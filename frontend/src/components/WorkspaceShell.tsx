import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Award,
  CalendarCog,
  CheckCircle2,
  Coffee,
  Compass,
  FileLock2,
  Gift,
  Image,
  LogOut,
  Map,
  Menu,
  QrCode,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  UserCircle2,
  X,
} from "lucide-react";
import { apiClient, getApiBaseUrl } from "../api/client";
import type { GamificationLedger, ScreenItem } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { DESIGN_TOKENS } from "../tokens";
import { formatIstDateTime } from "../utils/format";
import { ChristCrestMark } from "./BrandMarks";
import { dispatchOpenCommandPalette } from "./CommandPalette";
import { ToastNotice, ToastStack } from "./ToastStack";
import { ProfileModal } from "../pages/workspace/ProfileModal";

interface WorkspaceContextValue {
  notify: (kind: ToastNotice["kind"], title: string, detail?: string) => void;
  streamRevision: number;
  streamStatus: "sse" | "polling" | "connecting";
  refreshXpLedger: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined,
);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside <WorkspaceShell>");
  }
  return ctx;
}

const SECTION_LABELS: Record<ScreenItem["section"], string> = {
  events: "Campus Concourse",
  management: "Event Operations",
  approvals: "Governance Queue",
  sponsors: "Partner Hub",
  admin: "Platform Security",
};

function renderNavIcon(iconName: string) {
  const cls = "h-4 w-4 shrink-0";
  switch (iconName) {
    case "compass":
      return <Compass className={cls} />;
    case "map":
      return <Map className={cls} />;
    case "ticket":
      return <Ticket className={cls} />;
    case "image":
      return <Image className={cls} />;
    case "gift":
      return <Gift className={cls} />;
    case "calendar-cog":
      return <CalendarCog className={cls} />;
    case "qr-code":
      return <QrCode className={cls} />;
    case "check-circle-2":
      return <CheckCircle2 className={cls} />;
    case "shield-check":
      return <ShieldCheck className={cls} />;
    case "coffee":
      return <Coffee className={cls} />;
    case "shield-alert":
      return <ShieldAlert className={cls} />;
    case "file-lock-2":
      return <FileLock2 className={cls} />;
    default:
      return <Compass className={cls} />;
  }
}

export function toWorkspaceHref(screen: ScreenItem): string {
  if (screen.path === "/") return "/app/discover";
  return `/app${screen.path}`;
}

export const WorkspaceShell: React.FC = () => {
  const { user, screens, hasPerm, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [xpDrawerOpen, setXpDrawerOpen] = useState(false);
  const [xpLedger, setXpLedger] = useState<GamificationLedger | null>(null);

  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [streamRevision, setStreamRevision] = useState(0);
  const [streamStatus, setStreamStatus] = useState<
    "sse" | "polling" | "connecting"
  >("connecting");

  const canReadXp = hasPerm("gamification:read:own");

  const notify = useCallback(
    (kind: ToastNotice["kind"], title: string, detail?: string) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, kind, title, detail }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 6000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const refreshXpLedger = useCallback(async () => {
    if (!canReadXp) return;
    try {
      const ledger = await apiClient.getGamification();
      setXpLedger(ledger);
    } catch {
      // Non-fatal
    }
  }, [canReadXp]);

  useEffect(() => {
    refreshXpLedger();
  }, [refreshXpLedger, streamRevision]);

  // Live SSE Stream with automatic HTTP short-polling fallback (A9)
  useEffect(() => {
    let active = true;
    let pollTimer: number | null = null;
    let latestSeq = 0;
    let es: EventSource | null = null;

    const handleRealtimeEvent = (
      eventName: string,
      payload: Record<string, unknown>,
    ) => {
      if (!active) return;
      setStreamRevision((n) => n + 1);
      if (eventName === "announcement.broadcast") {
        notify(
          "broadcast",
          String(payload.eventTitle || "Campus Broadcast"),
          String(payload.message || "Schedule advisory updated."),
        );
      } else if (eventName === "waitlist.promoted") {
        notify(
          "success",
          "Atomic Waitlist Promoted",
          "A cancelled pass automatically promoted position #1.",
        );
      } else if (eventName === "luckydraw.completed") {
        notify(
          "success",
          "Commit-Reveal Draw Completed",
          `Winner selected: ${String(payload.winnerName || "Verified Entrant")}`,
        );
      }
    };

    const startShortPolling = () => {
      if (!active || pollTimer !== null) return;
      setStreamStatus("polling");
      const tick = async () => {
        try {
          const res = await apiClient.pollStream(latestSeq);
          for (const item of res.events) {
            if (item.id > latestSeq) latestSeq = item.id;
            handleRealtimeEvent(item.event, item.data);
          }
        } catch {
          // Keep polling quietly
        }
        if (active) {
          pollTimer = window.setTimeout(tick, 15000);
        }
      };
      pollTimer = window.setTimeout(tick, 4000);
    };

    if (typeof EventSource !== "undefined" && import.meta.env.MODE !== "test") {
      try {
        es = new EventSource(`${getApiBaseUrl()}/stream`);
        es.addEventListener("connected", () => {
          if (active) setStreamStatus("sse");
        });
        const tracked = [
          "seat.updated",
          "waitlist.promoted",
          "checkin.verified",
          "announcement.broadcast",
          "luckydraw.completed",
        ];
        for (const evtName of tracked) {
          es.addEventListener(evtName, (evt: MessageEvent) => {
            try {
              const parsed = JSON.parse(evt.data) as Record<string, unknown>;
              handleRealtimeEvent(evtName, parsed);
            } catch {
              setStreamRevision((n) => n + 1);
            }
          });
        }
        es.onerror = () => {
          es?.close();
          startShortPolling();
        };
      } catch {
        startShortPolling();
      }
    } else {
      setStreamStatus("polling");
    }

    return () => {
      active = false;
      es?.close();
      if (pollTimer !== null) window.clearTimeout(pollTimer);
    };
  }, [notify]);

  const groupedScreens = useMemo(() => {
    const order: ScreenItem["section"][] = [
      "events",
      "management",
      "approvals",
      "sponsors",
      "admin",
    ];
    return order
      .map((sec) => ({
        section: sec,
        label: SECTION_LABELS[sec],
        items: screens.filter((s) => s.section === sec),
      }))
      .filter((g) => g.items.length > 0);
  }, [screens]);

  const mobileQuickScreens = useMemo(() => screens.slice(0, 4), [screens]);

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const contextVal = useMemo<WorkspaceContextValue>(
    () => ({
      notify,
      streamRevision,
      streamStatus,
      refreshXpLedger,
    }),
    [notify, streamRevision, streamStatus, refreshXpLedger],
  );

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-obsidian text-bone">
      <div>
        <div className="flex items-center justify-between border-b border-obsidian-rule px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <ChristCrestMark className="h-9 w-9" tone="light" />
            <div>
              <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-bone">
                CONCOURSE
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold">
                CHRIST Central
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
            className="rounded p-1 text-paper-deep transition hover:text-bone lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Workspace navigation" className="space-y-5 p-4">
          {groupedScreens.map((group) => (
            <div key={group.section}>
              <p className="px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {group.label}
              </p>
              <ul className="mt-1.5 space-y-1">
                {group.items.map((screen) => (
                  <li key={screen.key}>
                    <NavLink
                      to={toWorkspaceHref(screen)}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                          isActive
                            ? "bg-vermilion text-void shadow-glow"
                            : "text-paper-deep hover:bg-obsidian-surface hover:text-bone"
                        }`
                      }
                    >
                      {renderNavIcon(screen.icon)}
                      <span>{screen.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Governance Identity Card */}
      <div className="border-t border-obsidian-rule p-4">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-obsidian-rule bg-obsidian-surface p-2.5 text-left transition hover:border-gold/60"
        >
          <UserCircle2 className="h-7 w-7 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-bone">
              {user?.name}
            </p>
            <p className="truncate font-mono text-[10px] text-ink-secondary">
              {user?.department || user?.institution || "Central Campus"}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md border border-obsidian-rule px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-paper-deep transition hover:border-vermilion hover:text-bone"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Revoke Session &amp; Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <WorkspaceContext.Provider value={contextVal}>
      <div className="flex min-h-screen bg-paper text-ink">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-obsidian-rule lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="w-72 max-w-[85vw]">{renderSidebarContent()}</div>
            <button
              type="button"
              aria-label="Close backdrop"
              onClick={() => setMobileNavOpen(false)}
              className="flex-1 bg-void/75 backdrop-blur-xs"
            />
          </div>
        )}

        {/* Main Workspace Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Architectural Telemetry Bar */}
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-paper-elevated/92 px-4 py-3 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="rounded-md border border-rule-strong p-2 text-bone lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  {DESIGN_TOKENS.campus.precinct}
                </p>
                <p className="text-xs font-semibold text-bone">
                  PBAC Active Scopes: {user?.permissions.length ?? 0} verified
                  grants
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tactical Command Palette Trigger */}
              <button
                type="button"
                onClick={dispatchOpenCommandPalette}
                aria-label="Open command palette"
                className="inline-flex items-center gap-2 rounded-md border border-rule-strong bg-paper px-2.5 py-1.5 font-mono text-xs text-ink-secondary transition hover:border-vermilion/60 hover:text-bone"
              >
                <Search className="h-3.5 w-3.5 text-vermilion" />
                <span className="hidden md:inline">Quick Jump</span>
                <kbd className="hidden rounded border border-rule px-1.5 py-0.5 text-[10px] text-ink-muted sm:inline">
                  Ctrl+K
                </kbd>
              </button>

              {/* SSE / Polling Telemetry Pill */}
              <span
                className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider sm:inline-flex ${
                  streamStatus === "sse"
                    ? "border-pine/35 bg-pine-soft text-pine"
                    : "border-rule-strong bg-paper text-ink-secondary"
                }`}
              >
                <Radio className="h-3 w-3" />
                <span>
                  {streamStatus === "sse" ? "SSE Live" : "Sync Active"}
                </span>
              </span>

              {/* Student XP Ledger Button (PBAC gated) */}
              {canReadXp && (
                <button
                  type="button"
                  onClick={() => {
                    refreshXpLedger();
                    setXpDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-paper px-3 py-1.5 font-mono text-xs font-semibold text-bone transition hover:border-gold"
                >
                  <Award className="h-3.5 w-3.5 text-gold" />
                  <span>{xpLedger?.totalXp ?? user?.xp ?? 0} XP</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="hidden items-center gap-1.5 rounded-md border border-rule-strong bg-paper px-3 py-1.5 font-mono text-xs font-medium text-bone transition hover:border-vermilion sm:inline-flex"
              >
                <UserCircle2 className="h-3.5 w-3.5 text-vermilion" />
                <span>Smart ID</span>
              </button>
            </div>
          </header>

          {/* Active Workspace View */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Quick-Dock (360px–1023px) */}
        <nav
          aria-label="Mobile quick navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-obsidian-rule bg-obsidian/95 px-2 py-1.5 backdrop-blur-md lg:hidden"
        >
          {mobileQuickScreens.map((screen) => (
            <NavLink
              key={`mob-${screen.key}`}
              to={toWorkspaceHref(screen)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-md py-1.5 font-mono text-[9px] uppercase tracking-wider transition ${
                  isActive
                    ? "text-vermilion"
                    : "text-ink-secondary hover:text-bone"
                }`
              }
            >
              {renderNavIcon(screen.icon)}
              <span className="max-w-[64px] truncate">
                {screen.title.split(" ")[0]}
              </span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-md py-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-secondary hover:text-bone"
          >
            <Menu className="h-4 w-4 shrink-0" />
            <span>More</span>
          </button>
        </nav>

        {/* Append-Only XP & Badges Slide-Over Drawer (ST-06) */}
        {xpDrawerOpen && canReadXp && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="xp-drawer-title"
            className="fixed inset-0 z-50 flex justify-end bg-void/75 backdrop-blur-xs"
          >
            <div className="flex h-full w-full max-w-md flex-col border-l border-rule-strong bg-paper-elevated shadow-anchor">
              <div className="flex items-center justify-between border-b border-obsidian-rule bg-obsidian px-6 py-5 text-bone">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                    APPEND-ONLY GAMIFICATION LEDGER
                  </p>
                  <h2
                    id="xp-drawer-title"
                    className="mt-1 font-display text-2xl font-bold text-bone"
                  >
                    Campus Participation XP
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setXpDrawerOpen(false)}
                  aria-label="Close XP ledger"
                  className="rounded border border-obsidian-rule p-1.5 text-paper-deep hover:text-bone"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <div className="rounded-xl border border-rule bg-paper p-5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    Verified Cumulative Balance
                  </span>
                  <p className="mt-1 font-display text-4xl font-bold text-bone">
                    {xpLedger?.totalXp ?? user?.xp ?? 0}{" "}
                    <span className="font-mono text-sm text-vermilion">XP</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-secondary">
                    +10 XP on confirmed registration · +50 XP on gate QR
                    verification
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-bone">
                    Earned Precinct Badges
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {(xpLedger?.badges?.length
                      ? xpLedger.badges
                      : ["Concourse Initiate"]
                    ).map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-paper px-3 py-1.5 font-mono text-xs font-semibold text-bone"
                      >
                        <Award className="h-3.5 w-3.5 text-gold" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-bone">
                    Immutable Credit History
                  </h3>
                  <div className="mt-2.5 space-y-2">
                    {(xpLedger?.history || []).map((entry, idx) => (
                      <div
                        key={`${entry.timestamp}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3.5 py-2.5 text-xs"
                      >
                        <div>
                          <p className="font-medium text-bone">
                            {entry.reason}
                          </p>
                          <p className="font-mono text-[10px] text-ink-muted">
                            {formatIstDateTime(entry.timestamp)}
                          </p>
                        </div>
                        <span className="font-mono font-semibold text-pine">
                          +{entry.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onUpdated={(msg) => notify("success", "Profile Updated", msg)}
        />

        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    </WorkspaceContext.Provider>
  );
};
