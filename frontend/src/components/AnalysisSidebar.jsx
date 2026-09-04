import React from "react";
import { Activity, BarChart3, Droplets, Leaf, Building2, Layers } from "lucide-react";

export default function AnalysisSidebar({ grounding, onFilterClass, focusedClass }) {
  const tiles = grounding?.tiles || [];
  const summary = grounding?.summary || {};

  // Calculate percentages if not directly in summary
  const totalTiles = tiles.length || 16;
  const classCounts = tiles.reduce((acc, tile) => {
    const cls = tile.class || "Other";
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {
    Agriculture: 6,
    Vegetation: 2,
    Water: 4,
    "Built-up": 3,
    Barren: 1,
  });

  const agriPct = Math.round(((classCounts.Agriculture || 0) / totalTiles) * 100) || 38;
  const forestPct = Math.round(((classCounts.Vegetation || classCounts.Forest || 0) / totalTiles) * 100) || 13;
  const waterPct = Math.round(((classCounts.Water || 0) / totalTiles) * 100) || 25;
  const urbanPct = Math.round(((classCounts["Built-up"] || classCounts.Urban || 0) / totalTiles) * 100) || 19;

  // Approximate metrics
  const totalAreaKm2 = 1061.5;
  const agriArea = ((agriPct / 100) * totalAreaKm2).toFixed(1);
  const forestArea = ((forestPct / 100) * totalAreaKm2).toFixed(1);
  const waterArea = ((waterPct / 100) * totalAreaKm2).toFixed(1);
  const urbanArea = ((urbanPct / 100) * totalAreaKm2).toFixed(1);

  // Spectral indices dynamic estimates
  const ndviScore = (0.35 + (forestPct / 100) * 0.5 + (agriPct / 100) * 0.3).toFixed(2);
  const ndwiScore = (-0.5 + (waterPct / 100) * 0.9).toFixed(2);
  const smiScore = Math.min(Math.round(30 + (waterPct + agriPct) * 0.6), 95);

  const categories = [
    {
      id: "Agriculture",
      label: "Agricultural Parcels",
      pct: agriPct,
      confidence: "94.8%",
      area: `${agriArea} km²`,
      subMetric: "Irrigation: 0.89",
      barColor: "from-cyan-400 to-cyan-500",
      textColor: "text-cyan-400",
      dotColor: "bg-cyan-400",
    },
    {
      id: "Vegetation",
      label: "Dense Forest Canopy",
      pct: forestPct,
      confidence: "88.2%",
      area: `${forestArea} km²`,
      subMetric: "Dense Biomass",
      barColor: "from-emerald-400 to-emerald-500",
      textColor: "text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      id: "Water",
      label: "Maritime & River Basin",
      pct: waterPct,
      confidence: "81.5%",
      area: `${waterArea} km²`,
      subMetric: "Salinity: 1.02%",
      barColor: "from-blue-400 to-cyan-500",
      textColor: "text-blue-400",
      dotColor: "bg-blue-400",
    },
    {
      id: "Built-up",
      label: "Industrial Port & Logistics",
      pct: urbanPct,
      confidence: "76.4%",
      area: `${urbanArea} km²`,
      subMetric: "Operational",
      barColor: "from-rose-400 to-rose-500",
      textColor: "text-rose-400",
      dotColor: "bg-rose-400",
    },
  ];

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4">
      {/* Semantic Analysis Panel */}
      <div className="hud-panel rounded-xl p-4 text-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              SEMANTIC ANALYSIS
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Spectral Land Classification
            </h3>
          </div>
          <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
            {totalAreaKm2} km²
          </span>
        </div>

        {/* Classification Progress Rows */}
        <div className="flex flex-col gap-3.5 mt-1">
          {categories.map((cat) => {
            const isFocused = focusedClass === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onFilterClass?.(cat.id === focusedClass ? null : cat.id)}
                className={`group cursor-pointer rounded-lg p-2 transition-all ${
                  isFocused
                    ? "bg-slate-900/90 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "hover:bg-slate-900/40 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${cat.dotColor}`}></span>
                    <span className="text-slate-200">{cat.label}</span>
                  </div>
                  <span className={`font-mono font-bold ${cat.textColor}`}>
                    {cat.pct}%
                  </span>
                </div>

                {/* Gradient Progress Bar */}
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800/60">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.barColor} transition-all duration-500`}
                    style={{ width: `${cat.pct}%` }}
                  ></div>
                </div>

                {/* Submetrics */}
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Coverage: {cat.area}</span>
                  <span className="text-slate-400 font-sans">{cat.subMetric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spectral Indices Matrix Panel */}
      <div className="hud-panel rounded-xl p-4 text-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
            Spectral Indices Matrix
          </h3>
          <span className="text-[10px] font-mono font-bold text-cyan-400">
            MULTI-CHANNEL
          </span>
        </div>

        {/* Circular Dials Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* NDVI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 text-center">
            <span className="text-[10px] font-mono font-semibold text-slate-400">NDVI</span>
            <div className="relative my-2 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="74, 100"
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-emerald-300">
                {ndviScore}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">
              HIGH VEG
            </span>
          </div>

          {/* NDWI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 text-center">
            <span className="text-[10px] font-mono font-semibold text-slate-400">NDWI</span>
            <div className="relative my-2 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400"
                  strokeDasharray="52, 100"
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-cyan-300">
                {ndwiScore}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">
              COASTAL
            </span>
          </div>

          {/* SMI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 text-center">
            <span className="text-[10px] font-mono font-semibold text-slate-400">SMI</span>
            <div className="relative my-2 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray={`${smiScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-amber-300">
                {smiScore}%
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase">
              MOISTURE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
