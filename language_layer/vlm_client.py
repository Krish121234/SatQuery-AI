"""
vlm_client.py — wraps calls to the Gemini API.

This is the "language layer" — it takes the structured, grounded JSON
output from the grounding pipeline plus the user's natural-language
question, and returns a grounded answer. It should NEVER be given
raw image pixels alone to reason freely over; grounding data always
comes along with the question.

Uses the current Google GenAI SDK (`google-genai`, imported as
`from google import genai`). The older `google-generativeai` package
(`import google.generativeai as genai`) is end-of-life as of Nov 30,
2025 — don't use it in new code.
"""

import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found. Make sure you've created a .env file "
        "(copy .env.example -> .env) and added the key."
    )

client = genai.Client(api_key=API_KEY)

# Model name — as of writing, gemini-2.5-flash is a stable, well-established
# free-tier model. Google ships new Flash versions fairly often (3.5, 3.6...);
# check aistudio.google.com for the current recommended free-tier model if
# this one is ever deprecated or rate-limited unexpectedly.
MODEL_NAME = "gemini-2.5-flash"


def build_prompt(question: str, grounding_data: dict) -> str:
    """
    Constructs the prompt sent to the LLM. The model only ever sees
    the structured grounding JSON, not the raw image — this is what
    keeps answers grounded instead of hallucinated.
    """
    grounding_json_str = json.dumps(grounding_data, indent=2)

    prompt = f"""You are SatQuery AI, an assistant that answers questions about satellite imagery.

You are given:
1. A user's question about a satellite image.
2. Structured detection data extracted from that image by a computer vision pipeline (land-cover classes, area percentages, object counts, confidence scores).

Your job: answer the question using ONLY the structured data provided below. Do not invent details that aren't in the data. If the data doesn't contain enough information to answer confidently, say so clearly instead of guessing.

Structured detection data:
{grounding_json_str}

User's question: {question}

Instructions for your answer:
- Be concise and direct — 1 to 3 sentences.
- Reference specific numbers from the data (percentages, counts) where relevant.
- Do not mention "JSON" or "the data" explicitly — just answer naturally, as if you looked at the image yourself.
- If confidence scores are low (below 0.5) for the relevant class, mention the answer is uncertain.

Answer:"""
    return prompt


def get_grounded_answer(question: str, grounding_data: dict) -> dict:
    """
    Main entry point. Takes a user question and grounding JSON,
    returns a dict with the answer and which classes it drew from.
    """
    prompt = build_prompt(question, grounding_data)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )
    answer_text = response.text.strip()

    # crude "evidence" extraction — list which detected classes are
    # mentioned in the answer, useful for the frontend to highlight
    # which parts of the overlay the answer is referring to
    evidence = [
        d["class"] for d in grounding_data.get("detections", [])
        if d["class"].replace("_", " ") in answer_text.lower()
        or d["class"] in answer_text.lower()
    ]

    return {
        "answer": answer_text,
        "evidence": evidence,
    }


if __name__ == "__main__":
    # Quick manual test — run this file directly to sanity-check the
    # pipeline works before wiring it into the backend.
    sample_grounding_data = {
        "image_id": "sample_001",
        "detections": [
            {"class": "forest", "confidence": 0.91, "area_percent": 34.2, "bbox": None},
            {"class": "water_body", "confidence": 0.87, "area_percent": 8.5, "bbox": None},
            {"class": "urban_builtup", "confidence": 0.78, "area_percent": 12.0, "bbox": None},
            {"class": "agricultural_land", "confidence": 0.83, "area_percent": 45.3, "bbox": None},
        ]
    }

    test_question = "What percentage of this region is forest cover?"

    result = get_grounded_answer(test_question, sample_grounding_data)
    print("Question:", test_question)
    print("Answer:", result["answer"])
    print("Evidence classes referenced:", result["evidence"])
