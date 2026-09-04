import React, { useState } from "react";
import {
  Search,
  Upload,
  ArrowRight,
  Mic,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";

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
      label: "Detect water basin saturation & runoff",
      query: "What percentage of this landscape is covered by water bodies and river basins?",
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      dot: "bg-cyan-400",
    },
    {
      label: "Quantify agricultural parcel change",
      query: "How much agricultural land and vegetation is detected in this region?",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      dot: "bg-amber-400",
    },
    {
      label: "Analyze built-up urban infrastructure",
      query: "Where are the primary built-up urban and industrial clusters located?",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      dot: "bg-rose-400",
    },
    {
      label: "Dense forest canopy & biomass",
      query: "What is the total coverage and distribution of dense forest vegetation?",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      dot: "bg-emerald-400",
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
    <div className="hud-panel rounded-xl p-4 sm:p-5 text-slate-100 transition-all relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Target sensor badge */}
          <div className="flex items-center gap-1.5 rounded-md bg-slate-900/90 border border-cyan-500/30 px-2.5 py-1 text-cyan-300 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold">EOS-7 COASTAL BASIN</span>
            <span className="text-slate-500 font-sans">(Hyperion-V2)</span>
          </div>

          {/* Quick preset switches */}
          <button
            onClick={() => onSelectPreset?.("delta")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              selectedPreset === "delta"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/60"
            }`}
          >
            Delta Agriculture
          </button>
          <button
            onClick={() => onSelectPreset?.("port")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              selectedPreset === "port"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/60"
            }`}
          >
            Urban Port Berths
          </button>
        </div>

        {/* Right buttons: Upload & Confidence */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 px-3 py-1 text-slate-200 font-medium text-xs transition shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-cyan-400" />
            <span>Upload Raster / Image</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-400 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-semibold">99.4% Confidence</span>
          </div>
        </div>
      </div>

      {/* Main Prompt Bar Title */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span>Earth Observation Query</span>
            <span className="font-mono text-xs font-normal text-cyan-400/80">
              // Zero-shot geospatial inference
            </span>
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
          Natural language prompt
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="relative flex items-center rounded-xl bg-[#090e1c] border border-cyan-500/30 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
          <div className="pl-3.5 pr-2 text-cyan-400/70">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about land cover, vegetation density, water channels, or spatial changes..."
            className="w-full bg-transparent py-3 pr-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 pr-2">
            <button
              type="button"
              title="Voice Prompt (Simulated)"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
            >
              <Mic className="h-3.5 w-3.5" />
            </button>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                  <span>Inference...</span>
                </>
              ) : (
                <>
                  <span>Execute Query</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Prompt Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-mono text-slate-500">Try:</span>
        {suggestedQueries.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggestion(item)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition hover:scale-[1.02] ${item.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`}></span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
