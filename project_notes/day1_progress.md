# Day 1 Progress — Frontend Scaffold (Sep 2, 2026)

**Status:** ✅ Complete  
**Branch:** `feature/frontend`  
**Last Commit:** `0fcf53b` — "feat(frontend): scaffold Vite+Tailwind app with 5 component stubs (Day 1)"

---

## What Got Done

### Frontend Scaffold Complete
All 5 core components built and wired:

1. **ImageUploader.jsx**
   - File upload with preview
   - Base64 dataURL generation for local display
   - Remove/reset functionality
   - Accepts image/* (PNG, JPG up to 10 MB indicated in UI)

2. **QuestionInput.jsx**
   - Text input for natural language queries
   - Disabled state when no image selected or loading

3. **AnswerPanel.jsx**
   - Display area for grounded answers
   - Loading state placeholder
   - Evidence class display (forest, water_body, etc.)

4. **OverlayCanvas.jsx**
   - Stub for bounding box / segmentation mask rendering
   - Will overlay detections on uploaded image (Day 6-7 work)

5. **BeforeAfterViewer.jsx**
   - Stub for change detection (stretch goal)
   - Placeholder UI only — implementation planned for Day 5

### App.jsx Layout
- Two-tab switcher: "Single Query" | "Change Detection"
- Single Query tab: 2-column grid (image upload/overlay left, Q&A right)
- Change Detection tab: placeholder message
- Header with project branding (SatQuery AI + ISRO PS 26167)
- Stub response simulation (600ms delay → placeholder answer)

### Current Behavior
- Upload image → preview appears
- Type question → submit button enabled
- Submit → 600ms fake loading → stub response appears:
  ```
  "[Stub response for: "<question>"] Backend integration coming on Day 3-4."
  ```
- Zero console errors, app runs cleanly

---

## Tech Stack

### Frontend
- **Vite 6.3.5** — Fast dev server, hot reload
- **React 19.1.0** — Latest stable
- **Tailwind CSS 4.1.8** — Utility-first styling
- **No routing library** — Single-page app with tab state only
- **No state management library** — Local `useState` sufficient for MVP

### File Structure
```
frontend/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx          (app entry point)
│   ├── App.jsx           (main layout + tab logic)
│   ├── index.css         (Tailwind imports)
│   └── components/
│       ├── ImageUploader.jsx
│       ├── QuestionInput.jsx
│       ├── AnswerPanel.jsx
│       ├── OverlayCanvas.jsx
│       └── BeforeAfterViewer.jsx
```

---

## Integration Notes

### API Contract (from `/docs/api_contract.md`)
**Request shape** (frontend → backend):
```json
{
  "image_id": "sample_001",
  "question": "What percentage of this region is forest cover?"
}
```

**Response shape** (backend → frontend):
```json
{
  "image_id": "sample_001",
  "question": "...",
  "answer": "Approximately 34% of this region is covered by forest...",
  "overlay": {
    "type": "highlight",
    "regions": [
      { "class": "forest", "area_percent": 34.2 }
    ]
  }
}
```

**Bounding box format:** `[x_min, y_min, x_max, y_max]` in pixel coordinates

### Backend Status
- **Not created yet** — Member 5's responsibility
- Frontend currently uses stub/mock responses
- Day 2-3: Will integrate with mock data locally
- Day 6-7: Real backend endpoints expected to be live

### Language Layer (Member 3)
- Already working! (`/language_layer/vlm_client.py`)
- Uses Gemini 2.5 Flash API
- Takes question + grounding JSON → returns grounded answer
- Includes crude evidence extraction (which classes were referenced)

---

## Key Architecture Principle

### Grounding Before Generation
- **Critical design principle:** LLM never sees raw pixels
- Grounding pipeline (segmentation/detection model) runs first → outputs structured JSON (land cover %, object counts, bboxes, confidence scores)
- Language layer (Gemini) sees only that JSON + user question → generates grounded answer
- This prevents hallucination and is the main innovation of the project

---

## Next Steps (Day 2-3)

### Immediate (Day 2)
1. Create mock grounding JSON responses locally
2. Wire mock data into `OverlayCanvas` to test bbox/mask rendering
3. Test different query categories (land cover, object counting, area estimation)
4. Coordinate with Member 5 on backend API endpoint design

### Day 3-4
1. Backend endpoints expected to be scaffolded by Member 5
2. Replace stub response with real `fetch()` calls to backend
3. Handle loading states, error states properly
4. Test with actual grounding pipeline outputs from Member 1

### Day 6-7 (your main work window)
1. Implement visual overlay rendering (bboxes, segmentation masks, highlighted regions)
2. Color-code evidence classes (forest=green, water=blue, etc.)
3. Make overlay interactive (hover to see class name + confidence)
4. Polish UI (loading spinners, error messages, empty states)

---

## Questions / Blockers
None currently. Day 1 deliverable complete, ready for Day 2 mock data integration.
