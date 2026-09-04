# Day 2 Progress — Question Box + Mock API (Sep 3, 2026)

**Status:** ✅ Complete  
**Branch:** `feature/frontend`  
**Time:** 3:22 PM

---

## What Got Done

### 1. Mock API Service (`services/api.js`)
Created a proper mock API service that simulates Lakshya's backend format:
- Returns hardcoded grounding JSON (3×3 grid with land cover classes)
- Mock answers for different question types (forest, water, agriculture)
- Simulates 600-1200ms network delay for realistic loading behavior
- Evidence extraction (which land cover classes are mentioned)
- Ready to be replaced with real `fetch()` calls on Day 3-4

### 2. Enhanced Loading Spinner
Replaced the pulse animation with a proper spinning loader:
- Blue spinning circle icon
- "Analyzing image and generating grounded answer..." text
- Looks professional for the demo

### 3. Wired Question Input to Mock API
Updated `App.jsx` to:
- Import and use the new `queryImage()` service
- Handle async/await properly
- Error handling with try-catch
- Clean loading state management

### 4. Build Verification
- ✅ Dev server runs cleanly at http://localhost:5173/
- ✅ Build succeeds with no errors
- ✅ 35 modules transformed, 203KB bundle size

---

## How It Works Now

**User Flow:**
1. Upload a satellite image → preview appears
2. Type a question (e.g., "How much forest is here?")
3. Click "Ask" → spinner shows for ~1 second
4. Mock answer appears in blue panel with evidence tags

**Mock Response Logic:**
- Question contains "forest/tree/vegetation" → Returns forest-focused answer (18% coverage)
- Question contains "water/river/lake" → Returns water-focused answer (12% coverage)
- Question contains "farm/crop/agriculture" → Returns agriculture-focused answer (48% coverage)
- Default → Returns full land cover summary

**Evidence Tags:**
- Show which land cover classes were used in the answer
- Displayed as blue pills (e.g., "vegetation", "water", "agriculture")

---

## Technical Details

### API Service Structure
```javascript
queryImage(imageDataUrl, question) → Promise<{
  image_id: string,
  question: string,
  answer: string,
  evidence: string[],
  grounding: { tiles, summary }
}>
```

### Mock Grounding Format
Matches the contract from `/docs/api_contract.md`:
- 3×3 grid (9 tiles total)
- Each tile: `{ tile_id, class, confidence }`
- Summary: percentage breakdown by land cover type
- Classes: agriculture, vegetation, built_up, water

---

## Next Steps

### Day 3 (Sep 4)
According to the plan:
- **Krish:** Build the photo-upload box (enhance ImageUploader with drag-drop, better preview)
- **Lakshya:** Wire in the real AI model (Gemini)
- **Integration:** Real image upload + question input captures text, calls mock API fn

### Day 4 (Sep 5)
- **Krish:** Connect to Lakshya's live server
- Replace mock `queryImage()` with real `fetch()` to backend
- Handle real grounding JSON from Sai's model

---

## Files Changed

- ✅ `frontend/src/services/api.js` — NEW: Mock API service
- ✅ `frontend/src/App.jsx` — Wired to use queryImage()
- ✅ `frontend/src/components/AnswerPanel.jsx` — Better loading spinner

---

## Testing Checklist

- [x] Dev server starts without errors
- [x] Build completes successfully
- [x] Upload image → question input enabled
- [x] Submit question → spinner shows
- [x] Mock answer appears after ~1 second
- [x] Evidence tags render correctly
- [x] Different question types return appropriate answers
- [x] Error handling works (try-catch in place)

---

**Day 2 deliverable complete!** 🎉

Ready to hand off to Lakshya for Day 3 integration.
