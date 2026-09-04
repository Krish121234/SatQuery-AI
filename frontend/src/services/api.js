/**
 * API Service — handles communication with the backend.
 *
 * Day 4: Now calling Lakshya's real FastAPI backend on localhost:8000
 */

const API_BASE_URL = "http://localhost:8000/api";

/**
 * Convert a data URL to a File object for multipart upload
 */
function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Query the backend with an image and question.
 *
 * @param {string} imageDataUrl - Base64 data URL of the uploaded image
 * @param {string} question - User's natural language question
 * @returns {Promise<object>} - Answer object with { answer, evidence, grounding }
 */
export async function queryImage(imageDataUrl, question) {
  // Convert data URL to File for multipart upload
  const imageFile = dataURLtoFile(imageDataUrl, "satellite-image.jpg");

  // Build FormData (backend expects multipart/form-data)
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("question", question);

  // Call backend
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    body: formData,
    // No Content-Type header — browser sets it automatically with boundary for FormData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend request failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  // Backend returns: { answer, grounding: { tiles, summary }, evidence }
  // Frontend expects: { image_id, question, answer, evidence, grounding }
  return {
    image_id: result.image_id || "unknown",
    question,
    answer: result.answer,
    evidence: result.evidence || [],
    grounding: result.grounding || { tiles: [], summary: {} },
  };
}
