import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  MapPin,
  Search,
  Terminal,
  Ticket,
  X,
} from "lucide-react";
import { apiClient } from "../api/client";
import type { EventItem, VenueItem } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { toWorkspaceHref } from "./WorkspaceShell";

export function dispatchOpenCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("concourse:open-cmd"));
  }
}

export const CommandPalette: React.FC = () => {
  const { isAuthenticated, screens } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("concourse:open-cmd", onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("concourse:open-cmd", onCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.all([apiClient.listEvents(), apiClient.getVenues()])
      .then(([ev, vn]) => {
        if (active) {
          setEvents(ev);
          setVenues(vn);
        }
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const navItems = isAuthenticated
      ? screens.map((s) => ({
          id: `nav-${s.key}`,
          group: "PBAC Workspace",
          title: s.title,
          sub: s.requiredPermissions.join(" · "),
          href: toWorkspaceHref(s),
        }))
      : [
          {
            id: "pub-home",
            group: "Navigation",
            title: "Central Concourse Landing",
            sub: "WebGL Hero, Live Events & 3D Precinct",
            href: "/",
          },
          {
            id: "pub-login",
            group: "Navigation",
            title: "Sign In / 8-Persona Evaluator Sandbox",
            sub: "Password, HMAC OTP & Instant Role Hydration",
            href: "/login",
          },
          {
            id: "pub-signup",
            group: "Navigation",
            title: "Dual-Track Onboarding",
            sub: "CHRIST Student & External Fest Guest",
            href: "/signup",
          },
        ];

    const evtItems = events.map((e) => ({
      id: `evt-${e.id}`,
      group: "Live Event",
      title: e.title,
      sub: `${e.venueName} · ${e.category}`,
      href: isAuthenticated
        ? `/app/discover?event=${e.id}`
        : `/login?redirect=/app/discover&event=${e.id}`,
    }));

    const venueItems = venues.map((v) => ({
      id: `ven-${v.id}`,
      group: "Precinct Block",
      title: v.name,
      sub: `${v.block} · Capacity ${v.capacity}`,
      href: isAuthenticated ? "/app/map" : "/#precinct-3d",
    }));

    const combined = [...navItems, ...evtItems, ...venueItems];
    if (!q) return combined.slice(0, 9);
    return combined
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.sub.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [events, isAuthenticated, query, screens, venues]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Concourse tactical command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-void/80 px-4 pt-20 backdrop-blur-md"
    >
      <div className="hud-frame w-full max-w-xl overflow-hidden rounded-xl border border-rule-strong bg-carbon shadow-anchor">
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3.5">
          <Search className="h-4 w-4 text-vermilion" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to event, CHRIST campus block, or PBAC console..."
            className="flex-1 bg-transparent text-sm text-bone placeholder:text-ink-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close command palette"
            className="rounded border border-rule px-2 py-0.5 font-mono text-[10px] text-silver hover:text-bone"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[60vh] divide-y divide-rule overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery("");
                navigate(item.href);
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-gunmetal"
            >
              <div className="flex min-w-0 items-center gap-3">
                {item.group === "Live Event" ? (
                  <Ticket className="h-4 w-4 shrink-0 text-vermilion" />
                ) : item.group === "Precinct Block" ? (
                  <MapPin className="h-4 w-4 shrink-0 text-gold" />
                ) : (
                  <Compass className="h-4 w-4 shrink-0 text-phosphor" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-bone">
                    {item.title}
                  </p>
                  <p className="truncate font-mono text-[10px] text-silver">
                    {item.sub}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase text-ink-muted">
                <span>{item.group}</span>
                <ArrowRight className="h-3 w-3 text-vermilion" />
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-rule bg-obsidian px-4 py-2 font-mono text-[10px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-vermilion" />
            <span>CONCOURSE TACTICAL HUD</span>
          </span>
          <span>ESC TO CLOSE · CTRL+K ANYWHERE</span>
        </div>
      </div>
    </div>
  );
};
