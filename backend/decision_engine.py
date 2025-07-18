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
        Start by extracting key personal context—goals, values, constraints, emotions—from the user’s scenario. Infer logical decision options if not all are stated; do not assume the user is aware of inferred options.
        Then construct a structured evaluation framework.
        
        User Scenario: "{scenario}"
        Analysis Depth: {depth} ({config['description']})
        Time Budget: {config['time']}
        
        Respond in **valid JSON only** with this structure:
        {{
            "decision_type": "classification like: comparison, yes_no, open_ended, career, purchase, life_choice",
            "title": "Concise decision title",
            "options": [
                {{"name": "Option 1 name", "description": "Brief description", "inferred": true/false}},
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
        
        Guidelines by depth level:
        - quick: Focus on top-level drivers and gut checks.
        - balanced: Cover emotional, practical, and strategic factors evenly.
        - thorough: Add stress points, edge cases, and long-term consequences.
        Ensure:
        If you include questions that reference a specific option or tradeoff, do not refer to it vaguely (e.g., ‘this option’) — instead, explicitly describe the idea directly in the question
        At least 2 questions must not be scale-based. Ensure all questions directly inform the criteria or reveal tradeoffs. Leave room for user to clarify unknowns via open text prompts.
        Output must be valid JSON only. Do not include markdown or explanations.
        """

        try:
            # Use a model appropriate for the task
            if depth == "quick":
                chosen_model = "gpt-4o-mini-2024-07-18"
            else:
                # chosen_model = "o4-mini-2025-04-16"
                # gpt 4.1 test
                chosen_model = "gpt-4.1-2025-04-14"

            print(f"Calling model: {chosen_model} for depth: {depth}")
            response = self.client.responses.create(
                model=chosen_model,
                instructions="You are an expert decision analyst who builds structured, personalized frameworks to navigate complex choices.",
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
            # chosen_model = "o4-mini-2025-04-16"
            # gpt 4.1 test
            chosen_model = "gpt-4.1-2025-04-14"

        prompt = f"""
        DECISION FRAMEWORK:
        {json.dumps(framework, indent=2)}

        USER RESPONSES:
        {json.dumps(responses, indent=2)}

        ANALYSIS INSTRUCTIONS:
        1. Calculate weighted scores by multiplying each criterion score by its weight
        2. Look for patterns, trade-offs, and synergies between criteria
        3. Consider both quantitative scores and qualitative insights
        4. Identify non-obvious strengths/weaknesses beyond surface-level observations
        5. Assess confidence based on response clarity, data quality, and alignment consistency
        6. Provide actionable insights that help the user understand WHY certain options perform better
        7. Consider uncertainty and what could change the recommendation

        RESPONSE REQUIREMENTS:
        - Respond with ONLY valid JSON (no markdown, backticks, or explanations)
        - Scores should reflect weighted calculations, not just averages
        - Strengths/weaknesses should be specific and actionable, not generic
        - Reasoning should connect user values to option performance
        - Red flags should identify genuine risks or concerns
        - Critical factors should highlight decision sensitivity

        JSON Schema:
        {{
            "option_scores": {{
                "Option Name": {{
                    "total_score": 0-100,
                    "criteria_scores": {{"criterion": weighted_score}},
                    "strengths": ["Specific advantages based on user priorities"],
                    "weaknesses": ["Specific disadvantages with context"],
                    "confidence": "high/medium/low"
                }}
            }},
            "recommendation": {{
                "primary_choice": "Recommended option name",
                "reasoning": "Multi-sentence explanation connecting user values to option performance",
                "alternatives": ["Viable alternatives with brief context"],
                "red_flags": ["Specific risks or concerns to monitor"]
            }},
            "sensitivity_analysis": {{
                "critical_factors": ["Factors that could significantly change the recommendation"],
                "robust_choice": "Option that performs consistently across different scenarios"
            }}
        }}"""

        try:
            print(f"Calling model: {chosen_model} for evaluation")
            response = self.client.responses.create(
                model=chosen_model,
                instructions="You are an expert decision analyst tasked with evaluating options using a structured framework. Your analysis should be thorough, nuanced, and actionable.",
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
