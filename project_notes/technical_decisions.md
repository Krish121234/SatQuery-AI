# Technical Decisions — SatQuery AI Frontend

This file tracks architectural and technical choices made during development, with rationale.

---

## Frontend Stack

### Why Vite (not Create React App)?
- **Faster dev server** — Vite uses native ES modules, instant hot reload
- **Smaller bundle size** — Better tree-shaking than CRA's webpack config
- **Simpler config** — `vite.config.js` is minimal vs. ejected CRA complexity
- **Modern default** — CRA is deprecated/unmaintained as of 2024

### Why React 19?
- Latest stable release
- Using newest APIs (no legacy hooks warnings)
- Team member (Krish) familiar with React

### Why Tailwind CSS 4?
- **Utility-first** — Faster iteration than writing separate CSS files
- **No naming conflicts** — Scoped by default (no BEM/CSS Modules needed)
- **Small learning curve** — Readable class names (`bg-blue-500`, `text-sm`)
- **v4 Vite plugin** — Zero-config setup, automatic purging

### Why No Routing Library?
- **Single-page app** — Only 2 tabs, no URL routing needed
- **Simpler state** — Just `useState("query" | "change")` for tab switching
- **Faster to build** — Avoid React Router setup overhead for a 10-day sprint
- **If needed later:** Can add React Router in 15 minutes if judges ask for shareable URLs

### Why No Global State Management (Redux/Zustand)?
- **Scope is small** — Only 3 pieces of shared state:
  1. Selected image (uploaded file + dataURL)
  2. Current answer (from backend)
  3. Loading state
- **Prop drilling is shallow** — Max 2 levels (App → component → subcomponent)
- **Premature optimization** — Can refactor to Zustand if state gets complex
- **Faster iteration** — `useState` + props is simpler to debug

---

## Data Flow Decisions

### Image Upload: Base64 DataURL (not Blob URLs)
**Chosen:** FileReader → base64 dataURL string  
**Alternative considered:** `URL.createObjectURL(file)` → blob URL

**Why base64?**
- Easier to pass to backend as JSON (if needed)
- Persists across re-renders without manual cleanup
- Simpler mental model for team

**Tradeoff:** Slightly larger memory footprint for large images, but satellite tiles are typically 1-5 MB (acceptable for a demo)

### Backend Communication: REST (not WebSockets)
**Chosen:** `POST /api/query` with JSON request/response  
**Alternative considered:** WebSocket stream for real-time grounding + answer generation

**Why REST?**
- **Simpler to build** — FastAPI REST endpoint is straightforward, WebSocket needs connection management
- **No real-time requirement** — User submits question → waits 2-5 seconds → gets answer (batch workflow, not streaming)
- **Easier to debug** — Can use Postman/curl to test backend independently
- **If streaming needed later:** Can add Server-Sent Events (SSE) for progress updates without major frontend changes

### Error Handling Strategy
**Chosen:** Try-catch around fetch, show error message in `AnswerPanel`  
**Not doing (yet):** Retry logic, exponential backoff, offline queue

**Why simple error handling?**
- **Demo environment** — Wifi/API will be stable during presentation
- **Fail-fast is fine** — If backend is down, surface it immediately
- **Can add retries later** — If live demo wifi is flaky, add a "Retry" button on Day 9

---

## Component Design Decisions

### Why 5 Separate Components (not 1 big App.jsx)?
- **Reusability** — `ImageUploader` can be used for both single query and change detection tabs
- **Parallel work** — Other team members can understand/modify one component without reading the whole file
- **Testability** — Easier to test `QuestionInput` in isolation than embedded in App
- **Standard React practice** — Matches team's existing mental model

### ImageUploader: Controlled vs. Uncontrolled Input?
**Chosen:** Uncontrolled `<input type="file">` (no `value` prop)  
**Why?** File inputs can't be controlled in React (browser security restriction). Preview state is controlled separately via `useState(preview)`.

### OverlayCanvas: Canvas API vs. SVG?
**Decision deferred to Day 6** — will choose based on grounding output format

**Canvas pros:**
- Better performance for complex masks (1000s of pixels)
- Easier to composite with uploaded image

**SVG pros:**
- Easier to make interactive (hover on bounding box → tooltip)
- Scales infinitely (zoom without pixelation)
- Simpler to debug (inspect element in DevTools)

**Likely choice:** Hybrid — SVG for bounding boxes (rectangles), Canvas for segmentation masks (pixel arrays)

---

## Styling Decisions

### Color Palette
```css
/* Neutrals (Tailwind defaults) */
bg-gray-50   /* page background */
bg-white     /* card background */
text-gray-900 /* primary text */
text-gray-500 /* secondary text */

/* Accent */
text-blue-600  /* primary actions, active tab */
border-blue-400 /* focus states */

/* Semantic */
text-red-500   /* remove button, errors */
bg-amber-50    /* info banners */
```

**Why this palette?**
- **Neutral base** — Doesn't compete with satellite imagery colors
- **Blue accent** — Matches space/tech theme (ISRO branding often uses blue)
- **High contrast** — Readable on projector during demo

### Responsive Breakpoints
- **Mobile (default):** Single column, stacked layout
- **Desktop (`md:` = 768px+):** 2-column grid (image left, Q&A right)

**Why only 1 breakpoint?** Demo will be on laptop (likely 1920×1080), and judges will view on desktop. Mobile optimization is nice-to-have, not required.

---

## Open Questions (to resolve with team)

1. **Image format for backend upload:** Base64 JSON payload, or multipart form-data?
   - *Decision needed by:* Day 3 (when wiring real backend)
   - *Blocker for:* Frontend fetch() call implementation

2. **Bounding box coordinate system:** Pixel coords relative to original image, or normalized 0-1 range?
   - *Decision needed by:* Day 6 (when implementing overlay rendering)
   - *Blocker for:* OverlayCanvas implementation

3. **Change detection workflow:** Upload 2 images simultaneously, or select "before" then "after" in sequence?
   - *Decision needed by:* Day 5 (if implementing change detection at all)
   - *Blocker for:* BeforeAfterViewer component

---

*Last updated: Day 1 (Sep 2, 2026)*
