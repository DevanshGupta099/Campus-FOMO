import type { NavigationScreen } from "../api/types.js";
import { DEMO_PERSONAS, type PersonaConfig } from "../auth/persona.js";

interface NavbarProps {
  screens: NavigationScreen[];
  currentPath: string;
  onNavigate: (path: string) => void;
  activePersona: PersonaConfig;
  onSelectPersona: (persona: PersonaConfig) => void;
}

export function Navbar({
  screens,
  currentPath,
  onNavigate,
  activePersona,
  onSelectPersona,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-ink-950/90 backdrop-blur-md border-b border-royal-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Persona Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div
            onClick={() => onNavigate("/")}
            className="cursor-pointer flex items-center gap-2 group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-royal-500/30 border border-royal-500 flex items-center justify-center text-gold-400 font-bold group-hover:scale-105 transition-transform">
              CF
            </div>
            <div className="text-left">
              <span className="font-display font-extrabold text-xl tracking-tight text-paper-50 group-hover:text-royal-300 transition-colors">
                CAMPUS <span className="text-gold-400">FOMO</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-paper-50/50 block font-mono">
                CHRIST UNIVERSITY
              </span>
            </div>
          </div>

          {/* Persona Switcher Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-paper-50/60 hidden sm:inline">
              Role:
            </span>
            <select
              value={activePersona.id}
              onChange={(e) => {
                const found = DEMO_PERSONAS.find(
                  (p) => p.id === e.target.value,
                );
                if (found) onSelectPersona(found);
              }}
              className="bg-ink-800 border border-royal-500/40 text-paper-50 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-royal-500/60 font-sans"
              aria-label="Switch Persona"
            >
              {DEMO_PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Navigation Bar (Directly from /me/navigation) */}
        <nav
          aria-label="Main Navigation"
          className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-none"
        >
          {screens.map((screen) => {
            const isActive = currentPath === screen.path;
            return (
              <button
                key={screen.key}
                onClick={() => onNavigate(screen.path)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-royal-500 text-paper-50 shadow-md shadow-royal-500/20 font-semibold border border-royal-400/50"
                    : "text-paper-50/70 hover:text-paper-50 hover:bg-ink-800 border border-transparent"
                }`}
              >
                <span>{getScreenIcon(screen.icon)}</span>
                <span>{screen.title}</span>
                {screen.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gold-400/20 text-gold-400 border border-gold-400/30">
                    {screen.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
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
