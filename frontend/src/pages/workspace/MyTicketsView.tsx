import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CalendarPlus,
  Clock,
  Download,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Ticket,
  XCircle,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { RegistrationItem, RotatingQrResponse } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { QrMatrixCanvas } from "../../components/QrMatrixCanvas";
import { useWorkspace } from "../../components/WorkspaceShell";
import {
  downloadIcsInvite,
  formatInr,
  formatIstDate,
  formatIstTime,
} from "../../utils/format";

const ActiveQrWidget: React.FC<{ registrationId: string }> = ({
  registrationId,
}) => {
  const [qrState, setQrState] = useState<RotatingQrResponse | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  const fetchToken = useCallback(async () => {
    try {
      const res = await apiClient.getRotatingQrToken(registrationId);
      setQrState(res);
      setSecondsLeft(res.expiresInSeconds || 30);
    } catch {
      // Keep existing state cleanly
    }
  }, [registrationId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [fetchToken]);

  return (
    <div className="flex flex-col items-center rounded-lg border border-rule bg-paper p-3.5">
      <QrMatrixCanvas
        value={qrState?.qrToken || `pending-${registrationId}`}
        size={156}
      />
      <div className="mt-2.5 flex w-full items-center justify-between font-mono text-[10px] text-ink-secondary">
        <span className="inline-flex items-center gap-1 text-pine">
          <ShieldCheck className="h-3 w-3" />
          <span>HMAC-SHA256</span>
        </span>
        <button
          type="button"
          onClick={fetchToken}
          className="inline-flex items-center gap-1 font-semibold text-ink hover:text-terracotta"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>Rotates in {secondsLeft}s</span>
        </button>
      </div>
    </div>
  );
};

export const MyTicketsView: React.FC = () => {
  const { hasPerm } = useAuth();
  const { notify, streamRevision } = useWorkspace();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canCancel = hasPerm("registration:cancel:own");

  const loadRegistrations = useCallback(async () => {
    try {
      const list = await apiClient.listMyRegistrations();
      setRegistrations(list);
    } catch (err: unknown) {
      notify(
        "error",
        "Could Not Load Passes",
        err instanceof Error ? err.message : "Failed to fetch registrations.",
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations, streamRevision]);

  const handleCancel = async (reg: RegistrationItem) => {
    setBusyId(reg.id);
    try {
      const res = await apiClient.cancelRegistration(reg.id);
      notify(
        "success",
        "Booking Cancelled",
        res.promoted
          ? "Your seat was released and Waitlist #1 was atomically promoted."
          : "Your registration pass has been revoked.",
      );
      await loadRegistrations();
    } catch (err: unknown) {
      notify(
        "error",
        "Cancellation Failed",
        err instanceof Error ? err.message : "Could not cancel registration.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const downloadPrintableSvgPass = (reg: RegistrationItem) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="280" viewBox="0 0 680 280">
      <rect width="680" height="280" rx="16" fill="#0B1520"/>
      <rect x="16" y="16" width="648" height="248" rx="10" fill="none" stroke="#B8893A" stroke-width="1.5"/>
      <text x="40" y="58" fill="#D6A756" font-family="monospace" font-size="12" letter-spacing="2">CHRIST CENTRAL CAMPUS · HOSUR ROAD GATE-1 PASS</text>
      <text x="40" y="102" fill="#FCFBF7" font-family="Georgia, serif" font-size="26">${(reg.eventTitle || reg.eventId).replace(/[<>&]/g, "")}</text>
      <text x="40" y="138" fill="#EAE4D7" font-family="sans-serif" font-size="14">Venue: ${(reg.venueName || "Central Precinct").replace(/[<>&]/g, "")}</text>
      <text x="40" y="166" fill="#EAE4D7" font-family="monospace" font-size="13">Holder: ${reg.userName.replace(/[<>&]/g, "")} · Status: ${reg.status}</text>
      <text x="40" y="222" fill="#1D6B52" font-family="monospace" font-size="12">Pass ID: ${reg.id} · Present live rotating QR at Gate-1 or venue entrance</text>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reg.id}-christ-pass.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Gate Admission Credentials
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            My Passes &amp; Rotating QR Tickets
          </h1>
        </div>
        <Link
          to="/app/discover"
          className="rounded-md border border-rule-strong bg-steel px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
        >
          Browse More Events
        </Link>
      </div>

      {/* Gate-1 Hosur Road Entry Instructions (GU-07) */}
      <div className="flex items-start gap-3 rounded-xl border border-rule-strong bg-paper-elevated p-4 text-xs text-ink-secondary">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <div>
          <p className="font-semibold text-ink">
            CHRIST Central Campus Entry Protocol (Hosur Road, Gate-1 &amp;
            Gate-2)
          </p>
          <p className="mt-0.5">
            Present the live 30-second rotating HMAC QR code below along with
            your college Smart-ID. Static screenshots expire automatically every
            30 seconds to prevent pass duplication.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-52 animate-pulse rounded-xl border border-rule bg-paper-elevated" />
      ) : registrations.length === 0 ? (
        <div className="rounded-xl border border-rule bg-paper-elevated p-12 text-center">
          <Ticket className="mx-auto h-7 w-7 text-brass" />
          <h2 className="mt-3 font-serif text-2xl text-ink">
            No Active Campus Passes Yet
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            Reserve a seat in Discover Events to generate your cryptographically
            signed gate pass.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <article
              key={reg.id}
              className="grid gap-5 rounded-xl border border-rule-strong bg-paper-elevated p-5 shadow-editorial md:grid-cols-12"
            >
              <div className="flex flex-col justify-between md:col-span-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        reg.status === "CONFIRMED"
                          ? "bg-pine-soft text-pine"
                          : reg.status === "WAITLISTED"
                            ? "bg-ochre-soft text-ochre"
                            : "bg-paper-recessed text-ink-muted"
                      }`}
                    >
                      {reg.status === "WAITLISTED"
                        ? `WAITLISTED · #${reg.waitlistPosition ?? 1}`
                        : reg.status}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      Ref: {reg.id}
                    </span>
                    {reg.isGuest && (
                      <span className="rounded border border-pine/40 px-2 py-0.5 font-mono text-[10px] text-pine">
                        External Guest Gate-1 Pass
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2.5 font-serif text-2xl text-ink">
                    {reg.eventTitle || reg.eventId}
                  </h2>

                  {reg.lastUpdateBanner && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-md border border-ochre/40 bg-ochre-soft px-3 py-2 text-xs text-ink">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ochre" />
                      <span>{reg.lastUpdateBanner}</span>
                    </div>
                  )}

                  <div className="mt-3 grid gap-2 text-xs text-ink-secondary sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-terracotta" />
                      <span>
                        {formatIstDate(reg.startsAt)} ·{" "}
                        {formatIstTime(reg.startsAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-terracotta" />
                      <span>{reg.venueName || "CHRIST Central Precinct"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-rule pt-4">
                  <span className="mr-auto font-mono text-xs font-semibold text-ink">
                    {formatInr(reg.fee)}
                  </span>

                  {reg.startsAt && reg.endsAt && (
                    <button
                      type="button"
                      onClick={() =>
                        downloadIcsInvite({
                          id: reg.eventId,
                          title: reg.eventTitle || reg.eventId,
                          description: "CHRIST Central Campus Confirmed Pass",
                          venueName: reg.venueName || "CHRIST Central Campus",
                          startsAt: reg.startsAt!,
                          endsAt: reg.endsAt!,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-paper px-3 py-1.5 text-xs font-medium text-ink transition hover:border-obsidian"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>.ICS Invite</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => downloadPrintableSvgPass(reg)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-paper px-3 py-1.5 text-xs font-medium text-ink transition hover:border-obsidian"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save Pass SVG</span>
                  </button>

                  {canCancel && reg.status !== "CANCELLED" && (
                    <button
                      type="button"
                      disabled={busyId === reg.id}
                      onClick={() => handleCancel(reg)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-terracotta/50 bg-terracotta-soft px-3 py-1.5 text-xs font-semibold text-terracotta transition hover:bg-terracotta hover:text-void disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>
                        {busyId === reg.id ? "Releasing..." : "Cancel Booking"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Perforated QR Ticket Stub */}
              <div className="flex items-center justify-center border-t border-dashed border-rule-strong pt-4 md:col-span-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                {reg.status === "CONFIRMED" ? (
                  <ActiveQrWidget registrationId={reg.id} />
                ) : (
                  <div className="rounded-lg border border-rule bg-paper p-5 text-center font-mono text-xs text-ink-muted">
                    {reg.status === "WAITLISTED"
                      ? "QR unlocks automatically upon waitlist promotion"
                      : "Pass revoked"}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
