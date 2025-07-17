# backend/api/decisions.py
from flask import Blueprint, request, jsonify, session
import os
import uuid
from models_decision import (
    db,
    Decision,
    DecisionOption,
    EvaluationCriteria,
    Question,
    UserResponse,
    Evaluation,
)
from services.decision_engine import DecisionEngine

decisions_bp = Blueprint("decisions", __name__)
engine = DecisionEngine(api_key=os.getenv("OPENAI_API_KEY"))


@decisions_bp.route("/decisions/analyze", methods=["POST"])
def analyze_scenario():
    """
    Endpoint for initial scenario analysis
    """
    data = request.json
    scenario = data.get("scenario")
    depth = data.get("depth", "balanced")

    if not scenario:
        return jsonify({"error": "Scenario text required"}), 400

    # Get or create session ID
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())

    session_id = session["session_id"]

    try:
        # Generate framework using AI
        analysis = engine.analyze_scenario(scenario, depth)

        # Save to database
        decision = Decision(
            user_session_id=session_id,
            scenario_text=scenario,
            decision_type=analysis.get("decision_type"),
            analysis_depth=depth,
            title=analysis.get("title", "Decision Analysis"),
        )
        db.session.add(decision)
        db.session.flush()  # Get the ID without committing

        # Save options
        for i, opt in enumerate(analysis.get("options", [])):
            option = DecisionOption(
                decision_id=decision.id,
                name=opt["name"],
                description=opt.get("description"),
                ai_inferred=opt.get("inferred", False),
                position=i,
            )
            db.session.add(option)

        # Save criteria
        for crit in analysis.get("criteria", []):
            criteria = EvaluationCriteria(
                decision_id=decision.id,
                name=crit["name"],
                description=crit.get("description"),
                weight=crit.get("weight", 0.5),
                category=crit.get("category", "general"),
            )
            db.session.add(criteria)

        # Save questions
        for i, q in enumerate(analysis.get("questions", [])):
            question = Question(
                decision_id=decision.id,
                question_text=q["text"],
                question_type=q.get("type", "text"),
                metadata=q.get("options", []),
                position=i,
                criteria_link=q.get("criteria_link"),
            )
            db.session.add(question)

        db.session.commit()

        return jsonify(
            {"decision_id": decision.id, "analysis": analysis, "session_id": session_id}
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


@decisions_bp.route("/decisions/<int:decision_id>", methods=["GET"])
def get_decision(decision_id):
    """Get decision details with all related data"""
    decision = Decision.query.get_or_404(decision_id)
    return jsonify(decision.to_dict())


@decisions_bp.route("/decisions/<int:decision_id>/responses", methods=["POST"])
def save_responses(decision_id):
    """Save user responses to questions"""
    decision = Decision.query.get_or_404(decision_id)
    responses_data = request.json.get("responses", {})

    try:
        # Clear existing responses for this decision
        UserResponse.query.filter(
            UserResponse.question_id.in_([q.id for q in decision.questions])
        ).delete()

        # Save new responses
        for question_id, response_value in responses_data.items():
            question = Question.query.get(int(question_id))
            if question and question.decision_id == decision_id:
                response = UserResponse(
                    question_id=question.id, response_value=str(response_value)
                )
                db.session.add(response)

        db.session.commit()
        return jsonify({"message": "Responses saved successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save responses: {str(e)}"}), 500


@decisions_bp.route("/decisions/<int:decision_id>/evaluate", methods=["POST"])
def evaluate_decision(decision_id):
    """
    Endpoint for evaluating options based on responses
    """
    decision = Decision.query.get_or_404(decision_id)

    # Get the framework
    framework = {
        "decision_type": decision.decision_type,
        "title": decision.title,
        "options": [opt.to_dict() for opt in decision.options],
        "criteria": [crit.to_dict() for crit in decision.criteria],
        "questions": [q.to_dict() for q in decision.questions],
    }

    # Get user responses
    responses = {}
    for question in decision.questions:
        user_response = UserResponse.query.filter_by(question_id=question.id).first()
        if user_response:
            responses[question.id] = user_response.response_value

    try:
        # Get evaluation from AI
        evaluation = engine.evaluate_options(framework, responses)

        # Save evaluations to database
        for option_name, scores in evaluation.get("option_scores", {}).items():
            option = DecisionOption.query.filter_by(
                decision_id=decision_id, name=option_name
            ).first()

            if option:
                eval_record = Evaluation(
                    decision_id=decision_id,
                    option_id=option.id,
                    score=scores.get("total_score", 0),
                    reasoning=evaluation.get("recommendation", {}).get("reasoning"),
                    strengths=scores.get("strengths", []),
                    weaknesses=scores.get("weaknesses", []),
                    confidence=scores.get("confidence", "medium"),
                )
                db.session.add(eval_record)

        db.session.commit()

        return jsonify({"decision_id": decision_id, "evaluation": evaluation})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Evaluation failed: {str(e)}"}), 500


@decisions_bp.route("/decisions", methods=["GET"])
def list_decisions():
    """List all decisions for the current session"""
    session_id = session.get("session_id")
    if not session_id:
        return jsonify({"decisions": []})

    decisions = (
        Decision.query.filter_by(user_session_id=session_id)
        .order_by(Decision.created_at.desc())
        .all()
    )

    return jsonify(
        {
            "decisions": [
                {
                    "id": d.id,
                    "title": d.title,
                    "decision_type": d.decision_type,
                    "analysis_depth": d.analysis_depth,
                    "created_at": d.created_at.isoformat() if d.created_at else None,
                    "status": d.status,
                }
                for d in decisions
            ]
        }
    )


@decisions_bp.route("/decisions/test", methods=["GET"])
def test_engine():
    """Test endpoint to verify the engine is working"""
    test_scenario = "I'm trying to decide between accepting a job offer in New York with 20% higher salary or staying in my current job in Boston near family."

    try:
        analysis = engine.analyze_scenario(test_scenario, "quick")
        return jsonify({"status": "success", "analysis": analysis})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500
