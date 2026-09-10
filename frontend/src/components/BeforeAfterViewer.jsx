import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Droplets,
  Sliders,
  Columns,
  Image as ImageIcon,
  Check,
} from "lucide-react";

export const CHANGE_PRESETS = [
  {
    id: "flood_event",
    title: "Indus River Basin Monsoon Floods",
    beforeSrc: "/samples/flood_before.jpg",
    afterSrc: "/samples/flood_after.jpg",
    beforeDate: "2022-07-15",
    afterDate: "2022-09-01",
    location: "Sindh Province, Pakistan",
    defaultQuery: "How many agricultural parcels were flooded and transformed into open water bodies?",
    tag: "Flood Inundation",
  },
  {
    id: "delta_urban",
    title: "Delta Agricultural vs Coastal Port",
    beforeSrc: "/samples/delta_agriculture.jpg",
    afterSrc: "/samples/urban_port.jpg",
    beforeDate: "2019-08-14",
    afterDate: "2024-09-02",
    location: "California Coastal Corridor",
    defaultQuery: "What land cover changes occurred between agricultural land and urban port infrastructure?",
    tag: "Urban Expansion",
  },
  {
    id: "forest_watershed",
    title: "Subalpine Forest & Cultivated Valley",
    beforeSrc: "/samples/forest_river.jpg",
    afterSrc: "/samples/delta_agriculture.jpg",
    beforeDate: "2020-06-10",
    afterDate: "2024-07-20",
    location: "Pacific Northwest Watershed",
    defaultQuery: "What are the key land cover transitions across forest canopy and cultivated land?",
    tag: "Deforestation / Land Use",
  },
];

export default function BeforeAfterViewer({
  onRunComparison,
  loading,
  result,
  changeResult,
}) {
  const [activePreset, setActivePreset] = useState(CHANGE_PRESETS[0]);
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState("slider"); // "slider" | "sideBySide"
  const [question, setQuestion] = useState(CHANGE_PRESETS[0].defaultQuery);

  const [beforeImage, setBeforeImage] = useState({
    src: CHANGE_PRESETS[0].beforeSrc,
    date: CHANGE_PRESETS[0].beforeDate,
    file: null,
    name: "Epoch 1 (Pre-Flood)",
  });

  const [afterImage, setAfterImage] = useState({
    src: CHANGE_PRESETS[0].afterSrc,
    date: CHANGE_PRESETS[0].afterDate,
    file: null,
    name: "Epoch 2 (Post-Flood)",
  });

  const activeResult = changeResult || result;
  const changeData = activeResult?.change_detection || activeResult?.changeDetection;

  function handleSelectPreset(preset) {
    setActivePreset(preset);
    setBeforeImage({
      src: preset.beforeSrc,
      date: preset.beforeDate,
      file: null,
      name: `${preset.title} - Epoch 1`,
    });
    setAfterImage({
      src: preset.afterSrc,
      date: preset.afterDate,
      file: null,
      name: `${preset.title} - Epoch 2`,
    });
    setQuestion(preset.defaultQuery);
  }

  function handleBeforeFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBeforeImage({
        src: reader.result,
        date: new Date().toISOString().split("T")[0],
        file,
        name: file.name,
      });
      setActivePreset(null);
    };
    reader.readAsDataURL(file);
  }

  function handleAfterFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAfterImage({
        src: reader.result,
        date: new Date().toISOString().split("T")[0],
        file,
        name: file.name,
      });
      setActivePreset(null);
    };
    reader.readAsDataURL(file);
  }

  function handleExecute() {
    onRunComparison?.(
      question,
      beforeImage.file || beforeImage.src,
      afterImage.file || afterImage.src
    );
  }

  const summaryText =
    typeof changeData?.summary === "object"
      ? changeData.summary.text || JSON.stringify(changeData.summary)
      : changeData?.summary || activeResult?.summary || "";

  const changedCount =
    changeData?.changed_count ??
    changeData?.changedCount ??
    changeData?.change_count ??
    changeData?.changes?.length ??
    0;

  const unchangedCount =
    changeData?.unchanged_count ??
    changeData?.unchangedCount ??
    (64 - changedCount > 0 ? 64 - changedCount : 0);

  const floodFlips =
    changeData?.flood_flips_count ??
    changeData?.floodFlipsCount ??
    changeData?.changes?.filter(
      (c) =>
        c.after_class === "water_body" &&
        (c.before_class === "agricultural_land" ||
          c.before_class === "barren_land" ||
          c.before_class === "urban_builtup")
    ).length ??
    0;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header & Epoch Indicators */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e2e0d6]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider block">
                MULTI-EPOCH TEMPORAL ANALYSIS
              </span>
              <h2 className="text-base font-bold text-[#313647] tracking-tight">
                Satellite Change Detection & Flood Dynamics
              </h2>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-[#f5f3ea] border border-[#e2e0d6] p-1 text-xs">
            <button
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                viewMode === "slider"
                  ? "bg-[#A3B087] text-white shadow-sm"
                  : "text-[#435663] hover:text-[#313647]"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setViewMode("sideBySide")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                viewMode === "sideBySide"
                  ? "bg-[#A3B087] text-white shadow-sm"
                  : "text-[#435663] hover:text-[#313647]"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>

        {/* Curated Presets Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#435663]/70 uppercase">
            Curated Epoch Pairs:
          </span>
          {CHANGE_PRESETS.map((p) => {
            const isSelected = activePreset?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#A3B087] border-[#A3B087] text-white shadow-sm"
                    : "bg-white border-[#e2e0d6] text-[#435663] hover:text-[#313647] hover:border-[#A3B087]/50"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
                <span>{p.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-[#f5f3ea] text-[#435663]"}`}>
                  {p.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dual Upload Bars for Epoch 1 and Epoch 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Epoch 1 Uploader */}
          <div className="rounded-xl border border-[#e2e0d6] bg-[#FFFCF0] p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-[#e2e0d6] flex-shrink-0 bg-[#f0ede4]">
                <img
                  src={beforeImage.src}
                  alt="Epoch 1 preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-mono text-[#435663]/60 uppercase font-bold">
                  EPOCH 1 (BEFORE) • {beforeImage.date}
                </span>
                <span className="text-xs font-bold text-[#313647] truncate">
                  {beforeImage.name}
                </span>
              </div>
            </div>

            <label className="flex items-center gap-1.5 rounded-lg bg-white border border-[#e2e0d6] hover:border-[#A3B087] hover:bg-[#f5f3ea] px-3 py-1.5 text-xs font-semibold text-[#313647] cursor-pointer transition flex-shrink-0 shadow-sm">
              <Upload className="h-3.5 w-3.5 text-[#A3B087]" />
              <span>Replace</span>
              <input
                type="file"
                accept="image/*,.tif,.tiff"
                onChange={handleBeforeFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Epoch 2 Uploader */}
          <div className="rounded-xl border border-[#e2e0d6] bg-[#FFFCF0] p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-[#e2e0d6] flex-shrink-0 bg-[#f0ede4]">
                <img
                  src={afterImage.src}
                  alt="Epoch 2 preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-mono text-[#A3B087] uppercase font-bold">
                  EPOCH 2 (AFTER) • {afterImage.date}
                </span>
                <span className="text-xs font-bold text-[#313647] truncate">
                  {afterImage.name}
                </span>
              </div>
            </div>

            <label className="flex items-center gap-1.5 rounded-lg bg-white border border-[#e2e0d6] hover:border-[#A3B087] hover:bg-[#f5f3ea] px-3 py-1.5 text-xs font-semibold text-[#313647] cursor-pointer transition flex-shrink-0 shadow-sm">
              <Upload className="h-3.5 w-3.5 text-[#A3B087]" />
              <span>Replace</span>
              <input
                type="file"
                accept="image/*,.tif,.tiff"
                onChange={handleAfterFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Comparison Viewports: Split Slider vs Side-by-Side */}
      {viewMode === "slider" ? (
        /* Split Slider Viewport */
        <div className="relative h-[440px] sm:h-[480px] w-full overflow-hidden rounded-2xl border border-[#e2e0d6] select-none shadow-sm bg-[#1a202c]">
          {/* After Image (Background layer) */}
          <img
            src={afterImage.src}
            alt="Epoch 2"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute top-3 right-3 z-10 rounded-xl bg-white/95 border border-[#e2e0d6] px-3 py-1 font-mono text-xs font-bold text-[#A3B087] backdrop-blur-sm shadow-sm">
            EPOCH 2: AFTER ({afterImage.date})
          </span>

          {/* Before Image (Clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={beforeImage.src}
              alt="Epoch 1"
              className="absolute inset-0 h-full w-full object-cover max-w-none"
              style={{ width: "100%", height: "100%" }}
            />
            <span className="absolute top-3 left-3 z-10 rounded-xl bg-white/95 border border-[#e2e0d6] px-3 py-1 font-mono text-xs font-bold text-[#313647] backdrop-blur-sm shadow-sm">
              EPOCH 1: BEFORE ({beforeImage.date})
            </span>
          </div>

          {/* Vertical Split Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-1 bg-[#A3B087] cursor-ew-resize flex items-center justify-center -translate-x-1/2 shadow-lg"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="h-9 w-9 rounded-full border-2 border-white bg-[#A3B087] shadow-xl flex items-center justify-center text-xs font-mono font-bold text-white">
              ⇄
            </div>
          </div>

          {/* Range input slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 z-30 opacity-0 cursor-ew-resize h-full w-full"
          />
        </div>
      ) : (
        /* Side-by-Side Viewport */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-[380px] rounded-2xl overflow-hidden border border-[#e2e0d6] bg-[#1a202c] shadow-sm">
            <img
              src={beforeImage.src}
              alt="Epoch 1 Before"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-3 left-3 rounded-xl bg-white/95 border border-[#e2e0d6] px-3 py-1 font-mono text-xs font-bold text-[#313647] shadow-sm">
              EPOCH 1: BEFORE ({beforeImage.date})
            </div>
          </div>

          <div className="relative h-[380px] rounded-2xl overflow-hidden border border-[#e2e0d6] bg-[#1a202c] shadow-sm">
            <img
              src={afterImage.src}
              alt="Epoch 2 After"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-3 left-3 rounded-xl bg-white/95 border border-[#e2e0d6] px-3 py-1 font-mono text-xs font-bold text-[#A3B087] shadow-sm">
              EPOCH 2: AFTER ({afterImage.date})
            </div>
          </div>
        </div>
      )}

      {/* Query Bar */}
      <div className="earth-panel p-4 flex flex-col gap-3">
        <label className="text-xs font-bold text-[#313647]">
          Natural Language Temporal Query:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about land cover transitions, flood expansion, urban shifts..."
            className="flex-1 rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] px-4 py-2.5 text-xs sm:text-sm text-[#313647] placeholder-[#435663]/40 focus:outline-none focus:border-[#A3B087] focus:ring-1 focus:ring-[#A3B087]/40 font-medium"
          />
          <button
            onClick={handleExecute}
            disabled={loading || !question.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white font-bold px-5 py-2 text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Comparing Epochs…</span>
              </>
            ) : (
              <>
                <span>Detect Changes</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results & Telemetry Breakdown */}
      {changeData && (
        <div className="earth-panel p-5 flex flex-col gap-4 text-[#313647]">
          {/* Top telemetry badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e2e0d6]">
            <div>
              <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider block">
                GEO-SPATIAL DIFFERENTIAL TELEMETRY
              </span>
              <h4 className="text-sm font-bold text-[#313647]">
                Transition Regime: <span className="text-emerald-700 uppercase">{changeData.change_type || "MULTI-EPOCH DETECTED"}</span>
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-rose-700 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {changedCount} Tiles Changed
              </span>
              <span className="rounded-xl bg-cyan-50 border border-cyan-200 px-3 py-1.5 text-cyan-700 font-bold flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5" />
                {floodFlips} Flood Inundations
              </span>
              <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {unchangedCount} Stable
              </span>
            </div>
          </div>

          {/* AI Analysis Summary */}
          {summaryText && (
            <div className="rounded-xl bg-[#f5f3ea] border border-[#e2e0d6] p-4">
              <span className="text-[10px] font-mono font-bold text-[#435663]/60 uppercase block mb-1">
                GeoRSCLIP Analytical Summary
              </span>
              <p className="text-xs sm:text-sm text-[#313647] leading-relaxed">
                {summaryText}
              </p>
            </div>
          )}

          {/* Detected Tile Transitions Grid */}
          {changeData.changes && changeData.changes.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#435663]/70 uppercase">
                  Spatial Tile Transitions ({changeData.changes.length})
                </span>
                <span className="text-[10px] font-mono text-[#435663]/50">
                  8x8 Grid Slices
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {changeData.changes.map((change, i) => {
                  const isFlood =
                    change.after_class === "water_body" &&
                    change.before_class !== "water_body";
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border p-3 flex flex-col gap-1.5 transition ${
                        isFlood
                          ? "bg-cyan-50/50 border-cyan-300"
                          : "bg-[#FFFCF0] border-[#e2e0d6]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#435663]/60">
                          TILE #{change.tile_id}
                        </span>
                        {isFlood && (
                          <span className="text-[9px] font-mono font-bold text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded">
                            FLOOD FLIP
                          </span>
                        )}
                        {change.confidence_change !== undefined && (
                          <span className="text-[10px] font-mono font-bold text-amber-600">
                            Δ {(Math.abs(change.confidence_change || 0) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#435663] font-medium capitalize truncate">
                          {change.before_class?.replace("_", " ")}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[#435663]/40 flex-shrink-0" />
                        <span className="text-[#A3B087] font-bold capitalize truncate">
                          {change.after_class?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
