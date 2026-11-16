import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Shield,
  Ticket,
  Users,
  X,
} from "lucide-react";
import type { EventItem } from "../api/types";
import { apiClient } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
  computeSeatState,
  downloadIcsInvite,
  formatInr,
  formatIstDate,
  formatIstDateTime,
  formatIstTime,
} from "../utils/format";

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onBooked?: (message: string, isWaitlisted: boolean) => void;
}

const MODAL_COVERS: Record<string, string> = {
  Hackathon: "/media/fest-labyrinth-hackathon.jpg",
  Technical: "/media/fest-magnovite-robotics.jpg",
  Workshop: "/media/campus-skyview-atrium.jpg",
  Cultural: "/media/fest-blossoms-stage.jpg",
  Competition: "/media/auditorium-keynote-conclave.jpg",
  "Guest Lecture": "/media/auditorium-keynote-conclave.jpg",
  Sports: "/media/southgate-floodlit-futsal.jpg",
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onBooked,
}) => {
  const { isAuthenticated, user, hasPerm } = useAuth();
  const navigate = useNavigate();
  const [phoneInput, setPhoneInput] = useState("");
  const [institutionInput, setInstitutionInput] = useState(
    user?.institution || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookedState, setBookedState] = useState<{
    regId: string;
    isWaitlisted: boolean;
    waitlistPos?: number;
  } | null>(null);

  if (!event) return null;

  const seat = computeSeatState(event);
  const canBook = hasPerm("registration:create");

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onClose();
      navigate(`/login?redirect=/app/discover&event=${event.id}`);
      return;
    }

    if (phoneInput && !/^\+91[6-9]\d{9}$/.test(phoneInput.trim())) {
      setErrorMsg("Enter a valid E.164 Indian mobile number (+91XXXXXXXXXX)");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.registerForEvent(event.id, {
        phone: phoneInput.trim() || undefined,
        institution: institutionInput.trim() || undefined,
      });
      setBookedState({
        regId: res.registration.id,
        isWaitlisted: res.isWaitlisted,
        waitlistPos: res.registration.waitlistPosition,
      });
      onBooked?.(
        res.isWaitlisted
          ? `Added to atomic waitlist (#${res.registration.waitlistPosition}) for ${event.title}`
          : `Confirmed pass issued for ${event.title}`,
        res.isWaitlisted,
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not complete registration",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
    >
      <div className="hud-frame glass-console max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-rule-strong shadow-anchor">
        {/* Top Cinema Banner + Dark Header */}
        <div className="relative overflow-hidden border-b border-obsidian-rule bg-obsidian px-6 py-6 text-bone">
          <img
            src={
              MODAL_COVERS[event.category] || "/media/hero-central-campus.jpg"
            }
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/65"
          />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
                <span className="rounded bg-vermilion px-2 py-0.5 font-bold text-void">
                  {event.category}
                </span>
                <span className="text-gold">{event.department}</span>
                {event.isExternalOpen ? (
                  <span className="rounded border border-phosphor/50 bg-phosphor-soft px-2 py-0.5 text-phosphor">
                    External-Open
                  </span>
                ) : (
                  <span className="rounded border border-obsidian-rule px-2 py-0.5 text-paper-deep">
                    CHRIST Internal
                  </span>
                )}
              </div>
              <h2
                id="event-modal-title"
                className="mt-2.5 font-display text-2xl font-bold leading-tight text-bone sm:text-3xl"
              >
                {event.title}
              </h2>
              {event.clubName && (
                <p className="mt-1 font-mono text-xs text-paper-deep/80">
                  Hosted by {event.clubName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close event details"
              className="rounded-md border border-obsidian-rule p-1.5 text-paper-deep transition hover:bg-obsidian-surface hover:text-bone"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* Amber Broadcast / Monsoon Contingency Banner (GU-08) */}
          {event.lastUpdateBanner && (
            <div className="flex items-start gap-2.5 rounded-lg border border-ochre/40 bg-ochre-soft px-4 py-3 text-xs text-bone">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
              <div>
                <span className="font-mono font-semibold uppercase tracking-wider text-ochre">
                  Official Schedule Advisory:{" "}
                </span>
                <span>{event.lastUpdateBanner}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-sm leading-relaxed text-ink-secondary">
            {event.description}
          </p>

          {/* 7 Binding Event Attributes in Asia/Kolkata IST (GU-04) */}
          <div className="grid gap-3 rounded-lg border border-rule bg-paper p-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Date (IST)
                </div>
                <div className="text-xs font-semibold text-bone">
                  {formatIstDate(event.startsAt)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Schedule Window
                </div>
                <div className="text-xs font-semibold text-bone">
                  {formatIstTime(event.startsAt)} –{" "}
                  {formatIstTime(event.endsAt)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Central Campus Venue
                </div>
                <div className="text-xs font-semibold text-bone">
                  {event.venueName}
                </div>
                {event.indoorBackupVenueName && (
                  <div className="font-mono text-[10px] text-phosphor">
                    Backup: {event.indoorBackupVenueName}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Registration Fee
                </div>
                <div className="text-xs font-semibold text-bone">
                  {formatInr(event.fee)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Eligibility
                </div>
                <div className="text-xs font-medium text-bone">
                  {event.eligibility ||
                    (event.isExternalOpen
                      ? "Open to CHRIST & external college students"
                      : "CHRIST University Central Campus members")}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Registration Closes
                </div>
                <div className="text-xs font-medium text-bone">
                  {formatIstDateTime(
                    event.registrationDeadline || event.startsAt,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Seat Availability Bar (GU-10) */}
          <div className="rounded-lg border border-rule bg-paper-elevated p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider text-ink-secondary">
                Live Seat Allocation
              </span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  seat.state === "CRITICAL"
                    ? "text-vermilion"
                    : seat.state === "WAITLIST"
                      ? "text-ochre"
                      : seat.state === "FULL"
                        ? "text-ink-muted"
                        : "text-phosphor"
                }`}
              >
                {seat.label}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper-recessed">
              <div
                style={{ width: `${seat.fillPercent}%` }}
                className={`h-full transition-all ${
                  seat.state === "CRITICAL"
                    ? "bg-vermilion"
                    : seat.state === "WAITLIST"
                      ? "bg-ochre"
                      : "bg-phosphor"
                }`}
              />
            </div>
          </div>

          {/* Confirmation Receipt State (GU-06) */}
          {bookedState ? (
            <div className="rounded-lg border border-phosphor/40 bg-phosphor-soft p-4 text-bone">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-phosphor" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-bone">
                    {bookedState.isWaitlisted
                      ? `Waitlist Position #${bookedState.waitlistPos} Confirmed`
                      : "Seat Atomically Reserved & Pass Signed"}
                  </h4>
                  <p className="mt-1 font-mono text-xs text-ink-secondary">
                    Pass Reference: {bookedState.regId}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/app/my-tickets");
                      }}
                      className="rounded-md bg-vermilion px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
                    >
                      Open Rotating QR Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadIcsInvite(event)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-paper-elevated px-3 py-2 text-xs font-semibold text-bone"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>Download .ICS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReserve} className="space-y-3.5">
              {isAuthenticated && user && (
                <div className="grid gap-3 rounded-lg border border-rule bg-paper p-3.5 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                      Account Holder (Masked PII)
                    </label>
                    <p className="mt-1 font-mono text-xs text-bone">
                      {user.name} · {user.phone || "+91******00"}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="reg-phone-opt"
                      className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                    >
                      SMS Alert Number (Optional E.164)
                    </label>
                    <input
                      id="reg-phone-opt"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+9198XXXXXXXX"
                      className="mt-1 w-full rounded border border-rule-strong bg-paper-elevated px-2.5 py-1.5 font-mono text-xs text-bone"
                    />
                  </div>
                  {!hasPerm("gamification:read:own") && (
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="reg-inst-input"
                        className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                      >
                        Visiting College / Institution
                      </label>
                      <input
                        id="reg-inst-input"
                        type="text"
                        value={institutionInput}
                        onChange={(e) => setInstitutionInput(e.target.value)}
                        placeholder="e.g. St. Joseph's University, Bengaluru"
                        className="mt-1 w-full rounded border border-rule-strong bg-paper-elevated px-2.5 py-1.5 text-xs text-bone"
                      />
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <p
                  role="alert"
                  className="rounded-md border border-vermilion/40 bg-vermilion-soft px-3 py-2 text-xs font-medium text-vermilion"
                >
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => downloadIcsInvite(event)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong px-3.5 py-2.5 text-xs font-semibold text-bone transition hover:border-bone"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                {!isAuthenticated ? (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-vermilion px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void shadow-glow transition hover:bg-vermilion-hover"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>Sign In to Reserve Pass</span>
                  </button>
                ) : canBook ? (
                  <button
                    type="submit"
                    disabled={submitting || seat.state === "FULL"}
                    className="inline-flex items-center gap-2 rounded-md bg-vermilion px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void shadow-glow transition hover:bg-vermilion-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>
                      {submitting
                        ? "Locking Seat..."
                        : seat.state === "WAITLIST"
                          ? "Join Atomic Waitlist"
                          : seat.state === "FULL"
                            ? "Capacity Exhausted"
                            : "Confirm Seat & Issue QR Pass"}
                    </span>
                  </button>
                ) : (
                  <span className="font-mono text-xs text-ink-muted">
                    Current governance profile is view-only for attendee booking
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
