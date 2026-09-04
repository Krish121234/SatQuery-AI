"""
Query service integrating Sid's router and Gemini API for real responses.

Pipeline:
1. Take user question and grounding JSON from Sai's pipeline
2. Use Sid's router to classify intent (land_cover, location, change_detection, unsupported)
3. Call Gemini with appropriate prompt and grounding data
4. Return natural language answer
"""
import json
import os
import sys
from typing import Dict, Any, Optional

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class QueryIntent:
    """Intent definitions matching Sid's intents.py"""
    LAND_COVER = "land_cover"
    LAND_COVER_LOCATION = "land_cover_location"
    LAND_COVER_SUMMARY = "land_cover_summary"
    CHANGE_DETECTION = "change_detection"
    UNSUPPORTED = "unsupported"

    @staticmethod
    def values():
        return [
            QueryIntent.LAND_COVER,
            QueryIntent.LAND_COVER_LOCATION,
            QueryIntent.LAND_COVER_SUMMARY,
            QueryIntent.CHANGE_DETECTION,
            QueryIntent.UNSUPPORTED,
        ]


# System prompt from Sid's prompts.py - enforces evidence-only contract
SYSTEM_PROMPT = """\
You are SatQuery AI, an evidence-grounded assistant for interpreting \
satellite land cover analysis results.

You do NOT have access to the raw satellite image. You can ONLY see a \
structured JSON object called "Grounding Facts", produced by an upstream \
computer vision system. This JSON contains fields such as grid/cell \
identifiers, land cover class labels (e.g. Agriculture, Water, Urban, \
Forest, Barren), bounding box coordinates, confidence percentages, and \
(when relevant) acquisition timestamps.

You must follow these rules with zero exceptions:

1. EVIDENCE-ONLY ANSWERS
   Every factual claim you must be directly traceable to a field in \
the provided Grounding Facts JSON. Do not introduce any land cover class, \
location, percentage, or trend that is not explicitly present in the JSON.

2. NEVER HALLUCINATE, NEVER GUESS
   If the JSON does not contain the information needed to answer the \
question, you must NOT infer, estimate, extrapolate, or "fill in the gaps" \
using general world knowledge about geography, agriculture, or land use. \
Silence in the data means the data is unavailable — not that you should \
assume a plausible-sounding answer.

3. CITE YOUR NUMBERS
   Whenever you state a land cover class, confidence level, percentage, or \
coordinate, quote the exact value from the JSON (e.g. "Agriculture (confidence: \
92.4%)"). Do not round, paraphrase away, or approximate numeric evidence \
unless explicitly asked to summarize.

4. DECLINE WHEN UNSUPPORTED OR MISSING EVIDENCE
   If the user's question cannot be answered from the Grounding Facts \
provided — either because the question is outside the system's scope \
(e.g. predictions, recommendations, opinions) or because the specific \
data point is missing from the JSON — you must politely decline. Clearly \
state that you don't have sufficient evidence to answer, and briefly \
explain what kind of data would be needed. Do not apologize excessively; \
one clear, respectful sentence is enough.

5. NO SPECULATION ABOUT CAUSES OR FUTURE STATES
   Do not speculate on WHY a land cover change occurred (e.g. policy, \
climate, economics) or WHAT might happen next, unless such causal or \
predictive data is explicitly present in the JSON.

6. TRANSPARENCY OVER CONFIDENCE
   If confidence values in the JSON are low or ambiguous (e.g. below a \
reasonable certainty threshold, or multiple classes with similar \
confidence for the same cell), surface that ambiguity to the user rather \
than silently picking the highest value without comment.

Your tone should be precise, factual, and concise — like a data analyst \
reporting findings, not a conversationalist speculating about them.
"""

# Task-specific prompts from Sid's prompts.py
LAND_COVER_PROMPT = """\
TASK: Land Cover Classification Lookup

The user is asking about the land cover class present at a specific grid \
cell or location. Use ONLY the Grounding Facts JSON below.

Instructions:
- Identify the relevant grid cell(s) referenced by the question.
- State the land cover class exactly as labeled in the JSON \
(e.g. "Agriculture", "Water", "Urban").
- Always cite the confidence percentage attached to that classification.
- If multiple classes appear for the same cell (e.g. mixed-use), report \
all of them with their respective confidence values rather than picking \
one arbitrarily.
- If the requested cell/location is not present in the JSON, decline and \
state that no grounding data exists for that location.

Grounding Facts (JSON):
{grounding_json}

User Question:
{user_question}

Respond with a direct, evidence-cited answer following the rules in the \
system prompt.
"""

LOCATION_PROMPT = """\
TASK: Spatial Location Lookup

The user wants to know WHERE a particular land cover class is located \
within the analyzed area. Use ONLY the Grounding Facts JSON below.

Instructions:
- Search the JSON for grid cells / entries whose land cover class matches \
the class the user is asking about.
- Report location using the bounding box coordinates and/or grid/cell \
identifiers exactly as given in the JSON. Do not invent coordinate \
systems or convert units unless the JSON provides the means to do so.
- If there are multiple matching locations, list each one separately with \
its own bounding box and confidence percentage.
- If the class the user asked about does not appear anywhere in the JSON, \
politely decline and state that no matching location was found in the \
provided evidence.
- Do not estimate distances, directions (e.g. "north of"), or proximity \
unless that spatial relationship can be directly derived from bounding \
box values present in the JSON.

Grounding Facts (JSON):
{grounding_json}

User Question:
{user_question}

Respond with a direct, evidence-cited answer following the rules in the \
system prompt.
"""

CHANGE_DETECTION_PROMPT = """\
TASK: Temporal Change Detection

The user wants to understand how land cover has changed between two or \
more time periods. Use ONLY the Grounding Facts JSON below, which may \
contain grounding data tagged with different timestamps/acquisition dates.

Instructions:
- Identify the relevant time-stamped entries in the JSON for the same \
grid cell(s) or region referenced in the question.
- Report the land cover class and confidence at each timestamp, then \
state explicitly whether the class changed (e.g. "Agriculture (91.2%) in \
2019 -> Urban (88.5%) in 2023") or remained the same.
- Only report a "change" if both timestamps are actually present in the \
JSON for the same location. Do not assume change or stability for any \
period not covered by the data.
- Do NOT speculate about the cause of the change (policy, climate, \
economic activity, etc.) — report only what the data shows.
- Do NOT predict future land cover states.
- If the JSON only contains a single timestamp for the requested \
location, decline and explain that a comparison requires at least two \
time-stamped grounding records, which are not both available.

Grounding Facts (JSON):
{grounding_json}

User Question:
{user_question}

Respond with a direct, evidence-cited answer following the rules in the \
system prompt.
"""

# Fallback prompt for unsupported queries
UNSUPPORTED_PROMPT = """\
TASK: Politely Decline Unsupported Query

The user has asked a question that is outside the scope of SatQuery AI. \
Your job is to politely explain why you cannot answer and what kind of data \
or capabilities would be needed.

Examples of unsupported queries:
- Predictions or forecasts about future land cover
- Recommendations or opinions (e.g., "Is this a good place to farm?")
- Questions about causation (e.g., "Why did the vegetation decrease?")
- Questions about activities or events not directly visible in satellite data
- Requests for information not present in the Grounding Facts JSON

Instructions:
- Be polite and respectful.
- Clearly state that you cannot answer the question.
- Briefly explain why (outside scope, missing data, etc.).
- If possible, suggest what kind of data or analysis would be needed to answer it.

User Question:
{user_question}

Respond with a brief, respectful decline.
"""

INTENT_PROMPT_MAP = {
    QueryIntent.LAND_COVER: LAND_COVER_PROMPT,
    QueryIntent.LAND_COVER_LOCATION: LOCATION_PROMPT,
    QueryIntent.LAND_COVER_SUMMARY: LAND_COVER_PROMPT,
    QueryIntent.CHANGE_DETECTION: CHANGE_DETECTION_PROMPT,
    QueryIntent.UNSUPPORTED: UNSUPPORTED_PROMPT,
}


class QueryRouter:
    """Routes user questions to appropriate intents and prompts"""

    def __init__(self, gemini_api_key: Optional[str] = None):
        """
        Initialize the query router with Gemini client.

        Args:
            gemini_api_key: Gemini API key (falls back to GEMINI_API_KEY env var)
        """
        self.api_key = gemini_api_key or os.environ.get("GEMINI_API_KEY")
        self.client = None

        if not self.api_key:
            print(
                "WARNING: GEMINI_API_KEY not provided and not set in environment",
                file=sys.stderr
            )
        elif GENAI_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"WARNING: Failed to initialize Gemini client: {e}", file=sys.stderr)

    def classify_intent(self, user_query: str) -> str:
        """
        Classify user query into an intent category.

        This is a simplified classifier. In production, this could use:
        - Keyword matching (quick)
        - A lightweight classifier model
        - A call to Gemini for classification

        For now, we use keyword heuristics.

        Args:
            user_query: User's natural language question

        Returns:
            Intent string (one of QueryIntent values)
        """
        query_lower = user_query.lower()

        # Keywords suggesting unsupported queries
        unsupported_keywords = [
            "should", "recommend", "best", "will", "predict", "forecast",
            "why", "caused", "investment", "profit", "opinion", "think",
            "should i", "can you advise", "do you think"
        ]
        for keyword in unsupported_keywords:
            if keyword in query_lower:
                return QueryIntent.UNSUPPORTED

        # Keywords suggesting change detection
        change_keywords = ["change", "changed", "difference", "before", "after", "compare", "trend"]
        for keyword in change_keywords:
            if keyword in query_lower:
                return QueryIntent.CHANGE_DETECTION

        # Keywords suggesting location queries
        location_keywords = ["where", "location", "locate", "find", "at which", "coordinates"]
        for keyword in location_keywords:
            if keyword in query_lower:
                return QueryIntent.LAND_COVER_LOCATION

        # Keywords suggesting summary queries
        summary_keywords = ["summary", "overview", "total", "percentage", "distribution", "breakdown", "how much"]
        for keyword in summary_keywords:
            if keyword in query_lower:
                return QueryIntent.LAND_COVER_SUMMARY

        # Default to land cover classification
        return QueryIntent.LAND_COVER

    def process_query(
        self,
        user_question: str,
        grounding_data: Dict[str, Any]
    ) -> str:
        """
        Process a user question with grounding data to generate an answer.

        Pipeline:
        1. Classify the intent of the user's question
        2. Select the appropriate prompt template
        3. Format grounding data as JSON
        4. Call Gemini API with system prompt + task prompt + grounding data
        5. Return the generated answer

        Args:
            user_question: User's natural language question
            grounding_data: Grounding facts from Sai's pipeline (dict)

        Returns:
            Natural language answer from Gemini
        """
        # Step 1: Classify intent
        intent = self.classify_intent(user_question)

        # Step 2: Get appropriate prompt template
        task_prompt_template = INTENT_PROMPT_MAP.get(intent)
        if task_prompt_template is None:
            return "I'm not able to answer that question."

        # Step 3: Format grounding data as JSON
        grounding_json_str = json.dumps(grounding_data, indent=2)

        # Step 4: Format the task prompt with grounding data and question
        task_prompt = task_prompt_template.format(
            grounding_json=grounding_json_str,
            user_question=user_question
        )

        # Step 5: Combine system prompt and task prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\n{task_prompt}"

        # Step 6: Call Gemini (or fallback if not available)
        if self.client and GENAI_AVAILABLE:
            return self._call_gemini(full_prompt)
        else:
            return self._fallback_answer(intent, grounding_data, user_question)

    def _call_gemini(self, full_prompt: str) -> str:
        """
        Call Gemini API to generate answer.

        Args:
            full_prompt: Complete prompt (system + task + grounding)

        Returns:
            Generated answer from Gemini
        """
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=full_prompt
            )
            return response.text
        except Exception as e:
            return f"[QueryRouter] Gemini API call failed: {str(e)}"

    def _fallback_answer(
        self,
        intent: str,
        grounding_data: Dict[str, Any],
        user_question: str
    ) -> str:
        """
        Fallback answer generator when Gemini is not available.

        Uses basic heuristics to provide a reasonable answer based on
        the grounding data and intent.

        Args:
            intent: Classified intent
            grounding_data: Grounding facts
            user_question: User's question

        Returns:
            Fallback answer string
        """
        tiles = grounding_data.get("tiles", [])

        if not tiles:
            return "No grounding data available for this image."

        if intent == QueryIntent.UNSUPPORTED:
            return "I'm not able to answer that question. Please ask about specific land cover classifications, their locations, or changes between two images."

        elif intent == QueryIntent.CHANGE_DETECTION:
            return "Change detection queries require before/after grounding data. Please provide two satellite images for comparison."

        elif intent == QueryIntent.LAND_COVER_LOCATION:
            # Extract classes and their locations
            class_locations = {}
            for tile in tiles:
                tile_class = tile.get("class", "Unknown")
                if tile_class not in class_locations:
                    class_locations[tile_class] = []
                class_locations[tile_class].append(tile)

            if class_locations:
                response = "Land cover classes found:\n"
                for tile_class, tile_list in class_locations.items():
                    response += f"\n{tile_class}: {len(tile_list)} tile(s) detected\n"
                    for tile in tile_list[:3]:  # Show first 3
                        bbox = tile.get("bbox", [])
                        response += f"  - Tile {tile.get('tile_id')}: bbox {bbox}, confidence {tile.get('confidence')}\n"
                return response
            else:
                return "No land cover data found in grounding results."

        elif intent == QueryIntent.LAND_COVER_SUMMARY:
            class_counts = {}
            for tile in tiles:
                tile_class = tile.get("class", "Unknown")
                class_counts[tile_class] = class_counts.get(tile_class, 0) + 1

            response = "Land Cover Summary:\n"
            for tile_class, count in sorted(class_counts.items()):
                percentage = (count / len(tiles)) * 100
                response += f"{tile_class}: {count} tiles ({percentage:.1f}%)\n"
            return response

        else:  # LAND_COVER
            if tiles:
                response = "Land Cover Classification:\n"
                for tile in tiles[:5]:  # Show first 5 tiles
                    response += f"Tile {tile.get('tile_id')}: {tile.get('class')} (confidence: {tile.get('confidence')})\n"
                return response
            else:
                return "No land cover classification data available."
