# SatQuery AI — Software Requirements & Execution Plan
**SIH 2026 | PS 26167 | Organization: Indian Space Research Organisation (ISRO) | Theme: Space Technology**

---

## 1. Project Overview

**Title:** SatQuery AI — An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries

**One-line pitch:** A chat-based assistant that lets users ask natural-language questions about satellite imagery and get answers grounded in actual detected features — not hallucinated guesses — with visual overlays showing the evidence.

**Why this matters to ISRO:** Remote sensing data (from Bhuvan, IRS, Cartosat, RISAT, etc.) is abundant but requires domain expertise to interpret. SatQuery AI lowers that barrier — a district officer, farmer-support worker, or disaster response team can ask "how much flooding is visible near this village" instead of manually reading satellite tiles.

**Team size:** 6
**Timeline:** 10 days
**Constraints:** Free-tier Colab only, mostly-beginner ML team, 1 team member with solid web dev skills

---

## 2. Objectives

1. Accept a satellite/aerial image + natural-language question as input.
2. Extract structured, verifiable visual features from the image (land cover, objects, area, change) using pretrained models — no training from scratch.
3. Feed those structured features (not raw pixels) into a language model to generate a grounded, non-hallucinated answer.
4. Visualize the evidence behind the answer (bounding boxes, segmentation masks, or map overlay).
5. Present all of this through a clean, demo-able chat interface.

---

## 3. Scope

### In scope (MVP for hackathon)
- Single-image query answering (upload or select from a preset gallery)
- Support for 3–4 query categories:
  - Land-cover / land-use identification ("what kind of terrain is this?")
  - Object counting / presence ("how many buildings / water bodies are visible?")
  - Area estimation ("what % of this region is forest cover?")
  - (Stretch) Simple change detection between two images of the same location at different times
- Visual grounding overlay (bounding boxes / segmentation mask / highlighted region)
- Web-based chat UI
- Demo dataset: mix of Bhuvan-sourced sample tiles + RSVQA dataset for broader Q&A coverage

### Out of scope (explicitly, for the PPT — "future work" slide)
- Real-time satellite feed ingestion
- Model fine-tuning / training a custom VLM from scratch
- Multi-turn conversational memory across sessions
- Full national-scale deployment / production infrastructure
- Live Bhuvan API integration (if it proves too slow to set up in time)

---

## 4. System Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Frontend       │────▶│   Backend API         │────▶│  Grounding Pipeline  │
│  (Chat UI +      │     │  (Flask/FastAPI)       │     │  (Segmentation /     │
│   image upload,  │◀────│  orchestrates the      │◀────│   Detection model)   │
│   overlay render)│     │  request flow          │     │  → structured JSON   │
└─────────────────┘     └──────────┬─────────────┘     └─────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Language Layer      │
                         │  (VLM API call, fed    │
                         │   grounded JSON +      │
                         │   user's question)     │
                         └─────────────────────┘
                                    │
                                    ▼
                         Grounded natural-language
                         answer + reference to visual
                         evidence, returned to frontend
```

**Key design principle: grounding before generation.** The LLM never sees raw pixels alone — it receives structured outputs (detected classes, counts, area %, bounding box coordinates) extracted by a separate vision model. This is what makes answers "grounded" rather than hallucinated, and it's the single most important thing to explain clearly to judges.

---

## 5. Tech Stack

| Layer | Tool / Library | Why |
|---|---|---|
| Grounding model | Pretrained SAM (Segment Anything) or a pretrained ResNet/EfficientNet classifier fine-tuned lightly on BigEarthNet labels | No training from scratch; runs on free Colab GPU |
| Object detection (optional) | Pretrained YOLOv8 (small variant) | Fast inference, good for counting buildings/objects |
| Language model | GPT-4V / Gemini 1.5 Flash / Claude API (pick based on free credits available) | Handles NL understanding + generation; fed grounded JSON |
| Backend | Python, FastAPI or Flask | Lightweight, beginner-friendly, easy to deploy for demo |
| Frontend | React (or plain HTML/JS if faster for your web dev) + Tailwind | Chat interface, image upload, overlay rendering |
| Visualization | Leaflet.js (for map overlay) + Canvas/SVG for bounding box overlay on image | Shows "why" behind each answer |
| Dataset | RSVQA (pre-built satellite Q&A pairs) + sample Bhuvan tiles | RSVQA gives ready-made query/answer structure; Bhuvan tiles add ISRO relevance |
| Hosting (demo) | Colab (backend/model inference) + Vercel/Netlify (frontend) or all-in-one on a laptop for live demo | Free-tier friendly |
| Version control | GitHub | Team coordination |

---

## 6. Team Roles & Workload Division (6 people)

| Role | Person | Responsibilities |
|---|---|---|
| **ML Lead — Grounding** | Member 1 | Set up segmentation/detection model in Colab, output structured JSON per image, tune confidence thresholds |
| **ML Support — Data** | Member 2 | Curate RSVQA subset, source/prepare Bhuvan sample tiles, build the query-category taxonomy, help test grounding accuracy |
| **ML/Integration — Language Layer** | Member 3 | Design prompt templates, wire up VLM API calls, test grounded-answer quality across query types, handle edge cases |
| **Frontend Lead** | Member 4 (the web dev) | Build chat UI, image upload/selection, overlay rendering, connect to backend |
| **Backend/Integration** | Member 5 | Build FastAPI/Flask backend, connect frontend ↔ grounding pipeline ↔ language layer, handle API orchestration |
| **PPT, Demo & Docs Lead** | Member 6 | Own the pitch deck, architecture diagrams, demo script, record backup video, coordinate rehearsal, track ISRO-relevance framing |

**Note:** Roles overlap by design — ML members 1–3 should sync daily since grounding output format directly determines what the language layer can use. Members 4–5 should agree on the API contract (request/response JSON shape) by end of Day 1 so they can build in parallel without blocking each other.

---

## 7. Day-by-Day Execution Plan

### Day 1 — Lock scope + setup
- Finalize the 3–4 supported query categories
- Set up GitHub repo, Colab notebooks, shared drive for datasets
- Members 4 & 5 agree on API contract (request/response schema) so frontend and backend can build independently
- Member 2 starts downloading RSVQA + exploring Bhuvan data access

### Day 2–3 — Data + grounding pipeline
- Member 1: get pretrained segmentation/detection model running on sample images
- Output format locked: structured JSON with land-cover %, object counts, bounding boxes, confidence scores
- Member 2: finalize dataset — mix RSVQA pairs with Bhuvan sample tiles; build a small labeled test set (~30–50 images) for pipeline validation

### Day 4–5 — Language layer + grounding glue
- Member 3: build prompt template that takes {user question + grounded JSON} → grounded NL answer
- Test across all supported query categories; iterate until answers are reliably accurate and not hallucinated
- Start integrating grounding pipeline output directly into the language layer (no manual copy-paste)

### Day 6–7 — Frontend + visualization
- Member 4: build chat UI, image upload/gallery selection, response display
- Add visual overlay: bounding boxes / segmentation mask rendered on the image; map view if using geo-tagged data
- Member 5: backend endpoints live, frontend able to hit them with real (not mocked) data by end of Day 7

### Day 8 — End-to-end integration + bug fixing
- Full pipeline test: image + query in → grounded visual answer out
- Fix broken links between grounding output and LLM prompt
- Handle edge cases: no objects detected, ambiguous query, low-confidence grounding
- Add loading states, error handling in UI

### Day 9 — Polish + demo prep
- Curate 5–6 strong demo queries spanning different capabilities
- Record a backup demo video (in case live demo/wifi fails)
- Member 6: finalize PPT — problem statement, architecture diagram, tech stack, ISRO-relevance framing, live demo screenshots

### Day 10 — Rehearse + buffer
- Full run-through with timing
- Assign who presents what section
- Keep the day mostly free for last-minute fixes
- Prepare answers for likely judge questions (see Section 9)

---

## 8. Deliverables Checklist

- [ ] Working end-to-end demo (image + query → grounded answer + visual overlay)
- [ ] GitHub repo with clean README
- [ ] Architecture diagram
- [ ] PPT deck (problem, solution, architecture, tech stack, demo, impact, future work)
- [ ] Backup demo video
- [ ] One-pager / abstract (if required by SIH submission format)

---

## 9. Anticipated Judge Questions — Prep Notes

- **"Why didn't you fine-tune your own model?"** → Time and compute constraints for a 10-day hackathon; the grounding-before-generation architecture is the actual innovation — it prevents hallucination regardless of which underlying VLM is used, and is more production-realistic (swappable components) than a single fine-tuned monolith.
- **"How do you prevent hallucinated answers?"** → The LLM never sees raw pixels directly; it only reasons over structured, verifiable outputs (detected classes, counts, coordinates) from the grounding model. Answers can be traced back to specific detections.
- **"How would this scale to real ISRO data volumes?"** → Explain the modular pipeline (grounding model and language model are swappable/upgradable independently), and that production deployment would move from Colab to proper GPU inference serving + batch processing for large-area imagery.
- **"Why RSVQA and not live Bhuvan data?"** → Time constraint for a 10-day build; Bhuvan sample tiles are used to demonstrate relevance to Indian remote sensing use cases, with RSVQA providing the broader benchmark-quality Q&A structure. Live Bhuvan API integration is flagged as a clear next step.

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Free Colab GPU quota runs out mid-sprint | Cache/precompute grounding outputs for demo images in advance; don't rely on live inference during Colab downtime |
| VLM API rate limits/costs | Use a cheaper/faster model (e.g. Gemini Flash) for iteration, reserve stronger model calls for final demo queries |
| Live demo fails (wifi, API downtime) | Backup video recorded on Day 9; also keep a fully offline/local fallback if possible |
| Grounding model gives poor detections on chosen images | Curate demo image set to ones with clean, high-confidence detections — don't leave this to chance during the live demo |
| Team members blocked waiting on each other | API contract locked Day 1; frontend/backend can be built and tested independently against mock data until real integration on Day 6-7 |

---

*This document is a living plan — update it as scope decisions get made. Keep it in the repo root so the whole team stays aligned.*
