import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import QuestionInput from "./components/QuestionInput";
import AnswerPanel from "./components/AnswerPanel";
import OverlayCanvas from "./components/OverlayCanvas";
import BeforeAfterViewer from "./components/BeforeAfterViewer";
import { queryImage } from "./services/api";

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("query"); // "query" | "change"

  function handleImageSelect(imageData) {
    setSelectedImage(imageData);
    setAnswer(null);
  }

  async function handleQuestionSubmit(question) {
    setLoading(true);
    try {
      // Day 2: Use mock API service (returns hardcoded grounded answers)
      const result = await queryImage(selectedImage?.dataUrl, question);
      setAnswer(result);
    } catch (error) {
      console.error("Query failed:", error);
      setAnswer({
        answer: "Sorry, something went wrong. Please try again.",
        evidence: [],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛰️</span>
            <div>
              <h1 className="text-lg font-bold">SatQuery AI</h1>
              <p className="text-xs text-gray-500">
                Grounded Vision-Language Assistant for Remote Sensing • ISRO PS 26167
              </p>
            </div>
          </div>
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
            <button
              onClick={() => setTab("query")}
              className={`rounded-md px-3 py-1.5 transition ${
                tab === "query"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Single Query
            </button>
            <button
              onClick={() => setTab("change")}
              className={`rounded-md px-3 py-1.5 transition ${
                tab === "change"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Change Detection
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-4">
        {tab === "query" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left: Image Upload & Canvas Overlay */}
            <div className="space-y-4">
              <ImageUploader onImageSelect={handleImageSelect} />
              {selectedImage && (
                <OverlayCanvas imageSrc={selectedImage.dataUrl} tiles={[]} />
              )}
            </div>

            {/* Right: Q&A Panel */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-700">
                  Ask About This Image
                </h2>
                <QuestionInput
                  onSubmit={handleQuestionSubmit}
                  disabled={!selectedImage || loading}
                />
                <AnswerPanel answer={answer} loading={loading} />
              </div>

              {/* Day 2 Footer hint */}
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <strong>Day 2 — Mock API Wired:</strong> Question box functional with
                loading spinner. Returns grounded mock answers from Lakshya's format.
              </div>
            </div>
          </div>
        ) : (
          /* Change Detection Tab */
          <div className="space-y-4">
            <BeforeAfterViewer />
            <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
              Change detection workflow will be built on Day 5.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
