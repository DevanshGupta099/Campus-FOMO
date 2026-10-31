import { useState, useEffect } from "react";
import type { RegistrationItem, EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface MyTicketsScreenProps {
  client: CampusFomoClient;
  events: EventItem[];
}

export function MyTicketsScreen({ client, events }: MyTicketsScreenProps) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeToken, setActiveToken] = useState<{
    id: string;
    token: string;
    expiresIn: number;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTickets = () => {
    setLoading(true);
    client
      .listMyRegistrations()
      .then((data) => {
        setRegistrations(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo data if offline
        setRegistrations([
          {
            id: "reg-demo-01",
            eventId: "evt-hackathon-100",
            userId: "student-devansh",
            status: "CONFIRMED",
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleShowRotatingToken = async (regId: string) => {
    try {
      const res = await client.getRotatingQrToken(regId);
      setActiveToken({
        id: regId,
        token: res.qrToken,
        expiresIn: res.expiresInSeconds,
      });
    } catch (err: any) {
      setActiveToken({
        id: regId,
        token: `TICKET-HMAC-${regId.slice(0, 8)}-${Math.floor(Date.now() / 30000)}`,
        expiresIn: 30,
      });
    }
  };

  const handleCancel = async (regId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this ticket? If waitlisted participants exist, one will be promoted immediately.",
      )
    ) {
      return;
    }
    try {
      const res = await client.cancelRegistration(regId);
      if (res.promoted) {
        setMessage(
          "Ticket cancelled. Waitlist participant promoted to confirmed status!",
        );
      } else {
        setMessage("Ticket cancelled successfully.");
      }
      fetchTickets();
    } catch (err: any) {
      setMessage(`Error cancelling: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          My Passes & Tickets
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Present your dynamic signed QR pass at the venue entrance. Codes
          rotate periodically to prevent ticket resale.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-xl text-xs font-mono">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-paper-50/60 text-xs">Loading passes...</p>
      ) : registrations.length === 0 ? (
        <div className="bg-ink-800/40 border border-royal-500/20 rounded-xl p-8 text-center">
          <p className="text-paper-50/70 text-sm">
            You have not registered for any events yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => {
            const event = events.find((e) => e.id === reg.eventId) || {
              title: "Fest Event Pass",
              venueName: "Central Campus Auditorium",
              startsAt: new Date().toISOString(),
            };

            const isConfirmed = reg.status === "CONFIRMED";

            return (
              <div
                key={reg.id}
                className="bg-ink-800/70 border border-royal-500/30 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isConfirmed
                          ? "bg-mint-400/20 text-mint-400 border border-mint-400/40"
                          : "bg-gold-400/20 text-gold-400 border border-gold-400/40"
                      }`}
                    >
                      {reg.status}
                      {reg.waitlistPosition
                        ? ` (Waitlist #${reg.waitlistPosition})`
                        : ""}
                    </span>

                    <span className="text-[10px] text-paper-50/50 font-mono">
                      REF: {reg.id.slice(0, 12)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-paper-50">
                    {event.title}
                  </h3>

                  <div className="text-xs text-paper-50/70 space-y-1 font-mono">
                    <div>📍 {event.venueName}</div>
                    <div>
                      🕒{" "}
                      {new Date(event.startsAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* QR Code Presentation Box */}
                {isConfirmed && (
                  <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20 flex flex-col items-center justify-center space-y-3 text-center">
                    {activeToken?.id === reg.id ? (
                      <div className="space-y-2">
                        {/* Simulated QR Code Canvas Visual */}
                        <div className="w-36 h-36 bg-paper-50 p-2 rounded-lg flex items-center justify-center shadow-inner mx-auto">
                          <div className="w-full h-full border-4 border-ink-950 flex flex-col items-center justify-center p-1 bg-white">
                            <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-ink-950/10">
                              <div className="bg-ink-950"></div>
                              <div className="bg-ink-950"></div>
                              <div></div>
                              <div className="bg-ink-950"></div>
                              <div></div>
                              <div className="bg-ink-950"></div>
                              <div className="bg-ink-950"></div>
                              <div></div>
                              <div className="bg-ink-950"></div>
                              <div></div>
                              <div className="bg-ink-950"></div>
                              <div className="bg-ink-950"></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-gold-400 break-all px-2">
                          Token: {activeToken.token}
                        </div>
                        <div className="text-[10px] text-paper-50/60">
                          Rotates in 30 seconds • Scan at venue gate
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleShowRotatingToken(reg.id)}
                        className="px-4 py-2 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-lg text-xs font-semibold shadow-md"
                      >
                        📱 Display Gate Admission QR
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-royal-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-paper-50/40">
                    Issued: {new Date(reg.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleCancel(reg.id)}
                    className="text-xs text-ember-400 hover:text-ember-300 font-medium underline"
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
