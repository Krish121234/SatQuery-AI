import React, { useState } from "react";
import { Layers, ArrowRight, Sparkles, RefreshCw, Calendar } from "lucide-react";

export default function BeforeAfterViewer({
  beforeSrc = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  afterSrc = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  beforeDate = "2019-08-14",
  afterDate = "2024-09-02",
  onRunComparison,
  loading,
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [question, setQuestion] = useState(
    "What land cover changes occurred between 2019 and 2024 in this flood basin?"
  );

  return (
    <div className="hud-panel rounded-xl p-5 text-slate-100 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            TEMPORAL SYNTHESIS
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">
            Multi-Epoch Change & Flood Detection
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
            T0: <strong className="text-cyan-400">{beforeDate}</strong>
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
          <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
            T1: <strong className="text-emerald-400">{afterDate}</strong>
          </span>
        </div>
      </div>

      {/* Split Interactive Slider Viewport */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-xl border border-slate-800 select-none">
        {/* After Image (Background) */}
        <img
          src={afterSrc}
          alt="After epoch"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 z-10 rounded bg-slate-950/80 border border-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
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
          <span className="absolute top-3 left-3 z-10 rounded bg-slate-950/80 border border-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400">
            BEFORE ({beforeDate})
          </span>
        </div>

        {/* Split Divider Bar */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] cursor-ew-resize flex items-center justify-center -translate-x-1/2"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 bg-slate-950 shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-cyan-300">
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

      {/* Change Inference Prompt */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono font-semibold text-slate-400">
          Change Detection Query Prompt:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => onRunComparison?.(question)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
          >
            <span>Analyze Epoch Shift</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
