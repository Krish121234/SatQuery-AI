import React, { useState, useEffect } from "react";
import {
  Radio,
  Bell,
  Activity,
  Layers,
  Sparkles,
  Compass,
  Cpu,
  RefreshCw,
} from "lucide-react";

export default function Header({ tab, setTab, telemetry, isOnline = true }) {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const iso = now.toISOString().replace("T", " ").substring(0, 19);
      setUtcTime(iso);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-cyan-950/60 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4">
        {/* Left: Brand & Orbit Info */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <span className="text-base font-black tracking-wider">🛰</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-widest text-slate-100 uppercase">
                SATQUERY
              </h1>
              <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 tracking-wider">
                AI V4.2
              </span>
            </div>
          </div>

          {/* Telemetry Pills */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 rounded-md bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200">EOS-7</span>
              <span className="text-slate-500">ORBITAL PASS</span>
              <span className="text-cyan-400 font-bold">// LIVE SYNCED</span>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-600">COORDS: </span>
                <span className="text-slate-300 font-medium">{telemetry?.coords || "34°03'N, 118°14'W"}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-slate-600">ALT: </span>
                <span className="text-slate-300 font-medium">{telemetry?.altitude || "682 KM"}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-slate-600">CLOUD: </span>
                <span className="text-emerald-400 font-medium">{telemetry?.cloud || "4.2%"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex rounded-lg bg-slate-950/80 border border-slate-800/80 p-1 text-xs font-medium">
          <button
            onClick={() => setTab("query")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${
              tab === "query"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Single Image</span>
          </button>

          <button
            onClick={() => setTab("change")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${
              tab === "change"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Temporal Compare</span>
          </button>
        </div>

        {/* Right: Real-time clock & Action icons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-md bg-slate-900/60 border border-slate-800 px-3 py-1 font-mono text-xs">
            <span className="text-slate-500 text-[10px]">UTC</span>
            <span className="text-cyan-300 font-medium">{utcTime || "2026-09-04 10:42:00"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              title="Telemetry Status"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition"
            >
              <Radio className="h-3.5 w-3.5" />
            </button>
            <button
              title="System Alerts"
              className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            </button>
            <div className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-mono font-bold text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              <span>OP-1</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
