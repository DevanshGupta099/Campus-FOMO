import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  Megaphone,
  PlusCircle,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type {
  AttendeeRosterItem,
  ClashReport,
  EventItem,
  VenueItem,
} from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { useWorkspace } from "../../components/WorkspaceShell";
import { DESIGN_TOKENS } from "../../tokens";
import { formatInrAmount, formatIstDateTime } from "../../utils/format";

type OpsTab = "propose" | "events" | "volunteers" | "roster" | "broadcast";

export const EventOpsView: React.FC = () => {
  const { user, hasPerm } = useAuth();
  const { notify, streamRevision } = useWorkspace();

  const [activeTab, setActiveTab] = useState<OpsTab>("propose");
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Proposal form state (EH-01)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Technical");
  const [department, setDepartment] = useState<string>(
    user?.department || DESIGN_TOKENS.departments[0],
  );
  const [venueId, setVenueId] = useState<string>("");
  const [indoorBackupVenueId, setIndoorBackupVenueId] = useState<string>("");
  const [startsAt, setStartsAt] = useState("2026-12-08T09:30");
  const [endsAt, setEndsAt] = useState("2026-12-08T16:30");
  const [capacity, setCapacity] = useState(180);
  const [waitlistCap, setWaitlistCap] = useState(25);
  const [budgetRequested, setBudgetRequested] = useState(45000);
  const [teamSize, setTeamSize] = useState(1);
  const [fee, setFee] = useState(0);
  const [isExternalOpen, setIsExternalOpen] = useState(true);
  const [attachmentLabel, setAttachmentLabel] = useState<string | null>(null);
  const [clashReport, setClashReport] = useState<ClashReport | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sub-operations state
  const [volunteers, setVolunteers] = useState<
    Array<{ studentSub: string; roleTitle: string; assignedAt: string }>
  >([]);
  const [volunteerSub, setVolunteerSub] = useState("usr-volunteer-01");
  const [volunteerRole, setVolunteerRole] = useState("Gate-1 QR Marshal");
  const [attendees, setAttendees] = useState<AttendeeRosterItem[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const loadCore = useCallback(async () => {
    try {
      const [vList, eList] = await Promise.all([
        apiClient.getVenues(),
        apiClient.listEvents({ status: "all" }),
      ]);
      setVenues(vList);
      setAllEvents(eList);

      if (vList[0] && !venueId) {
        setVenueId(vList[0].id);
        const firstIndoor = vList.find((v) => !v.isOutdoor);
        if (firstIndoor) setIndoorBackupVenueId(firstIndoor.id);
      }

      const owned = eList.filter(
        (ev) =>
          hasPerm("rbac:manage") ||
          ev.organizerSub === user?.sub ||
          ev.organizerSub === "event_head",
      );
      if (owned[0] && !selectedEventId) {
        setSelectedEventId(owned[0].id);
      }
    } catch (err: unknown) {
      notify(
        "error",
        "Operations Sync Error",
        err instanceof Error ? err.message : "Could not load operations data.",
      );
    }
  }, [hasPerm, notify, selectedEventId, user?.sub, venueId]);

  useEffect(() => {
    loadCore();
  }, [loadCore, streamRevision]);

  const managedEvents = useMemo(
    () =>
      allEvents.filter(
        (ev) =>
          hasPerm("rbac:manage") ||
          ev.organizerSub === user?.sub ||
          ev.organizerSub === "event_head",
      ),
    [allEvents, hasPerm, user?.sub],
  );

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === venueId) || null,
    [venues, venueId],
  );

  const indoorVenues = useMemo(
    () => venues.filter((v) => !v.isOutdoor),
    [venues],
  );

  // Live <150ms Clash Check on venue or schedule change
  useEffect(() => {
    if (!venueId || !startsAt || !endsAt) return;
    let active = true;
    const isoStart = new Date(startsAt).toISOString();
    const isoEnd = new Date(endsAt).toISOString();
    apiClient
      .checkVenueClash({ venueId, startsAt: isoStart, endsAt: isoEnd })
      .then((rep) => {
        if (active) setClashReport(rep);
      })
      .catch(() => {
        if (active) setClashReport(null);
      });
    return () => {
      active = false;
    };
  }, [venueId, startsAt, endsAt]);

  // Load event-specific roster/volunteers
  useEffect(() => {
    if (!selectedEventId) return;
    if (activeTab === "volunteers") {
      apiClient
        .listVolunteers(selectedEventId)
        .then(setVolunteers)
        .catch(() => setVolunteers([]));
    } else if (activeTab === "roster") {
      apiClient
        .listEventAttendees(selectedEventId)
        .then(setAttendees)
        .catch(() => setAttendees([]));
    }
  }, [selectedEventId, activeTab]);

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedExt = /\.(pdf|png|jpg|jpeg|zip)$/i;
    if (!allowedExt.test(file.name)) {
      notify(
        "error",
        "Unsupported Attachment",
        "Only PDF, PNG, JPG, or ZIP run-of-show attachments are accepted.",
      );
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify(
        "error",
        "File Exceeds 5 MB Limit",
        "Compress your budget annexure below 5 MB before attaching.",
      );
      e.target.value = "";
      return;
    }
    setAttachmentLabel(`${file.name} (${Math.round(file.size / 1024)} KB)`);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVenue?.isOutdoor && !indoorBackupVenueId) {
      notify(
        "error",
        "Monsoon Contingency Required",
        "Outdoor CHRIST venues require an indoor backup auditorium selection.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiClient.createProposal({
        title: title.trim(),
        description: description.trim(),
        category,
        department,
        venueId,
        venueName: selectedVenue?.name || "Main Auditorium (KE Block)",
        indoorBackupVenueId: selectedVenue?.isOutdoor
          ? indoorBackupVenueId
          : undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        capacity,
        waitlistCap,
        budgetRequested,
        teamSize,
        fee,
        isExternalOpen,
      });
      notify(
        "success",
        "Proposal Routed to Faculty Coordinator",
        `"${created.title}" is now in PENDING_FACULTY endorsement queue.`,
      );
      setTitle("");
      setDescription("");
      await loadCore();
      setActiveTab("events");
    } catch (err: unknown) {
      notify(
        "error",
        "Proposal Rejected",
        err instanceof Error ? err.message : "Could not submit proposal.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !volunteerSub.trim()) return;
    try {
      await apiClient.assignVolunteer(selectedEventId, {
        studentSub: volunteerSub.trim(),
        roleTitle: volunteerRole.trim(),
      });
      notify("success", "Volunteer Delegated", "Gate scan scope assigned.");
      const updated = await apiClient.listVolunteers(selectedEventId);
      setVolunteers(updated);
    } catch (err: unknown) {
      notify(
        "error",
        "Assignment Failed",
        err instanceof Error ? err.message : "Could not assign volunteer.",
      );
    }
  };

  const handleExportRoster = async () => {
    if (!selectedEventId) return;
    try {
      const exported = await apiClient.exportEventAttendees(selectedEventId);
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedEventId}-masked-roster.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify(
        "success",
        "Masked Roster Exported",
        `${exported.recordCount} attendee records downloaded with masked PII.`,
      );
    } catch (err: unknown) {
      notify(
        "error",
        "Export Denied",
        err instanceof Error ? err.message : "Could not export roster.",
      );
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || broadcastMsg.trim().length < 8) {
      notify(
        "warning",
        "Advisory Too Short",
        "Enter at least 8 characters describing the schedule or venue update.",
      );
      return;
    }
    try {
      const res = await apiClient.sendBroadcast(
        selectedEventId,
        broadcastMsg.trim(),
      );
      setBroadcastMsg("");
      notify(
        "success",
        "BCC Broadcast Dispatched",
        `Delivered to ${res.recipientCount} masked pass holders.`,
      );
      await loadCore();
    } catch (err: unknown) {
      notify(
        "error",
        "Broadcast Failed",
        err instanceof Error ? err.message : "Could not dispatch broadcast.",
      );
    }
  };

  const handleCancelOwnedEvent = async (evt: EventItem) => {
    try {
      await apiClient.cancelEvent(
        evt.id,
        "Cancelled by Event Operations organizer with attendee notification.",
      );
      notify("warning", "Event Cancelled", `${evt.title} marked CANCELLED.`);
      await loadCore();
    } catch (err: unknown) {
      notify(
        "error",
        "Cancellation Failed",
        err instanceof Error ? err.message : "Could not cancel event.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Organizer Control Room (EH-01..05)
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            Event Operations &amp; Proposals
          </h1>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["propose", "1. Submit Proposal"],
              ["events", `2. Pipeline (${managedEvents.length})`],
              ["volunteers", "3. QR Marshals"],
              ["roster", "4. Masked Roster"],
              ["broadcast", "5. BCC Broadcast"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition ${
                activeTab === key
                  ? "bg-vermilion text-void"
                  : "border border-rule-strong bg-paper-elevated text-ink-secondary hover:text-bone"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PROPOSAL BUILDER */}
      {activeTab === "propose" && (
        <form
          onSubmit={handleCreateProposal}
          className="space-y-5 rounded-xl border border-rule-strong bg-paper-elevated p-6 shadow-editorial"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-4">
            <div>
              <h2 className="font-serif text-2xl text-ink">
                Two-Stage Governance Proposal
              </h2>
              <p className="text-xs text-ink-secondary">
                Routes to Faculty Coordinator (Stage 1) → Deanery Budget
                Sanction (Stage 2) → Live Concourse Publication.
              </p>
            </div>
            {clashReport && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs font-semibold ${
                  clashReport.hasClash
                    ? "border-terracotta/50 bg-terracotta-soft text-terracotta"
                    : "border-pine/40 bg-pine-soft text-pine"
                }`}
              >
                {clashReport.hasClash ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>
                      Venue Clash ({clashReport.conflictingEvents.length}) ·{" "}
                      {clashReport.checkedInMs}ms
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      Venue Clear · Checked in {clashReport.checkedInMs}ms
                    </span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="prop-title"
                className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
              >
                1. Event Title
              </label>
              <input
                id="prop-title"
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ASCII Cloud Systems Symposium 2026"
                className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2 text-sm text-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="prop-cat"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  Category
                </label>
                <select
                  id="prop-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm text-ink"
                >
                  {DESIGN_TOKENS.categories
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="prop-dept"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  Department
                </label>
                <select
                  id="prop-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm text-ink"
                >
                  {DESIGN_TOKENS.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="prop-desc"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
            >
              2. Academic / Cultural Abstract &amp; Run-of-Show
            </label>
            <textarea
              id="prop-desc"
              rows={3}
              required
              minLength={20}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail speaker lineup, judging rubric, security marshals, and expected student outcomes..."
              className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2 text-sm text-ink"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="prop-venue"
                className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
              >
                3. Central Campus Venue
              </label>
              <select
                id="prop-venue"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm text-ink"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.capacity} cap{v.isOutdoor ? " · Outdoor" : ""})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="prop-budget"
                className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
              >
                4. Requested Budget (INR)
              </label>
              <input
                id="prop-budget"
                type="number"
                min={0}
                value={budgetRequested}
                onChange={(e) => setBudgetRequested(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2 font-mono text-sm text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="prop-team"
                className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
              >
                5. Team Size (1 = Solo)
              </label>
              <input
                id="prop-team"
                type="number"
                min={1}
                max={12}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2 font-mono text-sm text-ink"
              />
            </div>
          </div>

          {selectedVenue?.isOutdoor && (
            <div className="rounded-lg border border-ochre/45 bg-ochre-soft p-4">
              <label
                htmlFor="prop-backup-venue"
                className="block font-mono text-xs font-semibold uppercase tracking-wider text-ochre"
              >
                Bengaluru Monsoon Contingency · Mandatory Indoor Backup Venue
              </label>
              <select
                id="prop-backup-venue"
                value={indoorBackupVenueId}
                onChange={(e) => setIndoorBackupVenueId(e.target.value)}
                className="mt-2 w-full rounded-md border border-rule-strong bg-paper-elevated px-3 py-2 text-sm text-ink"
              >
                {indoorVenues.map((iv) => (
                  <option key={iv.id} value={iv.id}>
                    {iv.name} ({iv.capacity} cap)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Starts At (IST)
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-2.5 py-2 font-mono text-xs text-ink"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Ends At (IST)
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-2.5 py-2 font-mono text-xs text-ink"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Seat Capacity
              </label>
              <input
                type="number"
                min={10}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-2.5 py-2 font-mono text-xs text-ink"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Pass Fee (INR / Waitlist {waitlistCap})
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="w-1/2 rounded-md border border-rule-strong bg-paper px-2 py-2 font-mono text-xs text-ink"
                />
                <input
                  type="number"
                  min={0}
                  value={waitlistCap}
                  onChange={(e) => setWaitlistCap(Number(e.target.value))}
                  aria-label="Waitlist capacity"
                  className="w-1/2 rounded-md border border-rule-strong bg-paper px-2 py-2 font-mono text-xs text-ink"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
                <input
                  type="checkbox"
                  checked={isExternalOpen}
                  onChange={(e) => setIsExternalOpen(e.target.checked)}
                  className="h-4 w-4 accent-terracotta"
                />
                <span>Open to External College Delegations (Gate-1 Pass)</span>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-rule-strong bg-paper px-3 py-1.5 font-mono text-xs text-ink hover:border-obsidian">
                <FileUp className="h-3.5 w-3.5 text-terracotta" />
                <span>{attachmentLabel || "Attach Budget PDF/ZIP (≤5MB)"}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.zip"
                  onChange={handleAttachment}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-terracotta px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-terracotta-hover disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              <span>
                {submitting
                  ? "Submitting Proposal..."
                  : "Submit to Faculty Coordinator"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PIPELINE & STATUS */}
      {activeTab === "events" && (
        <div className="space-y-3">
          {managedEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rule-strong bg-paper-elevated p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-obsidian px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brass-light">
                    {ev.status}
                  </span>
                  <span className="font-mono text-xs text-ink-muted">
                    {ev.venueName} · {formatIstDateTime(ev.startsAt)}
                  </span>
                </div>
                <h3 className="mt-1.5 font-serif text-2xl text-ink">
                  {ev.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-ink-secondary">
                  Seats: {ev.confirmedCount}/{ev.capacity} · Waitlist:{" "}
                  {ev.waitlistCount}/{ev.waitlistCap} · Budget Requested:{" "}
                  {formatInrAmount(ev.budgetRequested)}
                  {ev.budgetApproved !== undefined &&
                    ` · Approved: ${formatInrAmount(ev.budgetApproved)}`}
                </p>
                {ev.rejectionReason && (
                  <p className="mt-1.5 text-xs font-medium text-terracotta">
                    Rejection Note: {ev.rejectionReason}
                  </p>
                )}
              </div>
              {(hasPerm("event:cancel:own") || hasPerm("event:cancel:any")) &&
                ev.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => handleCancelOwnedEvent(ev)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-terracotta/50 bg-terracotta-soft px-3.5 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-void"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Event</span>
                  </button>
                )}
            </div>
          ))}
        </div>
      )}

      {/* EVENT SELECTOR FOR TABS 3..5 */}
      {(activeTab === "volunteers" ||
        activeTab === "roster" ||
        activeTab === "broadcast") && (
        <div className="space-y-4 rounded-xl border border-rule-strong bg-paper-elevated p-6">
          <div>
            <label
              htmlFor="ops-target-event"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
            >
              Target Owned Event Scope
            </label>
            <select
              id="ops-target-event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="mt-1.5 w-full max-w-lg rounded-md border border-rule-strong bg-paper px-3.5 py-2 text-sm text-ink"
            >
              {managedEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.status})
                </option>
              ))}
            </select>
          </div>

          {activeTab === "volunteers" && (
            <div className="space-y-4 border-t border-rule pt-4">
              <form
                onSubmit={handleAssignVolunteer}
                className="grid gap-3 sm:grid-cols-3"
              >
                <input
                  type="text"
                  value={volunteerSub}
                  onChange={(e) => setVolunteerSub(e.target.value)}
                  placeholder="Student Subject ID (e.g. usr-volunteer-01)"
                  className="rounded-md border border-rule-strong bg-paper px-3 py-2 font-mono text-xs text-ink"
                />
                <input
                  type="text"
                  value={volunteerRole}
                  onChange={(e) => setVolunteerRole(e.target.value)}
                  placeholder="Duty Station (Gate-1 Marshal)"
                  className="rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-ink"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-rule-strong bg-steel px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Delegate Scanner Scope</span>
                </button>
              </form>

              <div className="space-y-2">
                {volunteers.length === 0 ? (
                  <p className="font-mono text-xs text-ink-muted">
                    No event-specific marshals assigned yet.
                  </p>
                ) : (
                  volunteers.map((v) => (
                    <div
                      key={`${v.studentSub}-${v.assignedAt}`}
                      className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3.5 py-2.5 text-xs"
                    >
                      <span className="font-mono font-semibold text-ink">
                        {v.studentSub}
                      </span>
                      <span className="text-ink-secondary">{v.roleTitle}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "roster" && (
            <div className="space-y-4 border-t border-rule pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Users className="h-4 w-4 text-terracotta" />
                  <span>
                    {attendees.length} Registrations (Phones Masked per Rule 8)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportRoster}
                  className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-steel px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Masked JSON</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-rule">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper font-mono text-[10px] uppercase text-ink-muted">
                    <tr>
                      <th className="px-3 py-2">Attendee</th>
                      <th className="px-3 py-2">Masked Phone</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Affiliation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule bg-paper-elevated">
                    {attendees.map((att) => (
                      <tr key={att.id}>
                        <td className="px-3 py-2 font-medium text-ink">
                          {att.userName}
                        </td>
                        <td className="px-3 py-2 font-mono text-ink-secondary">
                          {att.userPhone}
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold text-pine">
                          {att.status}
                        </td>
                        <td className="px-3 py-2 text-ink-secondary">
                          {att.isGuest
                            ? att.guestInstitution || "External Guest"
                            : "CHRIST Central"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "broadcast" && (
            <form
              onSubmit={handleBroadcast}
              className="space-y-3 border-t border-rule pt-4"
            >
              <label
                htmlFor="broadcast-input"
                className="block font-mono text-xs font-semibold uppercase tracking-wider text-ink"
              >
                BCC-Masked Attendee Advisory (Triggers Live SSE Banner)
              </label>
              <textarea
                id="broadcast-input"
                rows={3}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="e.g. Due to Hosur Road rain, check-in has shifted indoors to Block IV Seminar Hall..."
                className="w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2 text-sm text-ink"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-terracotta px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void"
              >
                <Megaphone className="h-4 w-4" />
                <span>Dispatch Masked Broadcast</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
