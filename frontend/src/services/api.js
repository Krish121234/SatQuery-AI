/**
 * API Service — handles communication with the backend.
 *
 * Day 2: Returns hardcoded mock responses from Lakshya's pretend answer format.
 * Day 3-4: Will be updated to call real backend endpoints.
 */

// Mock grounding data (from Lakshya's mock format)
const MOCK_GROUNDING = {
  image_id: "sample_001",
  grid: { rows: 3, cols: 3 },
  tiles: [
    { tile_id: "tile_1", class: "vegetation", confidence: 0.91 },
    { tile_id: "tile_2", class: "agriculture", confidence: 0.76 },
    { tile_id: "tile_3", class: "built_up", confidence: 0.83 },
    { tile_id: "tile_4", class: "built_up", confidence: 0.94 },
    { tile_id: "tile_5", class: "agriculture", confidence: 0.67 },
    { tile_id: "tile_6", class: "water", confidence: 0.88 },
    { tile_id: "tile_7", class: "vegetation", confidence: 0.90 },
    { tile_id: "tile_8", class: "water", confidence: 0.95 },
    { tile_id: "tile_9", class: "agriculture", confidence: 0.81 },
  ],
  summary: {
    agriculture: 0.48,
    vegetation: 0.18,
    built_up: 0.22,
    water: 0.12,
  },
};

// Mock answer responses based on question type
const MOCK_ANSWERS = {
  forest: "Approximately 18% of this region is covered by vegetation (forest). The forested areas are primarily located in the northern and southwestern sections of the analyzed region.",
  water: "Water bodies are concentrated primarily in the southeastern and central-right regions of the image, covering approximately 12% of the total area.",
  agriculture: "Agricultural land is dominant, covering approximately 48% of the analyzed region. Built-up areas account for ~22%, vegetation ~18%, and water bodies ~12%.",
  default: "Based on the grounding analysis: Agricultural land is dominant (48%), followed by built-up areas (22%), vegetation (18%), and water bodies (12%).",
};

/**
 * Query the backend with an image and question.
 *
 * @param {string} imageDataUrl - Base64 data URL of the uploaded image
 * @param {string} question - User's natural language question
 * @returns {Promise<object>} - Answer object with { answer, evidence, grounding }
 */
export async function queryImage(imageDataUrl, question) {
  // Simulate network delay (600-1200ms)
  const delay = 600 + Math.random() * 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Simple question classification for mock responses
  const q = question.toLowerCase();
  let answer = MOCK_ANSWERS.default;
  let evidence = ["agriculture", "built_up", "vegetation", "water"];

  if (q.includes("forest") || q.includes("tree") || q.includes("vegetation")) {
    answer = MOCK_ANSWERS.forest;
    evidence = ["vegetation"];
  } else if (q.includes("water") || q.includes("river") || q.includes("lake")) {
    answer = MOCK_ANSWERS.water;
    evidence = ["water"];
  } else if (q.includes("farm") || q.includes("crop") || q.includes("agriculture")) {
    answer = MOCK_ANSWERS.agriculture;
    evidence = ["agriculture", "built_up", "vegetation", "water"];
  }

  // Return mock response in the expected format
  return {
    image_id: MOCK_GROUNDING.image_id,
    question,
    answer,
    evidence, // List of land cover classes mentioned in the answer
    grounding: MOCK_GROUNDING, // Full grounding JSON (for overlay rendering later)
  };
}

/**
 * Day 3-4: This will be replaced with real fetch() calls like:
 *
 * export async function queryImage(imageDataUrl, question) {
 *   const response = await fetch('http://localhost:8000/api/query', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ image: imageDataUrl, question })
 *   });
 *   if (!response.ok) throw new Error('Backend request failed');
 *   return response.json();
 * }
 */
