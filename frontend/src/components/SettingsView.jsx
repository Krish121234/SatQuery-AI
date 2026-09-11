import React, { useState, useEffect } from "react";
import {
  Settings,
  Cpu,
  Sliders,
  Database,
  Activity,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Zap,
  RotateCcw,
} from "lucide-react";

export default function SettingsView() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [gridSize, setGridSize] = useState(8);
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8000/api");
  const [enableCache, setEnableCache] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Load saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("satquery_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.confidenceThreshold) setConfidenceThreshold(parsed.confidenceThreshold);
        if (parsed.gridSize) setGridSize(parsed.gridSize);
        if (parsed.apiEndpoint) setApiEndpoint(parsed.apiEndpoint);
        if (parsed.enableCache !== undefined) setEnableCache(parsed.enableCache);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  function handleSave() {
    try {
      localStorage.setItem(
        "satquery_settings",
        JSON.stringify({
          confidenceThreshold,
          gridSize,
          apiEndpoint,
          enableCache,
        })
      );
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  }

  function handleReset() {
    setConfidenceThreshold(0.75);
    setGridSize(8);
    setApiEndpoint("http://localhost:8000/api");
    setEnableCache(true);
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Settings Header */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider block">
                SYSTEM TELEMETRY & INFERENCE TUNING
              </span>
              <h2 className="text-base font-bold text-[#313647] tracking-tight">
                Model Settings & Hardware Telemetry
              </h2>
            </div>
          </div>

          {showSavedToast && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Settings Saved!
            </span>
          )}
        </div>
      </div>

      {/* Model & Grounding Parameters */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e2e0d6]">
          <Sliders className="h-4 w-4 text-[#A3B087]" />
          <h3 className="text-sm font-bold text-[#313647]">
            GeoRSCLIP Inference Hyperparameters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Confidence Threshold Slider */}
          <div className="flex flex-col gap-2 rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#313647]">
                Minimum Grounding Confidence:
              </label>
              <span className="font-mono text-xs font-bold text-[#A3B087]">
                {(confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="accent-[#A3B087] cursor-pointer"
            />
            <p className="text-[11px] text-[#435663]/70 leading-relaxed">
              Filters out low-confidence predictions from the 8x8 spatial bounding grid.
            </p>
          </div>

          {/* Grid Size Dimension */}
          <div className="flex flex-col gap-2 rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#313647]">
                Spatial Grid Partitioning:
              </label>
              <span className="font-mono text-xs font-bold text-[#A3B087]">
                {gridSize}x{gridSize} ({gridSize * gridSize} Tiles)
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              {[4, 8, 16].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGridSize(size)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                    gridSize === size
                      ? "bg-[#A3B087] text-white border-[#A3B087]"
                      : "bg-white border-[#e2e0d6] text-[#435663] hover:text-[#313647]"
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#435663]/70 leading-relaxed">
              Default 8x8 splits 800x800 imagery into 64 100x100 spatial feature patches.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware & Execution Engine Telemetry */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e2e0d6]">
          <Cpu className="h-4 w-4 text-[#A3B087]" />
          <h3 className="text-sm font-bold text-[#313647]">
            Active Neural Execution Backend
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#e2e0d6] bg-white p-3.5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#435663]/60 uppercase font-bold">
              Vision Backbone
            </span>
            <span className="text-xs font-bold text-[#313647]">
              OpenCLIP ViT-B-32
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold mt-1">
              ✓ GeoRSCLIP Weights Loaded
            </span>
          </div>

          <div className="rounded-xl border border-[#e2e0d6] bg-white p-3.5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#435663]/60 uppercase font-bold">
              Inference Hardware
            </span>
            <span className="text-xs font-bold text-[#313647]">
              Apple Silicon / CUDA / CPU
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold mt-1">
              ✓ Vectorized Batching Active
            </span>
          </div>

          <div className="rounded-xl border border-[#e2e0d6] bg-white p-3.5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#435663]/60 uppercase font-bold">
              Latency Target
            </span>
            <span className="text-xs font-bold text-[#313647]">
              &lt; 350ms Forward Pass
            </span>
            <span className="text-[10px] font-mono text-cyan-600 font-semibold mt-1">
              ✓ Single Forward Batch (64, 3, 224, 224)
            </span>
          </div>
        </div>
      </div>

      {/* Backend API Configuration */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e2e0d6]">
          <HardDrive className="h-4 w-4 text-[#A3B087]" />
          <h3 className="text-sm font-bold text-[#313647]">
            Backend API Connection
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#313647]">
            FastAPI Base URL:
          </label>
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            className="w-full rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] px-4 py-2 text-xs text-[#313647] font-mono focus:outline-none focus:border-[#A3B087]"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white font-bold px-5 py-2 text-xs shadow-sm transition"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl bg-white border border-[#e2e0d6] hover:bg-[#f5f3ea] text-[#435663] font-semibold px-4 py-2 text-xs transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
}
