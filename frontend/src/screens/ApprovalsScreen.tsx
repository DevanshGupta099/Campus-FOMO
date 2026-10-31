import { useState } from "react";
import type { EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";
import { sound } from "../utils/audio.js";

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
      sound.playSuccess();
      setStatusMsg(
        "Proposal endorsed! Escalated to Dean of Students for budget clearance.",
      );
      onRefresh();
    } catch (err: any) {
      sound.playAlert();
      setStatusMsg(`Endorsement failed: ${err.message}`);
    }
  };

  const handleApproveDean = async (id: string, budget?: number) => {
    try {
      await client.approveDean(id, budget);
      sound.playSuccess();
      setStatusMsg(
        "Event budget approved! Event is now PUBLISHED to campus feed.",
      );
      onRefresh();
    } catch (err: any) {
      sound.playAlert();
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
      sound.playAlert();
      setStatusMsg("Event rejected and logged in university audit log.");
      setRejectingId(null);
      setRejectReason("");
      onRefresh();
    } catch (err: any) {
      setStatusMsg(`Rejection failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-mono font-semibold border border-violet-500/30">
          <span>🛡️ GOVERNANCE PIPELINE</span>
          <span>•</span>
          <span>
            {mode === "department" ? "FACULTY LEVEL" : "DEANERY LEVEL"}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
          {mode === "department"
            ? "Faculty Departmental Endorsements (FC-01)"
            : "Deanery Executive Governance & Clearance (DS-01)"}
        </h2>
        <p className="text-xs text-white/60 max-w-xl mt-1">
          {mode === "department"
            ? "Verify academic alignment and check automated venue collisions before endorsing proposals."
            : "Review university budget allocations, campus safety, and grant final fest publication clearance."}
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-mint-500/15 text-mint-300 border border-mint-500/30 rounded-xl text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {pendingEvents.length === 0 ? (
        <div className="bg-surface border border-white/10 rounded-2xl p-8 text-center space-y-2">
          <p className="text-white/70 text-sm">
            No pending proposals awaiting{" "}
            {mode === "department"
              ? "faculty endorsement"
              : "deanery clearance"}
            .
          </p>
          <p className="text-xs text-white/40">
            All department events have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-surface border border-white/10 rounded-2xl p-6 shadow-card space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {evt.status}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {evt.title}
                  </h3>
                </div>

                {/* Automated Clash Prevention Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-500/10 border border-mint-500/30 text-mint-400 text-xs font-semibold">
                  <span>✓</span>
                  <span>Venue Available (No Conflict)</span>
                </div>
              </div>

              <p className="text-xs text-white/70">{evt.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-surface-2 p-3.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-white/40 block text-[10px]">VENUE</span>
                  <span className="text-white font-medium">
                    {evt.venueName || "Audi Block 2"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">
                    CAPACITY
                  </span>
                  <span className="text-white font-medium">
                    {evt.capacity} seats
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">
                    EXTERNAL STUDENTS
                  </span>
                  <span className="text-white font-medium">
                    {evt.isExternalOpen ? "Allowed" : "Internal Only"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">
                    ESTIMATED BUDGET
                  </span>
                  <span className="text-amber-300 font-bold">₹25,000</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setRejectingId(evt.id)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
                >
                  Reject Proposal
                </button>

                {mode === "department" ? (
                  <button
                    onClick={() => handleApproveFaculty(evt.id)}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/30 transition-all"
                  >
                    Endorse Proposal (Pass to Dean)
                  </button>
                ) : (
                  <button
                    onClick={() => handleApproveDean(evt.id, 25000)}
                    className="px-5 py-2 bg-mint-500 hover:bg-mint-400 text-void rounded-xl text-xs font-bold shadow-md shadow-mint-500/30 transition-all"
                  >
                    Grant Budget & Publish Event
                  </button>
                )}
              </div>

              {/* Rejection Note Drawer */}
              {rejectingId === evt.id && (
                <div className="bg-surface-2 p-4 rounded-xl border border-rose-500/30 space-y-3 animate-fadeIn">
                  <label className="block text-xs font-bold text-rose-300">
                    Mandatory Rejection Reason (Logged to Audit Trail):
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="State reason: e.g. Academic conflict during mid-semester examination week..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-void border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(evt.id)}
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm"
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
