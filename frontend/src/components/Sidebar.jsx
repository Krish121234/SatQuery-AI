import React from "react";
import {
  Scan,
  Layers,
  Settings,
  Globe,
  Database,
  Sparkles,
} from "lucide-react";

export default function Sidebar({ activeNav = "scanner", setActiveNav, onNavigateLanding }) {
  const navItems = [
    { id: "scanner", label: "Observation Scanner", icon: Scan },
    { id: "map", label: "Global Satellite Map", icon: Globe },
    { id: "temporal", label: "Temporal Change & Floods", icon: Layers },
    { id: "catalog", label: "Satellite Datasets & Indices", icon: Database },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-14 border-r border-[#e2e0d6] bg-white py-4 z-30">
      {/* Top icon and primary navigation */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onNavigateLanding || (() => setActiveNav?.("scanner"))}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A3B087]/15 border border-[#A3B087]/25 text-[#A3B087] hover:scale-105 transition"
          title="Return to Product Tour & Overview"
        >
          <span className="text-base">🛰</span>
        </button>

        <div className="my-1 h-[1px] w-6 bg-[#e2e0d6]" />

        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav?.(item.id)}
                title={item.label}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-[#A3B087]/15 text-[#A3B087] border border-[#A3B087]/30 shadow-sm"
                    : "text-[#435663]/60 hover:bg-[#f5f3ea] hover:text-[#313647] border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#A3B087]" />
                )}
                <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom config and settings */}
      <div className="flex flex-col items-center gap-2">
        {onNavigateLanding && (
          <button
            onClick={onNavigateLanding}
            title="Product Tour & Architecture"
            className="group flex h-9 w-9 items-center justify-center rounded-xl text-[#435663]/50 hover:bg-[#f5f3ea] hover:text-[#313647] transition"
          >
            <Sparkles className="h-4 w-4 text-[#A3B087] transition-transform group-hover:scale-110" />
          </button>
        )}

        <button
          onClick={() => setActiveNav?.("settings")}
          title="System & Model Config"
          className={`group flex h-9 w-9 items-center justify-center rounded-xl transition ${
            activeNav === "settings"
              ? "bg-[#A3B087]/15 text-[#A3B087] border border-[#A3B087]/30"
              : "text-[#435663]/50 hover:bg-[#f5f3ea] hover:text-[#313647]"
          }`}
        >
          <Settings className="h-4 w-4 transition-transform group-hover:rotate-45" />
        </button>
      </div>
    </aside>
  );
}
