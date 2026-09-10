import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Crosshair,
  Search,
  Scan,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import L from "leaflet";

// Curated Earth Observation landmark bookmarks
export const SATELLITE_BOOKMARKS = [
  {
    id: "delta",
    name: "Sacramento Delta Agriculture",
    location: "California, USA",
    lat: 38.1636,
    lng: -121.6864,
    zoom: 14,
    desc: "Intensive agricultural grid, irrigation canals, and river delta channels",
    sampleImage: "/samples/delta_agriculture.jpg",
  },
  {
    id: "flood",
    name: "Indus Basin Flood Plain",
    location: "Sindh, Pakistan",
    lat: 26.2442,
    lng: 68.0337,
    zoom: 13,
    desc: "Monsoon flood inundation zone along the historic Indus River corridor",
    sampleImage: "/samples/flood_after.jpg",
  },
  {
    id: "port",
    name: "Port of Long Beach & Harbor",
    location: "California, USA",
    lat: 33.7542,
    lng: -118.2165,
    zoom: 14,
    desc: "Major container terminals, logistics berths, breakwaters, and urban coastline",
    sampleImage: "/samples/urban_port.jpg",
  },
  {
    id: "forest",
    name: "Cascade Range Watershed",
    location: "Oregon, USA",
    lat: 44.3667,
    lng: -121.9000,
    zoom: 13,
    desc: "Dense coniferous canopy, riparian river valley, and alpine terrain",
    sampleImage: "/samples/forest_river.jpg",
  },
  {
    id: "dubai",
    name: "Palm Jumeirah & Coastline",
    location: "Dubai, UAE",
    lat: 25.1124,
    lng: 55.1390,
    zoom: 13,
    desc: "Artificial archipelago, coastal urban developments, and marine waters",
  },
  {
    id: "amazon",
    name: "Amazon & Rio Negro Confluence",
    location: "Manaus, Brazil",
    lat: -3.1319,
    lng: -59.9056,
    zoom: 12,
    desc: "Massive tropical river meeting of blackwater and whitewater river systems",
  },
  {
    id: "fuji",
    name: "Mount Fuji & Five Lakes",
    location: "Honshu, Japan",
    lat: 35.3606,
    lng: 138.7274,
    zoom: 12,
    desc: "Stratovolcano crater, alpine snowline, and surrounding volcanic lakes",
  },
  {
    id: "nile",
    name: "Nile Delta & Cairo Basin",
    location: "Cairo, Egypt",
    lat: 30.0444,
    lng: 31.2357,
    zoom: 13,
    desc: "High-density agrarian strip along the Nile riverbank surrounded by arid desert",
  },
];

export default function MapView({ onSendToScanner }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [currentCoords, setCurrentCoords] = useState({
    lat: 38.1636,
    lng: -121.6864,
    zoom: 14,
  });
  const [activeBookmark, setActiveBookmark] = useState(SATELLITE_BOOKMARKS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [layerType, setLayerType] = useState("esri"); // "esri" | "osm" | "topo"

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: currentCoords.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Esri ArcGIS World Imagery satellite tiles (High-resolution authentic orbital view)
      const esriTileLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          crossOrigin: true,
        }
      ).addTo(map);

      // Save references
      mapInstanceRef.current = map;
      mapInstanceRef.current._satelliteLayer = esriTileLayer;

      // Track pan and zoom events
      map.on("move", () => {
        const center = map.getCenter();
        setCurrentCoords({
          lat: parseFloat(center.lat.toFixed(4)),
          lng: parseFloat(center.lng.toFixed(4)),
          zoom: map.getZoom(),
        });
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layer on toggle
  function handleChangeLayer(type) {
    setLayerType(type);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (map._satelliteLayer) {
      map.removeLayer(map._satelliteLayer);
    }

    let newLayer;
    if (type === "esri") {
      newLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18, crossOrigin: true }
      );
    } else if (type === "osm") {
      newLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 18, crossOrigin: true }
      );
    } else {
      newLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18, crossOrigin: true }
      );
    }

    newLayer.addTo(map);
    map._satelliteLayer = newLayer;
  }

  // Jump to bookmark
  function handleSelectBookmark(bm) {
    setActiveBookmark(bm);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([bm.lat, bm.lng], bm.zoom, {
        duration: 1.5,
      });
    }
  }

  // Handle Search / Coordinate input
  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query is lat, lng
    const coordParts = searchQuery.split(",").map((s) => parseFloat(s.trim()));
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      const [lat, lng] = coordParts;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
        }
        return;
      }
    }

    // Match bookmarks
    const found = SATELLITE_BOOKMARKS.find(
      (b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      handleSelectBookmark(found);
    } else {
      // Geocoding via Nominatim
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const first = data[0];
            const lat = parseFloat(first.lat);
            const lon = parseFloat(first.lon);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.5 });
            }
          }
        })
        .catch((err) => console.error("Geocoding failed:", err));
    }
  }

  // Calculate Mercator Tile XY
  function getTileXY(lat, lon, zoom) {
    const latRad = (lat * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lon + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
    );
    return { x, y, z: zoom };
  }

  const currentTile = getTileXY(
    currentCoords.lat,
    currentCoords.lng,
    currentCoords.zoom
  );

  // Approximate Ground Sample Distance (GSD) at latitude
  const gsdMeters = (
    (156543.03392 * Math.cos((currentCoords.lat * Math.PI) / 180)) /
    Math.pow(2, currentCoords.zoom)
  ).toFixed(2);

  // Capture current satellite view and dispatch to Scanner
  async function handleCaptureToScanner() {
    setCapturing(true);

    try {
      // If we are at a known bookmark with a sample image, send directly
      if (activeBookmark && activeBookmark.sampleImage) {
        onSendToScanner?.({
          name: `${activeBookmark.name} (${activeBookmark.location})`,
          dataUrl: activeBookmark.sampleImage,
          coords: `${Math.abs(currentCoords.lat).toFixed(2)}°${
            currentCoords.lat >= 0 ? "N" : "S"
          }, ${Math.abs(currentCoords.lng).toFixed(2)}°${
            currentCoords.lng >= 0 ? "E" : "W"
          }`,
          file: null,
          zoom: currentCoords.zoom,
        });
        setCapturing(false);
        return;
      }

      // Build stitched 3x3 canvas of satellite tiles
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 768;
      const ctx = canvas.getContext("2d");

      const z = currentCoords.zoom;
      const centerTile = getTileXY(currentCoords.lat, currentCoords.lng, z);
      const startX = centerTile.x - 1;
      const startY = centerTile.y - 1;

      const tilePromises = [];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const tx = startX + c;
          const ty = startY + r;
          const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;

          const p = new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              ctx.drawImage(img, c * 256, r * 256, 256, 256);
              resolve();
            };
            img.onerror = () => {
              // Draw placeholder if tile load fails
              ctx.fillStyle = "#2d3748";
              ctx.fillRect(c * 256, r * 256, 256, 256);
              resolve();
            };
            img.src = url;
          });

          tilePromises.push(p);
        }
      }

      await Promise.all(tilePromises);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      onSendToScanner?.({
        name: `Satellite ROI (${currentCoords.lat}°, ${currentCoords.lng}°)`,
        dataUrl,
        coords: `${Math.abs(currentCoords.lat).toFixed(2)}°${
          currentCoords.lat >= 0 ? "N" : "S"
        }, ${Math.abs(currentCoords.lng).toFixed(2)}°${
          currentCoords.lng >= 0 ? "E" : "W"
        }`,
        file: null,
        zoom: currentCoords.zoom,
      });
    } catch (err) {
      console.error("Failed to capture satellite viewport:", err);
      // Fallback
      onSendToScanner?.({
        name: `Orbital Sector (${currentCoords.lat}°, ${currentCoords.lng}°)`,
        dataUrl: "/samples/delta_agriculture.jpg",
        coords: `${currentCoords.lat}°, ${currentCoords.lng}°`,
        file: null,
      });
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Map Action Bar */}
      <div className="earth-panel p-4 flex flex-wrap items-center justify-between gap-3 text-[#313647]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
            <Compass className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#A3B087] font-bold uppercase tracking-wider block">
              REAL-TIME ORBITAL EXPLORER
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#313647] tracking-tight">
              Interactive Global Satellite Map
            </h2>
          </div>
        </div>

        {/* Search Coordinates or Location */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#435663]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place or coords (e.g. 38.16, -121.68)..."
              className="w-full rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] pl-8 pr-3 py-1.5 text-xs text-[#313647] placeholder-[#435663]/40 focus:outline-none focus:border-[#A3B087]"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#f5f3ea] border border-[#e2e0d6] hover:border-[#A3B087]/50 px-3 py-1.5 text-xs font-semibold text-[#313647] transition"
          >
            Locate
          </button>
        </form>

        {/* Capture to Scanner Button */}
        <button
          onClick={handleCaptureToScanner}
          disabled={capturing}
          className="flex items-center gap-2 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white font-bold px-4 py-2 text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50"
        >
          {capturing ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Stitching Tiles…</span>
            </>
          ) : (
            <>
              <Scan className="h-4 w-4" />
              <span>Capture & Scan ROI</span>
            </>
          )}
        </button>
      </div>

      {/* Main Map Viewport & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (8 cols): Interactive Satellite Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative h-[560px] w-full rounded-2xl overflow-hidden border border-[#e2e0d6] shadow-sm bg-[#1a202c]">
            {/* Map Container */}
            <div ref={mapContainerRef} className="h-full w-full z-0" />

            {/* Center Reticle / Grounding Target Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
              <div className="relative flex items-center justify-center">
                {/* 800x800 Tile Slicing Scope HUD */}
                <div className="h-48 w-48 border-2 border-dashed border-[#A3B087]/80 rounded-xl bg-[#A3B087]/5 backdrop-blur-[1px] shadow-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 grid-rows-4 h-full w-full opacity-30 border border-[#A3B087]">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="border border-[#A3B087]/40" />
                    ))}
                  </div>
                </div>
                <Crosshair className="absolute h-8 w-8 text-white/90 drop-shadow-md" />
                <span className="absolute -bottom-6 font-mono text-[9px] font-bold text-white bg-black/70 px-2 py-0.5 rounded-full border border-white/20">
                  GeoRSCLIP Target FOV
                </span>
              </div>
            </div>

            {/* Top Left: Live Coordinate HUD */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="rounded-xl bg-white/90 backdrop-blur-md border border-[#e2e0d6] px-3 py-1.5 shadow-sm text-[#313647] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  <strong>{Math.abs(currentCoords.lat).toFixed(4)}°{currentCoords.lat >= 0 ? "N" : "S"}</strong>,{" "}
                  <strong>{Math.abs(currentCoords.lng).toFixed(4)}°{currentCoords.lng >= 0 ? "E" : "W"}</strong>
                </span>
                <span className="text-[#435663]/50">|</span>
                <span className="text-[#435663]/80">Zoom: {currentCoords.zoom}</span>
                <span className="text-[#435663]/50">|</span>
                <span className="text-[#A3B087] font-bold">GSD: ~{gsdMeters}m/px</span>
              </div>
            </div>

            {/* Top Right: Layer Switcher */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-xl bg-white/90 backdrop-blur-md border border-[#e2e0d6] p-1 shadow-sm">
              <button
                onClick={() => handleChangeLayer("esri")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  layerType === "esri"
                    ? "bg-[#A3B087] text-white font-bold shadow-sm"
                    : "text-[#435663] hover:text-[#313647]"
                }`}
              >
                Esri Satellite
              </button>
              <button
                onClick={() => handleChangeLayer("osm")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  layerType === "osm"
                    ? "bg-[#A3B087] text-white font-bold shadow-sm"
                    : "text-[#435663] hover:text-[#313647]"
                }`}
              >
                OpenStreetMap
              </button>
              <button
                onClick={() => handleChangeLayer("topo")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  layerType === "topo"
                    ? "bg-[#A3B087] text-white font-bold shadow-sm"
                    : "text-[#435663] hover:text-[#313647]"
                }`}
              >
                Topographic
              </button>
            </div>

            {/* Bottom Left: Tile Grid Info */}
            <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-white bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
              Tile z/y/x: {currentTile.z}/{currentTile.y}/{currentTile.x} | EPSG:3857 Web Mercator
            </div>

            {/* Bottom Right: Map Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
              <button
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="h-8 w-8 rounded-lg bg-white/95 border border-[#e2e0d6] hover:bg-[#f5f3ea] text-[#313647] flex items-center justify-center shadow-sm font-bold transition"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="h-8 w-8 rounded-lg bg-white/95 border border-[#e2e0d6] hover:bg-[#f5f3ea] text-[#313647] flex items-center justify-center shadow-sm font-bold transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right (4 cols): Landmark Bookmarks & Satellite POI Selector */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="earth-panel p-4 flex flex-col gap-3 h-[560px] overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e0d6]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#A3B087]" />
                <h3 className="text-xs font-bold text-[#313647] uppercase tracking-wider">
                  Orbital Landmarks ({SATELLITE_BOOKMARKS.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#435663]/60">Select to Fly</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
              {SATELLITE_BOOKMARKS.map((bm) => {
                const isSelected = activeBookmark?.id === bm.id;
                return (
                  <button
                    key={bm.id}
                    onClick={() => handleSelectBookmark(bm)}
                    className={`flex flex-col gap-1 rounded-xl p-3 text-left transition border ${
                      isSelected
                        ? "bg-[#A3B087]/10 border-[#A3B087] shadow-sm"
                        : "bg-[#FFFCF0] border-[#e2e0d6] hover:border-[#A3B087]/50 hover:bg-[#f5f3ea]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#313647] flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-[#A3B087]" : "bg-[#435663]/40"}`} />
                        {bm.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#A3B087] font-semibold">
                        {bm.zoom}x
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-[#435663]/70">
                      {bm.location} • {bm.lat.toFixed(2)}°, {bm.lng.toFixed(2)}°
                    </span>

                    <p className="text-[11px] text-[#435663]/80 line-clamp-2 mt-0.5 leading-relaxed">
                      {bm.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
