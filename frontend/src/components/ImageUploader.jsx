import { useState } from "react";

/**
 * ImageUploader — lets the user upload a satellite image or pick from a gallery.
 *
 * Day 1: stub only (file input + preview placeholder).
 * Day 2: wire to a hardcoded mock /query response.
 * Day 3: real upload via backend, preview rendered.
 */
export default function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onImageSelect?.({ file, dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-400">
      {preview ? (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Satellite preview"
            className="mx-auto max-h-64 rounded-md object-contain"
          />
          <p className="text-sm text-gray-500">{fileName}</p>
          <button
            onClick={() => {
              setPreview(null);
              setFileName("");
              onImageSelect?.(null);
            }}
            className="text-sm text-red-500 underline hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="cursor-pointer space-y-2">
          <div className="text-4xl">🛰️</div>
          <p className="text-sm font-medium text-gray-600">
            Drop a satellite image or{" "}
            <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-gray-400">PNG, JPG up to 10 MB</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
