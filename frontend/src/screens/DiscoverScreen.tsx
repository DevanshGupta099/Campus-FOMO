import { useState } from "react";
import type { EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";
import type { PersonaConfig } from "../auth/persona.js";

interface DiscoverScreenProps {
  events: EventItem[];
  client: CampusFomoClient;
  activePersona: PersonaConfig;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}

export function DiscoverScreen({
  events,
  client,
  activePersona,
  onRefresh,
  onNavigate,
}: DiscoverScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [externalOnly, setExternalOnly] = useState(
    activePersona.role === "GUEST",
  );
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(
    null,
  );
  const [phoneInput, setPhoneInput] = useState("");
  const [institutionInput, setInstitutionInput] = useState(
    activePersona.institution,
  );
  const [registerStatus, setRegisterStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "All",
    "Workshop",
    "Hackathon",
    "Cultural",
    "Sports",
    "Competition",
    "Technical",
  ];

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== "All" && e.category !== selectedCategory) {
      return false;
    }
    if (externalOnly && !e.isExternalOpen) {
      return false;
    }
    if (
      searchQuery &&
      !e.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;
    setLoading(true);
    setRegisterStatus(null);

    try {
      const idempotencyKey = `reg-${activePersona.id}-${registeringEvent.id}-${Date.now()}`;
      const res = await client.registerEvent(
        registeringEvent.id,
        {
          phone: phoneInput || "+919876543210",
          institution: institutionInput || activePersona.institution,
        },
        idempotencyKey,
      );

      if (res.isWaitlisted) {
        setRegisterStatus(
          `Joined Waitlist! Position: #${res.registration.waitlistPosition}. You will be auto-promoted if a seat frees up.`,
        );
      } else {
        setRegisterStatus(
          "Confirmed! Your ticket has been issued successfully.",
        );
      }
      onRefresh();
    } catch (err: any) {
      setRegisterStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-900 via-royal-900/40 to-ink-900 border border-royal-500/30 p-6 md:p-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 text-gold-400 text-xs font-semibold border border-gold-400/30">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              CHRIST Fest 2026 Live
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-paper-50 font-display">
              The Campus After Dark
            </h1>
            <p className="text-royal-300 text-sm md:text-base font-body">
              Explore high-demand workshops, hackathons, and cultural battles.
              Seats are live and strictly atomic.
            </p>
          </div>

          {/* Third Wave Coffee Promo Pill */}
          <div
            onClick={() => onNavigate("/sponsor")}
            className="cursor-pointer bg-ink-800/80 hover:bg-ink-800 border border-gold-400/40 rounded-xl p-4 max-w-xs text-left shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-gold-400 text-xs font-bold mb-1">
              <span>☕ SPONSOR SPOTLIGHT</span>
              <span className="text-[10px] bg-royal-500/30 px-1.5 py-0.5 rounded text-paper-50 font-normal">
                20% OFF
              </span>
            </div>
            <p className="text-xs text-paper-50 font-semibold">
              Third Wave Coffee Campus Lounge
            </p>
            <p className="text-[11px] text-paper-50/70 mt-1">
              Show your verified registration badge for 20% student discount.
              Click to view menu & lucky draw.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-ink-800/50 p-4 rounded-xl border border-royal-500/20">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-royal-500 text-paper-50 border border-royal-400"
                  : "bg-ink-950/60 text-paper-50/70 hover:text-paper-50 border border-royal-500/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-paper-50/80 select-none">
            <input
              type="checkbox"
              checked={externalOnly}
              onChange={(e) => setExternalOnly(e.target.checked)}
              className="rounded bg-ink-950 border-royal-500/40 text-royal-500 focus:ring-0"
            />
            <span>External Open Only</span>
          </label>

          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-ink-950 border border-royal-500/30 text-paper-50 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-royal-500 w-full md:w-48"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const seatsLeft = event.capacity - event.confirmedCount;
          const isFull = seatsLeft <= 0;
          const isNearFull = seatsLeft > 0 && seatsLeft <= 3;

          return (
            <article
              key={event.id}
              className="bg-ink-800/60 rounded-xl border border-royal-500/20 hover:border-royal-500/50 p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-royal-500/10 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-royal-500/20 text-royal-300 border border-royal-500/30">
                    {event.category}
                  </span>

                  {/* Seat Availability Badge */}
                  {isFull ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-400/20 text-gold-400 border border-gold-400/40">
                      Waitlist ({event.waitlistCount} of {event.waitlistCap})
                    </span>
                  ) : isNearFull ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-ember-500/20 text-ember-300 border border-ember-500/40 animate-pulse">
                      🔥 Only {seatsLeft} seat{seatsLeft > 1 ? "s" : ""} left!
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-mint-400/20 text-mint-400 border border-mint-400/30">
                      {seatsLeft} / {event.capacity} seats available
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-paper-50 group-hover:text-gold-400 transition-colors">
                  {event.title}
                </h3>

                <p className="text-xs text-paper-50/70 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-1 text-xs text-paper-50/60 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span className="truncate">
                      {event.venueName || "Campus Venue"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🕒</span>
                    <span>
                      {new Date(event.startsAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-royal-500/10 text-[11px]">
                  {event.isExternalOpen && (
                    <span className="text-mint-400">🌐 Open to External</span>
                  )}
                  <span className="text-paper-50/50">•</span>
                  <span className="text-paper-50/80 font-medium">
                    {event.fee === 0 ? "Free Entry" : `₹${event.fee}`}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3">
                <button
                  onClick={() => {
                    setRegisteringEvent(event);
                    setRegisterStatus(null);
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
                    isFull
                      ? "bg-gold-400/20 hover:bg-gold-400 text-gold-400 hover:text-ink-950 border border-gold-400/40"
                      : "bg-royal-500 hover:bg-royal-400 text-paper-50 shadow-md shadow-royal-500/20"
                  }`}
                >
                  {isFull ? "Join Waitlist" : "Register Now"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-ink-800/30 rounded-xl border border-royal-500/20">
          <p className="text-paper-50/60 text-sm">
            No events found matching your criteria.
          </p>
        </div>
      )}

      {/* Registration Modal */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <div className="bg-ink-900 border border-royal-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-royal-500/20 pb-3">
              <h3 className="font-bold text-paper-50 text-base">
                Register: {registeringEvent.title}
              </h3>
              <button
                onClick={() => setRegisteringEvent(null)}
                className="text-paper-50/50 hover:text-paper-50 text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-3 text-xs text-left"
            >
              <div>
                <label className="block text-paper-50/70 mb-1">
                  Attendee Name
                </label>
                <input
                  type="text"
                  disabled
                  value={activePersona.name}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2 text-paper-50/60"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">
                  Email (Masked for privacy)
                </label>
                <input
                  type="text"
                  disabled
                  value={activePersona.email}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2 text-paper-50/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">
                  Phone Number (Required for SMS pass alerts)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2 text-paper-50 focus:border-royal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1">
                  Department / College Institution
                </label>
                <input
                  type="text"
                  required
                  value={institutionInput}
                  onChange={(e) => setInstitutionInput(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-lg p-2 text-paper-50 focus:border-royal-500"
                />
              </div>

              {registerStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-mono ${
                    registerStatus.includes("Error")
                      ? "bg-ember-500/20 text-ember-300 border border-ember-500/40"
                      : "bg-mint-400/20 text-mint-300 border border-mint-400/40"
                  }`}
                >
                  {registerStatus}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisteringEvent(null)}
                  className="px-3 py-1.5 rounded-lg text-paper-50/70 hover:text-paper-50 bg-ink-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-royal-500 hover:bg-royal-400 text-paper-50 font-semibold"
                >
                  {loading ? "Confirming..." : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
