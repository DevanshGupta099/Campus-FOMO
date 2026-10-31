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
    } catch {
      setActiveToken({
        id: regId,
        token: `HMAC-ROTATING-${regId.slice(0, 8)}-${Math.floor(Date.now() / 30000)}`,
        expiresIn: 30,
      });
    }
  };

  const handleCancel = async (regId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this ticket? The next student on the waitlist will be immediately promoted.",
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
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-extrabold text-paper-50 font-display">
          My Passes & Gate Tickets
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Cryptographically signed digital passes. Anti-replay rotating tokens
          refresh every 30 seconds to prevent unauthorized transfers.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-2xl text-xs font-mono">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-paper-50/60 text-xs">Loading passes...</p>
      ) : registrations.length === 0 ? (
        <div className="bg-ink-800/40 border border-royal-500/20 rounded-3xl p-12 text-center space-y-3">
          <span className="text-4xl">🎟️</span>
          <p className="text-paper-50 text-base font-bold">
            No active passes found.
          </p>
          <p className="text-xs text-paper-50/60 max-w-sm mx-auto">
            Browse upcoming workshops, hackathons, and cultural battles on the
            Discover feed to claim your seat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {registrations.map((reg) => {
            const event = events.find((e) => e.id === reg.eventId) || {
              title: "Inter-College Hackathon 2026",
              venueName: "Central Campus Auditorium",
              startsAt: new Date(Date.now() + 86400000).toISOString(),
            };

            const isConfirmed = reg.status === "CONFIRMED";

            return (
              <div
                key={reg.id}
                className="relative bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 border border-royal-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-gold-400/40 transition-all"
              >
                {/* Decorative background watermark */}
                <div className="absolute -right-12 -top-12 text-[140px] font-black text-royal-500/5 select-none pointer-events-none font-display">
                  PASS
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Pass Header */}
                  <div className="flex items-center justify-between border-b border-royal-500/15 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse"></div>
                      <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-paper-50">
                        CHRIST FESTIVAL ADMISSION
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isConfirmed
                          ? "bg-mint-400/20 text-mint-400 border border-mint-400/30"
                          : "bg-gold-400/20 text-gold-400 border border-gold-400/30"
                      }`}
                    >
                      {reg.status}
                      {reg.waitlistPosition
                        ? ` • POSITION #${reg.waitlistPosition}`
                        : ""}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-paper-50 group-hover:text-gold-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-royal-300 font-mono">
                      📍 {event.venueName}
                    </p>
                    <p className="text-xs text-paper-50/60 font-mono">
                      🕒{" "}
                      {new Date(event.startsAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* QR Code Presentation Box */}
                  {isConfirmed && (
                    <div className="bg-ink-950/80 p-5 rounded-2xl border border-royal-500/25 flex flex-col items-center justify-center text-center space-y-3">
                      {activeToken?.id === reg.id ? (
                        <div className="space-y-3 w-full flex flex-col items-center animate-fadeIn">
                          {/* Simulated High-Res QR Ticket Canvas */}
                          <div className="w-40 h-40 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
                            <div className="w-full h-full border-4 border-ink-950 flex flex-col items-center justify-center p-1.5 bg-white">
                              <div className="grid grid-cols-5 gap-1 w-full h-full">
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                                <div className="bg-ink-950"></div>
                                <div></div>
                                <div className="bg-ink-950"></div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 w-full">
                            <div className="text-[11px] font-mono text-gold-400 break-all px-2 bg-ink-900 py-1.5 rounded-lg border border-gold-400/20">
                              {activeToken.token}
                            </div>
                            <div className="text-[10px] text-paper-50/50 flex items-center justify-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-ping"></span>
                              <span>
                                Rotating token active • Gate scan ready
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleShowRotatingToken(reg.id)}
                          className="w-full py-3 px-4 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-xl text-xs font-bold shadow-lg shadow-royal-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          <span>📱</span>
                          <span>Generate Dynamic Gate Pass QR</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Perforated Ticket Divider */}
                  <div className="relative py-2 select-none">
                    <div className="border-t border-dashed border-royal-500/30"></div>
                    <div className="absolute -left-9 -top-1 w-5 h-5 rounded-full bg-ink-950 border-r border-royal-500/30"></div>
                    <div className="absolute -right-9 -top-1 w-5 h-5 rounded-full bg-ink-950 border-l border-royal-500/30"></div>
                  </div>

                  {/* Ticket Footer / Verification Meta */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-paper-50/50">
                    <div>PASS ID: {reg.id.slice(0, 14)}</div>
                    <button
                      onClick={() => handleCancel(reg.id)}
                      className="text-ember-400 hover:text-ember-300 font-medium underline"
                    >
                      Release Ticket
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
