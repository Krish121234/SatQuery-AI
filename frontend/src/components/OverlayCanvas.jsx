import { useRef, useEffect } from "react";

/**
 * OverlayCanvas — draws bounding boxes / highlighted regions over the image.
 *
 * Day 1: stub that renders an image with no overlay.
 * Day 2: draws mock bbox array on canvas.
 * Day 4: wired to live overlay_data from API response.
 */

const CLASS_COLORS = {
  forest: "#2e7d32",
  water_body: "#1565c0",
  urban_builtup: "#c62828",
  agricultural_land: "#f9a825",
  barren_land: "#8d6e63",
  road: "#616161",
};

export default function OverlayCanvas({ imageSrc, tiles }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageSrc) return;

    function draw() {
      const ctx = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0);

      if (tiles?.length) {
        for (const tile of tiles) {
          const [x1, y1, x2, y2] = tile.bbox;
          const color = CLASS_COLORS[tile.class] || "#ffffff";
          ctx.fillStyle = color + "59"; // ~35% opacity
          ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
      }
    }

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
  }, [imageSrc, tiles]);

  if (!imageSrc) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        Image overlay will appear here
      </div>
    );
  }

  return (
    <div className="relative">
      <img ref={imgRef} src={imageSrc} alt="" className="hidden" />
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-gray-200"
      />
    </div>
  );
}
