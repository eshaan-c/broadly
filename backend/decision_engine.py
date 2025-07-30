# backend/decision_engine.py
import json
from typing import Dict, List, Any
from openai import OpenAI
from dotenv import load_dotenv
from utils.retry_helper import retry_with_backoff, clean_json_response
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

    @retry_with_backoff(max_attempts=3, initial_delay=1, backoff_factor=2)
    def _call_api_with_retry(self, model, instructions, prompt):
        """Wrapper to add retry logic to API calls"""
        response = self.client.responses.create(
            model=model,
            instructions=instructions,
            input=prompt,
        )

        # Clean and validate the response
        cleaned_text = clean_json_response(response.output_text)

        # Try to parse as JSON to validate
        try:
            parsed_json = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response: {cleaned_text[:200]}...")
            raise ValueError(f"Invalid JSON response from API: {e}")

        # Return the parsed JSON directly since we can't modify response.output_text
        return parsed_json

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
        - mcq: Multiple choice. Use for yes/no preferences or more nuanced options. No 'Other' option.
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
                "name": "", // Capitalized
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

        Ensure exactly {config['questions']} questions with diverse types.
        Output must be valid JSON only. Do not include markdown or explanations.
        """

        try:
            # Use a model appropriate for the task
            if depth == "quick":
                chosen_model = "gpt-4o-mini-2024-07-18"
            else:
                chosen_model = "gpt-4.1-2025-04-14"

            print(f"Calling model: {chosen_model} for depth: {depth}")
            framework = self._call_api_with_retry(
                model=chosen_model,
                instructions="You are an expert decision analyst who builds structured, personalized frameworks to navigate complex choices.",
                prompt=prompt,
            )
            # framework = json.loads(response.output_text)

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

    # In your decision_engine.py - update the evaluate_options method

    def evaluate_options(self, framework: Dict, responses: Dict) -> Dict:
        """
        Stage 2: Evaluate options based on responses using intelligent model routing
        """

        # Check if user skipped questions
        skip_questions = responses.get("_skipQuestions", False)

        depth = framework.get("depth", "balanced")
        if depth == "quick":
            chosen_model = "gpt-4o-mini-2024-07-18"
        else:
            chosen_model = "gpt-4.1-2025-04-14"

        example_strengths = (
            "Key advantages for typical users"
            if skip_questions
            else "Key advantages based on your priorities"
        )
        example_weaknesses = (
            "Key disadvantages for typical users"
            if skip_questions
            else "Key disadvantages based on your needs"
        )
        example_confidence = "low" if skip_questions else "high|medium|low"
        example_reasoning = (
            "General analysis: [2-3 sentences about how options compare]"
            if skip_questions
            else "Based on your responses: [2-3 sentences about how options compare]"
        )
        example_redflag = (
            "General concerns to consider"
            if skip_questions
            else "Specific concerns based on your input"
        )

        # Build prompt that always returns raw scores
        prompt = f"""
        DECISION FRAMEWORK:
        {json.dumps(framework, indent=2)}

        USER RESPONSES:
        {json.dumps(responses, indent=2)}

        EVALUATION INSTRUCTIONS:
        {"NOTE: The user skipped clarifying questions. Base your evaluation on the scenario context and reasonable assumptions for this type of decision." if skip_questions else "Evaluate based on the user's specific responses and preferences."}

        SCORING METHOD:
        1. For each option and each criterion combination:
        - Assign a raw score from 0.0 to 10.0 based on how well that option satisfies that criterion
        - {"Use general/typical preferences since user didn't provide specific input" if skip_questions else "Base scores on user's expressed preferences"}
        - Return raw 0-10 scores only (DO NOT pre-weight)
        
        2. Score meaning:
        - 0.0-2.0: Very poor fit
        - 2.1-4.0: Below average fit  
        - 4.1-6.0: Average/moderate fit
        - 6.1-8.0: Good fit
        - 8.1-10.0: Excellent fit

        OUTPUT: Do not include markdown, explanations, or natural language. Return only the JSON structure shown below:

        {{
        "option_scores": {{
            "Option Name": {{
            "criteria_scores": {{
                "Criterion Name": {{
                "raw_score": 0.0-10.0
                }}
            }},
            "strengths": ["{example_strengths}"],
            "weaknesses": ["{example_weaknesses}"],
            "confidence": "{example_confidence}",
            "inferred_option": true/false
            }}
        }},
        "recommendation": {{
            "primary_choice": "Will be calculated by frontend, but try to suggest a primary option",
            "reasoning": "{example_reasoning}",
            "alternatives": ["Option B excels if [specific priority]"],
            "red_flags": ["{example_redflag}"]
        }},
        "insights": {{
            "key_tensions": ["Trade-offs between criteria"],
            "surprise_findings": ["Notable patterns in the scoring"],
            "criteria_patterns": {{
            "highest_variance": "Criterion with biggest score differences",
            "lowest_variance": "Criterion where options score similarly"
            }}
        }}
        }}"""

        try:
            print(f"Calling model: {chosen_model} for evaluation")
            evaluation = self._call_api_with_retry(
                model=chosen_model,
                instructions="You are an expert decision analyst. Always provide raw scores for each option-criterion combination.",
                prompt=prompt,
            )

            # evaluation = json.loads(response.output_text)
            evaluation["model_used"] = chosen_model
            evaluation["skipped_questions"] = skip_questions

            return evaluation

        except Exception as e:
            print(f"Error in evaluation: {e}")
            # Return empty structure that won't break frontend
            return {
                "option_scores": {},
                "recommendation": {
                    "primary_choice": "",
                    "reasoning": "Evaluation failed. Please try again.",
                    "alternatives": [],
                    "red_flags": [],
                },
                "insights": {
                    "key_tensions": [],
                    "surprise_findings": [],
                    "criteria_patterns": {
                        "highest_variance": "",
                        "lowest_variance": "",
                    },
                },
                "model_used": chosen_model,
                "skipped_questions": skip_questions,
            }
