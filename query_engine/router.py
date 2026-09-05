# ============================================================
# File: router.py (Day 3 & 4 Unified Version)
# ============================================================
import json
import os
import sys

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

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

client = genai.Client(api_key=GEMINI_API_KEY)

INTENT_PROMPT_MAP = {
    QueryIntent.LAND_COVER: LAND_COVER_PROMPT,
    QueryIntent.LAND_COVER_LOCATION: LOCATION_PROMPT,
    QueryIntent.LAND_COVER_SUMMARY: LAND_COVER_PROMPT,
    QueryIntent.CHANGE_DETECTION: CHANGE_DETECTION_PROMPT,
}

class IntentClassification(BaseModel):
    intent: QueryIntent = Field(
        description="Classified intent matching one of the allowed enum values."
    )

def load_grounding_facts(path: str = GROUNDING_FACTS_PATH) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def classify_intent(user_query: str) -> QueryIntent:
    classifier_prompt = (
        f"Classify the user query into one of: LAND_COVER, LAND_COVER_LOCATION, "
        f"LAND_COVER_SUMMARY, CHANGE_DETECTION, UNSUPPORTED.\n\nQuery: \"{user_query}\""
    )
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=classifier_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=IntentClassification,
                temperature=0.0
            ),
        )
        result_data = json.loads(response.text)
        return QueryIntent(result_data.get("intent", "UNSUPPORTED"))
    except Exception as e:
        print(f"[router] Classification failed: {e}")
        return QueryIntent.UNSUPPORTED

def process_query(user_query: str) -> str:
    intent = classify_intent(user_query)
    grounding_facts = load_grounding_facts()
    grounding_json_str = json.dumps(grounding_facts, indent=2)

    template = INTENT_PROMPT_MAP.get(intent)
    if template is None:
        decline_message = "I'm not able to answer that question based on available data."
        print(f"--- Intent: {intent} (Declined) ---")
        print(decline_message)
        return decline_message

    task_prompt = template.format(grounding_json=grounding_json_str, user_question=user_query)
    full_prompt = f"{SYSTEM_PROMPT}\n\n{task_prompt}"

    try:
        response = client.models.generate_content(model=GEMINI_MODEL_NAME, contents=full_prompt)
        response_text = response.text
    except Exception as e:
        response_text = f"[router] Gemini API call failed: {e}"

    print(f"--- Intent: {intent} ---")
    print(response_text)
    return response_text

if __name__ == "__main__":
    test_queries = [
        "Where is the water body located?",
        "What is the total area and dominant class?",
        "Can you write a python script for me?"
    ]
    for q in test_queries:
        print(f"\nQuery: {q}")
        process_query(q)
