import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Globe,
  Scan,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Compass,
} from "lucide-react";

export default function Header({
  activeNav,
  setActiveNav,
  user,
  onOpenAuth,
  onLogout,
  onNavigateLanding,
  telemetry,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="border-b border-[#e2e0d6] bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Logo */}
        <button
          onClick={onNavigateLanding}
          className="flex items-center gap-2.5 text-left group"
          title="Return to Landing Page"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087] group-hover:scale-105 transition">
            <span className="text-base font-black tracking-wider">🛰</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-widest text-[#313647] uppercase group-hover:text-[#A3B087] transition">
              SATQUERY
            </h1>
            <span className="rounded-full border border-[#A3B087]/40 bg-[#A3B087]/10 px-2 py-0.5 text-[10px] font-semibold text-[#A3B087] tracking-wider">
              AI
            </span>
          </div>
        </button>

        {/* Center: Core Nav Pill Switcher */}
        <div className="flex rounded-full bg-[#f5f3ea] border border-[#e2e0d6] p-1 text-xs font-medium">
          <button
            onClick={() => setActiveNav("scanner")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
              activeNav === "scanner"
                ? "bg-[#A3B087] text-white font-semibold shadow-sm"
                : "text-[#435663] hover:text-[#313647] hover:bg-white/60"
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Scanner</span>
          </button>

          <button
            onClick={() => setActiveNav("map")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
              activeNav === "map"
                ? "bg-[#A3B087] text-white font-semibold shadow-sm"
                : "text-[#435663] hover:text-[#313647] hover:bg-white/60"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Satellite Map</span>
          </button>

          <button
            onClick={() => setActiveNav("temporal")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
              activeNav === "temporal"
                ? "bg-[#A3B087] text-white font-semibold shadow-sm"
                : "text-[#435663] hover:text-[#313647] hover:bg-white/60"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Temporal Changes</span>
          </button>

          <button
            onClick={onNavigateLanding}
            className="hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[#435663] hover:text-[#313647] hover:bg-white/60 transition-all"
            title="View Product Tour & Architecture"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#A3B087]" />
            <span>Tour</span>
          </button>
        </div>

        {/* Right: Telemetry & User Profile */}
        <div className="flex items-center gap-3">
          {/* Telemetry pill (hidden on small screens) */}
          {telemetry && (
            <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] bg-[#f5f3ea] border border-[#e2e0d6] px-2.5 py-1 rounded-full text-[#435663]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{telemetry.coords}</span>
            </div>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 rounded-xl bg-[#f5f3ea] border border-[#e2e0d6] hover:border-[#A3B087]/50 px-3 py-1.5 transition shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#A3B087] text-white text-[11px] font-bold">
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#313647] leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#435663]/70 leading-tight">
                    {user.role || "Analyst"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-[#435663]/60" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-[#e2e0d6] shadow-lg p-1.5 z-50 flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-[#e2e0d6] text-xs">
                    <p className="font-bold text-[#313647]">{user.name}</p>
                    <p className="text-[10px] text-[#435663]/70 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveNav("settings");
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#435663] hover:text-[#313647] hover:bg-[#f5f3ea] text-left transition"
                  >
                    <Shield className="h-3.5 w-3.5 text-[#A3B087]" />
                    <span>Analyst Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout?.();
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 text-left transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white font-bold px-3.5 py-1.5 text-xs shadow-sm transition-all"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
