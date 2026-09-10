import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";

export const CLASS_THEMES = {
  // GeoRSCLIP Model 6 classes
  forest: {
    label: "Forest / Vegetation",
    border: "border-emerald-500",
    bg: "bg-emerald-500/25",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
  },
  water_body: {
    label: "Water Body",
    border: "border-cyan-500",
    bg: "bg-cyan-500/30",
    text: "text-cyan-700",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-300",
    dot: "bg-cyan-500",
  },
  urban_builtup: {
    label: "Urban / Built-up",
    border: "border-rose-500",
    bg: "bg-rose-500/25",
    text: "text-rose-700",
    badge: "bg-rose-50 text-rose-700 border-rose-300",
    dot: "bg-rose-500",
  },
  agricultural_land: {
    label: "Agricultural Land",
    border: "border-amber-500",
    bg: "bg-amber-500/25",
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
  },
  barren_land: {
    label: "Barren Land",
    border: "border-stone-500",
    bg: "bg-stone-500/25",
    text: "text-stone-700",
    badge: "bg-stone-50 text-stone-700 border-stone-300",
    dot: "bg-stone-500",
  },
  road: {
    label: "Road / Transport",
    border: "border-purple-500",
    bg: "bg-purple-500/25",
    text: "text-purple-700",
    badge: "bg-purple-50 text-purple-700 border-purple-300",
    dot: "bg-purple-500",
  },

  // Aliases & legacy mappings
  agriculture: {
    label: "Agricultural",
    border: "border-amber-500",
    bg: "bg-amber-500/25",
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
  },
  vegetation: {
    label: "Vegetation",
    border: "border-emerald-500",
    bg: "bg-emerald-500/25",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
  },
  water: {
    label: "Water",
    border: "border-cyan-500",
    bg: "bg-cyan-500/30",
    text: "text-cyan-700",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-300",
    dot: "bg-cyan-500",
  },
  "built-up": {
    label: "Built-up",
    border: "border-rose-500",
    bg: "bg-rose-500/25",
    text: "text-rose-700",
    badge: "bg-rose-50 text-rose-700 border-rose-300",
    dot: "bg-rose-500",
  },
  barren: {
    label: "Barren",
    border: "border-stone-500",
    bg: "bg-stone-500/25",
    text: "text-stone-700",
    badge: "bg-stone-50 text-stone-700 border-stone-300",
    dot: "bg-stone-500",
  },
};

export function getTheme(className) {
  if (!className) return CLASS_THEMES.barren_land;
  const key = String(className).toLowerCase().replace(/[\s-]+/g, "_");
  if (CLASS_THEMES[key]) return CLASS_THEMES[key];
  if (key.includes("forest") || key.includes("veg")) return CLASS_THEMES.forest;
  if (key.includes("water") || key.includes("lake") || key.includes("river")) return CLASS_THEMES.water_body;
  if (key.includes("urban") || key.includes("built") || key.includes("city")) return CLASS_THEMES.urban_builtup;
  if (key.includes("agri") || key.includes("farm")) return CLASS_THEMES.agricultural_land;
  if (key.includes("road") || key.includes("trans")) return CLASS_THEMES.road;
  return CLASS_THEMES.barren_land;
}

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
  const [hoveredTile, setHoveredTile] = useState(null);
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
    setHoveredTile(null);
  }

  const tiles = grounding?.tiles || [];
  const rows = grounding?.grid?.rows || 8;
  const cols = grounding?.grid?.cols || 8;

  return (
    <div className="earth-panel flex flex-col overflow-hidden text-[#313647] transition-all">
      {/* Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e0d6] bg-[#f5f3ea]/60 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#435663]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GeoRSCLIP 8×8 (64 Tiles)
          </span>
          <span className="text-[#435663]/40">•</span>
          <span className="text-[11px] text-[#435663]/70">0.50 m/px GSD</span>
        </div>

        {/* Spectral Band Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-full bg-white border border-[#e2e0d6] p-0.5 text-[11px] font-mono shadow-sm">
            {["RGB+NIR", "SWIR", "SAR"].map((b) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`rounded-full px-2.5 py-0.5 transition-all ${
                  band === b
                    ? "bg-[#A3B087] text-white font-bold shadow-sm"
                    : "text-[#435663] hover:text-[#313647]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-[#e2e0d6] mx-1"></div>

          {/* Prominent Toggle Overlays Button */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            title={showOverlays ? "Hide Grounding Tile Grid" : "Show Grounding Tile Grid"}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all shadow-sm ${
              showOverlays
                ? "bg-[#A3B087] text-white border border-[#8f9d74]"
                : "bg-white text-[#435663] border border-[#e2e0d6] hover:bg-[#f5f3ea] hover:text-[#313647]"
            }`}
          >
            {showOverlays ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Tiles: ON</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5 opacity-60" />
                <span>Tiles: OFF</span>
              </>
            )}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-white border border-[#e2e0d6] text-[#435663] shadow-sm">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1 hover:text-[#A3B087] transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 font-mono text-[10px] text-[#313647] font-bold">
              {Math.round(zoom * 100)}%
            </span>
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
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e0d6] bg-white text-[#435663] hover:text-[#A3B087] transition shadow-sm"
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
        className="relative flex-1 min-h-[440px] max-h-[580px] bg-[#f0ede4] overflow-hidden select-none cursor-crosshair flex items-center justify-center p-4"
      >
        {/* Scaled Image & Overlay Container */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transition: "transform 0.15s ease-out",
          }}
          className="relative inline-block max-h-full max-w-full"
        >
          {imageSrc ? (
            <div className="relative inline-block overflow-hidden rounded-lg border border-[#e2e0d6] shadow-xl">
              <img
                src={imageSrc}
                alt="Satellite observation"
                className={`max-h-[460px] max-w-full w-auto object-contain block transition-all duration-300 ${
                  band === "SWIR"
                    ? "hue-rotate-90 contrast-125 saturate-150"
                    : band === "SAR"
                    ? "grayscale contrast-200 brightness-90"
                    : ""
                }`}
              />

              {/* Grounding Overlay Grid exactly mapped over the image */}
              {showOverlays && tiles.length > 0 && (
                <div
                  className="absolute inset-0 grid pointer-events-auto"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  }}
                >
                  {tiles.map((tile, i) => {
                    const theme = getTheme(tile.class);
                    const isFocused = focusedClass
                      ? String(tile.class).toLowerCase() === String(focusedClass).toLowerCase()
                      : true;
                    const isHovered = hoveredTile?.tile_id === tile.tile_id;

                    return (
                      <div
                        key={tile.tile_id ?? i}
                        onMouseEnter={() => {
                          setHoveredTile(tile);
                          onHoverTile?.(tile);
                        }}
                        className={`relative border transition-all duration-150 ${
                          theme.border
                        } ${
                          isFocused
                            ? `${theme.bg} ${isHovered ? "opacity-100 ring-2 ring-white shadow-lg z-10" : "opacity-85"}`
                            : "opacity-15 border-slate-400/40 bg-transparent"
                        }`}
                      >
                        {/* Compact Badge on Top-Left */}
                        <div className="absolute top-0.5 left-0.5 pointer-events-none">
                          <span
                            className={`rounded px-1 py-0.2 text-[8px] font-mono font-bold tracking-tight border shadow-xs ${theme.badge}`}
                          >
                            {tile.class?.replace("_", " ")?.toUpperCase()}: {Math.round(tile.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-[#435663]/50">
              <Sparkles className="h-10 w-10 text-[#A3B087]/40 mb-3" />
              <p className="text-sm text-[#435663]/70 font-semibold">Ready for satellite image</p>
              <p className="text-xs text-[#435663]/40 mt-1">Upload an image or select a preset above</p>
            </div>
          )}
        </div>

        {/* Hovered Tile Details Floater */}
        {hoveredTile && (
          <div className="pointer-events-none absolute top-4 left-4 z-30 rounded-xl bg-white/95 border border-[#e2e0d6] p-3 shadow-lg backdrop-blur-md font-mono text-xs max-w-xs animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between gap-3 border-b border-[#e2e0d6] pb-1.5 mb-1.5">
              <span className="font-bold text-[#313647]">Tile #{hoveredTile.tile_id}</span>
              <span className="rounded bg-[#A3B087]/20 text-[#54603e] px-1.5 py-0.5 text-[10px] font-bold">
                {(hoveredTile.confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-[#435663]">
              <div>
                Class: <strong className="text-[#313647]">{hoveredTile.class}</strong>
              </div>
              <div className="text-[10px] text-[#435663]/70">
                BBox: [{hoveredTile.bbox?.join(", ")}]
              </div>
            </div>
          </div>
        )}

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
              <div className="absolute h-2 w-2 rounded-full bg-[#A3B087]/80"></div>
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

        {/* Bottom Legend Banner for 6 RS Classes */}
        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/90 border border-[#e2e0d6] px-3 py-1.5 backdrop-blur-md text-[11px] font-mono shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#435663]/60 uppercase tracking-wider font-bold">Legend:</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Forest</span>
            </span>
            <span className="flex items-center gap-1 text-cyan-700">
              <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
              <span>Water Body</span>
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Urban/Built-up</span>
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>Agricultural</span>
            </span>
            <span className="flex items-center gap-1 text-stone-700">
              <span className="h-2 w-2 rounded-full bg-stone-500"></span>
              <span>Barren Land</span>
            </span>
            <span className="flex items-center gap-1 text-purple-700">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              <span>Road / Transport</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
