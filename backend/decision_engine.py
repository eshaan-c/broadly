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
                "questions": "1–3",
                "criteria": "2–5",
                "description": "Just the essentials; focus on surface-level distinctions",
            },
            "balanced": {
                "time": "3 minutes",
                "questions": "4–7",
                "criteria": "6–9",
                "description": "Well-rounded view across major considerations",
            },
            "thorough": {
                "time": "10 minutes",
                "questions": "8–14",
                "criteria": "10–14",
                "description": "Comprehensive breakdown with thoughtful depth",
            },
        }

        config = depth_configs.get(depth, depth_configs["balanced"])

        prompt = f"""
        You are a decision analyst helping someone think through a complex decision. Your goal is to understand THEIR context, values, and constraints—not to evaluate the options for them.

        User Scenario: "{scenario}"
        Analysis Depth: {depth} ({config['description']})
        Target Questions: {config['questions']}

        Analyze this scenario and create a decision framework following these principles:

        1. IDENTIFY OPTIONS: Extract explicitly stated options and infer logical alternatives the user may not have considered.

        2. DEFINE CRITERIA: Create evaluation dimensions based on what typically matters in this type of decision.

        3. DESIGN QUESTIONS: Create questions that reveal the USER'S context and preferences, NOT questions that evaluate the options directly.

        CRITICAL QUESTION GUIDELINES:
        - Ask about the user's values, constraints, and priorities
        - Never ask users to rank or rate the specific options
        - Never ask questions the AI can answer (e.g., "which city is more expensive?")
        - Focus on uncovering what matters TO THEM

        GOOD QUESTIONS:
        ✓ "How important is financial stability to you right now?" (reveals risk tolerance)
        ✓ "What does work-life balance mean to you?" (reveals lifestyle priorities)
        ✓ "How comfortable are you with major life changes?" (reveals change tolerance)

        BAD QUESTIONS:
        ✗ "Rank these cities by affordability" (AI already knows this)
        ✗ "Which option seems more appealing?" (too direct/leading)
        ✗ "Rate Option A on a scale of 1-10" (evaluates option, not user context)

        QUESTION TYPES:
        - scale: Use for measuring importance/comfort levels (always include min, max, minLabel, maxLabel)
        - mcq: Multiple choice. Use for yes/no preferences or more nuanced options
        - rank: Use ONLY for ranking abstract priorities (never the actual options)
        - text: Use for context the AI cannot infer

        You may use mcq for yes/no questions, but avoid binary questions that don't reveal user context.

        Respond with valid JSON only:
        {{
            "decision_type": "{{decision_type}}",
            "title": "{{concise_title}}",
            "options": [
            {{"name": "", "description": "", "inferred": boolean}}
            ],
            "criteria": [
            {{
                "name": "",
                "description": "",
                "weight": float,  // Each weight must be between 0 and 1 and all weights must sum to exactly 1.0
                "category": "financial|practical|emotional|strategic"
            }}
            ],
            "questions": [
            {{
                "text": "",
                "type": "scale|rank|mcq|text",
                "criteria_link": "",
                "options": [], // For rank type and mcq: abstract priorities, not the decision options
                "min": , // For scale only
                "max": , // For scale only  
                "minLabel": "", // For scale only
                "maxLabel": "", // For scale only
            }}
            ],
            "context_factors": []
        }}

        Ensure exactly {config['questions']} questions with at least 2 non-scale types.
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

            # chosen_model = "gpt-4.1-mini-2025-04-14"

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

        # chosen_model = "gpt-4.1-mini-2025-04-14"

        prompt = f"""
        DECISION FRAMEWORK:
        {json.dumps(framework, indent=2)}

        USER RESPONSES:
        {json.dumps(responses, indent=2)}

        EVALUATION INSTRUCTIONS:
        Evaluate ALL options (both explicit and AI-inferred) using the user's stated values, constraints, and priorities.

        SCORING METHOD (STRICT):
        1. For each option:
        a. For each criterion:
            - Assign a score from 0 to 10 based on how well the option aligns with the user's values
            - Multiply this score by the criterion's weight to get the weighted score
        b. Sum all weighted scores to compute a final `total_score` on a 0–10 scale:
            total_score = sum(weighted_criterion_scores)
        2. Report both `criteria_scores` (weighted) and `total_score` with **2 decimal places**.

        SCORING GUIDANCE:
        - Use user's responses to justify each score
        - Do not use generic assumptions — base everything on user's expressed preferences
        - All total_scores must be the **exact sum** of weighted criterion scores

        ANALYSIS REQUIREMENTS:
        - Justify scores with clear links to user input (e.g., “scores high on flexibility, which you rated as very important”)
        - Highlight tradeoffs and tensions between values
        - Identify strengths and weaknesses *specific to the user*, not general platitudes
        - Set confidence level as "high", "medium", or "low" depending on clarity and specificity of user input
        - Flag any options you inferred that were not user-provided

        OUTPUT: Valid **pure JSON** (no markdown or extra explanations), matching this structure:

        {{
        "option_scores": {{
            "Option Name": {{
            "total_score": float (0.00 to 10.00),
            "criteria_scores": {{
                "Criterion Name": float (0.00 to 10.00 * weight)
            }},
            "strengths": ["Specific strength aligned with user's stated values"],
            "weaknesses": ["Specific weakness based on user's constraints"],
            "confidence": "high" | "medium" | "low"
            }},
            ...
        }},
        "recommendation": {{
            "primary_choice": "Option Name",
            "reasoning": "Why this best fits the user's values and context (2-3 sentences)",
            "alternatives": ["Option B if user's priority X increases", "Option C if concern Y becomes more relevant"],
            "red_flags": ["Risk due to concern about X", "Potential mismatch with user's constraint Y"]
        }},
        "sensitivity_analysis": {{
            "critical_factors": ["If priority X changes, the top choice may shift to Option Y"],
            "robust_choice": "Option least sensitive to shifting priorities"
        }},
        "decision_insights": {{
            "key_tradeoff": "Primary tension the user must resolve (e.g., growth vs stability)",
            "surprise_finding": "Non-obvious insight from user's values"
        }}
        }}
        """

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
