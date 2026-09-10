import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const userData = {
      name: isSignUp ? name || email.split("@")[0] : email.split("@")[0],
      email,
      role: "Satellite Imagery Analyst",
      authenticated: true,
      token: "demo_bearer_token_" + Date.now(),
    };

    localStorage.setItem("satquery_user", JSON.stringify(userData));
    onAuthSuccess?.(userData);
    onClose();
  }

  function handleGuestLogin() {
    const guestData = {
      name: "Guest Analyst",
      email: "guest@satquery.ai",
      role: "Guest Observer",
      authenticated: true,
      token: "guest_token_" + Date.now(),
    };
    localStorage.setItem("satquery_user", JSON.stringify(guestData));
    onAuthSuccess?.(guestData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="earth-panel max-w-md w-full p-6 text-[#313647] flex flex-col gap-5 relative bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-[#435663]/60 hover:text-[#313647] hover:bg-[#f5f3ea] transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A3B087]/15 border border-[#A3B087]/30 text-[#A3B087]">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-mono font-bold text-[#A3B087] uppercase tracking-wider">
              MISSION CONTROL ACCESS
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#313647] tracking-tight mt-1">
            {isSignUp ? "Create Analyst Account" : "Sign in to SatQuery AI"}
          </h3>
          <p className="text-xs text-[#435663]/70">
            {isSignUp
              ? "Access full spatial grounding history, satellite catalogs, and team telemetry."
              : "Enter your credentials or continue as guest to start satellite querying."}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#313647]">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-3.5 w-3.5 text-[#435663]/50" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Alex Rivera"
                  className="w-full rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] pl-9 pr-3 py-2 text-xs text-[#313647] placeholder-[#435663]/40 focus:outline-none focus:border-[#A3B087]"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#313647]">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-3.5 w-3.5 text-[#435663]/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@earthobservation.org"
                className="w-full rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] pl-9 pr-3 py-2 text-xs text-[#313647] placeholder-[#435663]/40 focus:outline-none focus:border-[#A3B087]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#313647]">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-3.5 w-3.5 text-[#435663]/50" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-[#FFFCF0] border border-[#e2e0d6] pl-9 pr-3 py-2 text-xs text-[#313647] placeholder-[#435663]/40 focus:outline-none focus:border-[#A3B087]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#A3B087] hover:bg-[#95a279] text-white font-bold py-2.5 text-xs shadow-sm transition-all"
          >
            <span>{isSignUp ? "Register Analyst" : "Authenticate"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e0d6]" />
          </div>
          <span className="relative bg-white px-2 text-[10px] font-mono uppercase text-[#435663]/50">
            or instant access
          </span>
        </div>

        {/* Guest access button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f5f3ea] hover:bg-[#eae7dc] border border-[#e2e0d6] text-[#313647] font-semibold py-2 text-xs transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#A3B087]" />
          <span>Continue as Guest Analyst</span>
        </button>

        {/* Toggle sign in / sign up */}
        <div className="text-center text-xs text-[#435663]/80 pt-1">
          {isSignUp ? "Already registered? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-bold text-[#A3B087] hover:underline"
          >
            {isSignUp ? "Sign In" : "Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
}
