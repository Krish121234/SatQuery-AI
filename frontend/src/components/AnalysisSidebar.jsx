import React from "react";
import { Activity, BarChart3, Droplets, Leaf, Building2, Layers } from "lucide-react";

export default function AnalysisSidebar({ grounding, onFilterClass, focusedClass }) {
  const tiles = grounding?.tiles || [];
  const totalTiles = tiles.length;

  // No grounding data yet — show standby placeholder
  if (!grounding || totalTiles === 0) {
    return (
      <aside className="w-full lg:w-80 flex flex-col gap-4">
        <div className="earth-panel p-4 text-[#313647] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
            <div>
              <span className="text-[10px] font-mono text-[#A3B087] uppercase tracking-wider font-bold">
                LAND ANALYSIS
              </span>
              <h3 className="text-sm font-bold text-[#313647] tracking-tight">
                Spectral Land Classification
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-[#435663]/50">
            <Activity className="h-8 w-8 text-[#A3B087]/30 mb-2" />
            <p className="text-xs text-[#435663]/70 font-medium">Awaiting query results</p>
            <p className="text-[10px] text-[#435663]/40 mt-1">Submit a question to analyze the image</p>
          </div>
        </div>

        <div className="earth-panel p-4 text-[#313647] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
            <h3 className="text-xs font-bold font-mono tracking-wider text-[#435663] uppercase">
              Spectral Indices
            </h3>
            <span className="text-[10px] font-mono font-bold text-[#435663]/50">
              STANDBY
            </span>
          </div>
          <div className="flex items-center justify-center py-6 text-xs text-[#435663]/50">
            No telemetry data available
          </div>
        </div>
      </aside>
    );
  }

  // Calculate percentages from real tile data
  const classCounts = tiles.reduce((acc, tile) => {
    const cls = tile.class || "Other";
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const agriPct = Math.round(((classCounts.Agriculture || 0) / totalTiles) * 100);
  const forestPct = Math.round(((classCounts.Vegetation || classCounts.Forest || 0) / totalTiles) * 100);
  const waterPct = Math.round(((classCounts.Water || 0) / totalTiles) * 100);
  const urbanPct = Math.round(((classCounts["Built-up"] || classCounts.Urban || 0) / totalTiles) * 100);
  const barrenPct = Math.round(((classCounts.Barren || 0) / totalTiles) * 100);

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
      confidence: `${Math.round(((classCounts.Agriculture || 0) / (totalTiles || 1)) * 95 + 5)}%`,
      area: `${agriArea} km²`,
      subMetric: `Parcels: ${classCounts.Agriculture || 0} tiles`,
      barColor: "from-amber-300 to-amber-500",
      textColor: "text-amber-600",
      dotColor: "bg-amber-400",
    },
    {
      id: "Vegetation",
      label: "Dense Forest Canopy",
      pct: forestPct,
      confidence: `${Math.round(((classCounts.Vegetation || 0) / (totalTiles || 1)) * 92 + 8)}%`,
      area: `${forestArea} km²`,
      subMetric: `Biomass: ${classCounts.Vegetation || 0} tiles`,
      barColor: "from-emerald-300 to-emerald-500",
      textColor: "text-emerald-600",
      dotColor: "bg-emerald-400",
    },
    {
      id: "Water",
      label: "Water Bodies & Basins",
      pct: waterPct,
      confidence: `${Math.round(((classCounts.Water || 0) / (totalTiles || 1)) * 90 + 10)}%`,
      area: `${waterArea} km²`,
      subMetric: `Hydro: ${classCounts.Water || 0} tiles`,
      barColor: "from-cyan-300 to-cyan-500",
      textColor: "text-cyan-600",
      dotColor: "bg-cyan-400",
    },
    {
      id: "Built-up",
      label: "Urban & Industrial",
      pct: urbanPct,
      confidence: `${Math.round(((classCounts["Built-up"] || 0) / (totalTiles || 1)) * 88 + 12)}%`,
      area: `${urbanArea} km²`,
      subMetric: `Structures: ${classCounts["Built-up"] || 0} tiles`,
      barColor: "from-rose-300 to-rose-500",
      textColor: "text-rose-600",
      dotColor: "bg-rose-400",
    },
  ];

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4">
      {/* Land Classification Panel */}
      <div className="earth-panel p-4 text-[#313647] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
          <div>
            <span className="text-[10px] font-mono text-[#A3B087] uppercase tracking-wider font-bold">
              LAND ANALYSIS
            </span>
            <h3 className="text-sm font-bold text-[#313647] tracking-tight">
              Spectral Land Classification
            </h3>
          </div>
          <span className="rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] px-2 py-0.5 font-mono text-xs font-bold text-[#435663]">
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
                    ? "bg-[#A3B087]/10 border border-[#A3B087]/40 shadow-[0_2px_8px_rgba(163,176,135,0.12)]"
                    : "hover:bg-[#f5f3ea] border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${cat.dotColor}`}></span>
                    <span className="text-[#313647]">{cat.label}</span>
                  </div>
                  <span className={`font-mono font-bold ${cat.textColor}`}>
                    {cat.pct}%
                  </span>
                </div>

                {/* Gradient Progress Bar */}
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#f0ede4] overflow-hidden border border-[#e2e0d6]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.barColor} transition-all duration-500`}
                    style={{ width: `${cat.pct}%` }}
                  ></div>
                </div>

                {/* Submetrics */}
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-[#435663]/60">
                  <span>Coverage: {cat.area}</span>
                  <span className="font-sans">{cat.subMetric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spectral Indices Panel */}
      <div className="earth-panel p-4 text-[#313647] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
          <h3 className="text-xs font-bold font-mono tracking-wider text-[#435663] uppercase">
            Spectral Indices
          </h3>
          <span className="text-[10px] font-mono font-bold text-[#A3B087]">
            ACTIVE
          </span>
        </div>

        {/* Circular Dials Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* NDVI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2.5 text-center">
            <span className="text-[10px] font-mono font-semibold text-[#435663]/70">NDVI</span>
            <div className="relative my-2 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e2e0d6]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${Math.min(Math.max(Math.round((Number(ndviScore) + 1) * 50), 0), 100)}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-emerald-600">
                {ndviScore}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">
              {Number(ndviScore) > 0.5 ? "HIGH VEG" : "MODERATE"}
            </span>
          </div>

          {/* NDWI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2.5 text-center">
            <span className="text-[10px] font-mono font-semibold text-[#435663]/70">NDWI</span>
            <div className="relative my-2 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e2e0d6]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-500"
                  strokeDasharray={`${Math.min(Math.max(Math.round((Number(ndwiScore) + 1) * 50), 0), 100)}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-cyan-600">
                {ndwiScore}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-600 uppercase">
              {Number(ndwiScore) > 0 ? "WATER" : "LAND"}
            </span>
          </div>

          {/* SMI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2.5 text-center">
            <span className="text-[10px] font-mono font-semibold text-[#435663]/70">SMI</span>
            <div className="relative my-2 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e2e0d6]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  strokeDasharray={`${smiScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-bold text-amber-600">
                {smiScore}%
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-600 uppercase">
              MOISTURE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
