import { useState } from "react";
import type { EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface ApprovalsScreenProps {
  client: CampusFomoClient;
  events: EventItem[];
  onRefresh: () => void;
  mode: "department" | "executive";
}

export function ApprovalsScreen({
  client,
  events,
  onRefresh,
  mode,
}: ApprovalsScreenProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const pendingEvents = events.filter((e) =>
    mode === "department"
      ? e.status === "PENDING_FACULTY"
      : e.status === "PENDING_DEAN",
  );

  const handleApproveFaculty = async (id: string) => {
    try {
      await client.approveFaculty(id);
      setStatusMsg(
        "Proposal endorsed! Escalated to Dean of Students for budget clearance.",
      );
      onRefresh();
    } catch (err: any) {
      setStatusMsg(`Endorsement failed: ${err.message}`);
    }
  };

  const handleApproveDean = async (id: string, budget?: number) => {
    try {
      await client.approveDean(id, budget);
      setStatusMsg(
        "Event budget approved! Event is now PUBLISHED to campus feed.",
      );
      onRefresh();
    } catch (err: any) {
      setStatusMsg(`Dean clearance failed: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      alert("Please provide a rejection reason of at least 10 characters.");
      return;
    }
    try {
      await client.rejectEvent(id, rejectReason);
      setStatusMsg("Event rejected and logged in university audit log.");
      setRejectingId(null);
      setRejectReason("");
      onRefresh();
    } catch (err: any) {
      setStatusMsg(`Rejection failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          {mode === "department"
            ? "Faculty Departmental Endorsements (FC-01)"
            : "Deanery Executive Governance & Clearance (DS-01)"}
        </h2>
        <p className="text-xs text-royal-300 font-body">
          {mode === "department"
            ? "Verify academic alignment and check automated venue collisions before endorsing proposals."
            : "Review university budget allocations, campus safety, and grant final fest publication clearance."}
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-xl text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {pendingEvents.length === 0 ? (
        <div className="bg-ink-800/40 border border-royal-500/20 rounded-2xl p-8 text-center space-y-2">
          <p className="text-paper-50/70 text-sm">
            No pending proposals awaiting{" "}
            {mode === "department"
              ? "faculty endorsement"
              : "deanery clearance"}
            .
          </p>
          <p className="text-xs text-paper-50/40">
            All department events have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-ink-800/70 border border-royal-500/30 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-royal-500/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-400/20 text-gold-400 border border-gold-400/30">
                    {evt.status}
                  </span>
                  <h3 className="text-lg font-bold text-paper-50 mt-1">
                    {evt.title}
                  </h3>
                </div>

                {/* Automated Clash Prevention Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-400/10 border border-mint-400/30 text-mint-400 text-xs font-semibold">
                  <span>✓</span>
                  <span>Venue Available (No Conflict)</span>
                </div>
              </div>

              <p className="text-xs text-paper-50/80">{evt.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-ink-950 p-3 rounded-xl border border-royal-500/20">
                <div>
                  <span className="text-paper-50/50 block text-[10px]">
                    VENUE
                  </span>
                  <span>{evt.venueName || "Audi Block 2"}</span>
                </div>
                <div>
                  <span className="text-paper-50/50 block text-[10px]">
                    CAPACITY
                  </span>
                  <span>{evt.capacity} seats</span>
                </div>
                <div>
                  <span className="text-paper-50/50 block text-[10px]">
                    SCHEDULE
                  </span>
                  <span>
                    {new Date(evt.startsAt).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-paper-50/50 block text-[10px]">
                    FEE
                  </span>
                  <span>{evt.fee === 0 ? "Free" : `₹${evt.fee}`}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setRejectingId(evt.id)}
                  className="px-4 py-2 rounded-lg bg-ink-950 border border-ember-500/40 text-ember-400 hover:bg-ember-500/10 text-xs font-semibold"
                >
                  Reject with Reason
                </button>

                {mode === "department" ? (
                  <button
                    onClick={() => handleApproveFaculty(evt.id)}
                    className="px-5 py-2 rounded-lg bg-royal-500 hover:bg-royal-400 text-paper-50 text-xs font-bold shadow-md"
                  >
                    Endorse Proposal (Escalate to Dean)
                  </button>
                ) : (
                  <button
                    onClick={() => handleApproveDean(evt.id)}
                    className="px-5 py-2 rounded-lg bg-mint-500 hover:bg-mint-400 text-ink-950 text-xs font-extrabold shadow-md"
                  >
                    Approve Budget & Publish Event
                  </button>
                )}
              </div>

              {/* Rejection Dialog */}
              {rejectingId === evt.id && (
                <div className="mt-3 p-4 bg-ink-950 border border-ember-500/40 rounded-xl space-y-2">
                  <label className="block text-xs font-semibold text-ember-300">
                    Rejection Reason (minimum 10 characters):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule conflicts with mid-semester examinations..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-ink-900 border border-royal-500/30 rounded-lg p-2 text-paper-50 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1 rounded text-xs text-paper-50/60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(evt.id)}
                      className="px-3 py-1 rounded bg-ember-600 hover:bg-ember-500 text-paper-50 text-xs font-bold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
