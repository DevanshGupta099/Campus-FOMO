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

  // Merge extra discovery screens if not present
  const allScreens: NavigationScreen[] = [...screens];

  if (!allScreens.some((s) => s.path === "/map")) {
    allScreens.push({
      key: "campus-map",
      path: "/map",
      title: "Campus Map",
      section: "events",
      icon: "map",
    });
  }

  if (!allScreens.some((s) => s.path === "/feed")) {
    allScreens.push({
      key: "social-feed",
      path: "/feed",
      title: "Social Buzz",
      section: "events",
      icon: "message-circle",
      badge: "LIVE",
    });
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate("/")}
            className="cursor-pointer flex items-center gap-3 group select-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-400 p-[1.5px] shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center font-mono font-bold text-xs text-violet-300">
                CF
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-violet-300 transition-colors">
                  CAMPUS <span className="text-gradient-violet">FOMO</span>
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] text-white/40 block font-mono tracking-wider -mt-0.5">
                CHRIST UNIVERSITY • FEST '26
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 bg-surface-2/70 p-1 rounded-xl border border-white/5"
          >
            {allScreens.map((screen) => {
              const isActive = currentPath === screen.path;
              return (
                <button
                  key={screen.key}
                  onClick={() => onNavigate(screen.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold"
                      : "text-white/70 hover:text-white hover:bg-surface-3"
                  }`}
                >
                  <span className="text-xs">{getScreenIcon(screen.icon)}</span>
                  <span>{screen.title}</span>
                  {screen.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      {screen.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions: XP, Sound, Profile, Persona Pill */}
          <div className="flex items-center gap-2">
            {/* Gamification XP Badge (Student only) */}
            {activePersona.role === "STUDENT" && (
              <button
                onClick={() => onOpenGamification?.()}
                title="Your Fest XP & Badges"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
              >
                <span>⭐</span>
                <span>{studentXp} XP</span>
              </button>
            )}

            {/* Profile Navigation Shortcut */}
            <button
              onClick={() => onNavigate("/profile")}
              title="My Account & Identity Profile"
              className={`p-1.5 rounded-xl border text-xs transition-colors ${
                currentPath === "/profile"
                  ? "bg-violet-600/30 border-violet-500 text-white"
                  : "bg-surface-2 hover:bg-surface-3 border-white/10 text-white/70 hover:text-white"
              }`}
            >
              👤
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              aria-label={
                soundEnabled ? "Mute Festival Audio" : "Enable Festival Audio"
              }
              title={soundEnabled ? "Audio: ON" : "Audio: MUTED"}
              className="p-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-white/70 hover:text-amber-300 text-xs transition-colors"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Persona Switcher Pill */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Switch Persona"
              className="flex items-center gap-2 bg-surface-2 hover:bg-surface-3 border border-white/10 hover:border-violet-500/50 rounded-xl px-2.5 py-1.5 text-xs transition-all shadow-md group"
            >
              <span className="text-base">{activePersona.avatar}</span>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-white leading-tight group-hover:text-violet-300 transition-colors text-xs">
                  {activePersona.name.split(" ")[0]}
                </div>
                <div className="text-[10px] text-violet-400 font-mono leading-none">
                  {activePersona.role}
                </div>
              </div>
              <span className="text-[10px] text-white/40">▼</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Dock for Mobile (360px - 1024px) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 bg-surface/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around">
        {allScreens.slice(0, 6).map((screen) => {
          const isActive = currentPath === screen.path;
          return (
            <button
              key={screen.key}
              onClick={() => onNavigate(screen.path)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-violet-300 bg-violet-600/20 font-bold"
                  : "text-white/60 hover:text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-void/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm h-full bg-surface border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔐</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Switch Persona (PBAC)
                    </h3>
                    <p className="text-[10px] text-violet-400 font-mono">
                      Dynamic navigation reacts to permissions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-white/60 hover:text-white text-base p-1"
                >
                  ✕
                </button>
              </div>

              {/* Active User Card */}
              <div className="bg-surface-2 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activePersona.avatar}</span>
                  <div>
                    <div className="font-bold text-white text-xs">
                      {activePersona.name}
                    </div>
                    <div className="text-[10px] text-violet-400 font-mono">
                      {activePersona.email}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-white/60 space-y-0.5">
                  <div>Institution: {activePersona.institution}</div>
                  <div>Department: {activePersona.department}</div>
                </div>
              </div>

              {/* Persona Options List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">
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
                          ? "bg-violet-600/20 border-violet-500 text-white"
                          : "bg-surface-2/60 border-white/5 hover:border-white/20 text-white/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <span>{p.avatar}</span>
                          <span>{p.name}</span>
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-600/30">
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-[10px] text-white/40 font-mono">
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
    case "map":
      return "🗺️";
    case "message-circle":
      return "⚡";
    default:
      return "📌";
  }
}
