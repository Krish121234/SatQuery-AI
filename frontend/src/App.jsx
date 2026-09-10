import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QueryBox from "./components/QueryBox";
import ViewerHUD from "./components/ViewerHUD";
import AnalysisSidebar from "./components/AnalysisSidebar";
import ResponseCards from "./components/ResponseCards";
import ImageUploaderModal, { PRESET_IMAGES } from "./components/ImageUploaderModal";
import BeforeAfterViewer from "./components/BeforeAfterViewer";
import { queryChange, queryImage } from "./services/api";

export default function App() {
  const [tab, setTab] = useState("query"); // "query" | "change"
  const [activeNav, setActiveNav] = useState("scanner");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("delta");

  // Default initial demo image (EOS-7 Coastal Basin)
  const [currentImage, setCurrentImage] = useState({
    name: PRESET_IMAGES[0].name,
    dataUrl: PRESET_IMAGES[0].url,
    coords: PRESET_IMAGES[0].coords,
    file: null,
  });

  const [grounding, setGrounding] = useState({
    image_width: 256,
    image_height: 256,
    grid: { rows: 8, cols: 8 },
    tiles: [
      { tile_id: 0, class: "Agriculture", confidence: 0.948, bbox: [0, 0, 100, 100] },
      { tile_id: 1, class: "Vegetation", confidence: 0.912, bbox: [100, 0, 200, 100] },
      { tile_id: 2, class: "Agriculture", confidence: 0.892, bbox: [200, 0, 300, 100] },
      { tile_id: 3, class: "Water", confidence: 0.815, bbox: [300, 0, 400, 100] },
      { tile_id: 4, class: "Agriculture", confidence: 0.941, bbox: [0, 100, 100, 200] },
      { tile_id: 5, class: "Water", confidence: 0.934, bbox: [100, 100, 200, 200] },
      { tile_id: 6, class: "Agriculture", confidence: 0.875, bbox: [200, 100, 300, 200] },
      { tile_id: 7, class: "Built-up", confidence: 0.764, bbox: [300, 100, 400, 200] },
      { tile_id: 8, class: "Built-up", confidence: 0.812, bbox: [0, 200, 100, 300] },
      { tile_id: 9, class: "Barren", confidence: 0.873, bbox: [100, 200, 200, 300] },
      { tile_id: 10, class: "Built-up", confidence: 0.813, bbox: [200, 200, 300, 300] },
      { tile_id: 11, class: "Vegetation", confidence: 0.882, bbox: [300, 200, 400, 300] },
      { tile_id: 12, class: "Agriculture", confidence: 0.918, bbox: [0, 300, 100, 400] },
      { tile_id: 13, class: "Water", confidence: 0.908, bbox: [100, 300, 200, 400] },
      { tile_id: 14, class: "Water", confidence: 0.942, bbox: [200, 300, 300, 400] },
      { tile_id: 15, class: "Agriculture", confidence: 0.887, bbox: [300, 300, 400, 400] },
    ],
    summary: {
      Agriculture: 0.375,
      Vegetation: 0.125,
      Water: 0.25,
      "Built-up": 0.188,
      Barren: 0.062,
    },
  });

  const [currentAnswer, setCurrentAnswer] = useState({
    question: "What percentage of agricultural land shows active irrigation channels?",
    answer:
      "Active irrigation saturation connects 87.4% of agricultural zone via northern delta.\n\nDeep spatial verification across 412.8 km² detected 14 high-velocity feeder canals with healthy soil hydration.",
    evidence: ["Agriculture", "Water", "Vegetation"],
    groundedPct: "96.2% Grounded",
    latency: "284ms",
  });

  const [history, setHistory] = useState([]);
  const [changeResult, setChangeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedClass, setFocusedClass] = useState(null);

  function handleSelectPreset(presetKey) {
    setSelectedPreset(presetKey);
    const found = PRESET_IMAGES.find((p) => p.id === presetKey);
    if (found) {
      setCurrentImage({
        name: found.name,
        dataUrl: found.url,
        coords: found.coords,
        file: null,
      });
    }
  }

  function handleImageUpload(imageObj) {
    setCurrentImage(imageObj);
    setSelectedPreset(null);
  }

  async function handleQuestionSubmit(question) {
    if (!currentImage?.dataUrl && !currentImage?.file) {
      setIsUploadOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await queryImage(currentImage.file || currentImage.dataUrl, question);
      const latencyMs = Math.round(performance.now() - startTime);
      const newAnswer = {
        question,
        answer: result.answer,
        evidence: result.evidence || [],
        groundedPct: "Backend grounded",
        latency: `${latencyMs}ms`,
      };

      if (result.grounding) setGrounding(result.grounding);
      setHistory((prev) => [currentAnswer, ...prev]);
      setCurrentAnswer(newAnswer);
    } catch (requestError) {
      console.error("Query failed:", requestError);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeSubmit(question) {
    const before = PRESET_IMAGES[0];
    const after = PRESET_IMAGES[1];
    setLoading(true);
    setError(null);

    try {
      const result = await queryChange(before.url, after.url, question);
      setChangeResult(result);
    } catch (requestError) {
      console.error("Change detection failed:", requestError);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFCF0] text-[#313647] flex flex-col font-sans selection:bg-[#A3B087] selection:text-white">
      {/* Top Aerospace Telemetry Header */}
      <Header
        tab={tab}
        setTab={setTab}
        telemetry={{
          coords: currentImage?.coords || "34°03'N, 118°14'W",
          altitude: "682 KM",
          cloud: "4.2%",
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail */}
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 max-w-[1720px] mx-auto w-full flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          {tab === "query" ? (
            <>
              {/* Top Earth Observation Search Bar */}
              <QueryBox
                onSubmit={handleQuestionSubmit}
                onOpenUpload={() => setIsUploadOpen(true)}
                loading={loading}
                hasImage={!!currentImage?.dataUrl}
                selectedPreset={selectedPreset}
                onSelectPreset={handleSelectPreset}
              />

              {/* Central Observation & Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left (8 cols): Interactive Satellite Canvas HUD */}
                <div className="lg:col-span-8 flex flex-col">
                  <ViewerHUD
                    imageSrc={currentImage?.dataUrl}
                    grounding={grounding}
                    focusedClass={focusedClass}
                    onHoverTile={(tile) => console.log("Hovered tile:", tile)}
                  />
                </div>

                {/* Right (4 cols): Semantic Analysis & Spectral Indices Matrix */}
                <div className="lg:col-span-4 flex flex-col">
                  <AnalysisSidebar
                    grounding={grounding}
                    focusedClass={focusedClass}
                    onFilterClass={(cls) => setFocusedClass(cls)}
                  />
                </div>
              </div>

              {/* Bottom Grounded Response Cards */}
              <div className="mt-1">
                <ResponseCards
                  currentAnswer={currentAnswer}
                  history={history}
                  loading={loading}
                  focusedClass={focusedClass}
                  onFocusClass={(cls) => setFocusedClass(cls)}
                />
              </div>
            </>
          ) : (
            /* Temporal Comparison View */
            <div className="flex-1 flex flex-col gap-4">
              <BeforeAfterViewer
                beforeSrc={PRESET_IMAGES[0].url}
                afterSrc={PRESET_IMAGES[1].url}
                beforeDate="2019-08-14"
                afterDate="2024-09-02"
                loading={loading}
                result={changeResult}
                onRunComparison={handleChangeSubmit}
              />
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <ImageUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImageSelect={handleImageUpload}
        currentImage={currentImage}
      />
    </div>
  );
}
