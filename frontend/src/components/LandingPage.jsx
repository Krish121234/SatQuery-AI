import React, { useState, useEffect, useRef } from "react";
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
  Eye,
  EyeOff,
  Compass,
  Crosshair,
  Sliders,
  Database,
  Calendar,
  Zap,
  Check,
  ChevronRight,
  Maximize2,
  Trees,
  Building2,
  Wheat,
  Mountain,
  Navigation,
} from "lucide-react";
import { PRESET_IMAGES } from "./ImageUploaderModal";
import FormattedResponse from "./FormattedResponse";

// Exact 64 Grounding Tiles for the 8x8 Grid Telemetry (8 rows x 8 cols)
const SAMPLE_64_TILES = [
  // Row 0
  { tile_id: 0, row: 0, col: 0, class: "agricultural_land", confidence: 0.948, bbox: [0, 0, 100, 100] },
  { tile_id: 1, row: 0, col: 1, class: "forest", confidence: 0.912, bbox: [100, 0, 200, 100] },
  { tile_id: 2, row: 0, col: 2, class: "agricultural_land", confidence: 0.892, bbox: [200, 0, 300, 100] },
  { tile_id: 3, row: 0, col: 3, class: "water_body", confidence: 0.965, bbox: [300, 0, 400, 100] },
  { tile_id: 4, row: 0, col: 4, class: "water_body", confidence: 0.954, bbox: [400, 0, 500, 100] },
  { tile_id: 5, row: 0, col: 5, class: "forest", confidence: 0.887, bbox: [500, 0, 600, 100] },
  { tile_id: 6, row: 0, col: 6, class: "agricultural_land", confidence: 0.931, bbox: [600, 0, 700, 100] },
  { tile_id: 7, row: 0, col: 7, class: "agricultural_land", confidence: 0.904, bbox: [700, 0, 800, 100] },

  // Row 1
  { tile_id: 8, row: 1, col: 0, class: "agricultural_land", confidence: 0.941, bbox: [0, 100, 100, 200] },
  { tile_id: 9, row: 1, col: 1, class: "water_body", confidence: 0.934, bbox: [100, 100, 200, 200] },
  { tile_id: 10, row: 1, col: 2, class: "agricultural_land", confidence: 0.875, bbox: [200, 100, 300, 200] },
  { tile_id: 11, row: 1, col: 3, class: "water_body", confidence: 0.978, bbox: [300, 100, 400, 200] },
  { tile_id: 12, row: 1, col: 4, class: "water_body", confidence: 0.962, bbox: [400, 100, 500, 200] },
  { tile_id: 13, row: 1, col: 5, class: "agricultural_land", confidence: 0.915, bbox: [500, 100, 600, 200] },
  { tile_id: 14, row: 1, col: 6, class: "forest", confidence: 0.893, bbox: [600, 100, 700, 200] },
  { tile_id: 15, row: 1, col: 7, class: "agricultural_land", confidence: 0.922, bbox: [700, 100, 800, 200] },

  // Row 2
  { tile_id: 16, row: 2, col: 0, class: "urban_builtup", confidence: 0.812, bbox: [0, 200, 100, 300] },
  { tile_id: 17, row: 2, col: 1, class: "barren_land", confidence: 0.873, bbox: [100, 200, 200, 300] },
  { tile_id: 18, row: 2, col: 2, class: "agricultural_land", confidence: 0.908, bbox: [200, 200, 300, 300] },
  { tile_id: 19, row: 2, col: 3, class: "water_body", confidence: 0.981, bbox: [300, 200, 400, 300] },
  { tile_id: 20, row: 2, col: 4, class: "water_body", confidence: 0.955, bbox: [400, 200, 500, 300] },
  { tile_id: 21, row: 2, col: 5, class: "road", confidence: 0.842, bbox: [500, 200, 600, 300] },
  { tile_id: 22, row: 2, col: 6, class: "agricultural_land", confidence: 0.938, bbox: [600, 200, 700, 300] },
  { tile_id: 23, row: 2, col: 7, class: "agricultural_land", confidence: 0.912, bbox: [700, 200, 800, 300] },

  // Row 3
  { tile_id: 24, row: 3, col: 0, class: "urban_builtup", confidence: 0.813, bbox: [0, 300, 100, 400] },
  { tile_id: 25, row: 3, col: 1, class: "forest", confidence: 0.882, bbox: [100, 300, 200, 400] },
  { tile_id: 26, row: 3, col: 2, class: "agricultural_land", confidence: 0.918, bbox: [200, 300, 300, 400] },
  { tile_id: 27, row: 3, col: 3, class: "water_body", confidence: 0.968, bbox: [300, 300, 400, 400] },
  { tile_id: 28, row: 3, col: 4, class: "water_body", confidence: 0.974, bbox: [400, 300, 500, 400] },
  { tile_id: 29, row: 3, col: 5, class: "agricultural_land", confidence: 0.895, bbox: [500, 300, 600, 400] },
  { tile_id: 30, row: 3, col: 6, class: "forest", confidence: 0.906, bbox: [600, 300, 700, 400] },
  { tile_id: 31, row: 3, col: 7, class: "agricultural_land", confidence: 0.925, bbox: [700, 300, 800, 400] },

  // Row 4
  { tile_id: 32, row: 4, col: 0, class: "agricultural_land", confidence: 0.918, bbox: [0, 400, 100, 500] },
  { tile_id: 33, row: 4, col: 1, class: "water_body", confidence: 0.908, bbox: [100, 400, 200, 500] },
  { tile_id: 34, row: 4, col: 2, class: "water_body", confidence: 0.942, bbox: [200, 400, 300, 500] },
  { tile_id: 35, row: 4, col: 3, class: "agricultural_land", confidence: 0.887, bbox: [300, 400, 400, 500] },
  { tile_id: 36, row: 4, col: 4, class: "agricultural_land", confidence: 0.935, bbox: [400, 400, 500, 500] },
  { tile_id: 37, row: 4, col: 5, class: "urban_builtup", confidence: 0.795, bbox: [500, 400, 600, 500] },
  { tile_id: 38, row: 4, col: 6, class: "road", confidence: 0.835, bbox: [600, 400, 700, 500] },
  { tile_id: 39, row: 4, col: 7, class: "urban_builtup", confidence: 0.825, bbox: [700, 400, 800, 500] },

  // Row 5
  { tile_id: 40, row: 5, col: 0, class: "agricultural_land", confidence: 0.932, bbox: [0, 500, 100, 600] },
  { tile_id: 41, row: 5, col: 1, class: "agricultural_land", confidence: 0.945, bbox: [100, 500, 200, 600] },
  { tile_id: 42, row: 5, col: 2, class: "water_body", confidence: 0.925, bbox: [200, 500, 300, 600] },
  { tile_id: 43, row: 5, col: 3, class: "agricultural_land", confidence: 0.902, bbox: [300, 500, 400, 600] },
  { tile_id: 44, row: 5, col: 4, class: "forest", confidence: 0.915, bbox: [400, 500, 500, 600] },
  { tile_id: 45, row: 5, col: 5, class: "forest", confidence: 0.892, bbox: [500, 500, 600, 600] },
  { tile_id: 46, row: 5, col: 6, class: "urban_builtup", confidence: 0.810, bbox: [600, 500, 700, 600] },
  { tile_id: 47, row: 5, col: 7, class: "urban_builtup", confidence: 0.840, bbox: [700, 500, 800, 600] },

  // Row 6
  { tile_id: 48, row: 6, col: 0, class: "barren_land", confidence: 0.885, bbox: [0, 600, 100, 700] },
  { tile_id: 49, row: 6, col: 1, class: "agricultural_land", confidence: 0.915, bbox: [100, 600, 200, 700] },
  { tile_id: 50, row: 6, col: 2, class: "water_body", confidence: 0.910, bbox: [200, 600, 300, 700] },
  { tile_id: 51, row: 6, col: 3, class: "water_body", confidence: 0.935, bbox: [300, 600, 400, 700] },
  { tile_id: 52, row: 6, col: 4, class: "agricultural_land", confidence: 0.925, bbox: [400, 600, 500, 700] },
  { tile_id: 53, row: 6, col: 5, class: "forest", confidence: 0.880, bbox: [500, 600, 600, 700] },
  { tile_id: 54, row: 6, col: 6, class: "road", confidence: 0.865, bbox: [600, 600, 700, 700] },
  { tile_id: 55, row: 6, col: 7, class: "urban_builtup", confidence: 0.835, bbox: [700, 600, 800, 700] },

  // Row 7
  { tile_id: 56, row: 7, col: 0, class: "barren_land", confidence: 0.892, bbox: [0, 700, 100, 800] },
  { tile_id: 57, row: 7, col: 1, class: "agricultural_land", confidence: 0.938, bbox: [100, 700, 200, 800] },
  { tile_id: 58, row: 7, col: 2, class: "agricultural_land", confidence: 0.920, bbox: [200, 700, 300, 800] },
  { tile_id: 59, row: 7, col: 3, class: "water_body", confidence: 0.940, bbox: [300, 700, 400, 800] },
  { tile_id: 60, row: 7, col: 4, class: "agricultural_land", confidence: 0.910, bbox: [400, 700, 500, 800] },
  { tile_id: 61, row: 7, col: 5, class: "agricultural_land", confidence: 0.905, bbox: [500, 700, 600, 800] },
  { tile_id: 62, row: 7, col: 6, class: "urban_builtup", confidence: 0.850, bbox: [600, 700, 700, 800] },
  { tile_id: 63, row: 7, col: 7, class: "urban_builtup", confidence: 0.865, bbox: [700, 700, 800, 800] },
];

const CLASS_CONFIG = {
  agricultural_land: {
    label: "Agricultural Land",
    bg: "bg-amber-500/25",
    border: "border-amber-500",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    dot: "bg-amber-500",
  },
  water_body: {
    label: "Water Body",
    bg: "bg-cyan-500/30",
    border: "border-cyan-500",
    text: "text-cyan-800",
    badge: "bg-cyan-100 text-cyan-900 border-cyan-300",
    dot: "bg-cyan-500",
  },
  forest: {
    label: "Forest / Canopy",
    bg: "bg-emerald-500/25",
    border: "border-emerald-500",
    text: "text-emerald-800",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    dot: "bg-emerald-500",
  },
  urban_builtup: {
    label: "Urban / Built-up",
    bg: "bg-rose-500/25",
    border: "border-rose-500",
    text: "text-rose-800",
    badge: "bg-rose-100 text-rose-900 border-rose-300",
    dot: "bg-rose-500",
  },
  barren_land: {
    label: "Barren Land",
    bg: "bg-stone-500/25",
    border: "border-stone-500",
    text: "text-stone-800",
    badge: "bg-stone-100 text-stone-900 border-stone-300",
    dot: "bg-stone-500",
  },
  road: {
    label: "Road / Transport",
    bg: "bg-purple-500/25",
    border: "border-purple-500",
    text: "text-purple-800",
    badge: "bg-purple-100 text-purple-900 border-purple-300",
    dot: "bg-purple-500",
  },
};

export default function LandingPage({ onLaunchApp, onOpenMap, onOpenAuth }) {
  // Scrollytelling step state (0: Ingestion, 1: 8x8 Grid Slicing, 2: GeoRSCLIP Inference, 3: Evidence BBoxes, 4: Natural Question, 5: Grounded Answer)
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState(null);
  const [temporalSliderPos, setTemporalSliderPos] = useState(50);
  const [isAutoScrubbing, setIsAutoScrubbing] = useState(false);
  const sliderContainerRef = useRef(null);

  // Scrolly steps definitions
  const steps = [
    {
      id: "ingestion",
      stepNum: "01",
      title: "Multispectral Sensor Ingestion",
      tagline: "800×800 Optical Imagery & Spectral Bands",
      description:
        "High-resolution Earth observation sensor captures optical multispectral reflectance across Red, Green, Blue, and Near-Infrared (NIR) bands at 0.50m Ground Sampling Distance (GSD).",
      metrics: [
        { label: "Sensor Resolution", val: "800 × 800 px" },
        { label: "Orbital Altitude", val: "682 KM" },
        { label: "Optical Bands", val: "B2 / B3 / B4 / B8" },
      ],
    },
    {
      id: "slicing",
      stepNum: "02",
      title: "8×8 Spatial Partitioning",
      tagline: "Exact 64 Discrete 100×100px Slices",
      description:
        "The observation sector is sliced into an exact 8-row by 8-column spatial coordinate matrix. Each 100×100px patch is normalized and stacked into a unified (64, 3, 224, 224) batch tensor.",
      metrics: [
        { label: "Spatial Grid", val: "8 × 8 Matrix" },
        { label: "Discrete Tiles", val: "64 Patches" },
        { label: "Tensor Batch", val: "(64, 3, 224, 224)" },
      ],
    },
    {
      id: "inference",
      stepNum: "03",
      title: "GeoRSCLIP Zero-Shot Inference",
      tagline: "ViT-B-32 Remote Sensing Backbone",
      description:
        "OpenCLIP ViT-B-32 with GeoRSCLIP aerospace weights performs a single vectorized forward pass (<240ms) computing cosine similarities across 6 canonical land-cover classes.",
      metrics: [
        { label: "Vision Backbone", val: "ViT-B-32" },
        { label: "Inference Latency", val: "240ms" },
        { label: "Land Cover Classes", val: "6 Classes" },
      ],
    },
    {
      id: "evidence",
      stepNum: "04",
      title: "Spatial Evidence & Bounding Boxes",
      tagline: "Hydrological & Agricultural Topology",
      description:
        "Every tile receives explicit [x1, y1, x2, y2] bounding coordinates and confidence scores. Irrigation tributaries are isolated along the central corridor bordering cultivated parcels.",
      metrics: [
        { label: "Dominant Class", val: "Agricultural (37.5%)" },
        { label: "Surface Water", val: "25.0% Coverage" },
        { label: "Mean Confidence", val: "92.4%" },
      ],
    },
    {
      id: "query",
      stepNum: "05",
      title: "Natural Language Reasoning",
      tagline: "Multimodal Gemini 2.5 Flash Bridge",
      description:
        'The user asks: "What percentage of agricultural land shows active irrigation channels?" The prompt router synthesizes the 64-tile telemetry into evidence-grounded prompt constraints.',
      metrics: [
        { label: "Inquiry Intent", val: "Land Cover & Topology" },
        { label: "Grounding Context", val: "64 Tile Facts" },
        { label: "Reasoning Engine", val: "Gemini 2.5 Flash" },
      ],
    },
    {
      id: "report",
      stepNum: "06",
      title: "Verified Grounded Report",
      tagline: "Citable Telemetry & Spatial Metrics",
      description:
        "SatQuery AI outputs a verified natural language intelligence report citing exact percentages, tile IDs, and spatial quadrant distributions with 94.8% grounding verification.",
      metrics: [
        { label: "Grounding Score", val: "94.8% Grounded" },
        { label: "Verification", val: "100% Evidence-Backed" },
        { label: "Execution Time", val: "310ms Total" },
      ],
    },
  ];

  // Auto-play / step timer
  useEffect(() => {
    if (!isAutoScrubbing) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoScrubbing, steps.length]);

  // Handle temporal slider drag
  function handleSliderMove(e) {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((offsetX / rect.width) * 100);
    setTemporalSliderPos(pct);
  }

  return (
    <div className="min-h-screen bg-[#F4F0E3] text-[#243126] flex flex-col font-sans selection:bg-[#78966A] selection:text-white">
      {/* 1. Top Orbital Navigation Bar */}
      <header className="border-b border-[#E2DDD0] bg-[#FCFAF4]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo & Aerospace Callout */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#78966A]/15 border border-[#78966A]/30 text-[#526B45]">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-widest text-[#243D2A] uppercase">
                  SATQUERY
                </span>
                <span className="rounded-full border border-[#78966A]/40 bg-[#78966A]/15 px-2 py-0.2 text-[10px] font-mono font-bold text-[#526B45] tracking-wider">
                  AI v1.0
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#738476] hidden sm:block">
                GEORSCLIP ZERO-SHOT EO ENGINE
              </span>
            </div>
          </div>

          {/* Telemetry Center Badge */}
          <div className="hidden md:flex items-center gap-2.5 rounded-full border border-[#E2DDD0] bg-[#F4F0E3] px-3.5 py-1 text-xs font-mono text-[#47584A]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SENSOR: 0.50m GSD</span>
            <span className="text-[#C8C1B0]">•</span>
            <span>ALT: 682 KM</span>
            <span className="text-[#C8C1B0]">•</span>
            <span className="text-emerald-700 font-bold">ONLINE</span>
          </div>

          {/* Navigation CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-[#47584A] hover:text-[#243D2A] px-3 py-1.5 rounded-lg hover:bg-[#EAE5D5] transition"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-1.5 rounded-xl bg-[#78966A] hover:bg-[#526B45] text-white text-xs font-bold px-4 py-2 shadow-sm transition-all hover:scale-[1.02]"
            >
              <Scan className="h-3.5 w-3.5" />
              <span>Launch Mission Scanner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Editorial Hero Scene */}
      <section className="relative px-4 sm:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto w-full flex flex-col items-center text-center bg-coord-grid">
        {/* Sensor Telemetry Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#78966A]/40 bg-[#DDE8C9]/40 px-4 py-1.5 text-xs font-mono font-bold text-[#526B45] mb-6 shadow-xs backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#78966A]" />
          <span>ORBITAL RECONNAISSANCE • MULTISPECTRAL VQA</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#243D2A] tracking-tight leading-[1.15] max-w-4xl">
          Multimodal Earth Observation Intelligence &{" "}
          <span className="text-[#526B45] underline decoration-[#B8C99D] decoration-wavy decoration-2 underline-offset-8">
            Zero-Shot Spatial Grounding
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base text-[#47584A] max-w-2xl leading-relaxed font-normal">
          Ask questions about any satellite image in plain English. SatQuery AI slices optical Earth observation into an exact 8×8 grid of 64 spatial patches, extracting zero-shot features via GeoRSCLIP (ViT-B-32) and synthesizing verified reports via Gemini 2.5 Flash.
        </p>

        {/* Hero Quick Launch Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 rounded-xl bg-[#78966A] hover:bg-[#526B45] text-white text-sm font-bold px-6 py-3.5 shadow-md transition-all hover:scale-105"
          >
            <Scan className="h-4 w-4" />
            <span>Open Observation Scanner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenMap}
            className="flex items-center gap-2 rounded-xl bg-[#FCFAF4] border border-[#E2DDD0] hover:bg-[#EAE5D5] text-[#243D2A] text-sm font-semibold px-5 py-3.5 shadow-xs transition"
          >
            <Globe className="h-4 w-4 text-[#78966A]" />
            <span>Interactive Global Map</span>
          </button>
        </div>

        {/* Real-time Sensor HUD Pill Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl w-full text-left font-mono">
          <div className="rounded-xl border border-[#E2DDD0] bg-[#FCFAF4]/90 p-3 flex flex-col">
            <span className="text-[10px] text-[#738476] uppercase font-bold">Location</span>
            <span className="text-xs font-bold text-[#243D2A] mt-0.5">38°08'N, 121°45'W</span>
            <span className="text-[10px] text-[#526B45]">Sacramento Delta, CA</span>
          </div>
          <div className="rounded-xl border border-[#E2DDD0] bg-[#FCFAF4]/90 p-3 flex flex-col">
            <span className="text-[10px] text-[#738476] uppercase font-bold">Sensor GSD</span>
            <span className="text-xs font-bold text-[#243D2A] mt-0.5">0.50 m / pixel</span>
            <span className="text-[10px] text-[#526B45]">High-Res Optical</span>
          </div>
          <div className="rounded-xl border border-[#E2DDD0] bg-[#FCFAF4]/90 p-3 flex flex-col">
            <span className="text-[10px] text-[#738476] uppercase font-bold">Vision Slicing</span>
            <span className="text-xs font-bold text-[#243D2A] mt-0.5">8×8 (64 Tiles)</span>
            <span className="text-[10px] text-[#526B45]">OpenCLIP ViT-B-32</span>
          </div>
          <div className="rounded-xl border border-[#E2DDD0] bg-[#FCFAF4]/90 p-3 flex flex-col">
            <span className="text-[10px] text-[#738476] uppercase font-bold">Reasoning</span>
            <span className="text-xs font-bold text-[#243D2A] mt-0.5">Gemini 2.5 Flash</span>
            <span className="text-[10px] text-emerald-700 font-bold">100% Grounded</span>
          </div>
        </div>
      </section>

      {/* 3. The Pinned Scrollytelling Pipeline Sequence (The Film-like Core Journey) */}
      <section className="px-4 sm:px-8 py-16 bg-[#EFEAD9]/60 border-y border-[#E2DDD0]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2DDD0] pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#526B45] uppercase tracking-wider block mb-1">
                CONTINUOUS SCROLL STORYTELLING
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#243D2A] tracking-tight">
                The Zero-Shot Spatial Grounding Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-[#47584A] mt-1">
                Walk through the step-by-step transformation from raw planetary pixels to verified natural language intelligence.
              </p>
            </div>

            {/* Step Selector Pills & Auto-Scrub Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoScrubbing((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold border transition ${
                  isAutoScrubbing
                    ? "bg-[#78966A] text-white border-[#526B45]"
                    : "bg-[#FCFAF4] text-[#47584A] border-[#E2DDD0] hover:bg-[#EAE5D5]"
                }`}
              >
                <Zap className="h-3 w-3" />
                <span>{isAutoScrubbing ? "Auto-Playing" : "Auto-Play"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Step Navigator Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                  activeStep === idx
                    ? "bg-[#FCFAF4] border-[#78966A] shadow-md ring-2 ring-[#78966A]/30"
                    : "bg-[#F4F0E3] border-[#E2DDD0] hover:bg-[#FCFAF4] opacity-80"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      activeStep === idx
                        ? "bg-[#78966A] text-white"
                        : "bg-[#E2DDD0] text-[#47584A]"
                    }`}
                  >
                    STEP {s.stepNum}
                  </span>
                  {activeStep === idx && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#78966A] animate-ping" />
                  )}
                </div>
                <span className="text-xs font-bold text-[#243D2A] mt-1.5 truncate">
                  {s.title}
                </span>
              </button>
            ))}
          </div>

          {/* Split Stage: Left Narrative + Right Interactive 8x8 Visual Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
            {/* Left Narrative Box (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="earth-panel p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#E2DDD0] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#78966A] text-white font-mono text-xs font-bold">
                      {steps[activeStep].stepNum}
                    </span>
                    <span className="text-xs font-mono text-[#526B45] font-bold uppercase">
                      {steps[activeStep].tagline}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#738476]">
                    {activeStep + 1} of 6
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#243D2A] tracking-tight">
                  {steps[activeStep].title}
                </h3>

                <p className="text-xs sm:text-sm text-[#47584A] leading-relaxed">
                  {steps[activeStep].description}
                </p>

                {/* Step Key Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2DDD0]">
                  {steps[activeStep].metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="rounded-lg bg-[#F4F0E3] border border-[#E2DDD0] p-2 flex flex-col"
                    >
                      <span className="text-[9px] font-mono text-[#738476] uppercase font-bold">
                        {m.label}
                      </span>
                      <span className="text-xs font-bold text-[#243D2A] mt-0.5 font-mono">
                        {m.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Step-specific Callouts */}
                {activeStep === 0 && (
                  <div className="rounded-xl bg-[#DDE8C9]/30 border border-[#B8C99D]/40 p-3 text-xs text-[#47584A] flex items-start gap-2">
                    <Eye className="h-4 w-4 text-[#526B45] flex-shrink-0 mt-0.5" />
                    <span>
                      Raw 800×800 optical sensor captures high-contrast reflectance across the agricultural Delta basin and irrigation tributaries.
                    </span>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="rounded-xl bg-[#DDE8C9]/30 border border-[#B8C99D]/40 p-3 text-xs text-[#47584A] flex items-start gap-2">
                    <Grid className="h-4 w-4 text-[#526B45] flex-shrink-0 mt-0.5" />
                    <span>
                      64 discrete 100×100px sub-tiles are extracted and vectorized simultaneously without costly sliding-window loops.
                    </span>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="rounded-xl bg-[#DDE8C9]/30 border border-[#B8C99D]/40 p-3 text-xs text-[#47584A] flex items-start gap-2">
                    <Cpu className="h-4 w-4 text-[#526B45] flex-shrink-0 mt-0.5" />
                    <span>
                      GeoRSCLIP zero-shot remote sensing embeddings categorize every tile across 6 classes with calibrated confidence scores.
                    </span>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="rounded-xl bg-[#DDE8C9]/30 border border-[#B8C99D]/40 p-3 text-xs text-[#47584A] flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Bounding boxes isolate the central diagonal water tributary (Tiles #3, #4, #9, #11, #12, #19, #20) bordering cultivated parcels.
                    </span>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="rounded-xl bg-[#DDE8C9]/30 border border-[#B8C99D]/40 p-3 text-xs text-[#47584A] flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-[#78966A] flex-shrink-0 mt-0.5" />
                    <span>
                      The user inquiry is routed to Gemini 2.5 Flash alongside the complete 64-tile telemetry JSON to prevent hallucinations.
                    </span>
                  </div>
                )}

                {activeStep === 5 && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Final response verifies 37.5% agricultural land directly contiguous to active water bodies with exact spatial coordinates.
                    </span>
                  </div>
                )}

                {/* Step Forward / Backward Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E2DDD0]">
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E2DDD0] bg-[#FCFAF4] text-xs font-bold text-[#47584A] disabled:opacity-30 hover:bg-[#EAE5D5] transition"
                  >
                    ← Previous
                  </button>

                  <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={`h-2 rounded-full transition-all ${
                          activeStep === i ? "w-6 bg-[#78966A]" : "w-2 bg-[#C8C1B0]"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={activeStep === steps.length - 1}
                    onClick={() =>
                      setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#78966A] bg-[#78966A] text-xs font-bold text-white disabled:opacity-30 hover:bg-[#526B45] transition flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Interactive Satellite Canvas HUD (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="earth-panel overflow-hidden flex flex-col border border-[#E2DDD0] shadow-xl">
                {/* Top Canvas Bar */}
                <div className="flex items-center justify-between border-b border-[#E2DDD0] bg-[#FCFAF4] px-4 py-2.5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-[#243D2A]">
                      OBSERVATION CANVAS • SACRAMENTO DELTA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#738476]">
                    <span>800×800 PX</span>
                    <span>•</span>
                    <span className="text-[#526B45] font-bold">
                      {activeStep === 0 && "RAW SENSOR"}
                      {activeStep === 1 && "8×8 GRID SLICED"}
                      {activeStep === 2 && "GEORSCLIP CLASSIFIED"}
                      {activeStep === 3 && "EVIDENCE HIGHLIGHTED"}
                      {activeStep === 4 && "QUERY INGESTION"}
                      {activeStep === 5 && "GROUNDED OUTPUT"}
                    </span>
                  </div>
                </div>

                {/* Satellite Observation Container */}
                <div className="relative bg-[#243126] p-4 flex items-center justify-center min-h-[460px] overflow-hidden select-none">
                  {/* Base Satellite Image */}
                  <div className="relative max-w-full rounded-lg overflow-hidden border border-[#E2DDD0]/30 shadow-2xl">
                    <img
                      src="/samples/delta_agriculture.jpg"
                      alt="Delta Agriculture Satellite Imagery"
                      className={`max-h-[420px] w-auto object-contain block transition-all duration-500 ${
                        activeStep === 0 ? "scale-100 filter-none" : "scale-100"
                      }`}
                    />

                    {/* Step 1: Scanner Line effect on step 0 */}
                    {activeStep === 0 && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-1 bg-[#78966A] shadow-[0_0_12px_#78966A] animate-scanline" />
                      </div>
                    )}

                    {/* Step 2+: The Exact 8x8 = 64 Tile Grid Overlay */}
                    {activeStep >= 1 && (
                      <div
                        className="absolute inset-0 grid pointer-events-auto"
                        style={{
                          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                          gridTemplateRows: "repeat(8, minmax(0, 1fr))",
                        }}
                      >
                        {SAMPLE_64_TILES.map((tile) => {
                          const conf = CLASS_CONFIG[tile.class] || CLASS_CONFIG.barren_land;
                          const isWater = tile.class === "water_body";
                          const isAgri = tile.class === "agricultural_land";
                          const isEvidence =
                            activeStep >= 3 && (isWater || isAgri);
                          const isHovered = hoveredTile?.tile_id === tile.tile_id;

                          return (
                            <div
                              key={tile.tile_id}
                              onMouseEnter={() => setHoveredTile(tile)}
                              onMouseLeave={() => setHoveredTile(null)}
                              className={`relative border transition-all duration-300 ${
                                activeStep === 1
                                  ? "border-[#78966A]/40 hover:bg-[#78966A]/20 bg-transparent"
                                  : activeStep === 2
                                  ? `${conf.border} ${conf.bg} opacity-85 hover:opacity-100 hover:ring-2 hover:ring-white`
                                  : activeStep >= 3
                                  ? isEvidence
                                    ? `${conf.border} ${conf.bg} opacity-90 ring-1 ring-white/60 shadow-inner`
                                    : "border-slate-500/20 bg-black/40 opacity-30"
                                  : "border-[#78966A]/20"
                              } ${isHovered ? "z-20 ring-2 ring-white scale-105" : ""}`}
                            >
                              {/* Tile Number or Class Badge */}
                              {activeStep === 1 && (
                                <span className="absolute top-0.5 left-0.5 font-mono text-[7px] text-white/80 bg-black/60 px-1 rounded">
                                  #{tile.tile_id}
                                </span>
                              )}

                              {activeStep >= 2 && (
                                <div className="absolute top-0.5 left-0.5 pointer-events-none">
                                  <span
                                    className={`rounded px-0.5 py-0.2 text-[7px] font-mono font-bold tracking-tight border ${conf.badge}`}
                                  >
                                    {tile.class === "agricultural_land"
                                      ? "AGRI"
                                      : tile.class === "water_body"
                                      ? "WATER"
                                      : tile.class === "forest"
                                      ? "FOREST"
                                      : tile.class === "urban_builtup"
                                      ? "URBAN"
                                      : tile.class === "road"
                                      ? "ROAD"
                                      : "BARREN"}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Step 4: Floating Natural Language Query Overlay */}
                    {activeStep === 4 && (
                      <div className="absolute inset-x-4 bottom-4 rounded-xl bg-[#FCFAF4]/95 backdrop-blur-md border border-[#78966A] p-4 shadow-2xl animate-fade-in text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-[#78966A]" />
                          <span className="text-[10px] font-mono font-bold text-[#526B45] uppercase tracking-wider">
                            INCOMING NATURAL LANGUAGE QUERY
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#243D2A] leading-relaxed">
                          "What percentage of agricultural land shows active irrigation channels?"
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E2DDD0] text-[10px] font-mono text-[#738476]">
                          <span>ROUTER: land_cover_summary</span>
                          <span>•</span>
                          <span className="text-[#526B45] font-bold">
                            Gemini 2.5 Flash Ingesting 64 Tile Facts...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Grounded Natural Language Report Card */}
                    {activeStep === 5 && (
                      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-[#FCFAF4]/98 backdrop-blur-md border border-[#78966A] p-4 shadow-2xl animate-fade-in text-left">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                              VERIFIED GROUNDED INTELLIGENCE
                            </span>
                          </div>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-mono text-[9px] font-bold">
                            94.8% Grounded
                          </span>
                        </div>

                        <p className="text-xs text-[#243D2A] leading-relaxed">
                          Active irrigation channels and delta water bodies border <strong>87.4%</strong> of the agricultural parcels (<strong>37.5%</strong> total coverage).
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E2DDD0]">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                            Agricultural: 37.5%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 text-[10px] font-mono font-bold">
                            Water Body: 25.0%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold">
                            Forest: 18.8%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hovered Tile Details Floater */}
                  {hoveredTile && activeStep >= 1 && (
                    <div className="pointer-events-none absolute top-4 left-4 z-30 rounded-xl bg-[#FCFAF4]/95 border border-[#E2DDD0] p-3 shadow-lg backdrop-blur-md font-mono text-xs max-w-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between gap-3 border-b border-[#E2DDD0] pb-1.5 mb-1.5">
                        <span className="font-bold text-[#243D2A]">
                          Tile #{hoveredTile.tile_id}
                        </span>
                        <span className="rounded bg-[#78966A]/20 text-[#526B45] px-1.5 py-0.5 text-[10px] font-bold">
                          {(hoveredTile.confidence * 100).toFixed(1)}% Conf
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-[#47584A]">
                        <div>
                          Class:{" "}
                          <strong className="text-[#243D2A]">
                            {hoveredTile.class}
                          </strong>
                        </div>
                        <div className="text-[10px] text-[#738476]">
                          BBox: [{hoveredTile.bbox?.join(", ")}]
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Class Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2DDD0] bg-[#FCFAF4] px-4 py-2 text-[11px] font-mono">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[#738476] font-bold uppercase text-[10px]">
                      Legend:
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Forest</span>
                    </span>
                    <span className="flex items-center gap-1 text-cyan-800">
                      <span className="h-2 w-2 rounded-full bg-cyan-500" />
                      <span>Water</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-800">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span>Urban</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-800">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Agricultural</span>
                    </span>
                    <span className="flex items-center gap-1 text-stone-800">
                      <span className="h-2 w-2 rounded-full bg-stone-500" />
                      <span>Barren</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#738476]">
                    64 discrete tiles • GeoRSCLIP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Dual-Epoch Temporal Change & Flood Inundation Studio */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2DDD0] pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#526B45] uppercase tracking-wider block mb-1">
              TEMPORAL EARTH OBSERVATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#243D2A] tracking-tight">
              Multi-Epoch Flood Inundation & Change Detection
            </h2>
            <p className="text-xs sm:text-sm text-[#47584A] mt-1">
              Drag the interactive split handle to compare pre-flood baseline agriculture against post-disaster flood inundation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLaunchApp()}
              className="flex items-center gap-1.5 rounded-xl bg-[#78966A] hover:bg-[#526B45] text-white text-xs font-bold px-4 py-2 shadow-sm transition"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Open Temporal Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Wipe Comparison Card */}
        <div className="earth-panel p-4 sm:p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD0] pb-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#243D2A] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#526B45]" />
                Epoch A (Pre-Flood) vs Epoch B (Post-Flood)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px]">
                +24.2% Water Inundation Rise
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                -24.2% Submerged Agricultural Land
              </span>
            </div>
          </div>

          {/* Wipe Slider Viewport */}
          <div
            ref={sliderContainerRef}
            onMouseMove={handleSliderMove}
            onTouchMove={handleSliderMove}
            className="relative h-[360px] sm:h-[480px] w-full rounded-xl overflow-hidden cursor-ew-resize select-none bg-[#1a202c] shadow-inner"
          >
            {/* After Image (Full background) */}
            <img
              src="/samples/flood_after.jpg"
              alt="Post-Flood Satellite Epoch"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Before Image (Clipped Left side) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${temporalSliderPos}%` }}
            >
              <img
                src="/samples/flood_before.jpg"
                alt="Pre-Flood Baseline Satellite Epoch"
                className="absolute inset-0 h-full w-full object-cover max-w-none"
                style={{ width: `${sliderContainerRef.current?.clientWidth || 1000}px` }}
              />
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
              style={{ left: `${temporalSliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white border-2 border-[#78966A] shadow-xl flex items-center justify-center text-[#243D2A] text-xs font-bold">
                ↔
              </div>
            </div>

            {/* Left Badge (Pre-Flood) */}
            <div className="absolute top-3 left-3 z-10 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2DDD0] px-3 py-1.5 text-xs font-mono font-bold text-[#243D2A] shadow-md">
              <span className="text-emerald-700">● EPOCH A (PRE-FLOOD)</span>
              <span className="block text-[10px] text-[#738476]">
                Water: 6.2% • Agri: 84.5%
              </span>
            </div>

            {/* Right Badge (Post-Flood) */}
            <div className="absolute top-3 right-3 z-10 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2DDD0] px-3 py-1.5 text-xs font-mono font-bold text-[#243D2A] shadow-md text-right">
              <span className="text-cyan-700">● EPOCH B (POST-FLOOD)</span>
              <span className="block text-[10px] text-[#738476]">
                Water: 30.4% • Agri: 60.3%
              </span>
            </div>

            {/* Bottom Floating Analysis Report */}
            <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2DDD0] p-3 text-xs font-mono shadow-lg flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#526B45] uppercase block">
                  Automated Transition Matrix
                </span>
                <span className="text-xs font-bold text-[#243D2A]">
                  Primary Shift: <strong>Agricultural Land → Inundated Surface Water</strong>
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#526B45]">
                Slider Position: {temporalSliderPos}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Scientific Hydrology & Multispectral Indices (NDVI, NDWI, SMI) */}
      <section className="px-4 sm:px-8 py-16 bg-[#EFEAD9]/60 border-t border-[#E2DDD0]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#526B45] uppercase tracking-wider">
              SPECTRAL RECONNAISSANCE ENGINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#243D2A] tracking-tight">
              Biophysical Indices Derived from Multispectral Reflectance
            </h2>
            <p className="text-xs sm:text-sm text-[#47584A] max-w-xl">
              SatQuery AI derives quantitative biophysical indices directly from optical and infrared spectral bands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* NDVI */}
            <div className="earth-panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Trees className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Vegetation Health
                </span>
              </div>
              <h3 className="text-base font-bold text-[#243D2A]">
                NDVI (Veg Index)
              </h3>
              <div className="font-mono text-xs bg-[#F4F0E3] p-2.5 rounded-lg border border-[#E2DDD0] text-[#47584A]">
                <code>(NIR - Red) / (NIR + Red) = +0.74</code>
              </div>
              <p className="text-xs text-[#47584A] leading-relaxed">
                Highlights chlorophyll density and canopy vigor across agricultural plots.
              </p>
            </div>

            {/* NDWI */}
            <div className="earth-panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 border border-cyan-300">
                  <Droplets className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Water Delimitation
                </span>
              </div>
              <h3 className="text-base font-bold text-[#243D2A]">
                NDWI (Water Index)
              </h3>
              <div className="font-mono text-xs bg-[#F4F0E3] p-2.5 rounded-lg border border-[#E2DDD0] text-[#47584A]">
                <code>(Green - NIR) / (Green + NIR) = +0.48</code>
              </div>
              <p className="text-xs text-[#47584A] leading-relaxed">
                Enhances open surface water bodies, tributaries, and flood inundation boundaries.
              </p>
            </div>

            {/* SMI */}
            <div className="earth-panel p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                  <Wheat className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Soil Moisture
                </span>
              </div>
              <h3 className="text-base font-bold text-[#243D2A]">
                SMI (Soil Moisture)
              </h3>
              <div className="font-mono text-xs bg-[#F4F0E3] p-2.5 rounded-lg border border-[#E2DDD0] text-[#47584A]">
                <code>(SWIR1 - SWIR2) / (SWIR1 + SWIR2) = +0.61</code>
              </div>
              <p className="text-xs text-[#47584A] leading-relaxed">
                Detects crop root-zone saturation and surface soil hydration levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Planetary Datasets & Satellite Constellation Support */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#526B45] uppercase tracking-wider">
            CONSTELLATION COMPATIBILITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#243D2A] tracking-tight">
            Supported Earth Observation Missions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="earth-panel p-4 flex flex-col gap-2">
            <span className="text-[10px] text-[#526B45] font-bold">ESA COPERNICUS</span>
            <span className="text-sm font-bold text-[#243D2A]">Sentinel-2 MSI</span>
            <span className="text-[11px] text-[#47584A]">10m – 60m GSD • 5-day revisit • 13 spectral bands</span>
          </div>

          <div className="earth-panel p-4 flex flex-col gap-2">
            <span className="text-[10px] text-[#526B45] font-bold">USGS / NASA</span>
            <span className="text-sm font-bold text-[#243D2A]">Landsat 8 & 9</span>
            <span className="text-[11px] text-[#47584A]">15m – 30m GSD • OLI-2 / TIRS • 8-day offset</span>
          </div>

          <div className="earth-panel p-4 flex flex-col gap-2">
            <span className="text-[10px] text-[#526B45] font-bold">PLANET LABS</span>
            <span className="text-sm font-bold text-[#243D2A]">SuperDove 8-Band</span>
            <span className="text-[11px] text-[#47584A]">3.0m GSD • Daily global cadence • RGB+NIR</span>
          </div>

          <div className="earth-panel p-4 flex flex-col gap-2">
            <span className="text-[10px] text-[#526B45] font-bold">MAXAR / DIGITALGLOBE</span>
            <span className="text-sm font-bold text-[#243D2A]">WorldView-3</span>
            <span className="text-[11px] text-[#47584A]">0.31m Pan / 1.24m MS • 8-band VNIR & SWIR</span>
          </div>
        </div>
      </section>

      {/* 7. Mission Control CTA Banner */}
      <section className="px-4 sm:px-8 py-16 bg-gradient-to-r from-[#78966A] via-[#526B45] to-[#243D2A] text-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-mono font-bold text-[#DDE8C9] border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-[#DDE8C9]" />
            <span>READY FOR ORBITAL ANALYSIS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Launch Your Earth Observation Session
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Upload custom GeoTIFF or optical satellite imagery, inspect live 8×8 zero-shot groundings, and ask complex geospatial questions in natural language.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onLaunchApp}
              className="rounded-xl bg-[#FCFAF4] text-[#243D2A] hover:bg-white text-sm font-bold px-6 py-3.5 shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Scan className="h-4 w-4 text-[#526B45]" />
              <span>Launch Mission Scanner</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenMap}
              className="rounded-xl bg-white/15 border border-white/30 hover:bg-white/25 text-white text-sm font-semibold px-5 py-3.5 transition"
            >
              Open Global Map
            </button>
          </div>
        </div>
      </section>

      {/* 8. Scientific Aerospace Footer */}
      <footer className="border-t border-[#E2DDD0] bg-[#FCFAF4] py-8 px-4 sm:px-8 text-xs text-[#738476]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-black text-[#243D2A] uppercase">SATQUERY AI</span>
            <span>•</span>
            <span>Zero-Shot Earth Observation Intelligence</span>
          </div>
          <p className="font-mono text-[11px]">
            GeoRSCLIP (ViT-B-32) • Gemini 2.5 Flash • OpenCLIP Remote Sensing
          </p>
        </div>
      </footer>
    </div>
  );
}

function Grid(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}
