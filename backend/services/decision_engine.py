# backend/services/decision_engine.py
import json
import openai
from typing import Dict, List, Any
from backend.models_decision import db


class DecisionEngine:
    """
    Generalized decision analysis engine adapted from study abroad recommendation engine.
    Uses two-stage LLM workflow for cost optimization.
    """

    def __init__(self, api_key: str):
        openai.api_key = api_key

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
                    "criteria_link": "Which criterion this helps evaluate"
                }}
                // Generate {config['questions']} questions
            ],
            "context_factors": ["Key contextual elements identified"]
        }}
        
        Ensure questions directly support evaluation of the criteria.
        For 'quick' depth, focus on deal-breakers and primary drivers.
        For 'balanced' depth, cover main decision dimensions.
        For 'thorough' depth, include long-term implications and edge cases.
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert decision analyst who creates structured frameworks for complex decisions.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )

            framework = json.loads(response.choices[0].message.content)
            framework["depth"] = depth
            framework["scenario_text"] = scenario

            return framework

        except Exception as e:
            print(f"Error in scenario analysis: {e}")
            # Fallback to a simple framework
            return self._generate_fallback_framework(scenario, depth)

    def evaluate_options(self, framework: Dict, responses: Dict) -> Dict:
        """
        Stage 2: Evaluate options based on responses using intelligent model routing
        """
        # Calculate complexity score
        complexity = self._calculate_complexity(framework, responses)

        # Route to appropriate model
        model = "gpt-3.5-turbo" if complexity < 0.7 else "gpt-4"

        prompt = f"""
        Evaluate decision options based on user responses.
        
        Decision Framework:
        {json.dumps(framework, indent=2)}
        
        User Responses:
        {json.dumps(responses, indent=2)}
        
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
            response = openai.ChatCompletion.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are evaluating decision options based on structured criteria and user preferences.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.5,
                max_tokens=1500,
            )

            evaluation = json.loads(response.choices[0].message.content)
            evaluation["model_used"] = model
            evaluation["complexity_score"] = complexity

            return evaluation

        except Exception as e:
            print(f"Error in evaluation: {e}")
            return self._generate_simple_evaluation(framework, responses)

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
