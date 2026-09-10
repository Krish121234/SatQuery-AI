import React, { useState } from "react";
import { Layers, ArrowRight, Sparkles, RefreshCw, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function BeforeAfterViewer({
  beforeSrc = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  afterSrc = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  beforeDate = "2019-08-14",
  afterDate = "2024-09-02",
  onRunComparison,
  loading,
  result,
  changeResult,
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [question, setQuestion] = useState(
    "What land cover changes occurred between 2019 and 2024 in this flood basin?"
  );

  const activeResult = changeResult || result;
  const changeData = activeResult?.change_detection || activeResult?.changeDetection;

  return (
    <div className="earth-panel p-5 text-[#313647] flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e2e0d6]">
        <div>
          <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider">
            CHANGE DETECTION
          </span>
          <h3 className="text-base font-bold text-[#313647] tracking-tight">
            Temporal Comparison
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] px-2.5 py-1 text-[#435663]">
            Before: <strong className="text-[#313647]">{beforeDate}</strong>
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[#435663]/40" />
          <span className="rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] px-2.5 py-1 text-[#435663]">
            After: <strong className="text-[#A3B087]">{afterDate}</strong>
          </span>
        </div>
      </div>

      {/* Split Interactive Slider Viewport */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-xl border border-[#e2e0d6] select-none shadow-sm">
        {/* After Image (Background) */}
        <img
          src={afterSrc}
          alt="After epoch"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 z-10 rounded-lg bg-white/90 border border-[#e2e0d6] px-2 py-0.5 font-mono text-xs font-bold text-[#A3B087] backdrop-blur-sm">
          AFTER ({afterDate})
        </span>

        {/* Before Image (Clipped by slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeSrc}
            alt="Before epoch"
            className="absolute inset-0 h-full w-full object-cover max-w-none"
            style={{ width: "100%", height: "100%" }}
          />
          <span className="absolute top-3 left-3 z-10 rounded-lg bg-white/90 border border-[#e2e0d6] px-2 py-0.5 font-mono text-xs font-bold text-[#313647] backdrop-blur-sm">
            BEFORE ({beforeDate})
          </span>
        </div>

        {/* Split Divider Bar */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-[#A3B087] cursor-ew-resize flex items-center justify-center -translate-x-1/2"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="h-8 w-8 rounded-full border-2 border-[#A3B087] bg-white shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-[#A3B087]">
            ⇄
          </div>
        </div>

        {/* Transparent Range Input Slider on Top */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 z-30 opacity-0 cursor-ew-resize h-full w-full"
        />
      </div>

      {/* Change Detection Query */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#435663]">
          Change detection query:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] px-4 py-2.5 text-xs sm:text-sm text-[#313647] placeholder-[#435663]/40 focus:outline-none focus:border-[#A3B087] focus:ring-1 focus:ring-[#A3B087]/40"
          />
          <button
            onClick={() => onRunComparison?.(question)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white font-bold px-4 py-2 text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <span>Analyze Changes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Change Detection Results Panel */}
      {changeData && (
        <div className="flex flex-col gap-4 pt-2 border-t border-[#e2e0d6]">
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider">
                CHANGE DETECTION RESULTS
              </span>
              <h4 className="text-sm font-bold text-[#313647] tracking-tight">
                Temporal Analysis
              </h4>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-rose-600 font-bold">
                <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5" />
                {changeData.change_count || changeData.changeCount || 0} Changed
              </span>
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-600 font-bold">
                <CheckCircle2 className="inline h-3 w-3 mr-1 -mt-0.5" />
                {changeData.unchanged_count || changeData.unchangedCount || 0} Stable
              </span>
            </div>
          </div>

          {/* AI Summary */}
          {changeData.summary && (
            <div className="rounded-xl bg-[#f5f3ea] border border-[#e2e0d6] px-4 py-3">
              <span className="text-[10px] font-mono font-bold text-[#435663]/50 uppercase block mb-1">
                AI Summary
              </span>
              <p className="text-sm text-[#313647] leading-relaxed">
                {changeData.summary}
              </p>
            </div>
          )}

          {/* Changed Tiles Grid */}
          {changeData.changes && changeData.changes.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-semibold text-[#435663]/60 uppercase">
                Detected Transitions ({changeData.changes.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {changeData.changes.slice(0, 15).map((change, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] px-3 py-2.5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#435663]/50">
                        TILE #{change.tile_id}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        Math.abs(change.confidence_change || 0) > 0.1
                          ? "text-rose-500"
                          : "text-amber-500"
                      }`}>
                        Δ {((change.confidence_change || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#435663] font-medium">{change.before_class}</span>
                      <ArrowRight className="h-3 w-3 text-[#435663]/30 flex-shrink-0" />
                      <span className="text-[#A3B087] font-bold">{change.after_class}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
