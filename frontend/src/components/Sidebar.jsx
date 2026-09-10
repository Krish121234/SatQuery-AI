import React from "react";
import {
  Scan,
  History,
  Activity,
  Layers,
  Settings,
  HelpCircle,
  Globe,
} from "lucide-react";

export default function Sidebar({ activeNav = "scanner", setActiveNav }) {
  const navItems = [
    { id: "scanner", label: "Observation Scanner", icon: Scan },
    { id: "layers", label: "Spectral Layers", icon: Layers },
    { id: "telemetry", label: "Telemetry", icon: Activity },
    { id: "history", label: "Query History", icon: History },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-14 border-r border-[#e2e0d6] bg-white py-4 z-30">
      {/* Top icon */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A3B087]/10 border border-[#A3B087]/25 text-[#A3B087]">
          <Globe className="h-5 w-5" />
        </div>

        <div className="my-2 h-[1px] w-6 bg-[#e2e0d6]"></div>

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
                    ? "bg-[#A3B087]/15 text-[#A3B087] border border-[#A3B087]/30"
                    : "text-[#435663]/60 hover:bg-[#f5f3ea] hover:text-[#313647] border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-[#A3B087]"></span>
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
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#435663]/50 hover:bg-[#f5f3ea] hover:text-[#313647] transition"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          title="Help"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#435663]/50 hover:bg-[#f5f3ea] hover:text-[#313647] transition"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
