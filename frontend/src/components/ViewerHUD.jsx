import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

const CLASS_THEMES = {
  Agriculture: { border: "border-amber-400", bg: "bg-amber-400/20", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  Vegetation: { border: "border-emerald-400", bg: "bg-emerald-400/20", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  Forest: { border: "border-emerald-400", bg: "bg-emerald-400/20", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  Water: { border: "border-cyan-400", bg: "bg-cyan-400/25", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  "Built-up": { border: "border-rose-400", bg: "bg-rose-400/20", text: "text-rose-300", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  Urban: { border: "border-rose-400", bg: "bg-rose-400/20", text: "text-rose-300", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  Barren: { border: "border-slate-400", bg: "bg-slate-400/20", text: "text-slate-300", badge: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
};

export default function ViewerHUD({
  imageSrc,
  grounding,
  activeFilter,
  onHoverTile,
  focusedClass,
}) {
  const containerRef = useRef(null);
  const [band, setBand] = useState("RGB+NIR");
  const [zoom, setZoom] = useState(1);
  const [showOverlays, setShowOverlays] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, show: false });
  const [coordsText, setCoordsText] = useState("34°03'21\"N, 118°14'09\"W");

  function handleMouseMove(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y, show: true });

    const latBase = 34.056;
    const lonBase = -118.243;
    const lat = (latBase - (y / rect.height) * 0.05).toFixed(4);
    const lon = (lonBase + (x / rect.width) * 0.08).toFixed(4);
    setCoordsText(`${Math.abs(lat)}°${lat > 0 ? "N" : "S"}, ${Math.abs(lon)}°${lon > 0 ? "E" : "W"}`);
  }

  function handleMouseLeave() {
    setMousePos((prev) => ({ ...prev, show: false }));
  }

  const tiles = grounding?.tiles || [];
  const rows = grounding?.grid?.rows || 8;
  const cols = grounding?.grid?.cols || 8;

  return (
    <div className="earth-panel flex flex-col overflow-hidden text-[#313647] transition-all">
      {/* Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e0d6] bg-[#f5f3ea]/50 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#435663]/70 font-medium">
            RGB+NIR • 0.50 m/px
          </span>
        </div>

        {/* Spectral Band Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-full bg-white border border-[#e2e0d6] p-0.5 text-[11px] font-mono">
            {["RGB+NIR", "SWIR", "SAR"].map((b) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`rounded-full px-2.5 py-0.5 transition-all ${
                  band === b
                    ? "bg-[#A3B087] text-white font-semibold shadow-sm"
                    : "text-[#435663] hover:text-[#313647]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-[#e2e0d6] mx-1"></div>

          {/* Toggle Overlays */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            title="Toggle Overlays"
            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
              showOverlays
                ? "border-[#A3B087]/40 bg-[#A3B087]/10 text-[#A3B087]"
                : "border-[#e2e0d6] bg-white text-[#435663]/50"
            }`}
          >
            {showOverlays ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-white border border-[#e2e0d6] text-[#435663]">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1 hover:text-[#A3B087] transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 font-mono text-[10px] text-[#313647] font-medium">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-1 hover:text-[#A3B087] transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoom(1)}
            title="Reset View"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e0d6] bg-white text-[#435663] hover:text-[#A3B087] transition"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 min-h-[440px] max-h-[560px] bg-[#f0ede4] overflow-hidden select-none cursor-crosshair flex items-center justify-center"
      >
        {/* Image Layer */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transition: "transform 0.15s ease-out",
          }}
          className="relative max-h-full max-w-full flex items-center justify-center"
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Satellite observation"
              className={`max-h-[480px] w-auto rounded-lg object-contain border border-[#e2e0d6] shadow-lg transition-all duration-300 ${
                band === "SWIR"
                  ? "hue-rotate-90 contrast-125 saturate-150"
                  : band === "SAR"
                  ? "grayscale contrast-200 brightness-90"
                  : ""
              }`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-[#435663]/50">
              <Sparkles className="h-10 w-10 text-[#A3B087]/40 mb-3" />
              <p className="text-sm text-[#435663]/70">Ready for satellite image</p>
              <p className="text-xs text-[#435663]/40 mt-1">Upload an image or select a preset above</p>
            </div>
          )}

          {/* Grounding Overlay Grid */}
          {showOverlays && tiles.length > 0 && (
            <div
              className="absolute inset-0 grid rounded-lg pointer-events-none"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {tiles.map((tile, i) => {
                const theme = CLASS_THEMES[tile.class] || CLASS_THEMES.Agriculture;
                const isFocused = focusedClass
                  ? tile.class.toLowerCase() === focusedClass.toLowerCase()
                  : true;

                return (
                  <div
                    key={tile.tile_id ?? i}
                    className={`relative border transition-all duration-200 m-[1px] rounded-sm ${
                      theme.border
                    } ${
                      isFocused
                        ? `${theme.bg} opacity-90`
                        : "opacity-20 border-slate-700/50 bg-transparent"
                    }`}
                  >
                    <div className="absolute top-1 left-1 flex items-center gap-1">
                      <span
                        className={`rounded px-1 py-0.2 text-[9px] font-mono font-bold tracking-tight border ${theme.badge}`}
                      >
                        {tile.class?.toUpperCase()}: {Math.round(tile.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cursor Crosshair & Coordinate Tooltip */}
        {mousePos.show && (
          <>
            <div
              className="pointer-events-none absolute left-0 right-0 border-t border-[#A3B087]/30"
              style={{ top: `${mousePos.y}px` }}
            ></div>
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-[#A3B087]/30"
              style={{ left: `${mousePos.x}px` }}
            ></div>

            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
            >
              <div className="h-10 w-10 rounded-full border border-[#A3B087]/40"></div>
              <div className="absolute h-2 w-2 rounded-full bg-[#A3B087]/70"></div>
            </div>

            <div
              className="pointer-events-none absolute z-20 rounded-lg bg-white/90 border border-[#e2e0d6] px-2 py-0.5 font-mono text-[10px] text-[#313647] shadow-md backdrop-blur-sm"
              style={{
                left: `${Math.min(mousePos.x + 16, (containerRef.current?.clientWidth || 500) - 180)}px`,
                top: `${Math.max(mousePos.y - 28, 12)}px`,
              }}
            >
              {coordsText}
            </div>
          </>
        )}

        {/* Bottom Legend Banner */}
        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/85 border border-[#e2e0d6] px-3 py-1.5 backdrop-blur-md text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#435663]/60 uppercase tracking-wider font-semibold">Legend:</span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>Agricultural</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Forest</span>
            </span>
            <span className="flex items-center gap-1 text-cyan-600">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              <span>Water</span>
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              <span>Built-up</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
