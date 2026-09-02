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
      <div className="animate-pulse rounded-lg bg-gray-50 p-4">
        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
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
