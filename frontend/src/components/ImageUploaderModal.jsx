import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle, Sparkles, ExternalLink, Globe } from "lucide-react";

export const PRESET_IMAGES = [
  {
    id: "delta",
    name: "EOS-7 Delta Agriculture",
    location: "Sacramento Delta, CA",
    coords: "38°08'N, 121°45'W",
    url: "/samples/delta_agriculture.jpg",
    desc: "Agricultural grid with river delta and irrigation channels",
  },
  {
    id: "port",
    name: "Urban Port & Logistics Complex",
    location: "Long Beach Harbor, CA",
    coords: "33°45'N, 118°13'W",
    url: "/samples/urban_port.jpg",
    desc: "Deep water container terminals, cargo berths, and breakwaters",
  },
  {
    id: "forest",
    name: "Coniferous Forest & Riparian Zone",
    location: "Cascade Range, OR",
    coords: "44°22'N, 121°54'W",
    url: "/samples/forest_river.jpg",
    desc: "Dense coniferous canopy, river watershed, and clearings",
  },
  {
    id: "flood_before",
    name: "Indus Basin (Pre-Flood Epoch)",
    location: "Sindh Province, Pakistan",
    coords: "26°14'N, 68°02'E",
    url: "/samples/flood_before.jpg",
    desc: "Pre-monsoon agricultural river valley",
  },
  {
    id: "flood_after",
    name: "Indus Basin (Post-Flood Inundation)",
    location: "Sindh Province, Pakistan",
    coords: "26°14'N, 68°02'E",
    url: "/samples/flood_after.jpg",
    desc: "Severe flood inundation and expanded water surface",
  },
];

export const SATELLITE_DATA_SOURCES = [
  {
    name: "Copernicus Browser (Sentinel-2)",
    url: "https://browser.dataspace.copernicus.eu/",
    desc: "Free 10m multispectral (RGB, NIR, SWIR) global coverage updated every 5 days.",
  },
  {
    name: "USGS EarthExplorer (Landsat 8/9)",
    url: "https://earthexplorer.usgs.gov/",
    desc: "30m multispectral and thermal imagery with historical archives dating to 1972.",
  },
  {
    name: "NASA Worldview",
    url: "https://worldview.earthdata.nasa.gov/",
    desc: "Daily interactive full-resolution satellite imagery from MODIS and VIIRS.",
  },
  {
    name: "SpaceNet & EuroSAT Datasets",
    url: "https://spacenet.ai/datasets/",
    desc: "Open benchmark datasets for high-resolution satellite vision and land-cover segmentation.",
  },
];

export default function ImageUploaderModal({
  isOpen,
  onClose,
  onImageSelect,
  currentImage,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showSources, setShowSources] = useState(false);

  if (!isOpen) return null;

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelect({
        file,
        dataUrl: reader.result,
        name: file.name,
        isPreset: false,
      });
      onClose();
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleSelectPreset(preset) {
    onImageSelect({
      file: null,
      dataUrl: preset.url,
      name: preset.name,
      coords: preset.coords,
      isPreset: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="earth-panel max-w-xl w-full p-6 text-[#313647] flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e0d6]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#A3B087]"></div>
            <h3 className="text-base font-bold text-[#313647] tracking-tight">
              Satellite Image Input & Presets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#435663]/60 hover:text-[#313647] hover:bg-[#f5f3ea] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drag and drop dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-7 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragging
              ? "border-[#A3B087] bg-[#A3B087]/5"
              : "border-[#e2e0d6] bg-[#FFFCF0] hover:border-[#A3B087]/50 hover:bg-[#f5f3ea]"
          }`}
        >
          <label className="cursor-pointer w-full flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A3B087]/10 border border-[#A3B087]/30 text-[#A3B087]">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#313647]">
                Drop any satellite image or{" "}
                <span className="text-[#A3B087] underline">browse files</span>
              </p>
              <p className="text-xs text-[#435663]/50 mt-1">
                GeoTIFF, PNG, JPG, JPEG (Sentinel-2, Landsat, Planet, Drone)
              </p>
            </div>
            <input
              type="file"
              accept="image/*,.tif,.tiff"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
          </label>
        </div>

        {/* Curated Sample Presets */}
        <div>
          <span className="text-xs font-mono font-bold text-[#435663]/70 uppercase tracking-wider">
            Or Choose Curated Grounding Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="group flex flex-col items-start rounded-xl border border-[#e2e0d6] bg-white p-2.5 text-left transition hover:border-[#A3B087]/50 hover:shadow-md"
              >
                <div className="relative h-20 w-full rounded-lg overflow-hidden border border-[#e2e0d6] mb-2 bg-[#f0ede4]">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-white font-bold drop-shadow">
                    {preset.coords}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#313647] line-clamp-1 group-hover:text-[#A3B087]">
                  {preset.name}
                </span>
                <span className="text-[10px] text-[#435663]/60 line-clamp-1 mt-0.5">
                  {preset.location}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Where to get satellite images info section */}
        <div className="pt-3 border-t border-[#e2e0d6]">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full text-left text-xs font-semibold text-[#435663] hover:text-[#313647]"
          >
            <span className="flex items-center gap-1.5 font-mono uppercase text-[11px] text-[#A3B087] font-bold">
              <Globe className="h-3.5 w-3.5" /> Where to get satellite images?
            </span>
            <span className="text-xs font-mono">{showSources ? "Hide ▲" : "Show ▼"}</span>
          </button>

          {showSources && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
              {SATELLITE_DATA_SOURCES.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#f5f3ea] border border-[#e2e0d6] p-2 hover:border-[#A3B087]/50 transition flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#313647]">
                      {source.name}
                    </span>
                    <ExternalLink className="h-3 w-3 text-[#435663]/40" />
                  </div>
                  <p className="text-[10px] text-[#435663]/70 leading-relaxed">
                    {source.desc}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
