import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { EventItem } from "../api/types";
import {
  downloadIcsInvite,
  formatInr,
  formatIstDate,
  formatIstTime,
} from "../utils/format";

interface ConclaveItineraryPlannerProps {
  events: EventItem[];
  onInspectEvent: (evt: EventItem) => void;
}

export const ConclaveItineraryPlanner: React.FC<
  ConclaveItineraryPlannerProps
> = ({ events, onInspectEvent }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "evt-hackathon-100",
    "evt-cultural-dance",
  ]);

  const toggleEvent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedEvents = useMemo(() => {
    return events
      .filter((e) => selectedIds.includes(e.id))
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
  }, [events, selectedIds]);

  const clashPairs = useMemo(() => {
    const overlaps: Array<[string, string]> = [];
    for (let i = 0; i < selectedEvents.length; i++) {
      for (let j = i + 1; j < selectedEvents.length; j++) {
        const a = selectedEvents[i];
        const b = selectedEvents[j];
        const sA = new Date(a.startsAt).getTime();
        const eA = new Date(a.endsAt).getTime();
        const sB = new Date(b.startsAt).getTime();
        const eB = new Date(b.endsAt).getTime();
        if (sA < eB && eA > sB) {
          overlaps.push([a.title, b.title]);
        }
      }
    }
    return overlaps;
  }, [selectedEvents]);

  const totalFee = useMemo(
    () => selectedEvents.reduce((acc, e) => acc + e.fee, 0),
    [selectedEvents],
  );
  const totalXp = selectedEvents.length * 60;

  if (events.length === 0) return null;

  return (
    <section
      id="itinerary-planner"
      className="relative overflow-hidden border-b border-rule bg-void py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-architectural-grid opacity-55"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-phosphor/40 bg-phosphor-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-phosphor">
              <CalendarCheck2 className="h-3.5 w-3.5" />
              <span>01B // INTERACTIVE PERSONAL FEST PLANNER</span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-bone sm:text-5xl">
              Build Your Clash-Free{" "}
              <span className="text-vermilion">Fest Run-of-Show.</span>
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-silver sm:text-sm">
            Select conclaves below to assemble your custom CHRIST Central
            schedule. The temporal verifier flags overlapping auditorium slots
            in real time and calculates your cumulative XP &amp; pass total.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* Left: Selectable Conclave Timeline Cards */}
          <div className="space-y-3 lg:col-span-7">
            {events.slice(0, 6).map((evt) => {
              const active = selectedIds.includes(evt.id);
              return (
                <div
                  key={evt.id}
                  className={`spotlight-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                    active
                      ? "border-vermilion bg-gunmetal shadow-glow"
                      : "border-rule-strong"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                      <span className="rounded bg-void px-2 py-0.5 font-bold text-gold">
                        {evt.category}
                      </span>
                      <span className="text-silver">
                        {formatIstDate(evt.startsAt)} ·{" "}
                        {formatIstTime(evt.startsAt)}
                      </span>
                      <span className="font-bold text-bone">
                        {formatInr(evt.fee)}
                      </span>
                    </div>
                    <h3 className="mt-1.5 truncate font-serif text-base font-bold text-bone sm:text-lg">
                      {evt.title}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-silver">
                      <MapPin className="h-3 w-3 text-vermilion" />
                      <span className="truncate">{evt.venueName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectEvent(evt)}
                      className="rounded-lg border border-rule-strong bg-void px-3 py-2 font-mono text-[11px] font-semibold text-silver transition hover:border-bone hover:text-bone"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleEvent(evt.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                        active
                          ? "bg-vermilion text-void"
                          : "border border-rule-strong bg-carbon text-bone hover:border-vermilion"
                      }`}
                    >
                      {active ? (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>In Pack</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 text-vermilion" />
                          <span>Add Slot</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Clash Status, XP & Itinerary Summary HUD */}
          <div className="hud-frame glass-console flex flex-col justify-between rounded-2xl border border-rule-strong p-6 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between border-b border-rule pb-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-gold">
                  <Sparkles className="h-4 w-4 text-vermilion" />
                  <span>PERSONAL ITINERARY TELEMETRY</span>
                </div>
                <span className="font-mono text-xs font-bold text-bone">
                  {selectedEvents.length} Slots
                </span>
              </div>

              {/* Clash Diagnostic Banner */}
              <div className="mt-4">
                {clashPairs.length === 0 ? (
                  <div className="flex items-start gap-2.5 rounded-xl border border-phosphor/40 bg-phosphor-soft p-3.5 text-xs text-phosphor">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-mono font-bold uppercase">
                        ZERO TEMPORAL CLASH DETECTED
                      </p>
                      <p className="mt-0.5 text-bone/85">
                        All selected CHRIST Central auditoriums and quadrangles
                        have clean non-overlapping IST windows.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-xl border border-vermilion/50 bg-vermilion-soft p-3.5 text-xs text-vermilion">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-mono font-bold uppercase">
                        SCHEDULE OVERLAP DETECTED ({clashPairs.length})
                      </p>
                      <p className="mt-0.5 text-bone/90">
                        {clashPairs[0][0]} overlaps with {clashPairs[0][1]}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Chronological Run-of-Show */}
              <div className="mt-5 space-y-2.5">
                {selectedEvents.length === 0 ? (
                  <p className="rounded-xl border border-rule bg-void/80 p-5 text-center font-mono text-xs text-silver">
                    Click &ldquo;Add Slot&rdquo; on any conclave to simulate
                    your fest day.
                  </p>
                ) : (
                  selectedEvents.map((ev, idx) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-rule bg-void/85 px-3.5 py-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-gold">
                          STOP 0{idx + 1} · {formatIstDate(ev.startsAt)} (
                          {formatIstTime(ev.startsAt)})
                        </p>
                        <p className="truncate font-semibold text-bone">
                          {ev.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          downloadIcsInvite({
                            id: ev.id,
                            title: ev.title,
                            description: ev.description,
                            venueName: ev.venueName,
                            startsAt: ev.startsAt,
                            endsAt: ev.endsAt,
                          })
                        }
                        className="shrink-0 rounded border border-rule-strong bg-carbon px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-silver hover:border-gold hover:text-gold"
                      >
                        .ICS
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totals Footer */}
            <div className="mt-6 space-y-3 border-t border-rule pt-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-rule bg-void p-3.5 font-mono">
                <div>
                  <span className="block text-[10px] uppercase text-ink-muted">
                    ESTIMATED PASS TOTAL
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-lg font-extrabold text-bone">
                    <Clock className="h-3.5 w-3.5 text-vermilion" />
                    {formatInr(totalFee)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-ink-muted">
                    SEASON XP YIELD
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-lg font-extrabold text-phosphor">
                    <Award className="h-3.5 w-3.5 text-gold" />+{totalXp} XP
                  </span>
                </div>
              </div>

              {selectedEvents[0] && (
                <button
                  type="button"
                  onClick={() => onInspectEvent(selectedEvents[0])}
                  className="w-full rounded-lg bg-vermilion py-3 font-mono text-xs font-bold uppercase tracking-widest text-void shadow-glow transition hover:bg-vermilion-hover"
                >
                  Reserve Lead Itinerary Pass →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
