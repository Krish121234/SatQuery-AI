/**
 * API Service — handles communication with the backend.
 */

const API_BASE_URL = "http://localhost:8000/api";

async function toUploadFile(value, filename) {
  if (value instanceof File) return value;

  if (typeof value === "string" && value.startsWith("data:")) {
    const [header, encoded] = value.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new File([bytes], filename, { type: mime });
  }

  if (typeof value === "string") {
    const response = await fetch(value);
    if (!response.ok) {
      throw new Error(`Unable to load image for upload: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  }

  throw new Error("An image file or image URL is required");
}

async function postMultipart(path, formData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function queryImage(image, question) {
  const formData = new FormData();
  formData.append("file", await toUploadFile(image, "satellite-image.jpg"));
  formData.append("question", question);
  const result = await postMultipart("/query", formData);

  return {
    image_id: result.image_id || result.filename || "unknown",
    question: result.question || question,
    answer: result.answer || "No answer returned by the backend.",
    evidence: result.evidence || [],
    grounding: result.grounding || { grid: { rows: 8, cols: 8 }, tiles: [] },
  };
}

export async function queryChange(beforeImage, afterImage, question = "") {
  const formData = new FormData();
  formData.append("before_file", await toUploadFile(beforeImage, "before-image.jpg"));
  formData.append("after_file", await toUploadFile(afterImage, "after-image.jpg"));
  formData.append("before_question", question);
  formData.append("after_question", question);
  return postMultipart("/query/change", formData);
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  return response.json();
}
