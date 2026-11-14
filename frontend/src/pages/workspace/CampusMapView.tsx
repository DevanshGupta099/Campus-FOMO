import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Building2,
  CloudRain,
  Compass,
  MapPin,
  Radio,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { EventItem, VenueItem } from "../../api/types";
import { EventDetailModal } from "../../components/EventDetailModal";
import { useWorkspace } from "../../components/WorkspaceShell";
import {
  computeSeatState,
  formatIstDate,
  formatIstTime,
} from "../../utils/format";

const CampusPrecinct3DMap = lazy(() =>
  import("../../components/webgl/CampusPrecinct3DMap").then((m) => ({
    default: m.CampusPrecinct3DMap,
  })),
);

export const CampusMapView: React.FC = () => {
  const { notify, streamRevision, refreshXpLedger } = useWorkspace();

  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [focusVenueId, setFocusVenueId] = useState<string>("ALL");

  const loadData = useCallback(async () => {
    try {
      const [vn, ev] = await Promise.all([
        apiClient.getVenues(),
        apiClient.listEvents(),
      ]);
      setVenues(vn);
      setEvents(ev);
    } catch (err: unknown) {
      notify(
        "error",
        "Precinct Sync Failed",
        err instanceof Error
          ? err.message
          : "Could not load 3D precinct radar.",
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData, streamRevision]);

  const stats = useMemo(() => {
    const outdoorWithBackup = venues.filter((v) => v.isOutdoor).length;
    const totalSeats = events.reduce((acc, e) => acc + e.capacity, 0);
    const bookedSeats = events.reduce((acc, e) => acc + e.confirmedCount, 0);
    return {
      venueCount: venues.length,
      outdoorWithBackup,
      activeEvents: events.length,
      utilizationPct:
        totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
    };
  }, [venues, events]);

  const filteredEvents = useMemo(() => {
    if (focusVenueId === "ALL") return events;
    return events.filter((e) => e.venueId === focusVenueId);
  }, [events, focusVenueId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-vermilion">
            <Compass className="h-3.5 w-3.5" />
            <span>Spatial Digital Twin · Hosur Road Precinct</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
            3D Precinct Radar &amp; Venue Telemetry
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-secondary">
            Interactive spatial twin of CHRIST (Deemed to be University) Central
            Campus. Inspect architectural block capacities, indoor monsoon
            contingencies, and reserve live passes directly from block beacons.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-phosphor/35 bg-phosphor-soft px-3.5 py-2 font-mono text-xs text-phosphor">
          <Radio className="h-3.5 w-3.5" />
          <span>{stats.utilizationPct}% Precinct Seat Load</span>
        </div>
      </div>

      {/* Telemetry Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-rule-strong bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Mapped Campus Blocks
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-bone">
            {stats.venueCount}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-secondary">
            Main Aud · Block I–IV · Skyview
          </p>
        </div>

        <div className="rounded-xl border border-rule-strong bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Live Scheduled Conclaves
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-vermilion">
            {stats.activeEvents}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-secondary">
            Zero overlapping venue clashes
          </p>
        </div>

        <div className="rounded-xl border border-rule-strong bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Monsoon Contingencies
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-gold">
            {stats.outdoorWithBackup} Outdoor
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-secondary">
            100% indoor fallback assigned
          </p>
        </div>

        <div className="rounded-xl border border-rule-strong bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Gate-1 Entry Control
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-phosphor">
            HMAC-QR
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-secondary">
            30s rotating pass verification
          </p>
        </div>
      </div>

      {/* Interactive 3D Campus Twin */}
      {loading ? (
        <div className="h-[440px] animate-pulse rounded-2xl border border-rule-strong bg-paper-elevated" />
      ) : (
        <Suspense
          fallback={
            <div className="flex h-[440px] items-center justify-center rounded-2xl border border-rule-strong bg-paper-elevated font-mono text-xs uppercase tracking-widest text-silver">
              Initializing 3D Precinct Radar...
            </div>
          }
        >
          <CampusPrecinct3DMap
            venues={venues}
            events={events}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        </Suspense>
      )}

      {/* Architectural Block Directory & Filtered Schedules */}
      <section className="space-y-4 rounded-2xl border border-rule-strong bg-paper-elevated p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
              Block-Level Schedule Matrix
            </p>
            <h2 className="mt-0.5 font-display text-xl font-bold text-bone">
              Filter Active Conclaves by Precinct Venue
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFocusVenueId("ALL")}
              className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition ${
                focusVenueId === "ALL"
                  ? "bg-vermilion text-void"
                  : "border border-rule-strong bg-paper text-ink-secondary hover:border-vermilion/60 hover:text-bone"
              }`}
            >
              All Blocks ({events.length})
            </button>
            {venues.map((v) => {
              const count = events.filter((e) => e.venueId === v.id).length;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFocusVenueId(v.id)}
                  className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-medium transition ${
                    focusVenueId === v.id
                      ? "bg-vermilion font-semibold text-void"
                      : "border border-rule bg-paper text-ink-secondary hover:border-bone/40 hover:text-bone"
                  }`}
                >
                  {v.name.split("—")[0].trim()} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-rule bg-paper p-8 text-center">
            <Building2 className="mx-auto h-6 w-6 text-gold" />
            <p className="mt-2 font-display text-lg font-semibold text-bone">
              No Published Conclaves in Selected Block
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              This architectural block currently has open scheduling
              availability for student organizers.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt) => {
              const seat = computeSeatState(evt);
              return (
                <article
                  key={evt.id}
                  className="flex flex-col justify-between rounded-xl border border-rule-strong bg-paper p-4 transition hover:border-vermilion/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider">
                      <span className="rounded bg-paper-recessed px-2 py-0.5 font-semibold text-bone">
                        {evt.category}
                      </span>
                      <span className="text-gold">{seat.label}</span>
                    </div>
                    <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-bone">
                      {evt.title}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-ink-secondary">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-vermilion" />
                        <span className="truncate text-bone">
                          {evt.venueName}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Users className="h-3.5 w-3.5 shrink-0 text-phosphor" />
                        <span>
                          {formatIstDate(evt.startsAt)} ·{" "}
                          {formatIstTime(evt.startsAt)}
                        </span>
                      </p>
                      {evt.indoorBackupVenueName && (
                        <p className="flex items-center gap-1.5 font-mono text-[10px] text-gold">
                          <CloudRain className="h-3 w-3 shrink-0" />
                          <span>Fallback: {evt.indoorBackupVenueName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEvent(evt)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-rule-strong bg-paper-elevated px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Inspect &amp; Reserve Pass</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 font-mono text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-phosphor" />
            <span>
              Venue double-booking prevented at submission &amp; approval layers
            </span>
          </span>
          <span>Coordinates: 12.9344° N, 77.6062° E · Bengaluru</span>
        </div>
      </section>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
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
