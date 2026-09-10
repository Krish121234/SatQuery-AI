import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle, Sparkles } from "lucide-react";

export const PRESET_IMAGES = [
  {
    id: "delta",
    name: "EOS-7 Coastal Basin (Hyperion-V2)",
    location: "Sacramento Delta, CA",
    coords: "38°08'N, 121°45'W",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    desc: "Agricultural grid with river delta and irrigation channels",
  },
  {
    id: "port",
    name: "Urban Port Logistics & Berth Complex",
    location: "Long Beach Harbor, CA",
    coords: "33°45'N, 118°13'W",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    desc: "Deep water container terminals, cargo berths, and breakwaters",
  },
  {
    id: "forest",
    name: "Subalpine Forest & River Watershed",
    location: "Cascade Range, OR",
    coords: "44°22'N, 121°54'W",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    desc: "Dense coniferous canopy, clearings, and riparian zones",
  },
];

export default function ImageUploaderModal({
  isOpen,
  onClose,
  onImageSelect,
  currentImage,
}) {
  const [isDragging, setIsDragging] = useState(false);

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
      <div className="earth-panel max-w-xl w-full p-6 text-[#313647] flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e0d6]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#A3B087]"></div>
            <h3 className="text-base font-bold text-[#313647] tracking-tight">
              Upload Image
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
          className={`rounded-xl border-2 border-dashed p-8 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
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
                Drop your satellite image or{" "}
                <span className="text-[#A3B087] underline">browse files</span>
              </p>
              <p className="text-xs text-[#435663]/50 mt-1">
                GeoTIFF, PNG, JPG up to 50 MB
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

        {/* Or Choose Curated Sample Presets */}
        <div>
          <span className="text-xs font-mono font-bold text-[#435663]/70 uppercase tracking-wider">
            Or Load Satellite Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="group flex flex-col items-start rounded-xl border border-[#e2e0d6] bg-white p-2.5 text-left transition hover:border-[#A3B087]/50 hover:shadow-md"
              >
                <div className="relative h-20 w-full rounded-lg overflow-hidden border border-[#e2e0d6] mb-2">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-[#435663] font-bold">
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
      </div>
    </div>
  );
}
