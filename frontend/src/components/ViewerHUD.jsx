import React, { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Layers,
  Sparkles,
  RefreshCw,
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
  const [band, setBand] = useState("RGB+NIR"); // RGB+NIR, SWIR, SAR
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

    // Calculate dynamic synthetic lat/lon based on pixel position
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
  const rows = grounding?.grid?.rows || 4;
  const cols = grounding?.grid?.cols || 4;

  return (
    <div className="hud-panel rounded-xl flex flex-col overflow-hidden text-slate-100 transition-all">
      {/* Top HUD Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-[#080d1a] px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span className="font-bold">EOS-7</span>
            <span className="text-slate-500">RGB+NIR • 0.50 m/px</span>
          </div>
        </div>

        {/* Spectral Band Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-md bg-slate-950 border border-slate-800 p-0.5 text-[11px] font-mono">
            {["RGB+NIR", "SWIR", "SAR"].map((b) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`rounded px-2.5 py-0.5 transition ${
                  band === b
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-slate-800 mx-1"></div>

          {/* Toggle Bounding Overlays */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            title="Toggle Strata Overlays"
            className={`flex h-7 w-7 items-center justify-center rounded border transition ${
              showOverlays
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-slate-800 bg-slate-900 text-slate-500"
            }`}
          >
            {showOverlays ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-md bg-slate-950 border border-slate-800 text-slate-400">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1 hover:text-cyan-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 font-mono text-[10px] text-slate-300 font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-1 hover:text-cyan-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoom(1)}
            title="Reset View"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-400 transition"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 min-h-[440px] max-h-[560px] bg-[#050811] overflow-hidden select-none cursor-crosshair flex items-center justify-center"
      >
        {/* Synthetic background grid */}
        <div className="absolute inset-0 bg-cyber-grid opacity-60 pointer-events-none"></div>

        {/* The Satellite Image Layer */}
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
              className={`max-h-[480px] w-auto rounded-lg object-contain border border-slate-800/80 shadow-2xl transition-all duration-300 ${
                band === "SWIR"
                  ? "hue-rotate-90 contrast-125 saturate-150"
                  : band === "SAR"
                  ? "grayscale contrast-200 brightness-90"
                  : ""
              }`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600">
              <Sparkles className="h-10 w-10 text-cyan-500/40 mb-3 animate-pulse" />
              <p className="text-sm font-mono text-slate-400">Ready for Satellite Raster</p>
              <p className="text-xs text-slate-600 mt-1">Upload an image or select a preset above</p>
            </div>
          )}

          {/* Real-time Grounding Overlay Grid */}
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
                    {/* Tile ID & Class Badge */}
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

        {/* Dynamic Cursor Target Reticle & Coordinate Tooltip */}
        {mousePos.show && (
          <>
            {/* Horizontal Line */}
            <div
              className="pointer-events-none absolute left-0 right-0 border-t border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              style={{ top: `${mousePos.y}px` }}
            ></div>
            {/* Vertical Line */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 border-l border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              style={{ left: `${mousePos.x}px` }}
            ></div>

            {/* Circular Target Crosshair */}
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
            >
              <div className="h-10 w-10 rounded-full border border-cyan-400/70 animate-pulse"></div>
              <div className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            </div>

            {/* Coordinate Badge near cursor */}
            <div
              className="pointer-events-none absolute z-20 rounded-md bg-slate-950/90 border border-cyan-500/50 px-2 py-0.5 font-mono text-[10px] text-cyan-300 shadow-lg backdrop-blur-sm"
              style={{
                left: `${Math.min(mousePos.x + 16, (containerRef.current?.clientWidth || 500) - 180)}px`,
                top: `${Math.max(mousePos.y - 28, 12)}px`,
              }}
            >
              {coordsText}
            </div>
          </>
        )}

        {/* Bottom Overlay Info Banner inside the viewer */}
        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Strata:</span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>Agricultural</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Forest</span>
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              <span>Water</span>
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              <span>Built-up / Port</span>
            </span>
          </div>

          <div className="text-slate-400 text-[10px]">
            <span>2026-09-04 10:42 UTC</span>
            <span className="text-cyan-400 font-bold ml-2">// EOS-7 SENSOR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
