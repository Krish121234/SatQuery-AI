import React, { useState } from "react";
import { Search, Upload, ArrowRight } from "lucide-react";

export default function QueryBox({
  onSubmit,
  onOpenUpload,
  loading,
  hasImage,
  selectedPreset,
  onSelectPreset,
}) {
  const [question, setQuestion] = useState("");

  const suggestedQueries = [
    {
      label: "Detect water bodies & river basins",
      query: "What percentage of this landscape is covered by water bodies and river basins?",
      color: "text-[#435663] border-[#435663]/20 bg-[#435663]/5",
      dot: "bg-cyan-500",
    },
    {
      label: "Quantify agricultural land",
      query: "How much agricultural land and vegetation is detected in this region?",
      color: "text-[#435663] border-[#435663]/20 bg-[#435663]/5",
      dot: "bg-amber-500",
    },
    {
      label: "Find urban clusters",
      query: "Where are the primary built-up urban and industrial clusters located?",
      color: "text-[#435663] border-[#435663]/20 bg-[#435663]/5",
      dot: "bg-rose-500",
    },
    {
      label: "Forest canopy coverage",
      query: "What is the total coverage and distribution of dense forest vegetation?",
      color: "text-[#435663] border-[#435663]/20 bg-[#435663]/5",
      dot: "bg-emerald-500",
    },
  ];

  function handleSubmit(e) {
    e?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    onSubmit?.(trimmed);
  }

  function handleSelectSuggestion(item) {
    setQuestion(item.query);
    if (hasImage) {
      onSubmit?.(item.query);
    }
  }

  return (
    <div className="earth-panel p-4 sm:p-5 text-[#313647] transition-all">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#e2e0d6] text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset switches */}
          <button
            onClick={() => onSelectPreset?.("delta")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              selectedPreset === "delta"
                ? "bg-[#A3B087]/15 text-[#A3B087] border border-[#A3B087]/40 font-semibold"
                : "text-[#435663] hover:text-[#313647] hover:bg-[#f5f3ea] border border-[#e2e0d6]"
            }`}
          >
            Delta Agriculture
          </button>
          <button
            onClick={() => onSelectPreset?.("port")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              selectedPreset === "port"
                ? "bg-[#A3B087]/15 text-[#A3B087] border border-[#A3B087]/40 font-semibold"
                : "text-[#435663] hover:text-[#313647] hover:bg-[#f5f3ea] border border-[#e2e0d6]"
            }`}
          >
            Urban Port
          </button>
        </div>

        {/* Upload button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 rounded-full bg-white border border-[#e2e0d6] hover:border-[#A3B087]/50 hover:bg-[#f5f3ea] px-3 py-1 text-[#313647] font-medium text-xs transition-all shadow-sm"
        >
          <Upload className="h-3.5 w-3.5 text-[#A3B087]" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Title */}
      <div className="mt-4 mb-1">
        <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#313647]">
          Ask a question about this image
        </h2>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="relative flex items-center rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] focus-within:border-[#A3B087] focus-within:ring-1 focus-within:ring-[#A3B087]/40 transition-all shadow-sm">
          <div className="pl-3.5 pr-2 text-[#435663]/50">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about land cover, vegetation, water channels, or spatial changes..."
            className="w-full bg-transparent py-3 pr-2 text-xs sm:text-sm text-[#313647] placeholder-[#435663]/40 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 pr-2">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#A3B087] hover:bg-[#95a279] text-white font-semibold px-4 py-2 text-xs sm:text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-[#435663]/60">Try:</span>
        {suggestedQueries.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggestion(item)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all hover:bg-[#f5f3ea] ${item.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`}></span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
