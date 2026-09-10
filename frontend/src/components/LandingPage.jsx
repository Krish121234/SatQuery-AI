import React from "react";
import {
  Globe,
  Scan,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BarChart2,
  MapPin,
  Droplets,
  ExternalLink,
} from "lucide-react";

export default function LandingPage({ onLaunchApp, onOpenMap, onOpenAuth }) {
  const features = [
    {
      icon: Scan,
      title: "Spatial 8x8 Tile Grounding",
      desc: "Slices 800x800 Earth observation imagery into 64 spatial patches, extracting zero-shot semantic features with GeoRSCLIP ViT-B-32 in a single forward pass (<300ms).",
      tag: "Zero-Shot Grounding",
    },
    {
      icon: Layers,
      title: "Multi-Epoch Change & Flood Detection",
      desc: "Compares satellite imagery across temporal epochs, tracking transition matrices, land-to-water flood flips, and environmental degradation over time.",
      tag: "Temporal Analytics",
    },
    {
      icon: Globe,
      title: "Interactive Global Satellite Explorer",
      desc: "Pan and zoom worldwide via Esri ArcGIS World Imagery tiles, search any landmark or coordinate, and capture regions of interest directly for AI scanning.",
      tag: "Global Map",
    },
    {
      icon: BarChart2,
      title: "Multispectral Indices Engine",
      desc: "Dynamically derives NDVI (Vegetation), NDWI (Water), SMI (Soil Moisture), and NDBI (Urban Density) directly from predicted land-cover fractions.",
      tag: "Spectral Analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF0] text-[#313647] flex flex-col font-sans selection:bg-[#A3B087] selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-[#e2e0d6] bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
              <span className="text-lg">🛰</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-widest text-[#313647] uppercase">
                SATQUERY
              </span>
              <span className="rounded-full border border-[#A3B087]/40 bg-[#A3B087]/10 px-2 py-0.5 text-[10px] font-semibold text-[#A3B087] tracking-wider">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-[#435663] hover:text-[#313647] px-3 py-1.5 rounded-lg hover:bg-[#f5f3ea] transition"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-1.5 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white text-xs font-bold px-4 py-2 shadow-sm transition-all"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-12 sm:pt-24 sm:pb-20 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#A3B087]/40 bg-[#A3B087]/10 px-3.5 py-1 text-xs font-bold text-[#A3B087]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ORBITAL INTELLIGENCE • GEORSCLIP ZERO-SHOT VQA</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#313647] tracking-tight leading-[1.15]">
          Natural Language Earth Observation &{" "}
          <span className="text-[#A3B087]">Satellite Spatial Grounding</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#435663]/90 max-w-2xl leading-relaxed">
          Ask questions about any satellite image in plain English. SatQuery AI pairs high-resolution orbital imagery with zero-shot spatial grounding models to localize water bodies, agricultural parcels, urban growth, and flood inundation.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white text-sm font-bold px-6 py-3 shadow-md transition-all hover:scale-105"
          >
            <Scan className="h-4 w-4" />
            <span>Launch Mission Scanner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenMap}
            className="flex items-center gap-2 rounded-xl bg-white border border-[#e2e0d6] hover:bg-[#f5f3ea] text-[#313647] text-sm font-semibold px-5 py-3 shadow-sm transition"
          >
            <Globe className="h-4 w-4 text-[#A3B087]" />
            <span>Explore Global Map</span>
          </button>
        </div>

        {/* Live Satellite Preview Card */}
        <div className="w-full mt-8 rounded-2xl overflow-hidden border border-[#e2e0d6] shadow-xl bg-white p-3 flex flex-col gap-3">
          <div className="relative h-64 sm:h-96 w-full rounded-xl overflow-hidden bg-[#1a202c]">
            <img
              src="/samples/delta_agriculture.jpg"
              alt="Sacramento Delta Satellite Observation"
              className="h-full w-full object-cover"
            />
            {/* 8x8 Overlay Grid Mock */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 border border-[#A3B087]/30">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-[#A3B087]/20 hover:bg-[#A3B087]/20 transition cursor-crosshair"
                />
              ))}
            </div>

            {/* Floating Telemetry Box */}
            <div className="absolute top-3 left-3 rounded-xl bg-white/90 backdrop-blur-md border border-[#e2e0d6] px-3.5 py-1.5 font-mono text-xs font-bold text-[#313647] shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sacramento Delta Agriculture • 38°08'N, 121°45'W</span>
            </div>

            {/* Answer Badge */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto max-w-lg rounded-xl bg-white/95 backdrop-blur-md border border-[#e2e0d6] p-3.5 text-left shadow-lg">
              <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase block mb-1">
                Query: "Where are irrigation channels bordering agricultural land?"
              </span>
              <p className="text-xs text-[#313647] font-medium leading-relaxed">
                Active irrigation channels and delta water bodies border 87.4% of the agricultural land parcels with 94.8% grounding confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 bg-[#f5f3ea]/50 border-t border-[#e2e0d6]">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#A3B087] uppercase tracking-wider">
              CORE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#313647] tracking-tight">
              Next-Generation Earth Observation Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="earth-panel p-6 flex flex-col gap-3 transition hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f5f3ea] text-[#435663] border border-[#e2e0d6]">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#313647]">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#435663]/80 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pipeline Infographic Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto flex flex-col gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#A3B087] uppercase tracking-wider">
            END-TO-END WORKFLOW
          </span>
          <h2 className="text-2xl font-bold text-[#313647] tracking-tight">
            How SatQuery AI Processes Satellite Inquiries
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
          <div className="rounded-xl border border-[#e2e0d6] bg-white p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-xs font-mono font-bold text-[#A3B087]">01. INGESTION</span>
            <h4 className="text-xs font-bold text-[#313647]">Image & Question</h4>
            <p className="text-[11px] text-[#435663]/80 leading-relaxed">
              Accepts GeoTIFF, Sentinel-2, or optical satellite imagery alongside natural questions.
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e0d6] bg-white p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-xs font-mono font-bold text-[#A3B087]">02. SLICING</span>
            <h4 className="text-xs font-bold text-[#313647]">8x8 Spatial Patching</h4>
            <p className="text-[11px] text-[#435663]/80 leading-relaxed">
              Partitions image into 64 spatial tiles stacked into a single (64, 3, 224, 224) tensor.
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e0d6] bg-white p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-xs font-mono font-bold text-[#A3B087]">03. INFERENCE</span>
            <h4 className="text-xs font-bold text-[#313647]">GeoRSCLIP Forward Pass</h4>
            <p className="text-[11px] text-[#435663]/80 leading-relaxed">
              Zero-shot classification computes per-tile class probabilities and spectral features.
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e0d6] bg-white p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-xs font-mono font-bold text-[#A3B087]">04. GROUNDING</span>
            <h4 className="text-xs font-bold text-[#313647]">Visual Answer & HUD</h4>
            <p className="text-[11px] text-[#435663]/80 leading-relaxed">
              Renders color-coded spatial bounding boxes, confidence overlays, and natural response.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-14 bg-gradient-to-r from-[#A3B087] to-[#8f9d74] text-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to Analyze Earth Observation Data?
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Jump into Mission Control, explore live satellite maps, or upload your own satellite images now.
          </p>
          <button
            onClick={onLaunchApp}
            className="mt-2 rounded-xl bg-white text-[#313647] hover:bg-[#FFFCF0] text-sm font-bold px-6 py-3 shadow-lg transition-all hover:scale-105"
          >
            Launch SatQuery AI
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e0d6] bg-white py-6 px-6 text-center text-xs text-[#435663]/70">
        <p>SatQuery AI • Aerospace Hackathon 2026 • Powered by GeoRSCLIP & Sentinel-2</p>
      </footer>
    </div>
  );
}
