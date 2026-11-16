import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CalendarPlus,
  CheckCircle2,
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

  const timelineEvents = useMemo(() => {
    return [...events]
      .slice(0, 6)
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
  }, [events]);

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
      className="relative overflow-hidden border-b border-rule bg-obsidian/60 py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Editorial Chapter Masthead */}
        <div className="grid items-end gap-6 border-b border-rule pb-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex items-baseline gap-3">
              <span className="editorial-italic text-3xl text-gold sm:text-4xl">
                02.
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">
                Personal Schedule Composer · Temporal Verifier
              </span>
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
              Build Your Clash-Free{" "}
              <span className="editorial-italic font-normal text-gold">
                Fest Run-of-Show.
              </span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-silver lg:col-span-4">
            Toggle conclaves along the campus time-rail to assemble your custom
            itinerary. Overlapping auditorium windows are flagged automatically
            before you lock a pass.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Left: Chronological Vertical Time-Rail */}
          <div className="relative space-y-4 pl-6 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-rule-strong lg:col-span-7">
            {timelineEvents.map((evt) => {
              const active = selectedIds.includes(evt.id);
              return (
                <div key={evt.id} className="relative">
                  {/* Timeline Node Dot */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[22px] top-6 h-3 w-3 rounded-full border-2 transition ${
                      active
                        ? "border-gold bg-gold shadow-[0_0_12px_rgba(229,186,107,0.7)]"
                        : "border-rule-strong bg-void"
                    }`}
                  />

                  <div
                    className={`spotlight-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 transition ${
                      active
                        ? "border-gold/55 bg-gunmetal/95"
                        : "border-rule hover:border-rule-strong"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="font-mono font-medium text-gold">
                          {formatIstTime(evt.startsAt)}
                        </span>
                        <span className="text-rule-strong">·</span>
                        <span className="font-mono text-[11px] text-silver">
                          {formatIstDate(evt.startsAt)}
                        </span>
                        <span className="rounded-full border border-rule bg-void/70 px-2.5 py-0.5 text-[11px] font-medium text-bone/90">
                          {evt.category}
                        </span>
                        <span className="font-mono text-xs font-medium text-bone">
                          {formatInr(evt.fee)}
                        </span>
                      </div>

                      <h3 className="mt-2 truncate font-display text-lg font-bold tracking-tight text-bone">
                        {evt.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-silver">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                        <span className="truncate">{evt.venueName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onInspectEvent(evt)}
                        className="rounded-full border border-rule px-3.5 py-2 text-xs font-medium text-silver transition hover:border-rule-strong hover:text-bone"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleEvent(evt.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          active
                            ? "bg-bone text-void hover:bg-gold"
                            : "border border-rule-strong bg-carbon text-bone hover:border-gold hover:text-gold"
                        }`}
                      >
                        {active ? (
                          <>
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 text-gold" />
                            <span>Add Slot</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Perforated Personal Fest Pass Wallet */}
          <div className="lg:col-span-5">
            <div className="studio-bezel sticky top-24">
              <div className="flex flex-col justify-between rounded-[20px] border border-rule bg-carbon p-6 sm:p-7">
                <div>
                  <div className="flex items-center justify-between border-b border-rule pb-4">
                    <div>
                      <p className="editorial-italic text-lg text-gold">
                        Personal Fest Pass Wallet
                      </p>
                      <h3 className="font-display text-xl font-bold text-bone">
                        Selected Itinerary ({selectedEvents.length})
                      </h3>
                    </div>
                    <Sparkles className="h-5 w-5 text-gold" />
                  </div>

                  {/* Real-Time Clash Status */}
                  <div className="mt-5">
                    {clashPairs.length > 0 ? (
                      <div className="rounded-2xl border border-ochre/40 bg-ochre-soft p-4 text-xs text-bone">
                        <div className="flex items-center gap-2 font-semibold text-ochre">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>
                            Temporal Overlap Detected ({clashPairs.length})
                          </span>
                        </div>
                        <p className="mt-1.5 leading-relaxed text-silver">
                          <strong className="text-bone">
                            {clashPairs[0][0]}
                          </strong>{" "}
                          overlaps with{" "}
                          <strong className="text-bone">
                            {clashPairs[0][1]}
                          </strong>
                          . Remove one slot for a conflict-free Gate-1 run.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 rounded-2xl border border-phosphor/35 bg-phosphor-soft px-4 py-3 text-xs font-medium text-phosphor">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>
                          Zero Auditorium Overlaps · Ready for Atomic Booking
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selected Slots List */}
                  <div className="mt-5 space-y-2.5">
                    {selectedEvents.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-rule p-6 text-center text-xs text-silver">
                        Select conclaves from the timeline on the left to
                        calculate your pass pack and XP projection.
                      </p>
                    ) : (
                      selectedEvents.map((ev, i) => (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-rule bg-void/70 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-bone">
                              <span className="mr-2 font-mono text-gold">
                                0{i + 1}
                              </span>
                              {ev.title}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-silver">
                              {formatIstDate(ev.startsAt)} ·{" "}
                              {formatIstTime(ev.startsAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadIcsInvite(ev)}
                            aria-label={`Download ICS calendar invite for ${ev.title}`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rule px-2.5 py-1 font-mono text-[10px] text-silver transition hover:border-gold hover:text-gold"
                          >
                            <CalendarPlus className="h-3 w-3" />
                            <span>.ICS</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="pass-perforation mb-5 h-[2px] w-full" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-rule bg-void/70 p-3.5">
                      <span className="block text-[11px] text-ink-muted">
                        Projected Ledger XP
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-lg font-semibold text-phosphor">
                        <Award className="h-4 w-4 text-gold" />+{totalXp} XP
                      </span>
                    </div>
                    <div className="rounded-xl border border-rule bg-void/70 p-3.5">
                      <span className="block text-[11px] text-ink-muted">
                        Combined Entry Fee
                      </span>
                      <span className="mt-1 block font-mono text-lg font-semibold text-bone">
                        {formatInr(totalFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
