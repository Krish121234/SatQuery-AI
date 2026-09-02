import { useState } from "react";

/**
 * QuestionInput — text input for the user's natural-language question.
 *
 * Day 1: stub with submit handler.
 * Day 2: wire to mock API call.
 * Day 3: real API call via services/api.js.
 */
export default function QuestionInput({ onSubmit, disabled }) {
  const [question, setQuestion] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setQuestion("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about this image…"
        disabled={disabled}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                   focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || !question.trim()}
        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white
                   transition hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Ask
      </button>
    </form>
  );
}
