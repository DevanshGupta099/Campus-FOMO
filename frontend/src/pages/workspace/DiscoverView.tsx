import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  Bookmark,
  Building2,
  Calendar,
  Clock,
  Coffee,
  Compass,
  Filter,
  Search,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type {
  CampusLeaderboard,
  EventItem,
  SponsorShowcase,
} from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { EventDetailModal } from "../../components/EventDetailModal";
import { useWorkspace } from "../../components/WorkspaceShell";
import { DESIGN_TOKENS } from "../../tokens";
import {
  computeSeatState,
  formatInr,
  formatIstDate,
  formatIstTime,
} from "../../utils/format";

export const DiscoverView: React.FC = () => {
  const { hasPerm } = useAuth();
  const { notify, streamRevision, refreshXpLedger } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [sponsor, setSponsor] = useState<SponsorShowcase | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<CampusLeaderboard | null>(
    null,
  );
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [externalOnly, setExternalOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "scarcity" | "fee">("date");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showPerkModal, setShowPerkModal] = useState(false);

  const isExternalScopedGuest =
    !hasPerm("gamification:read:own") &&
    !hasPerm("event:approve:dept") &&
    !hasPerm("rbac:manage") &&
    !hasPerm("sponsor:profile:manage:own") &&
    !hasPerm("event:create") &&
    !hasPerm("checkin:scan:own-event");

  const loadData = useCallback(async () => {
    try {
      const [evts, sp, bms, lb] = await Promise.all([
        apiClient.listEvents({
          category,
          external: externalOnly || undefined,
        }),
        apiClient.getSponsorShowcase().catch(() => null),
        apiClient.getBookmarks().catch(() => []),
        apiClient.getLeaderboard().catch(() => null),
      ]);
      setEvents(evts);
      if (sp) setSponsor(sp);
      setSavedIds(new Set(bms.map((b) => b.eventId)));
      if (lb) setLeaderboard(lb);

      const deepEventId = searchParams.get("event");
      if (deepEventId) {
        const match = evts.find((e) => e.id === deepEventId);
        if (match) setSelectedEvent(match);
      }
    } catch (err: unknown) {
      notify(
        "error",
        "Feed Sync Failed",
        err instanceof Error ? err.message : "Could not load campus events.",
      );
    } finally {
      setLoading(false);
    }
  }, [category, externalOnly, notify, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData, streamRevision]);

  const handleToggleBookmark = async (evt: EventItem) => {
    try {
      const res = await apiClient.toggleBookmark(evt.id);
      setSavedIds(new Set(res.bookmarks.map((b) => b.eventId)));
      notify(
        "success",
        res.saved ? "Added to Watchlist" : "Removed from Watchlist",
        evt.title,
      );
    } catch {
      notify("error", "Watchlist Error", "Could not update saved watchlist.");
    }
  };

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = events.filter((e) => {
      if (savedOnly && !savedIds.has(e.id)) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        (e.clubName || "").toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "fee") return a.fee - b.fee;
      if (sortBy === "scarcity") {
        const remA = a.capacity - a.confirmedCount;
        const remB = b.capacity - b.confirmedCount;
        return remA - remB;
      }
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
  }, [events, search, sortBy, savedOnly, savedIds]);

  return (
    <div className="space-y-6">
      {/* Editorial Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-vermilion">
            Central Campus Schedule · IST
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
            Discover Campus Events &amp; Conclaves
          </h1>
          {isExternalScopedGuest && (
            <p className="mt-1 font-mono text-xs text-phosphor">
              External Fest Guest Scope Active: Showing inter-collegiate
              External-Open events only.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/app/map"
            className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-paper-elevated px-3 py-1.5 font-mono text-xs font-semibold text-bone transition hover:border-vermilion hover:text-vermilion"
          >
            <Compass className="h-3.5 w-3.5 text-vermilion" />
            <span>3D Precinct Radar</span>
          </Link>
          {leaderboard && (
            <button
              type="button"
              onClick={() => setShowLeaderboard((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/45 bg-gold-soft px-3 py-1.5 font-mono text-xs font-semibold text-gold transition hover:border-gold"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Deanery XP League</span>
            </button>
          )}
          <div className="font-mono text-xs text-ink-secondary">
            <span className="font-semibold text-bone">
              {filteredEvents.length}
            </span>{" "}
            verified schedules
          </div>
        </div>
      </div>

      {/* Collapsible Deanery XP League Panel */}
      {showLeaderboard && leaderboard && (
        <section
          aria-label="Deanery XP League"
          className="grid gap-4 rounded-xl border border-gold/40 bg-paper-elevated p-5 lg:grid-cols-12"
        >
          <div className="space-y-2.5 lg:col-span-7">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-gold">
              <Trophy className="h-3.5 w-3.5" />
              <span>Inter-Deanery Participation Standings</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {leaderboard.deaneries.map((d) => (
                <div
                  key={d.deanery}
                  className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3.5 py-2.5"
                >
                  <div>
                    <p className="font-mono text-[10px] text-gold">
                      #{d.rank} · {d.badge}
                    </p>
                    <p className="text-xs font-semibold text-bone">
                      {d.deanery}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-phosphor">
                      {d.totalXp.toLocaleString()} XP
                    </p>
                    <p className="text-[10px] text-ink-muted">
                      {d.activePasses} passes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-5">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-vermilion">
              <Award className="h-3.5 w-3.5" />
              <span>Top Campus Contributors (Masked PII)</span>
            </div>
            <div className="space-y-1.5">
              {leaderboard.topParticipants.map((p) => (
                <div
                  key={`${p.rank}-${p.displayName}`}
                  className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] font-bold text-vermilion">
                      0{p.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-bone">
                        {p.displayName}
                      </span>
                      <span className="ml-2 font-mono text-[10px] text-ink-muted">
                        {p.department}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-gold">
                    {p.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Third Wave Coffee Central Block Partner Banner (SP-01) */}
      {sponsor && (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-obsidian-rule bg-obsidian px-5 py-4 text-bone sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/50 bg-obsidian-surface text-gold">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">
                  Official Campus Beverage Partner
                </span>
                <span className="rounded border border-obsidian-rule px-2 py-0.5 font-mono text-[10px] text-paper-deep/80">
                  Zero PII Tracking
                </span>
              </div>
              <p className="mt-0.5 text-sm font-semibold text-bone">
                {sponsor.brand} · {sponsor.location}
              </p>
              <p className="text-xs text-paper-deep/85">
                {sponsor.studentPerk}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPerkModal((prev) => !prev)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gold/60 bg-obsidian-surface px-3.5 py-2 font-mono text-xs font-semibold text-gold transition hover:bg-gold hover:text-void"
          >
            <span>
              {showPerkModal ? "Hide Menu Perks" : "View Concourse Perks"}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {showPerkModal && sponsor && (
        <div className="grid gap-3 rounded-xl border border-rule-strong bg-paper-elevated p-4 sm:grid-cols-3">
          {sponsor.menuHighlights.map((item) => (
            <div
              key={item.name}
              className="rounded-lg border border-rule bg-paper p-3"
            >
              <p className="text-xs font-semibold text-bone">{item.name}</p>
              <div className="mt-1 flex items-baseline gap-2 font-mono text-xs">
                <span className="font-bold text-phosphor">
                  INR {item.studentPrice}
                </span>
                <span className="text-ink-muted line-through">
                  INR {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="space-y-3 rounded-xl border border-rule bg-paper-elevated p-4">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event title, venue (Main Auditorium, Block IV), or society..."
              aria-label="Search campus events"
              className="w-full rounded-md border border-rule-strong bg-paper py-2 pl-9 pr-3.5 text-xs text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-3">
            <Filter className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
            <select
              aria-label="Sort events"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "scarcity" | "fee")
              }
              className="w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-bone"
            >
              <option value="date">Sort: Chronological (IST)</option>
              <option value="scarcity">Sort: Seats Filling Fastest</option>
              <option value="fee">Sort: Complimentary First</option>
            </select>
          </div>

          <div className="flex items-center gap-2 md:col-span-4">
            <label className="flex flex-1 cursor-pointer items-center justify-between rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs font-medium text-bone">
              <span>External-Open</span>
              <input
                type="checkbox"
                checked={externalOnly}
                onChange={(e) => setExternalOnly(e.target.checked)}
                className="h-4 w-4 accent-vermilion"
              />
            </label>

            <button
              type="button"
              onClick={() => setSavedOnly((prev) => !prev)}
              aria-pressed={savedOnly}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-xs font-semibold transition ${
                savedOnly
                  ? "border-gold bg-gold text-void"
                  : "border-rule-strong bg-paper text-bone hover:border-gold/60"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Watchlist ({savedIds.size})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {DESIGN_TOKENS.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-md px-3 py-1 font-mono text-[11px] font-semibold transition ${
                category === cat
                  ? "bg-vermilion text-void"
                  : "border border-rule bg-paper text-ink-secondary hover:border-vermilion/60 hover:text-bone"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Architectural Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-xl border border-rule bg-paper-elevated p-5"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-rule bg-paper-elevated p-10 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-gold" />
          <h2 className="mt-2 font-display text-xl font-bold text-bone">
            No Matching Precinct Events
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            Adjust your category, search, or watchlist filter to explore active
            CHRIST Central schedules.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((evt) => {
            const seat = computeSeatState(evt);
            const isSaved = savedIds.has(evt.id);
            return (
              <article
                key={evt.id}
                className="group flex flex-col justify-between rounded-xl border border-rule-strong bg-paper-elevated p-5 shadow-editorial transition hover:-translate-y-0.5 hover:border-vermilion/60"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded bg-paper-recessed px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-bone">
                      {evt.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {evt.isExternalOpen ? (
                        <span className="rounded border border-phosphor/40 bg-phosphor-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-phosphor">
                          External-Open
                        </span>
                      ) : (
                        <span className="rounded border border-rule px-2 py-0.5 font-mono text-[10px] text-ink-muted">
                          CHRIST Internal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(evt)}
                        aria-label={
                          isSaved
                            ? `Remove ${evt.title} from watchlist`
                            : `Save ${evt.title} to watchlist`
                        }
                        className={`rounded border p-1 transition ${
                          isSaved
                            ? "border-gold bg-gold-soft text-gold"
                            : "border-rule bg-paper text-ink-muted hover:border-gold/60 hover:text-gold"
                        }`}
                      >
                        <Bookmark
                          className="h-3.5 w-3.5"
                          fill={isSaved ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-3 font-display text-xl font-bold leading-snug text-bone transition group-hover:text-vermilion">
                    {evt.title}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] text-ink-muted">
                    {evt.clubName || evt.department}
                  </p>

                  {evt.lastUpdateBanner && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-ochre/40 bg-ochre-soft px-2.5 py-2 text-[11px] text-bone">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ochre" />
                      <span className="line-clamp-2">
                        {evt.lastUpdateBanner}
                      </span>
                    </div>
                  )}

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-secondary">
                    {evt.description}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-rule pt-3 text-xs text-ink-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-vermilion" />
                      <span>{formatIstDate(evt.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-vermilion" />
                      <span>{formatIstTime(evt.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-vermilion" />
                      <span className="truncate font-medium text-bone">
                        {evt.venueName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-2">
                  {/* Seat Scarcity Bar */}
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span
                      className={`font-semibold ${
                        seat.state === "CRITICAL"
                          ? "text-vermilion"
                          : seat.state === "WAITLIST"
                            ? "text-ochre"
                            : "text-phosphor"
                      }`}
                    >
                      {seat.label}
                    </span>
                    <span className="font-semibold text-bone">
                      {formatInr(evt.fee)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper-recessed">
                    <div
                      style={{ width: `${seat.fillPercent}%` }}
                      className={`h-full ${
                        seat.state === "CRITICAL"
                          ? "bg-vermilion"
                          : seat.state === "WAITLIST"
                            ? "bg-ochre"
                            : "bg-phosphor"
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEvent(evt)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-rule-strong bg-steel px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Inspect Schedule &amp; Reserve</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          if (searchParams.has("event")) {
            searchParams.delete("event");
            setSearchParams(searchParams, { replace: true });
          }
        }}
        onBooked={(msg, isWaitlisted) => {
          notify(
            isWaitlisted ? "warning" : "success",
            isWaitlisted ? "Waitlist Queued" : "Pass Issued",
            msg,
          );
          loadData();
          refreshXpLedger();
        }}
      />
    </div>
  );
};
