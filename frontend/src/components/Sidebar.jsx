import React from "react";
import {
  Compass,
  Scan,
  History,
  Activity,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function Sidebar({ activeNav = "scanner", setActiveNav }) {
  const navItems = [
    { id: "scanner", label: "Observation Scanner", icon: Scan },
    { id: "layers", label: "Spectral Layers", icon: Layers },
    { id: "telemetry", label: "Orbital Telemetry", icon: Activity },
    { id: "history", label: "Query Logs", icon: History },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-14 border-r border-slate-800/80 bg-[#070b14]/95 py-4 z-30">
      {/* Top action icons */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400">
          <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: "16s" }} />
        </div>

        <div className="my-2 h-[1px] w-6 bg-slate-800/80"></div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav?.(item.id)}
                title={item.label}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-cyan-400"></span>
                )}
                <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom tools */}
      <div className="flex flex-col items-center gap-2">
        <button
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900 hover:text-slate-300 transition"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          title="Documentation & SRS"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900 hover:text-slate-300 transition"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
