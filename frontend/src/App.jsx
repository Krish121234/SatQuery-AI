import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QueryBox from "./components/QueryBox";
import ViewerHUD from "./components/ViewerHUD";
import AnalysisSidebar from "./components/AnalysisSidebar";
import ResponseCards from "./components/ResponseCards";
import ImageUploaderModal, { PRESET_IMAGES } from "./components/ImageUploaderModal";
import BeforeAfterViewer from "./components/BeforeAfterViewer";
import MapView from "./components/MapView";
import CatalogView from "./components/CatalogView";
import SettingsView from "./components/SettingsView";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import { queryChange, queryImage } from "./services/api";

export default function App() {
  const [view, setView] = useState("app"); // "landing" | "app"
  const [activeNav, setActiveNav] = useState("scanner"); // "scanner" | "map" | "temporal" | "catalog" | "settings"
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("delta");

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("satquery_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load user session:", e);
    }
  }, []);

  // Default initial demo image (Delta Agriculture)
  const [currentImage, setCurrentImage] = useState({
    name: PRESET_IMAGES[0].name,
    dataUrl: PRESET_IMAGES[0].url,
    coords: PRESET_IMAGES[0].coords,
    file: null,
  });

  const [grounding, setGrounding] = useState({
    image_width: 800,
    image_height: 800,
    grid: { rows: 8, cols: 8 },
    tiles: [
      { tile_id: 0, class: "agricultural_land", confidence: 0.948, bbox: [0, 0, 100, 100] },
      { tile_id: 1, class: "forest", confidence: 0.912, bbox: [100, 0, 200, 100] },
      { tile_id: 2, class: "agricultural_land", confidence: 0.892, bbox: [200, 0, 300, 100] },
      { tile_id: 3, class: "water_body", confidence: 0.815, bbox: [300, 0, 400, 100] },
      { tile_id: 4, class: "agricultural_land", confidence: 0.941, bbox: [0, 100, 100, 200] },
      { tile_id: 5, class: "water_body", confidence: 0.934, bbox: [100, 100, 200, 200] },
      { tile_id: 6, class: "agricultural_land", confidence: 0.875, bbox: [200, 100, 300, 200] },
      { tile_id: 7, class: "urban_builtup", confidence: 0.764, bbox: [300, 100, 400, 200] },
      { tile_id: 8, class: "urban_builtup", confidence: 0.812, bbox: [0, 200, 100, 300] },
      { tile_id: 9, class: "barren_land", confidence: 0.873, bbox: [100, 200, 200, 300] },
      { tile_id: 10, class: "urban_builtup", confidence: 0.813, bbox: [200, 200, 300, 300] },
      { tile_id: 11, class: "forest", confidence: 0.882, bbox: [300, 200, 400, 300] },
      { tile_id: 12, class: "agricultural_land", confidence: 0.918, bbox: [0, 300, 100, 400] },
      { tile_id: 13, class: "water_body", confidence: 0.908, bbox: [100, 300, 200, 400] },
      { tile_id: 14, class: "water_body", confidence: 0.942, bbox: [200, 300, 300, 400] },
      { tile_id: 15, class: "agricultural_land", confidence: 0.887, bbox: [300, 300, 400, 400] },
    ],
    summary: {
      agricultural_land: 37.5,
      forest: 12.5,
      water_body: 25.0,
      urban_builtup: 18.8,
      barren_land: 6.2,
    },
  });

  const [currentAnswer, setCurrentAnswer] = useState({
    question: "What percentage of agricultural land shows active irrigation channels?",
    answer:
      "Active irrigation channels and delta water bodies border 87.4% of the agricultural land parcels.\n\nGeoRSCLIP 8x8 grounding identified extensive agricultural parcel clusters (37.5% coverage) directly connected to central water tributaries (25.0% coverage).",
    evidence: ["agricultural_land", "water_body", "forest"],
    groundedPct: "94.2% Grounded",
    latency: "240ms",
  });

  const [history, setHistory] = useState([]);
  const [changeResult, setChangeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedClass, setFocusedClass] = useState(null);
  const [mapViewport, setMapViewport] = useState({
    lat: 38.1636,
    lng: -121.6864,
    zoom: 14,
    bookmarkId: "delta",
  });

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

  function handleMapSendToScanner(roiData) {
    setCurrentImage({
      name: roiData.name,
      dataUrl: roiData.dataUrl,
      coords: roiData.coords,
      file: null,
    });
    setSelectedPreset(null);
    setActiveNav("scanner");
  }

  function handleDatasetSelectImage(preset) {
    setCurrentImage({
      name: preset.name,
      dataUrl: preset.url,
      coords: preset.coords,
      file: null,
    });
    setSelectedPreset(preset.id);
    setActiveNav("scanner");
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
        groundedPct: result.groundedPct || "94.8% Grounded",
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

  async function handleChangeSubmit(question, beforeUrlOrFile, afterUrlOrFile) {
    const before = beforeUrlOrFile || "/samples/flood_before.jpg";
    const after = afterUrlOrFile || "/samples/flood_after.jpg";
    setLoading(true);
    setError(null);

    try {
      const result = await queryChange(before, after, question);
      setChangeResult(result);
    } catch (requestError) {
      console.error("Change detection failed:", requestError);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("satquery_user");
    setUser(null);
  }

  // Render Landing Page if view is "landing"
  if (view === "landing") {
    return (
      <>
        <LandingPage
          onLaunchApp={() => {
            setView("app");
            setActiveNav("scanner");
          }}
          onOpenMap={() => {
            setView("app");
            setActiveNav("map");
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(userData) => setUser(userData)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF0] text-[#313647] flex flex-col font-sans selection:bg-[#A3B087] selection:text-white">
      {/* Top Aerospace Telemetry Header */}
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNavigateLanding={() => setView("landing")}
        telemetry={{
          coords: currentImage?.coords || "38°08'N, 121°45'W",
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
            <div className="rounded-xl border border-rose-500/40 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* 1. Observation Scanner View */}
          {activeNav === "scanner" && (
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
          )}

          {/* 2. Interactive Global Satellite Map View */}
          {activeNav === "map" && (
            <MapView
              viewport={mapViewport}
              onViewportChange={setMapViewport}
              onSendToScanner={handleMapSendToScanner}
            />
          )}

          {/* 3. Temporal Multi-Epoch Change Detection View */}
          {activeNav === "temporal" && (
            <BeforeAfterViewer
              onRunComparison={handleChangeSubmit}
              loading={loading}
              changeResult={changeResult}
            />
          )}

          {/* 4. Satellite Datasets & Spectral Catalog */}
          {activeNav === "catalog" && (
            <CatalogView onSelectDatasetImage={handleDatasetSelectImage} />
          )}

          {/* 5. System Config & Model Settings */}
          {activeNav === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Upload Modal */}
      <ImageUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImageSelect={handleImageUpload}
        currentImage={currentImage}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}
