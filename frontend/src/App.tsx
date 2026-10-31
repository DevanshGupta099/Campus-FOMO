import { useEffect, useState, useCallback } from "react";
import { CampusFomoClient } from "./api/client.js";
import type {
  HealthResponse,
  NavigationScreen,
  EventItem,
} from "./api/types.js";
import { DEMO_PERSONAS, type PersonaConfig } from "./auth/persona.js";
import { Navbar } from "./components/Navbar.js";
import { GamificationModal } from "./components/GamificationModal.js";
import {
  BroadcastToast,
  type ToastMessage,
} from "./components/BroadcastToast.js";
import { DiscoverScreen } from "./screens/DiscoverScreen.js";
import { MyTicketsScreen } from "./screens/MyTicketsScreen.js";
import { EventHeadScreen } from "./screens/EventHeadScreen.js";
import { ScannerScreen } from "./screens/ScannerScreen.js";
import { ApprovalsScreen } from "./screens/ApprovalsScreen.js";
import { LuckyDrawScreen } from "./screens/LuckyDrawScreen.js";
import { SponsorScreen } from "./screens/SponsorScreen.js";
import { GalleryScreen } from "./screens/GalleryScreen.js";
import { AdminRbacScreen } from "./screens/AdminRbacScreen.js";

let currentToken: string = DEMO_PERSONAS[0].token;

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3001/api/v1";

const client = new CampusFomoClient({
  baseUrl: API_BASE_URL,
  mode: ((import.meta as any).env?.VITE_API_MODE as "live" | "mock") || "live",
  getAccessToken: () => currentToken,
  setAccessToken: (token) => {
    currentToken = token || "";
  },
});

export function App() {
  const [activePersona, setActivePersona] = useState<PersonaConfig>(
    DEMO_PERSONAS[0],
  );
  const [screens, setScreens] = useState<NavigationScreen[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentXp, setStudentXp] = useState(450);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync token when persona changes
  const handleSelectPersona = (persona: PersonaConfig) => {
    setActivePersona(persona);
    currentToken = persona.token;
    client.setAccessToken(persona.token);
    if (persona.role === "STUDENT") {
      setStudentXp(450);
    }
    refreshNavigation();
  };

  const refreshNavigation = useCallback(() => {
    client
      .getNavigation()
      .then((navScreens) => {
        setScreens(navScreens);
      })
      .catch(() => {
        // Fallback default screens based on role if backend not reachable
        setScreens([
          {
            key: "feed",
            path: "/",
            title: "Discover Events",
            section: "events",
            icon: "compass",
          },
          {
            key: "my-tickets",
            path: "/my-tickets",
            title: "My Passes",
            section: "events",
            icon: "ticket",
          },
          {
            key: "gallery",
            path: "/gallery",
            title: "Gallery",
            section: "events",
            icon: "image",
          },
          {
            key: "lucky-draw",
            path: "/lucky-draw",
            title: "Lucky Draws",
            section: "events",
            icon: "gift",
          },
          {
            key: "sponsor-portal",
            path: "/sponsor",
            title: "Sponsor Hub",
            section: "sponsors",
            icon: "coffee",
          },
        ]);
      });
  }, []);

  const refreshEvents = useCallback(() => {
    client
      .listEvents()
      .then((items) => {
        setEvents(items);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    client
      .getHealth()
      .then(setHealth)
      .catch(() => null);
    refreshNavigation();
    refreshEvents();
  }, [refreshNavigation, refreshEvents]);

  // Real-Time Event Bus: SSE stream with auto-reconnect
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      if (
        typeof window !== "undefined" &&
        window.EventSource &&
        !navigator.userAgent?.includes("jsdom")
      ) {
        const streamUrl = `${API_BASE_URL}/stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.addEventListener("seat.updated", () => {
          refreshEvents();
        });

        eventSource.addEventListener("announcement.broadcast", (e: any) => {
          try {
            const data = JSON.parse(e.data);
            setToast({
              id: `toast-${Date.now()}`,
              title: data.eventTitle || "Campus Announcement",
              message: data.message,
              type: "alert",
            });
            refreshEvents();
          } catch {
            // Ignored
          }
        });

        eventSource.addEventListener("luckydraw.completed", (e: any) => {
          try {
            const data = JSON.parse(e.data);
            setToast({
              id: `draw-${Date.now()}`,
              title: "🎉 Lucky Draw Winner Selected!",
              message: `Congratulations to ${data.winnerName} (${data.winnerDept})!`,
              type: "success",
            });
          } catch {
            // Ignored
          }
        });

        eventSource.onerror = () => {
          eventSource?.close();
        };
      }
    } catch {
      // Offline fallback
    }

    return () => {
      eventSource?.close();
    };
  }, [refreshEvents]);

  // Route selector
  const renderScreen = () => {
    switch (currentPath) {
      case "/":
        return (
          <DiscoverScreen
            events={events}
            client={client}
            activePersona={activePersona}
            onRefresh={refreshEvents}
            onNavigate={setCurrentPath}
          />
        );
      case "/my-tickets":
        return <MyTicketsScreen client={client} events={events} />;
      case "/manage-events":
        return (
          <EventHeadScreen
            client={client}
            events={events}
            onRefresh={refreshEvents}
          />
        );
      case "/scanner":
        return <ScannerScreen client={client} />;
      case "/approvals/department":
        return (
          <ApprovalsScreen
            client={client}
            events={events}
            onRefresh={refreshEvents}
            mode="department"
          />
        );
      case "/approvals/executive":
        return (
          <ApprovalsScreen
            client={client}
            events={events}
            onRefresh={refreshEvents}
            mode="executive"
          />
        );
      case "/lucky-draw":
        return <LuckyDrawScreen client={client} />;
      case "/sponsor":
        return <SponsorScreen client={client} onNavigate={setCurrentPath} />;
      case "/gallery":
        return <GalleryScreen client={client} />;
      case "/admin/rbac":
        return <AdminRbacScreen />;
      default:
        return (
          <DiscoverScreen
            events={events}
            client={client}
            activePersona={activePersona}
            onRefresh={refreshEvents}
            onNavigate={setCurrentPath}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-paper-50 flex flex-col font-sans">
      <BroadcastToast toast={toast} onDismiss={() => setToast(null)} />

      <Navbar
        screens={screens}
        currentPath={currentPath}
        onNavigate={setCurrentPath}
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
        studentXp={studentXp}
        onOpenGamification={() => setIsGamificationOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-24 md:pb-8">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-royal-300 text-sm animate-pulse">
              Loading Campus FOMO...
            </p>
          </div>
        ) : (
          renderScreen()
        )}
      </main>

      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
        xp={studentXp}
        userName={activePersona.name}
      />

      {/* Footer & Zero-Trust PBAC System Info Bar */}
      <footer className="bg-ink-950 border-t border-royal-500/20 py-4 px-6 text-xs text-paper-50/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mint-400"></span>
              API Health:{" "}
              <span className="font-mono text-mint-400">
                {health?.status || "online"}
              </span>
            </span>
            <span>•</span>
            <span>
              Persona:{" "}
              <strong className="text-paper-50">{activePersona.name}</strong> (
              {activePersona.role})
            </span>
          </div>

          <div className="text-[11px] text-paper-50/40 font-mono">
            CHRIST University • Zero-Trust PBAC • APISIX + Keycloak 26
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
