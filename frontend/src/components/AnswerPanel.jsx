/**
 * AnswerPanel — displays the grounded answer returned by the backend.
 *
 * Day 1: stub with placeholder text.
 * Day 2: renders mock answer JSON.
 * Day 4: renders real answer + evidence percentages.
 */
export default function AnswerPanel({ answer, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          {/* Spinning loader */}
          <svg
            className="h-5 w-5 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-gray-600">Analyzing image and generating grounded answer...</span>
        </div>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-400 italic">
        Upload an image and ask a question to get a grounded answer.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-blue-50 p-4">
      <p className="text-sm leading-relaxed text-gray-800">{answer.answer}</p>
      {answer.evidence?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {answer.evidence.map((cls) => (
            <span
              key={cls}
              className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {cls.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
