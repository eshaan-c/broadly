# backend/api/programs.py
from flask import Blueprint, request, jsonify
from backend.models import Program, AcademicField, Tag, db
from backend.services.recommendation_engine import RecommendationEngine
from sqlalchemy import or_

programs_bp = Blueprint("programs", __name__)
recommendation_engine = RecommendationEngine()


@programs_bp.route("/programs", methods=["GET"])
def list_programs():
    """List all programs with optional filtering."""
    # Optional filters
    country = request.args.get("country")
    region = request.args.get("region")
    duration_type = request.args.get("duration_type")
    max_cost = request.args.get("max_cost", type=int)

    query = Program.query

    if country:
        query = query.filter(Program.country == country)
    if region:
        query = query.filter(Program.region == region)
    if duration_type:
        query = query.filter(Program.duration_type == duration_type)
    if max_cost:
        query = query.filter(Program.estimated_total_cost <= max_cost)

    programs = query.order_by(Program.name).all()

    return jsonify(
        {"programs": [p.to_dict() for p in programs], "total": len(programs)}
    )


@programs_bp.route("/programs/<int:program_id>", methods=["GET"])
def get_program(program_id):
    """Get single program details."""
    program = Program.query.get_or_404(program_id)
    return jsonify(program.to_dict())


@programs_bp.route("/programs/search", methods=["POST"])
def search_programs():
    """Search programs based on preferences."""
    preferences = request.json

    if not preferences:
        return jsonify({"error": "No preferences provided"}), 400

    recommendations = recommendation_engine.get_recommendations(preferences)

    return jsonify({"recommendations": recommendations, "search_criteria": preferences})


@programs_bp.route("/programs/compare", methods=["POST"])
def compare_programs():
    """Compare 2-3 programs side by side."""
    data = request.json
    program_ids = data.get("program_ids", [])

    if len(program_ids) < 2 or len(program_ids) > 3:
        return jsonify({"error": "Please select 2-3 programs to compare"}), 400

    comparison = recommendation_engine.compare_programs(program_ids)

    return jsonify(comparison)


@programs_bp.route("/programs/filters", methods=["GET"])
def get_available_filters():
    """Get available filter options from the catalog."""
    filters = {
        "countries": db.session.query(Program.country)
        .distinct()
        .order_by(Program.country)
        .all(),
        "regions": db.session.query(Program.region)
        .filter(Program.region.isnot(None))
        .distinct()
        .all(),
        "duration_types": db.session.query(Program.duration_type).distinct().all(),
    }

    return jsonify(
        {
            "countries": [c[0] for c in filters["countries"]],
            "regions": [r[0] for r in filters["regions"]],
            "duration_types": [d[0] for d in filters["duration_types"]],
            "price_ranges": [
                {"label": "Under $10,000", "max": 10000},
                {"label": "$10,000 - $15,000", "min": 10000, "max": 15000},
                {"label": "$15,000 - $20,000", "min": 15000, "max": 20000},
                {"label": "Over $20,000", "min": 20000},
            ],
        }
    )
