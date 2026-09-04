# Project Notes

This folder contains local progress tracking, technical decisions, and session notes for the SatQuery AI project.

---

## Daily Progress Files

### `day1_progress.md`
What got done on Day 1 (Sep 2, 2026):
- Frontend scaffold complete (Vite + Tailwind + 5 component stubs)
- Tech stack choices and initial team contracts

### `day2_progress.md`
What got done on Day 2 (Sep 3, 2026):
- Question input box wired to mock API service
- Loading spinner with UX feedback
- Mock grounding format validation

### `day3_progress.md`
What got done on Day 3 (Sep 3–4, 2026):
- Enhanced Image Uploader with true drag & drop and curated satellite presets
- Futuristic cyber command center UI overhaul (aerospace HUD aesthetic)
- Interactive canvas reticle, dynamic coordinate tracking, and spectral band switcher (RGB, SWIR, SAR)
- Semantic analysis breakdown + Spectral Indices Matrix (NDVI / NDWI / SMI dials)
- Grounded query response cards with latency tracking and active class filtering

### `day4_progress.md`
What got done on Day 4 (Sep 4, 2026):
- Backend discovery on `backend/lakshya` branch and merge
- FastAPI import & dependency compatibility fixes (Pydantic / httpx / google-genai)
- Live end-to-end integration: `POST /api/query` via multipart `FormData`
- Fixed 422 Unprocessable Entity error using `Form(...)` parameters
- Live testing and verification between `localhost:5173` and `localhost:8000`

### `technical_decisions.md`
Why we chose specific technologies and approaches:
- Why Vite over CRA
- Component design rationale and state management
- Styling, performance, and security decisions

---

*Updated: Day 4, Sep 4, 2026*
