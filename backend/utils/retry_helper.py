import json
import time
from functools import wraps
import logging

logger = logging.getLogger(__name__)


def clean_json_response(text):
    """Clean common JSON formatting issues from LLM responses"""
    # Remove markdown code blocks if present
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    # Strip whitespace
    return text.strip()


def retry_with_backoff(max_attempts=3, initial_delay=1, backoff_factor=2):
    """Decorator to retry failed API calls with exponential backoff"""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            delay = initial_delay

            for attempt in range(max_attempts):
                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    last_error = e
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_attempts} failed: {str(e)}"
                    )

                    if attempt < max_attempts - 1:
                        logger.info(f"Retrying in {delay} seconds...")
                        time.sleep(delay)
                        delay *= backoff_factor
                    else:
                        logger.error(f"All retry attempts exhausted")
                        raise last_error

        return wrapper

    return decorator
