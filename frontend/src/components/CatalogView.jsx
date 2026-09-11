import React, { useState } from "react";
import {
  Layers,
  Database,
  ExternalLink,
  Search,
  Scan,
  Sparkles,
  Info,
  CheckCircle2,
  Cpu,
  BarChart2,
  Droplets,
  TreePine,
  Building2,
} from "lucide-react";
import { PRESET_IMAGES, SATELLITE_DATA_SOURCES } from "./ImageUploaderModal";

export const SPECTRAL_INDEX_GUIDE = [
  {
    name: "NDVI (Normalized Difference Vegetation Index)",
    formula: "(NIR - Red) / (NIR + Red)",
    range: "-1.0 to +1.0",
    useCase: "Assessing vegetation health, biomass density, and forest canopy coverage.",
    bands: "Sentinel-2 B8 (842nm) & B4 (665nm)",
    color: "emerald",
  },
  {
    name: "NDWI (Normalized Difference Water Index)",
    formula: "(Green - NIR) / (Green + NIR)",
    range: "-1.0 to +1.0",
    useCase: "Detecting water bodies, delineating flood boundaries, and river morphology.",
    bands: "Sentinel-2 B3 (560nm) & B8 (842nm)",
    color: "cyan",
  },
  {
    name: "SMI (Soil Moisture Index)",
    formula: "(SWIR - NIR) / (SWIR + NIR)",
    range: "0.0 to 1.0",
    useCase: "Evaluating irrigation saturation, drought stress, and agricultural soil hydration.",
    bands: "Sentinel-2 B11 (1610nm) & B8 (842nm)",
    color: "amber",
  },
  {
    name: "NDBI (Normalized Difference Built-up Index)",
    formula: "(SWIR - NIR) / (SWIR + NIR)",
    range: "-1.0 to +1.0",
    useCase: "Mapping urban growth, impervious concrete surfaces, and industrial clusters.",
    bands: "Sentinel-2 B11 (1610nm) & B8 (842nm)",
    color: "rose",
  },
];

export default function CatalogView({ onSelectDatasetImage }) {
  const [filter, setFilter] = useState("all");

  return (
    <div className="flex flex-col gap-5">
      {/* Catalog Header */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider block">
              EARTH OBSERVATION DATASETS & ARCHIVES
            </span>
            <h2 className="text-base font-bold text-[#313647] tracking-tight">
              Satellite Data Sources, Presets & Spectral Guide
            </h2>
          </div>
        </div>
        <p className="text-xs text-[#435663]/80 mt-1 max-w-2xl leading-relaxed">
          SatQuery AI integrates multispectral Earth observation constellations (Copernicus Sentinel-2, USGS Landsat, PlanetScope) with zero-shot spatial grounding models to answer natural language environmental queries.
        </p>
      </div>

      {/* Preset Imagery Section */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-[#A3B087]" />
            <h3 className="text-sm font-bold text-[#313647]">
              Curated Observation Presets ({PRESET_IMAGES.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#435663]/60">
            Click any preset to load into Scanner
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PRESET_IMAGES.map((preset) => (
            <div
              key={preset.id}
              className="group rounded-xl border border-[#e2e0d6] bg-white p-3 flex flex-col gap-2.5 transition hover:border-[#A3B087] hover:shadow-md"
            >
              <div className="relative h-36 w-full rounded-lg overflow-hidden border border-[#e2e0d6] bg-[#f0ede4]">
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white font-bold drop-shadow">
                  {preset.coords}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#313647] group-hover:text-[#A3B087] transition">
                  {preset.name}
                </h4>
                <span className="text-[10px] font-mono text-[#435663]/70 block mt-0.5">
                  {preset.location}
                </span>
                <p className="text-[11px] text-[#435663]/80 line-clamp-2 mt-1 leading-relaxed">
                  {preset.desc}
                </p>
              </div>

              <button
                onClick={() => onSelectDatasetImage?.(preset)}
                className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-[#f5f3ea] hover:bg-[#A3B087] hover:text-white border border-[#e2e0d6] text-[#313647] py-1.5 text-xs font-semibold transition"
              >
                <Scan className="h-3.5 w-3.5" />
                <span>Load in Scanner</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Satellite Repositories */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e2e0d6]">
          <ExternalLink className="h-4 w-4 text-[#A3B087]" />
          <h3 className="text-sm font-bold text-[#313647]">
            Open Earth Observation Data Hubs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SATELLITE_DATA_SOURCES.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-[#e2e0d6] bg-[#FFFCF0] p-4 flex flex-col gap-1.5 transition hover:border-[#A3B087] hover:bg-[#f5f3ea] group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#313647] group-hover:text-[#A3B087] transition">
                  {source.name}
                </h4>
                <ExternalLink className="h-3.5 w-3.5 text-[#435663]/50 group-hover:text-[#A3B087]" />
              </div>
              <p className="text-xs text-[#435663]/80 leading-relaxed">
                {source.desc}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Spectral Indices Reference Matrix */}
      <div className="earth-panel p-5 text-[#313647] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e2e0d6]">
          <BarChart2 className="h-4 w-4 text-[#A3B087]" />
          <h3 className="text-sm font-bold text-[#313647]">
            Remote Sensing Spectral Indices Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SPECTRAL_INDEX_GUIDE.map((idx, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#e2e0d6] bg-white p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#313647]">
                  {idx.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f5f3ea] text-[#435663] font-semibold">
                  {idx.range}
                </span>
              </div>

              <div className="rounded-lg bg-[#FFFCF0] border border-[#e2e0d6] px-3 py-1.5 font-mono text-xs text-[#313647] font-bold">
                Formula: {idx.formula}
              </div>

              <p className="text-xs text-[#435663]/80 leading-relaxed">
                {idx.useCase}
              </p>

              <span className="text-[10px] font-mono text-[#A3B087] font-semibold mt-auto">
                Bands: {idx.bands}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
