# backend/decision_engine.py
import json
from typing import Dict, List, Any
from openai import OpenAI
from dotenv import load_dotenv
import os


load_dotenv()

# from models_decision import db


class DecisionEngine:
    """
    Generalized decision analysis engine adapted from study abroad recommendation engine.
    Uses two-stage LLM workflow for cost optimization.
    """

    def __init__(self):
        self.client = OpenAI(
            # This is the default and can be omitted
            api_key=os.getenv("OPENAI_API_KEY"),
        )

    def analyze_scenario(self, scenario: str, depth: str = "balanced") -> Dict:
        """
        Stage 1: Analyze scenario and generate decision framework using GPT-4
        """
        depth_configs = {
            "quick": {
                "time": "30 seconds",
                "questions": 2,
                "criteria": 4,
                "description": "Essential factors only",
            },
            "balanced": {
                "time": "3 minutes",
                "questions": 6,
                "criteria": 8,
                "description": "Key dimensions covered",
            },
            "thorough": {
                "time": "10 minutes",
                "questions": 12,
                "criteria": 12,
                "description": "Comprehensive analysis",
            },
        }

        config = depth_configs.get(depth, depth_configs["balanced"])

        prompt = f"""
        Analyze this decision scenario and create a structured framework.
        
        User Scenario: "{scenario}"
        
        Analysis Depth: {depth} ({config['description']})
        Time Budget: {config['time']}
        
        Generate a JSON response with exactly this structure:
        {{
            "decision_type": "classification like: comparison, yes_no, open_ended, career, purchase, life_choice",
            "title": "A clear, concise title for this decision",
            "options": [
                {{"name": "Option 1", "description": "Brief description", "inferred": true/false}},
                // Extract explicit options or infer logical ones
            ],
            "criteria": [
                {{
                    "name": "Criterion name",
                    "description": "What this evaluates",
                    "weight": 0.0-1.0,
                    "category": "financial/practical/emotional/strategic"
                }}
                // Generate {config['criteria']} criteria
            ],
            "questions": [
                {{
                    "text": "Question text",
                    "type": "scale/rank/boolean/text",
                    "options": [], // For multiple choice
                    "criteria_link": "Which criterion this helps evaluate",
                    "min": 1, // For scale type questions, specify minimum value
                    "max": 5, // For scale type questions, specify maximum value
                    "minLabel": "Lowest value meaning", // For scale type questions, specify label for minimum value
                    "maxLabel": "Highest value meaning" // For scale type questions, specify label for maximum value
                }}
                // Generate {config['questions']} questions
            ],
            "context_factors": ["Key contextual elements identified"]
        }}
        
        Ensure questions directly support evaluation of the criteria.
        For 'quick' depth, focus on deal-breakers and primary drivers.
        For 'balanced' depth, cover main decision dimensions.
        For 'thorough' depth, include long-term implications and edge cases.
        Respond with only valid JSON. Do not include any markdown, triple backticks, or explanatory text. Only return the JSON object.
        """

        try:
            # Use a model appropriate for the task
            if depth == "quick":
                chosen_model = "gpt-4o-mini-2024-07-18"
            else:
                chosen_model = "o4-mini-2025-04-16"

            print(f"Calling model: {chosen_model} for depth: {depth}")
            response = self.client.responses.create(
                model=chosen_model,
                instructions="You are an expert decision analyst who creates structured frameworks for complex decisions.",
                input=prompt,
            )
            framework = json.loads(response.output_text)

            # with open("test/framework.json", "r") as f:
            #     sample_json = json.load(f)

            # framework = sample_json
            framework["depth"] = depth
            framework["scenario_text"] = scenario

            return framework

        except Exception as e:
            print(f"Error in scenario analysis: {e}")
            # return dummy data for fallback
            return {}

    def evaluate_options(self, framework: Dict, responses: Dict) -> Dict:
        """
        Stage 2: Evaluate options based on responses using intelligent model routing
        """

        depth = framework.get("depth", "balanced")
        if depth == "quick":
            chosen_model = "gpt-4o-mini-2024-07-18"
        else:
            chosen_model = "o4-mini-2025-04-16"

        prompt = f"""
        Evaluate decision options based on user responses.
        
        Decision Framework:
        {json.dumps(framework, indent=2)}
        
        User Responses:
        {json.dumps(responses, indent=2)}

        Respond with only valid JSON. Do not include any markdown, triple backticks, or explanatory text. Only return the JSON object.
        Generate a JSON evaluation with:
        {{
            "option_scores": {{
                "Option Name": {{
                    "total_score": 0-100,
                    "criteria_scores": {{"criterion": score}},
                    "strengths": ["List of strengths"],
                    "weaknesses": ["List of weaknesses"],
                    "confidence": "high/medium/low"
                }}
            }},
            "recommendation": {{
                "primary_choice": "Recommended option",
                "reasoning": "Clear explanation",
                "alternatives": ["Other viable options"],
                "red_flags": ["Any concerns to consider"]
            }},
            "sensitivity_analysis": {{
                "critical_factors": ["Factors that could change the recommendation"],
                "robust_choice": "Option that performs well across scenarios"
            }}
        }}
        """

        try:
            print(f"Calling model: {chosen_model} for evaluation")
            response = self.client.responses.create(
                model=chosen_model,
                instructions="You are evaluating decision options based on structured criteria and user preferences.",
                input=prompt,
                # temperature=0.7,
                # max_tokens=2000,
            )

            evaluation = json.loads(response.output_text)

            # with open("test/evaluation.json", "r") as f:
            #     sample_json = json.load(f)

            # evaluation = sample_json
            evaluation["model_used"] = chosen_model

            return evaluation

        except Exception as e:
            print(f"Error in scenario analysis: {e}")
            # return dummy data for fallback
            return {}

    def _calculate_complexity(self, framework: Dict, responses: Dict) -> float:
        """Calculate decision complexity for model routing"""
        factors = {
            "num_options": len(framework.get("options", [])),
            "num_criteria": len(framework.get("criteria", [])),
            "has_conflicts": self._check_for_conflicts(responses),
            "uncertainty_level": self._assess_uncertainty(responses),
            "decision_type_complexity": {
                "yes_no": 0.2,
                "comparison": 0.5,
                "open_ended": 0.8,
                "career": 0.9,
                "life_choice": 0.9,
            }.get(framework.get("decision_type", "comparison"), 0.5),
        }

        # Weighted complexity calculation
        complexity = (
            (min(factors["num_options"] / 5, 1.0) * 0.2)
            + (min(factors["num_criteria"] / 10, 1.0) * 0.2)
            + (factors["has_conflicts"] * 0.2)
            + (factors["uncertainty_level"] * 0.2)
            + (factors["decision_type_complexity"] * 0.2)
        )

        return complexity

    def _generate_fallback_framework(self, scenario: str, depth: str) -> Dict:
        """Simple fallback framework if AI fails"""
        return {
            "decision_type": "comparison",
            "title": "Decision Analysis",
            "options": [
                {"name": "Option A", "description": "First option", "inferred": True},
                {"name": "Option B", "description": "Second option", "inferred": True},
            ],
            "criteria": [
                {"name": "Cost", "weight": 0.3, "category": "financial"},
                {"name": "Benefits", "weight": 0.4, "category": "practical"},
                {"name": "Risks", "weight": 0.3, "category": "strategic"},
            ],
            "questions": [
                {"text": "What is your budget constraint?", "type": "text"},
                {"text": "What is your primary goal?", "type": "text"},
            ],
            "context_factors": ["General decision"],
        }
