# backend/decisions.py
from flask import Blueprint, request, jsonify

# from models_decision import db, Decision, DecisionOption, EvaluationCriteria
from decision_engine import DecisionEngine


decisions_bp = Blueprint("decisions", __name__)
decision_engine = DecisionEngine()


@decisions_bp.route("/analyze", methods=["POST"])
def analyze_decision():
    data = request.get_json()
    scenario = data.get("scenario", "")
    depth = data.get("depth", "balanced")

    result = decision_engine.analyze_scenario(scenario=scenario, depth=depth)
    # print(f"Analysis result: {result}")
    return jsonify(result), 200


@decisions_bp.route("/evaluate", methods=["POST"])
def evaluate_decision():
    data = request.get_json()
    framework = data.get("framework", {})
    responses = data.get("responses", {})

    # Call the DecisionEngine evaluation
    result = decision_engine.evaluate_options(framework=framework, responses=responses)
    # print(f"Evaluation result: {result}")
    return jsonify(result), 200


@decisions_bp.route("/test", methods=["GET"])
def test_endpoint():
    """Simple test endpoint to verify the API is working"""
    return (
        jsonify(
            {
                "status": "ok",
                "message": "Decision engine is running",
                "endpoints": [
                    "POST /api/analyze",
                    "POST /api/evaluate",
                    "GET /api/test",
                ],
            }
        ),
        200,
    )
