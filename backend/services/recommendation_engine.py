# backend/services/recommendation_engine.py
from typing import List, Dict, Any
import json
from sqlalchemy import and_, or_, func
from models import Program, db


class RecommendationEngine:
    """
    Universal recommendation engine that treats all programs equally,
    regardless of provider. Focuses on matching user preferences to
    program characteristics.
    """

    def get_recommendations(self, preferences: Dict[str, Any]) -> List[Dict]:
        """
        Get 6-8 recommended programs based on user preferences.
        No provider-specific logic - all programs compete equally.

        Args:
            preferences: {
                'interests': ['culture', 'language', 'internship'],
                'countries': ['Spain', 'Japan', 'France'],
                'regions': ['Europe', 'Asia'],
                'budget_max': 20000,
                'duration_type': 'semester',
                'academic_fields': ['Business', 'Computer Science'],
                'gpa': 3.5
            }
        """
        # Start with all programs
        query = Program.query

        # Apply hard filters
        if preferences.get("gpa"):
            # Only show programs where user meets GPA requirement
            query = query.filter(
                or_(
                    Program.gpa_requirement <= preferences["gpa"],
                    Program.gpa_requirement.is_(None),
                )
            )

        if preferences.get("budget_max"):
            query = query.filter(
                Program.estimated_total_cost <= preferences["budget_max"]
            )

        if preferences.get("duration_type"):
            query = query.filter(Program.duration_type == preferences["duration_type"])

        # Get all programs that pass hard filters
        eligible_programs = query.all()

        # Score each program based on preference matching
        scored_programs = []
        for program in eligible_programs:
            score = self._calculate_match_score(program, preferences)
            scored_programs.append(
                {
                    "program": program,
                    "score": score,
                    "match_reasons": self._get_match_reasons(program, preferences),
                }
            )

        # Sort by score and return top 6-8
        scored_programs.sort(key=lambda x: x["score"], reverse=True)
        top_programs = scored_programs[:8]

        # Format results
        recommendations = []
        for item in top_programs:
            program_data = item["program"].to_dict()
            program_data["match_score"] = round(item["score"], 2)
            program_data["match_reasons"] = item["match_reasons"]
            recommendations.append(program_data)

        return recommendations

    def _calculate_match_score(self, program: Program, preferences: Dict) -> float:
        """
        Calculate match score based on how well program matches preferences.
        All programs evaluated equally regardless of provider.
        """
        score = 0.0
        max_score = 0.0

        # Location matching (30% weight)
        if preferences.get("countries"):
            max_score += 30
            if program.country in preferences["countries"]:
                score += 30
            elif preferences.get("regions") and hasattr(program, "region"):
                if program.region in preferences["regions"]:
                    score += 20  # Partial credit for region match

        # Interest/tag matching (25% weight)
        if preferences.get("interests"):
            max_score += 25
            program_tags = [tag.name for tag in program.tags]
            matched_interests = set(preferences["interests"]) & set(program_tags)
            if matched_interests:
                score += 25 * (len(matched_interests) / len(preferences["interests"]))

        # Academic field matching (20% weight)
        if preferences.get("academic_fields"):
            max_score += 20
            program_fields = [field.name for field in program.academic_fields]
            matched_fields = set(preferences["academic_fields"]) & set(program_fields)
            if matched_fields:
                score += 20 * (
                    len(matched_fields) / len(preferences["academic_fields"])
                )

        # Cost efficiency (15% weight)
        if preferences.get("budget_max"):
            max_score += 15
            budget_utilization = (
                program.estimated_total_cost / preferences["budget_max"]
            )
            if budget_utilization <= 0.7:  # Great value
                score += 15
            elif budget_utilization <= 0.85:  # Good value
                score += 10
            elif budget_utilization <= 1.0:  # Within budget
                score += 5

        # Special features (10% weight)
        max_score += 10
        feature_score = 0
        if preferences.get("interests"):
            if (
                "internship" in preferences["interests"]
                and program.internship_available
            ):
                feature_score += 5
            if (
                "research" in preferences["interests"]
                and program.research_opportunities
            ):
                feature_score += 5
        score += min(feature_score, 10)

        # Normalize to 0-100
        return (score / max_score * 100) if max_score > 0 else 0

    def _get_match_reasons(self, program: Program, preferences: Dict) -> List[str]:
        """
        Generate human-readable reasons why this program matches preferences.
        """
        reasons = []

        # Location match
        if preferences.get("countries") and program.country in preferences["countries"]:
            reasons.append(f"Located in your preferred country: {program.country}")

        # Interest matches
        if preferences.get("interests"):
            program_tags = [tag.name for tag in program.tags]
            matched_interests = set(preferences["interests"]) & set(program_tags)
            if matched_interests:
                reasons.append(
                    f"Matches your interests: {', '.join(matched_interests)}"
                )

        # Academic matches
        if preferences.get("academic_fields"):
            program_fields = [field.name for field in program.academic_fields]
            matched_fields = set(preferences["academic_fields"]) & set(program_fields)
            if matched_fields:
                reasons.append(f"Offers courses in: {', '.join(matched_fields)}")

        # Special features
        if program.internship_available and "internship" in preferences.get(
            "interests", []
        ):
            reasons.append("Internship opportunities available")
        if program.research_opportunities and "research" in preferences.get(
            "interests", []
        ):
            reasons.append("Research opportunities available")

        # Value proposition
        if preferences.get("budget_max"):
            if program.estimated_total_cost <= preferences["budget_max"] * 0.7:
                reasons.append("Excellent value within your budget")

        return reasons[:3]  # Return top 3 reasons

    def compare_programs(self, program_ids: List[int]) -> Dict:
        """
        Generate comparison data for 2-3 programs.
        Provider is just one data point among many.
        """
        programs = Program.query.filter(Program.id.in_(program_ids)).all()

        if len(programs) < 2:
            return {"error": "Need at least 2 programs to compare"}

        comparison = {
            "programs": [p.to_dict() for p in programs],
            "comparison_matrix": self._build_comparison_matrix(programs),
            "key_differences": self._identify_key_differences(programs),
            "recommendation": self._generate_comparison_recommendation(programs),
        }

        return comparison

    def _build_comparison_matrix(self, programs: List[Program]) -> Dict:
        """Build a structured comparison across key dimensions."""
        matrix = {
            "location": {
                "category": "Location",
                "values": {p.id: f"{p.city}, {p.country}" for p in programs},
            },
            "duration": {
                "category": "Duration",
                "values": {
                    p.id: f"{p.duration_weeks} weeks ({p.duration_type})"
                    for p in programs
                },
            },
            "cost": {
                "category": "Total Cost",
                "values": {p.id: f"${p.estimated_total_cost:,}" for p in programs},
            },
            "credits": {
                "category": "Credits",
                "values": {p.id: f"{p.credits_min}-{p.credits_max}" for p in programs},
            },
            "gpa_requirement": {
                "category": "GPA Requirement",
                "values": {
                    p.id: str(p.gpa_requirement) if p.gpa_requirement else "None"
                    for p in programs
                },
            },
            "language": {
                "category": "Language Requirement",
                "values": {p.id: p.language_requirement or "None" for p in programs},
            },
            "housing": {
                "category": "Housing",
                "values": {
                    p.id: "Included" if p.housing_included else "Not included"
                    for p in programs
                },
            },
            "special_features": {
                "category": "Special Features",
                "values": {p.id: self._get_special_features(p) for p in programs},
            },
            "provider": {
                "category": "Provider",
                "values": {p.id: p.provider for p in programs},
            },
        }
        return matrix

    def _get_special_features(self, program: Program) -> str:
        """Get special features as a string."""
        features = []
        if program.internship_available:
            features.append("Internships")
        if program.research_opportunities:
            features.append("Research")
        if program.excursions_included:
            features.append("Excursions")
        return ", ".join(features) if features else "None"

    def _identify_key_differences(self, programs: List[Program]) -> List[str]:
        """Identify the most important differences between programs."""
        differences = []

        # Cost difference
        costs = [p.estimated_total_cost for p in programs]
        if max(costs) - min(costs) > 5000:
            differences.append(
                f"Significant cost difference: ${min(costs):,} to ${max(costs):,}"
            )

        # Location diversity
        countries = set(p.country for p in programs)
        if len(countries) > 1:
            differences.append(f"Programs span {len(countries)} different countries")

        # Academic focus
        all_fields = set()
        for p in programs:
            all_fields.update([f.name for f in p.academic_fields])
        if len(all_fields) > 3:
            differences.append("Diverse academic offerings across programs")

        # Special opportunities
        internship_programs = [p for p in programs if p.internship_available]
        if 0 < len(internship_programs) < len(programs):
            differences.append(
                f"Only {len(internship_programs)} program(s) offer internships"
            )

        return differences

    def _generate_comparison_recommendation(self, programs: List[Program]) -> str:
        """Generate an AI-ready prompt for detailed comparison analysis."""
        prompt = f"""
        Compare these {len(programs)} study abroad programs:
        
        {json.dumps([p.to_dict() for p in programs], indent=2)}
        
        Provide a balanced analysis covering:
        1. Best fit for different student profiles
        2. Value proposition of each program
        3. Unique opportunities each offers
        4. Potential drawbacks or limitations
        
        Keep the analysis practical and student-focused.
        """
        return prompt
