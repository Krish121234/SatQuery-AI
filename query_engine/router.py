# ============================================================
# File: router.py
# ============================================================
import json
import os
import sys

# USING THE NEW SDK
from google import genai

from query_engine.intents import QueryIntent
from query_engine.prompts import (
    SYSTEM_PROMPT,
    LAND_COVER_PROMPT,
    LOCATION_PROMPT,
    CHANGE_DETECTION_PROMPT,
)

GROUNDING_FACTS_PATH = "query_engine/mock_grounding.json"
GEMINI_MODEL_NAME = "gemini-3.6-flash" 

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)

# NEW CLIENT INITIALIZATION
client = genai.Client(api_key=GEMINI_API_KEY)

INTENT_PROMPT_MAP = {
    QueryIntent.LAND_COVER: LAND_COVER_PROMPT,
    QueryIntent.LAND_COVER_LOCATION: LOCATION_PROMPT,
    QueryIntent.LAND_COVER_SUMMARY: LAND_COVER_PROMPT,
    QueryIntent.CHANGE_DETECTION: CHANGE_DETECTION_PROMPT,
}

def load_grounding_facts(path: str = GROUNDING_FACTS_PATH) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"File not found at '{path}'")
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse '{path}' as valid JSON: {e}")

def classify_intent(user_query: str) -> QueryIntent:
    return QueryIntent.LAND_COVER_LOCATION

def process_query(user_query: str) -> str:
    intent = classify_intent(user_query)
    grounding_facts = load_grounding_facts()
    grounding_json_str = json.dumps(grounding_facts, indent=2)

    template = INTENT_PROMPT_MAP.get(intent)

    if template is None:
        decline_message = "I'm not able to answer that question."
        print(decline_message)
        return decline_message

    task_prompt = template.format(
        grounding_json=grounding_json_str,
        user_question=user_query,
    )

    full_prompt = f"{SYSTEM_PROMPT}\n\n{task_prompt}"

    # NEW SDK GENERATION CALL
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=full_prompt
        )
        response_text = response.text
    except Exception as e:
        response_text = f"[router] Gemini API call failed: {e}"

    print(f"--- Intent: {intent} ---")
    print(response_text)

    return response_text

if __name__ == "__main__":
    test_query = "What is the best fertilizer to use for the crops in cell A1?"
    process_query(test_query)
