# SatQuery AI

An interactive vision-language assistant for querying satellite/remote-sensing imagery in natural language.

**SIH 2026 | PS 26167 | Organization: ISRO | Theme: Space Technology**

## Team & Roles

| Role | Folder | Owner |
|---|---|---|
| Grounding pipeline (segmentation/detection) | `grounding/` | Member 1 |
| Dataset curation (RSVQA + Bhuvan) | `data/` | Member 2 |
| Language layer (prompt + VLM calls) | `language_layer/` | Member 3 |
| Frontend (chat UI) | `frontend/` | Member 4 |
| Backend (API orchestration) | `backend/` | Member 5 |
| Docs, PPT, demo | `docs/` | Member 6 |

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd satquery-ai

# 2. Python environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Environment variables
cp .env.example .env
# Fill in your GEMINI_API_KEY in .env — NEVER commit this file

# 4. Frontend (once scaffolded)
cd frontend
npm install
```

## Architecture

See `docs/SatQuery_AI_SRS_Execution_Plan.md` for the full execution plan, and `docs/api_contract.md` for the request/response schema between frontend, backend, grounding, and language layers.

## Branching convention

- `main` — always demo-able
- `feature/<name>` — one branch per person/feature, PR into `main` when working end-to-end
- Sync daily — grounding output format directly affects the language layer, so don't let these drift out of sync

## Do not commit

- `.env` (API keys)
- Large raw dataset files (use `data/` locally, add a `data/README.md` noting where to download from instead)
- Colab checkpoint files
