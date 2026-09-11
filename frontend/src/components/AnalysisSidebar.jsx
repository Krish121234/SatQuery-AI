import React from "react";
import { Activity, Droplets, Leaf, Building2, Trees, ShieldAlert, Navigation } from "lucide-react";
import { getTheme, CLASS_THEMES } from "./ViewerHUD";

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
    const rawCls = tile.class || "barren_land";
    const key = rawCls.toLowerCase().replace(/[\s-]+/g, "_");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalAreaKm2 = 1061.5;

  // 6 RS Categories from GeoRSCLIP
  const allCategories = [
    {
      id: "forest",
      aliases: ["forest", "vegetation"],
      label: "Dense Forest / Vegetation",
      barColor: "from-emerald-400 to-emerald-600",
      textColor: "text-emerald-700",
      dotColor: "bg-emerald-500",
      icon: Trees,
    },
    {
      id: "water_body",
      aliases: ["water_body", "water"],
      label: "Water Bodies & Basins",
      barColor: "from-cyan-400 to-cyan-600",
      textColor: "text-cyan-700",
      dotColor: "bg-cyan-500",
      icon: Droplets,
    },
    {
      id: "urban_builtup",
      aliases: ["urban_builtup", "built-up", "urban"],
      label: "Urban & Built-up",
      barColor: "from-rose-400 to-rose-600",
      textColor: "text-rose-700",
      dotColor: "bg-rose-500",
      icon: Building2,
    },
    {
      id: "agricultural_land",
      aliases: ["agricultural_land", "agriculture"],
      label: "Agricultural Farmland",
      barColor: "from-amber-400 to-amber-600",
      textColor: "text-amber-700",
      dotColor: "bg-amber-500",
      icon: Leaf,
    },
    {
      id: "barren_land",
      aliases: ["barren_land", "barren"],
      label: "Barren & Bare Soil",
      barColor: "from-stone-400 to-stone-600",
      textColor: "text-stone-700",
      dotColor: "bg-stone-500",
      icon: ShieldAlert,
    },
    {
      id: "road",
      aliases: ["road", "transport"],
      label: "Roads & Transit Networks",
      barColor: "from-purple-400 to-purple-600",
      textColor: "text-purple-700",
      dotColor: "bg-purple-500",
      icon: Navigation,
    },
  ];

  const categories = allCategories.map((cat) => {
    let count = 0;
    for (const alias of cat.aliases) {
      if (classCounts[alias]) {
        count += classCounts[alias];
      }
    }
    const pct = Math.round((count / totalTiles) * 100);
    const area = ((pct / 100) * totalAreaKm2).toFixed(1);

    return {
      ...cat,
      count,
      pct,
      area: `${area} km²`,
      subMetric: `${count} / ${totalTiles} tiles`,
    };
  });

  const forestPct = categories.find((c) => c.id === "forest")?.pct || 0;
  const agriPct = categories.find((c) => c.id === "agricultural_land")?.pct || 0;
  const waterPct = categories.find((c) => c.id === "water_body")?.pct || 0;

  // Spectral indices dynamic estimates from real land cover fractions
  const ndviScore = Math.min(Math.max((0.15 + (forestPct / 100) * 0.65 + (agriPct / 100) * 0.35).toFixed(2), 0.05), 0.95);
  const ndwiScore = ((-0.45 + (waterPct / 100) * 1.1)).toFixed(2);
  const smiScore = Math.min(Math.round(25 + (waterPct * 0.7 + agriPct * 0.4 + forestPct * 0.2)), 98);

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
        <div className="flex flex-col gap-2.5 mt-1 max-h-[380px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isFocused =
              focusedClass &&
              (focusedClass.toLowerCase() === cat.id || cat.aliases.includes(focusedClass.toLowerCase()));

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (isFocused) {
                    onFilterClass?.(null);
                  } else {
                    onFilterClass?.(cat.id);
                  }
                }}
                className={`group cursor-pointer rounded-lg p-2 transition-all ${
                  isFocused
                    ? "bg-[#A3B087]/15 border border-[#A3B087]/50 shadow-[0_2px_8px_rgba(163,176,135,0.15)]"
                    : "hover:bg-[#f5f3ea] border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${cat.dotColor}`}></span>
                    <span className="text-[#313647] font-semibold">{cat.label}</span>
                  </div>
                  <span className={`font-mono font-bold ${cat.textColor}`}>
                    {cat.pct}%
                  </span>
                </div>

                {/* Gradient Progress Bar */}
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#f0ede4] overflow-hidden border border-[#e2e0d6]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.barColor} transition-all duration-500`}
                    style={{ width: `${Math.max(cat.pct, cat.count > 0 ? 3 : 0)}%` }}
                  ></div>
                </div>

                {/* Submetrics */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#435663]/60">
                  <span>Coverage: {cat.area}</span>
                  <span>{cat.subMetric}</span>
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
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* NDVI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2 text-center">
            <span className="text-[10px] font-mono font-semibold text-[#435663]/70">NDVI</span>
            <div className="relative my-1.5 flex h-12 w-12 items-center justify-center">
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
              <span className="absolute font-mono text-[10px] font-bold text-emerald-600">
                {ndviScore}
              </span>
            </div>
            <span className="text-[8px] font-mono font-bold text-emerald-600 uppercase">
              {Number(ndviScore) > 0.45 ? "HIGH VEG" : "MODERATE"}
            </span>
          </div>

          {/* NDWI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2 text-center">
            <span className="text-[10px] font-mono font-semibold text-[#435663]/70">NDWI</span>
            <div className="relative my-1.5 flex h-12 w-12 items-center justify-center">
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
              <span className="absolute font-mono text-[10px] font-bold text-cyan-600">
                {ndwiScore}
              </span>
            </div>
            <span className="text-[8px] font-mono font-bold text-cyan-600 uppercase">
              {Number(ndwiScore) > 0 ? "WATER" : "LAND"}
            </span>
          </div>

          {/* SMI Dial */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2 text-center">
            <span className="text-[10px] font-mono font-semibold text-[#435663]/70">SMI</span>
            <div className="relative my-1.5 flex h-12 w-12 items-center justify-center">
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
              <span className="absolute font-mono text-[10px] font-bold text-amber-600">
                {smiScore}%
              </span>
            </div>
            <span className="text-[8px] font-mono font-bold text-amber-600 uppercase">
              MOISTURE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
