# Day 5 Progress — Real API Wiring & Mock Decoupling (Sep 5, 2026)

**Status:** ✅ Complete  
**Branch:** `feature/frontend`  

---

## What Got Done

### 1. Fixed API Response Mapping (`services/api.js`) ✅
- Added `computeSummary()` to transform backend string summary into `{ [class]: fraction }` for semantic breakdown.
- Added `extractEvidence()` to derive unique active land cover classes from tiles.
- Added `computeGroundedPct()` calculating average confidence dynamically across grounding tiles.
- Implemented `queryChange()` calling `POST /api/query/change` for multi-epoch temporal comparison.

### 2. Decoupled Mocks & Handled Live States (`App.jsx`) ✅
- Initialized `grounding` and `currentAnswer` to `null` so app starts clean without dummy data.
- Replaced fake catch-block fallbacks with real error alert banners with dismissal.
- Added `handleChangeDetection()` handler for temporal change queries.
- Connected live grounding updates to `ViewerHUD`, `AnalysisSidebar`, and `ResponseCards`.

### 3. Clean Dynamic Semantic Analysis (`AnalysisSidebar.jsx`) ✅
- Removed hardcoded default reducer counts (`{ Agriculture: 6, Vegetation: 2, ... }`).
- Removed hardcoded percentage fallbacks (`|| 38`, `|| 13`, etc.).
- Added graceful awaiting/standby state when no grounding data is present.

### 4. Multi-Epoch Change Detection Display (`BeforeAfterViewer.jsx`) ✅
- Wired `changeResult` prop into the temporal comparison viewer.
- Rendered change metrics HUD: total changed vs stable tile count badges.
- Rendered detected transition cards with tile ID, before/after class labels, and confidence change deltas.
- Added AI change summary callout block.

---

## Verification
- Production build succeeded cleanly with `npx vite build` (0 errors).
- All changes committed locally to `feature/frontend`.
