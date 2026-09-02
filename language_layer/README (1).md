# Language Layer

This is where the user's question meets the grounding pipeline's structured output and gets turned into a natural-language answer.

## Files

- `vlm_client.py` — the core wrapper around the Gemini API, using the **current** `google-genai` SDK (`pip install google-genai`). The older `google-generativeai` package is end-of-life as of Nov 30, 2025 — don't reintroduce it. Contains `build_prompt()` (constructs the prompt) and `get_grounded_answer()` (the main function the backend will call).

## How to test it standalone

Make sure your `.env` has `GEMINI_API_KEY` set (see the root `README.md` / `docs/TEAM_GUIDE.md`), then:

```bash
cd language_layer
python vlm_client.py
```

This runs a built-in test with sample grounding data and prints the answer. If this works, the language layer is functioning correctly on its own, independent of the rest of the pipeline.

## How the backend should use this

```python
from language_layer.vlm_client import get_grounded_answer

grounding_data = call_grounding_pipeline(image_id)  # however backend gets this
result = get_grounded_answer(user_question, grounding_data)

# result["answer"]   -> the text answer to show the user
# result["evidence"] -> which detected classes the answer references,
#                        useful for highlighting the relevant part of
#                        the visual overlay on the frontend
```

## Things to improve as you go

- **Prompt tuning:** if answers are too verbose, too hedgy, or missing details, adjust the prompt template in `build_prompt()`. Small wording changes can meaningfully change output quality — test on several different question types before locking it in.
- **Evidence extraction:** the current method (checking if class names appear in the answer text) is crude. If time allows, a cleaner approach is asking the model to return structured output (e.g. JSON with `answer` and `evidence_classes` fields explicitly) instead of parsing plain text.
- **Error handling:** add a try/except around the `generate_content()` call in case of API rate limits or timeouts — return a graceful fallback message rather than crashing the whole request.
- **Query type coverage:** test against all your supported query categories (land-cover ID, counting, area estimation, change detection if in scope) — the prompt may need per-category tweaks if one type consistently performs worse.
