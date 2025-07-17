# backend/decisions.py
from flask import Blueprint, request, jsonify

# from models_decision import db, Decision, DecisionOption, EvaluationCriteria
from decision_engine import DecisionEngine


decisions_bp = Blueprint("decisions", __name__)


@decisions_bp.route("/analyze", methods=["POST"])
def analyze_decision():
    data = request.get_json()
    # Call the DecisionEngine with the provided scenario data
    decision_engine = DecisionEngine()
    result = decision_engine.analyze_scenario(scenario=data)
    return jsonify(result), 200


@decisions_bp.route("/evaluate", methods=["POST"])
def evaluate_decision():
    data = request.get_json()
    # Call the DecisionEngine with the provided responses and framework
    decision_engine = DecisionEngine()
    result = decision_engine.evaluate_options(
        framework=data.get("framework"), responses=data.get("responses")
    )
    return jsonify(result), 200
