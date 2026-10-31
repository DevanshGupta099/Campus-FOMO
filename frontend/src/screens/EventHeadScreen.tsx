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
  const [budget, setBudget] = useState(20000);
  const [teamSize, setTeamSize] = useState(4);
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
        "Proposal submitted! Sent to department faculty for endorsement.",
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
        `Volunteer assigned! Scanner permissions granted to student.`,
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
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          Event Operations & Head Console
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Manage event proposals, delegate volunteer scanning roles, and
          broadcast urgent notices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Submit Proposal */}
        <section className="bg-ink-800/60 border border-royal-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-royal-500/20 pb-3">
            <span className="text-lg">📋</span>
            <h3 className="font-bold text-paper-50 text-base">
              Submit Event Proposal (Handbook 5 Fields)
            </h3>
          </div>

          <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
            <div>
              <label className="block text-paper-50/70 mb-1">
                1. Event Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Prompt Engineering Jam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50"
              />
            </div>

            <div>
              <label className="block text-paper-50/70 mb-1">
                2. Description (2-3 sentences)
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe rules, objectives, and eligibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-paper-50/70 mb-1">3. Venue</label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50"
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
                <label className="block text-paper-50/70 mb-1">
                  4. Budget Requested (₹)
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-paper-50/70 mb-1">
                  5. Team Size / Capacity
                </label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">
                  Team Coordination Size
                </label>
                <input
                  type="number"
                  required
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-paper-50/70 mb-1">Starts At</label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2 text-paper-50 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">Ends At</label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2 text-paper-50 font-mono text-[11px]"
                />
              </div>
            </div>

            {proposalMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
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
              className="w-full py-2.5 rounded-lg bg-royal-500 hover:bg-royal-400 text-paper-50 font-semibold shadow-md mt-2"
            >
              Submit Proposal for Faculty Endorsement
            </button>
          </form>
        </section>

        {/* Right Column: Volunteer Delegation & Urgent Broadcast */}
        <div className="space-y-6">
          {/* Volunteer Role Delegation */}
          <section className="bg-ink-800/60 border border-royal-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-royal-500/20 pb-3">
              <span className="text-lg">🤝</span>
              <h3 className="font-bold text-paper-50 text-base">
                Volunteer Role Delegation (Story Card EH-02)
              </h3>
            </div>

            <form
              onSubmit={handleAssignVolunteer}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-paper-50/70 mb-1">
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">
                  Student Sub / ID (Search)
                </label>
                <input
                  type="text"
                  required
                  value={studentSub}
                  onChange={(e) => setStudentSub(e.target.value)}
                  placeholder="e.g. 01927500-0004-7000-8000-000000000004"
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50"
                />
              </div>

              {volunteerMsg && (
                <div className="p-2.5 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-lg text-xs font-mono">
                  {volunteerMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-lg font-semibold"
              >
                Assign Scanner Role
              </button>
            </form>
          </section>

          {/* Broadcast Announcements */}
          <section className="bg-ink-800/60 border border-royal-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-royal-500/20 pb-3">
              <span className="text-lg">📢</span>
              <h3 className="font-bold text-paper-50 text-base">
                Broadcast Emergency / Venue Shift Alert (EH-05)
              </h3>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-paper-50/70 mb-1">
                  Urgent Update Message
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Venue moved from Amphitheatre to Audi Block 2 due to rain..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2.5 text-paper-50"
                />
              </div>

              {broadcastMsg && (
                <div className="p-2.5 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-lg text-xs font-mono">
                  {broadcastMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-ember-500 hover:bg-ember-400 text-paper-50 rounded-lg font-semibold shadow-md"
              >
                🚀 Dispatch Broadcast (All Attendees)
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
