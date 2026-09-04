import React from "react";
import { Sparkles, CheckCircle, Crosshair, Cpu, ArrowUpRight, Zap } from "lucide-react";

export default function ResponseCards({
  currentAnswer,
  history = [],
  loading,
  onFocusClass,
  focusedClass,
}) {
  if (loading) {
    return (
      <div className="hud-panel rounded-xl p-6 text-slate-100 flex items-center justify-center gap-4">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
          <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-cyan-300">
            Running Zero-Shot Inference & Grounding Extraction...
          </span>
          <span className="text-xs font-mono text-slate-500">
            Routing question ➔ Grounding facts ➔ Gemini language synthesis
          </span>
        </div>
      </div>
    );
  }

  // Use current answer or default demo card if none yet
  const primaryAnswer = currentAnswer || {
    question: "What percentage of agricultural land shows active irrigation channels?",
    answer:
      "Active irrigation saturation connects 87.4% of agricultural zone via northern delta.\n\nDeep spatial verification across 412.8 km² detected 14 high-velocity feeder canals with healthy soil hydration.",
    evidence: ["Agriculture", "Water", "Vegetation"],
    groundedPct: "96.2%",
    latency: "284ms",
  };

  const secondaryAnswer = {
    question: "Eastern port berth container density",
    answer:
      "Eastern port berths 3 & 4 show 92% container density with heavy gantry clustering.\n\nConnecting corridors maintain steady flow with zero structural queue degradation.",
    evidence: ["Built-up", "Water"],
    groundedPct: "94.7%",
    latency: "310ms",
  };

  const cards = currentAnswer
    ? [currentAnswer, ...(history.slice(0, 1))]
    : [primaryAnswer, secondaryAnswer];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, idx) => {
        const isPrimary = idx === 0;
        return (
          <div
            key={idx}
            className={`hud-panel rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 text-slate-100 transition-all duration-300 relative overflow-hidden ${
              isPrimary
                ? "border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                : "border-slate-800/80"
            }`}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-mono text-xs font-bold tracking-wider text-cyan-400">
                QUERY RESPONSE {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{card.groundedPct || "96.2% Grounded"}</span>
              </div>
            </div>

            {/* Content Headline & Body */}
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-bold text-white leading-snug whitespace-pre-line tracking-tight">
                {card.answer}
              </p>

              {/* Evidence tags */}
              {card.evidence && card.evidence.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-slate-500">Evidence:</span>
                  {card.evidence.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => onFocusClass?.(cls === focusedClass ? null : cls)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold transition border ${
                        cls.toLowerCase() === (focusedClass || "").toLowerCase()
                          ? "bg-cyan-500/30 text-cyan-300 border-cyan-400"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span>Latency: {card.latency || "284ms"}</span>
              </div>

              <button
                onClick={() => onFocusClass?.(card.evidence?.[0] || null)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                <span>Focus Target Area</span>
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
