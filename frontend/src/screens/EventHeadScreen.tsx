import { useState } from "react";
import type { EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface EventHeadScreenProps {
  client: CampusFomoClient;
  events: EventItem[];
  onRefresh: () => void;
}

export function EventHeadScreen({
  client,
  events,
  onRefresh,
}: EventHeadScreenProps) {
  // Proposal state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState("ven-auditorium");
  const [budget, setBudget] = useState(25000);
  const [teamSize, setTeamSize] = useState(6);
  const [capacity, setCapacity] = useState(60);
  const [startsAt, setStartsAt] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
  );
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 86400000 * 3 + 14400000).toISOString().slice(0, 16),
  );
  const [proposalMsg, setProposalMsg] = useState<string | null>(null);

  // Volunteer state
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || "evt-hackathon-100",
  );
  const [studentSub, setStudentSub] = useState(
    "01927500-0004-7000-8000-000000000004",
  );
  const [roleTitle, setRoleTitle] = useState("QR Scanner");
  const [volunteerMsg, setVolunteerMsg] = useState<string | null>(null);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null);

  // Live clash detection simulator
  const hasClash = events.some((evt) => {
    if (evt.venueId !== venueId) return false;
    const existingStart = new Date(evt.startsAt).getTime();
    const existingEnd = new Date(evt.endsAt).getTime();
    const proposalStart = new Date(startsAt).getTime();
    const proposalEnd = new Date(endsAt).getTime();
    return (
      !isNaN(proposalStart) &&
      !isNaN(proposalEnd) &&
      Math.max(existingStart, proposalStart) <
        Math.min(existingEnd, proposalEnd)
    );
  });

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposalMsg(null);
    try {
      await client.submitProposal({
        title,
        description,
        venueId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        capacity: Number(capacity),
        budget: Number(budget),
        teamSize: Number(teamSize),
      });
      setProposalMsg(
        "Proposal submitted! Department faculty mentor notified for endorsement review.",
      );
      setTitle("");
      setDescription("");
      onRefresh();
    } catch (err: any) {
      setProposalMsg(`Error submitting: ${err.message}`);
    }
  };

  const handleAssignVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerMsg(null);
    try {
      await client.assignVolunteer(selectedEventId, studentSub, roleTitle);
      setVolunteerMsg(
        "Volunteer assigned! Scanner permissions granted on the student's dashboard.",
      );
    } catch (err: any) {
      setVolunteerMsg(`Error assigning volunteer: ${err.message}`);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastMsg(null);
    try {
      const res = await client.broadcastMessage(selectedEventId, broadcastText);
      setBroadcastMsg(
        `Dispatched to ${res.recipientCount || 100} attendees via Email and Push (Recipients masked).`,
      );
      setBroadcastText("");
    } catch (err: any) {
      setBroadcastMsg(`Broadcast failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/15 text-royal-300 text-xs font-mono font-bold border border-royal-500/30">
          <span>⚡ EVENT LEAD CONSOLE</span>
          <span>•</span>
          <span>STORY CARDS EH-01 TO EH-05</span>
        </div>
        <h2 className="text-3xl font-extrabold text-paper-50 font-display mt-2">
          Event Operations & Management
        </h2>
        <p className="text-xs text-royal-300 font-body max-w-xl">
          Submit proposals across the 5 binding handbook fields, delegate door
          scanning roles, and broadcast urgent schedule shifts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Submit Proposal */}
        <section className="bg-gradient-to-br from-ink-900 to-ink-850 border border-royal-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-royal-500/15 pb-3">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="font-bold text-paper-50 text-base">
                Event Proposal Submission (EH-01)
              </h3>
              <span className="text-[10px] text-royal-300 font-mono">
                Validated against mid-sem blackouts and venue collisions
              </span>
            </div>
          </div>

          <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
            <div>
              <label className="block text-paper-50/70 mb-1 font-semibold">
                1. Event Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Autonomous Agents Hackathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-ink-950 border border-royal-500/30 focus:border-royal-400 rounded-xl p-3 text-paper-50"
              />
            </div>

            <div>
              <label className="block text-paper-50/70 mb-1 font-semibold">
                2. Description (Goals, format, and rules)
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe team formations, technical tracks, and equipment requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-ink-950 border border-royal-500/30 focus:border-royal-400 rounded-xl p-3 text-paper-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  3. Requested Venue
                </label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-3 text-paper-50"
                >
                  <option value="ven-auditorium">
                    Central Campus Auditorium
                  </option>
                  <option value="ven-audi-2">Audi Block 2</option>
                  <option value="ven-lab-2">Block 2 Computing Lab</option>
                  <option value="ven-amphi">Open-Air Amphitheatre</option>
                </select>
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  4. Budget Requested (₹)
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-3 text-paper-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  5. Total Capacity Limit
                </label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-3 text-paper-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Team Size Per Entry
                </label>
                <input
                  type="number"
                  required
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-3 text-paper-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Event Starts
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Event Ends
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Real-time automated clash check */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] font-mono ${
                hasClash
                  ? "bg-ember-500/15 border-ember-500/40 text-ember-300"
                  : "bg-mint-400/10 border-mint-400/30 text-mint-400"
              }`}
            >
              <span>{hasClash ? "⚠️" : "✓"}</span>
              <span>
                {hasClash
                  ? "Venue Conflict: Another event overlaps with requested time slot"
                  : "Venue Available: Automated collision check passed"}
              </span>
            </div>

            {proposalMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-mono ${
                  proposalMsg.includes("Error")
                    ? "bg-ember-500/20 text-ember-300 border border-ember-500/40"
                    : "bg-mint-400/20 text-mint-300 border border-mint-400/40"
                }`}
              >
                {proposalMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-royal-500 hover:bg-royal-400 text-paper-50 font-bold shadow-lg shadow-royal-500/25 mt-2 transition-all hover:scale-[1.01]"
            >
              Submit Proposal for Faculty Endorsement
            </button>
          </form>
        </section>

        {/* Right Column: Volunteer Delegation & Urgent Broadcast */}
        <div className="space-y-6">
          {/* Volunteer Role Delegation */}
          <section className="bg-gradient-to-br from-ink-900 to-ink-850 border border-royal-500/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-royal-500/15 pb-3">
              <span className="text-xl">🤝</span>
              <div>
                <h3 className="font-bold text-paper-50 text-base">
                  Volunteer Scanner Delegation (EH-02)
                </h3>
                <span className="text-[10px] text-royal-300 font-mono">
                  Grants door scan permissions without exposing budgets
                </span>
              </div>
            </div>

            <form
              onSubmit={handleAssignVolunteer}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Student Sub / ID (Search)
                </label>
                <input
                  type="text"
                  required
                  value={studentSub}
                  onChange={(e) => setStudentSub(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Assigned Role
                </label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50"
                />
              </div>

              {volunteerMsg && (
                <div className="p-3 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-xl text-xs font-mono">
                  {volunteerMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-xl font-bold shadow-md"
              >
                Assign Door Scanner Role
              </button>
            </form>
          </section>

          {/* Broadcast Announcements */}
          <section className="bg-gradient-to-br from-ink-900 to-ink-850 border border-royal-500/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-royal-500/15 pb-3">
              <span className="text-xl">📢</span>
              <div>
                <h3 className="font-bold text-paper-50 text-base">
                  Broadcast Urgent Alert (EH-05)
                </h3>
                <span className="text-[10px] text-royal-300 font-mono">
                  BCC recipient concealment enforced
                </span>
              </div>
            </div>

            <form
              onSubmit={handleSendBroadcast}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Urgent Notice
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Venue moved to Audi Block 2 due to rain in amphitheatre..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50"
                />
              </div>

              {broadcastMsg && (
                <div className="p-3 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-xl text-xs font-mono">
                  {broadcastMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-ember-500 hover:bg-ember-400 text-ink-950 rounded-xl font-black shadow-lg shadow-ember-500/20"
              >
                🚀 Dispatch Mass Broadcast (Masked Recipients)
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
