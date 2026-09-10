import React from "react";
import { Layers, Sparkles } from "lucide-react";

export default function Header({ tab, setTab }) {
  return (
    <header className="border-b border-[#e2e0d6] bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
            <span className="text-base font-black tracking-wider">🛰</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-widest text-[#313647] uppercase">
              SATQUERY
            </h1>
            <span className="rounded-full border border-[#A3B087]/40 bg-[#A3B087]/10 px-2 py-0.5 text-[10px] font-semibold text-[#A3B087] tracking-wider">
              AI
            </span>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex rounded-full bg-[#f5f3ea] border border-[#e2e0d6] p-1 text-xs font-medium">
          <button
            onClick={() => setTab("query")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all ${
              tab === "query"
                ? "bg-[#A3B087] text-white font-semibold shadow-sm"
                : "text-[#435663] hover:text-[#313647] hover:bg-white/60"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Single Image</span>
          </button>

          <button
            onClick={() => setTab("change")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all ${
              tab === "change"
                ? "bg-[#A3B087] text-white font-semibold shadow-sm"
                : "text-[#435663] hover:text-[#313647] hover:bg-white/60"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Temporal Compare</span>
          </button>
        </div>

        {/* Right: spacer for balance */}
        <div className="w-[120px] hidden sm:block" />
      </div>
    </header>
  );
}
