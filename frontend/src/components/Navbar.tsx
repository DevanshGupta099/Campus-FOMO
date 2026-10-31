import { useState } from "react";
import type { NavigationScreen } from "../api/types.js";
import { DEMO_PERSONAS, type PersonaConfig } from "../auth/persona.js";
import { sound } from "../utils/audio.js";

interface NavbarProps {
  screens: NavigationScreen[];
  currentPath: string;
  onNavigate: (path: string) => void;
  activePersona: PersonaConfig;
  onSelectPersona: (persona: PersonaConfig) => void;
  studentXp?: number;
  onOpenGamification?: () => void;
}

export function Navbar({
  screens,
  currentPath,
  onNavigate,
  activePersona,
  onSelectPersona,
  studentXp = 450,
  onOpenGamification,
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sound.playSuccess();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-ink-950/80 backdrop-blur-xl border-b border-royal-500/20 px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Fest Title */}
          <div
            onClick={() => onNavigate("/")}
            className="cursor-pointer flex items-center gap-3 group select-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-royal-700 via-royal-500 to-gold-400 p-[1.5px] shadow-lg shadow-royal-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-ink-950 rounded-[10px] flex items-center justify-center font-display font-black text-xs text-gold-400">
                CF
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight text-paper-50 group-hover:text-royal-300 transition-colors">
                  CAMPUS <span className="text-gold-400">FOMO</span>
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] text-paper-50/50 block font-mono tracking-wider -mt-0.5">
                CHRIST UNIVERSITY • FEST '26
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Server-driven via /me/navigation) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1.5 bg-ink-900/60 p-1 rounded-xl border border-royal-500/20"
          >
            {screens.map((screen) => {
              const isActive = currentPath === screen.path;
              return (
                <button
                  key={screen.key}
                  onClick={() => onNavigate(screen.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-royal-500 text-paper-50 shadow-md shadow-royal-500/30 border border-royal-400"
                      : "text-paper-50/70 hover:text-paper-50 hover:bg-ink-800/60 border border-transparent"
                  }`}
                >
                  <span className="text-xs">{getScreenIcon(screen.icon)}</span>
                  <span>{screen.title}</span>
                  {screen.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gold-400/20 text-gold-400 border border-gold-400/30 font-mono">
                      {screen.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Persona Switcher Trigger */}
          <div className="flex items-center gap-2.5">
            {/* Gamification XP Badge (Student only) */}
            {activePersona.role === "STUDENT" && (
              <button
                onClick={() => onOpenGamification?.()}
                title="Your Campus Participation XP (Click to view badges)"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-400/15 hover:bg-gold-400/25 border border-gold-400/30 text-gold-400 text-xs font-mono font-bold shadow-sm transition-all cursor-pointer"
              >
                <span>⭐</span>
                <span>{studentXp} XP</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              aria-label={
                soundEnabled ? "Mute Festival Audio" : "Enable Festival Audio"
              }
              title={soundEnabled ? "Audio: ON" : "Audio: MUTED"}
              className="p-1.5 rounded-xl bg-ink-800/80 hover:bg-ink-800 border border-royal-500/30 text-paper-50/70 hover:text-gold-400 text-xs transition-colors"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Persona Switcher Trigger Pill */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Switch Persona"
              className="flex items-center gap-2 bg-ink-800/80 hover:bg-ink-800 border border-royal-500/30 hover:border-gold-400/50 rounded-xl px-2.5 py-1.5 text-xs transition-all shadow-md group"
            >
              <span className="text-base">{activePersona.avatar}</span>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-paper-50 leading-tight group-hover:text-gold-400 transition-colors text-xs">
                  {activePersona.name.split(" ")[0]}
                </div>
                <div className="text-[10px] text-royal-300 font-mono leading-none">
                  {activePersona.role}
                </div>
              </div>
              <span className="text-[10px] text-paper-50/40">▼</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Dock for Mobile Viewports (360px - 768px) */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-ink-950/90 backdrop-blur-xl border border-royal-500/30 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around">
        {screens.slice(0, 5).map((screen) => {
          const isActive = currentPath === screen.path;
          return (
            <button
              key={screen.key}
              onClick={() => onNavigate(screen.path)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-gold-400 bg-royal-500/20 font-bold"
                  : "text-paper-50/60 hover:text-paper-50"
              }`}
            >
              <span className="text-base">{getScreenIcon(screen.icon)}</span>
              <span className="text-[9px] font-mono mt-0.5 truncate max-w-[56px]">
                {screen.title.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Persona Selection Drawer Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-ink-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm h-full bg-ink-900 border-l border-royal-500/30 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-royal-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔐</span>
                  <div>
                    <h3 className="font-bold text-paper-50 text-sm">
                      Switch Persona (PBAC)
                    </h3>
                    <p className="text-[10px] text-royal-300 font-mono">
                      Dynamic navigation reacts to permissions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-paper-50/60 hover:text-paper-50 text-base p-1"
                >
                  ✕
                </button>
              </div>

              {/* Active User Card */}
              <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/30 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activePersona.avatar}</span>
                  <div>
                    <div className="font-bold text-paper-50 text-xs">
                      {activePersona.name}
                    </div>
                    <div className="text-[10px] text-royal-300 font-mono">
                      {activePersona.email}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-royal-500/10 text-[10px] text-paper-50/60 space-y-0.5">
                  <div>Institution: {activePersona.institution}</div>
                  <div>Department: {activePersona.department}</div>
                </div>
              </div>

              {/* Persona Options List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-paper-50/50 block">
                  Select Persona to Test PBAC Bounds:
                </span>

                {DEMO_PERSONAS.map((p) => {
                  const isSelected = p.id === activePersona.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPersona(p);
                        setDrawerOpen(false);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-royal-500/20 border-gold-400 text-paper-50"
                          : "bg-ink-950/60 border-royal-500/10 hover:border-royal-500/40 text-paper-50/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <span>{p.avatar}</span>
                          <span>{p.name}</span>
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-royal-500/20 text-royal-300 border border-royal-500/30">
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-paper-50/60 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-royal-500/20 text-center">
              <span className="text-[10px] text-paper-50/40 font-mono">
                Keycloak 26 Composite PBAC • Token-driven
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getScreenIcon(iconName: string): string {
  switch (iconName) {
    case "compass":
      return "🧭";
    case "ticket":
      return "🎟️";
    case "image":
      return "🖼️";
    case "gift":
      return "🎁";
    case "calendar-cog":
      return "⚙️";
    case "qr-code":
      return "📷";
    case "check-circle-2":
      return "✅";
    case "shield-check":
      return "🛡️";
    case "coffee":
      return "☕";
    case "shield-alert":
      return "🔐";
    default:
      return "📌";
  }
}
