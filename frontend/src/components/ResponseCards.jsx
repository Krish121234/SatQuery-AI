import React from "react";
import { Crosshair, Zap } from "lucide-react";

export default function ResponseCards({
  currentAnswer,
  history = [],
  loading,
  onFocusClass,
  focusedClass,
}) {
  if (loading) {
    return (
      <div className="earth-panel p-6 text-[#313647] flex items-center justify-center gap-4">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-[#A3B087] border-t-transparent"></div>
          <Zap className="h-4 w-4 text-[#A3B087]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#313647]">
            Analyzing image and extracting results…
          </span>
          <span className="text-xs text-[#435663]/60">
            Processing your query
          </span>
        </div>
      </div>
    );
  }

  const primaryAnswer = currentAnswer || {
    question: "What percentage of agricultural land shows active irrigation channels?",
    answer:
      "Active irrigation saturation connects 87.4% of agricultural zone via northern delta.\n\nDeep spatial verification across 412.8 km² detected 14 high-velocity feeder canals with healthy soil hydration.",
    evidence: ["Agriculture", "Water", "Vegetation"],
    groundedPct: "96.2%",
    latency: "284ms",
  };

  const secondaryAnswer = {
    question: "Eastern port container density",
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
            className={`earth-panel p-4 sm:p-5 flex flex-col justify-between gap-3 text-[#313647] transition-all duration-300 ${
              isPrimary
                ? "border-[#A3B087]/40 shadow-[0_2px_12px_rgba(163,176,135,0.12)]"
                : ""
            }`}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
              <span className="font-mono text-xs font-semibold tracking-wider text-[#A3B087]">
                RESPONSE {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1.5 rounded-full bg-[#A3B087]/10 border border-[#A3B087]/25 px-2.5 py-0.5 font-mono text-[11px] text-[#A3B087]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A3B087]"></span>
                <span>{card.groundedPct || "96.2%"} Grounded</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-semibold text-[#313647] leading-snug whitespace-pre-line tracking-tight">
                {card.answer}
              </p>

              {/* Evidence tags */}
              {card.evidence && card.evidence.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#435663]/50">Evidence:</span>
                  {card.evidence.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => onFocusClass?.(cls === focusedClass ? null : cls)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all border ${
                        cls.toLowerCase() === (focusedClass || "").toLowerCase()
                          ? "bg-[#A3B087]/20 text-[#A3B087] border-[#A3B087]/40"
                          : "bg-[#f5f3ea] text-[#435663] border-[#e2e0d6] hover:border-[#A3B087]/30"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e2e0d6] text-xs text-[#435663]/60">
              <span>Latency: {card.latency || "284ms"}</span>
              <button
                onClick={() => onFocusClass?.(card.evidence?.[0] || null)}
                className="flex items-center gap-1 text-[#A3B087] hover:text-[#95a279] font-semibold transition"
              >
                <span>Focus Area</span>
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
