import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { ClashReport, EventItem } from "../../api/types";
import { useWorkspace } from "../../components/WorkspaceShell";
import { formatInrAmount, formatIstDateTime } from "../../utils/format";

interface ApprovalsViewProps {
  stage: "faculty" | "dean";
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ stage }) => {
  const { notify, streamRevision } = useWorkspace();

  const targetStatus = stage === "faculty" ? "PENDING_FACULTY" : "PENDING_DEAN";

  const [proposals, setProposals] = useState<EventItem[]>([]);
  const [clashMap, setClashMap] = useState<Record<string, ClashReport>>({});
  const [budgetEdits, setBudgetEdits] = useState<Record<string, number>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const list = await apiClient.listEvents({ status: targetStatus });
      setProposals(list);

      const initialBudgets: Record<string, number> = {};
      for (const item of list) {
        initialBudgets[item.id] = item.budgetRequested ?? 0;
      }
      setBudgetEdits(initialBudgets);

      // Run live <150ms venue clash checks for all pending items (FC-01)
      const checks = await Promise.all(
        list.map(async (ev) => {
          try {
            const rep = await apiClient.checkVenueClash({
              venueId: ev.venueId,
              startsAt: ev.startsAt,
              endsAt: ev.endsAt,
              excludeEventId: ev.id,
            });
            return [ev.id, rep] as const;
          } catch {
            return null;
          }
        }),
      );
      const map: Record<string, ClashReport> = {};
      for (const pair of checks) {
        if (pair) map[pair[0]] = pair[1];
      }
      setClashMap(map);
    } catch (err: unknown) {
      notify(
        "error",
        "Queue Sync Failed",
        err instanceof Error ? err.message : "Could not load approval queue.",
      );
    } finally {
      setLoading(false);
    }
  }, [notify, targetStatus]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue, streamRevision]);

  const handleApprove = async (ev: EventItem) => {
    setBusyId(ev.id);
    try {
      if (stage === "faculty") {
        await apiClient.approveFaculty(ev.id);
        notify(
          "success",
          "Department Endorsement Signed",
          `"${ev.title}" routed to Deanery Executive Sanction queue.`,
        );
      } else {
        const sanctioned = budgetEdits[ev.id] ?? ev.budgetRequested ?? 0;
        await apiClient.approveDean(ev.id, sanctioned);
        notify(
          "success",
          "Budget Sanctioned & Published Live",
          `"${ev.title}" is now live on the Central Concourse (${formatInrAmount(sanctioned)}).`,
        );
      }
      await loadQueue();
    } catch (err: unknown) {
      notify(
        "error",
        "Approval Action Failed",
        err instanceof Error ? err.message : "Could not approve proposal.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (ev: EventItem) => {
    if (rejectReason.trim().length < 10) {
      notify(
        "warning",
        "Reason Required",
        "Provide at least 10 characters explaining the revision needed.",
      );
      return;
    }
    setBusyId(ev.id);
    try {
      await apiClient.rejectEvent(ev.id, rejectReason.trim());
      setRejectingId(null);
      setRejectReason("");
      notify(
        "warning",
        "Proposal Returned with Audit Note",
        `"${ev.title}" marked REJECTED with feedback.`,
      );
      await loadQueue();
    } catch (err: unknown) {
      notify(
        "error",
        "Rejection Failed",
        err instanceof Error ? err.message : "Could not reject proposal.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            {stage === "faculty"
              ? "Stage 1 · Departmental Endorsement & Clash Audit (FC-01)"
              : "Stage 2 · Deanery Budget Sanction & Publication (DS-01)"}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            {stage === "faculty"
              ? "Faculty Coordinator Review Queue"
              : "Deanery Executive Governance Queue"}
          </h1>
        </div>
        <span className="rounded-md border border-rule-strong bg-paper-elevated px-3.5 py-1.5 font-mono text-xs font-semibold text-ink">
          {proposals.length} awaiting action
        </span>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl border border-rule bg-paper-elevated" />
      ) : proposals.length === 0 ? (
        <div className="rounded-xl border border-rule bg-paper-elevated p-12 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-pine" />
          <h2 className="mt-3 font-serif text-2xl text-ink">
            Governance Queue Clear
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            All {targetStatus} proposals have been reviewed and logged.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((ev) => {
            const clash = clashMap[ev.id];
            return (
              <article
                key={ev.id}
                className="rounded-xl border border-rule-strong bg-paper-elevated p-6 shadow-editorial"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-obsidian px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brass-light">
                        {ev.status}
                      </span>
                      <span className="font-mono text-xs text-ink-secondary">
                        {ev.department} · {ev.category}
                      </span>
                    </div>
                    <h2 className="mt-2 font-serif text-2xl text-ink">
                      {ev.title}
                    </h2>
                    <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-ink-secondary">
                      {ev.description}
                    </p>
                  </div>

                  {/* <150ms Live Venue Clash Badge */}
                  {clash && (
                    <div
                      className={`rounded-lg border px-3.5 py-2 font-mono text-xs ${
                        clash.hasClash
                          ? "border-terracotta/50 bg-terracotta-soft text-terracotta"
                          : "border-pine/40 bg-pine-soft text-pine"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        {clash.hasClash ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span>
                          {clash.hasClash
                            ? `${clash.conflictingEvents.length} Venue Clash`
                            : "Zero Venue Clash"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] opacity-85">
                        Query verified in {clash.checkedInMs}ms (&lt;150ms SLA)
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3 rounded-lg border border-rule bg-paper p-3.5 text-xs sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-terracotta" />
                    <div>
                      <span className="block font-mono text-[10px] uppercase text-ink-muted">
                        Venue &amp; Capacity
                      </span>
                      <span className="font-semibold text-ink">
                        {ev.venueName} ({ev.capacity} seats)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-terracotta" />
                    <div>
                      <span className="block font-mono text-[10px] uppercase text-ink-muted">
                        Schedule Window (IST)
                      </span>
                      <span className="font-semibold text-ink">
                        {formatIstDateTime(ev.startsAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-terracotta" />
                    <div>
                      <span className="block font-mono text-[10px] uppercase text-ink-muted">
                        Requested Budget
                      </span>
                      <span className="font-mono font-semibold text-ink">
                        {formatInrAmount(ev.budgetRequested)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
                  {stage === "dean" ? (
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`sanction-${ev.id}`}
                        className="font-mono text-xs font-semibold text-ink"
                      >
                        Sanctioned INR:
                      </label>
                      <input
                        id={`sanction-${ev.id}`}
                        type="number"
                        min={0}
                        value={budgetEdits[ev.id] ?? ev.budgetRequested ?? 0}
                        onChange={(e) =>
                          setBudgetEdits((prev) => ({
                            ...prev,
                            [ev.id]: Number(e.target.value),
                          }))
                        }
                        className="w-36 rounded-md border border-rule-strong bg-paper px-3 py-1.5 font-mono text-xs text-ink"
                      />
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] text-ink-muted">
                      Stage-1 endorsement forwards to Deanery budget sanction
                    </span>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setRejectingId((curr) =>
                          curr === ev.id ? null : ev.id,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-terracotta/50 bg-terracotta-soft px-3.5 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-void"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Return / Reject</span>
                    </button>

                    <button
                      type="button"
                      disabled={busyId === ev.id}
                      onClick={() => handleApprove(ev)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-pine px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:opacity-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {busyId === ev.id
                          ? "Signing..."
                          : stage === "faculty"
                            ? "Endorse to Deanery"
                            : "Sanction & Publish Live"}
                      </span>
                    </button>
                  </div>
                </div>

                {rejectingId === ev.id && (
                  <div className="mt-4 flex flex-col gap-2 rounded-lg border border-terracotta/40 bg-terracotta-soft p-3.5 sm:flex-row">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter formal governance revision note (min 10 characters)..."
                      className="flex-1 rounded border border-rule-strong bg-paper-elevated px-3 py-2 text-xs text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => handleReject(ev)}
                      className="rounded bg-terracotta px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
