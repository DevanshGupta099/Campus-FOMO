import { useState } from "react";
import type { EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";
import type { PersonaConfig } from "../auth/persona.js";
import { CampusNightCanvas } from "../components/CampusNightCanvas.js";
import { sound } from "../utils/audio.js";

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
  const [seatsOnly, setSeatsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "fomo" | "soonest" | "free">(
    "default",
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
    { name: "All", icon: "🌌" },
    { name: "Hackathon", icon: "💻" },
    { name: "Workshop", icon: "🛠️" },
    { name: "Cultural", icon: "🎭" },
    { name: "Sports", icon: "⚽" },
    { name: "Competition", icon: "🏆" },
    { name: "Technical", icon: "⚡" },
  ];

  const filteredEvents = events.filter((e) => {
    if (e.status && e.status !== "PUBLISHED") {
      return false;
    }
    if (selectedCategory !== "All" && e.category !== selectedCategory) {
      return false;
    }
    if (externalOnly && !e.isExternalOpen) {
      return false;
    }
    if (seatsOnly && e.confirmedCount >= e.capacity) {
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

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "fomo") {
      const remA = a.capacity - a.confirmedCount;
      const remB = b.capacity - b.confirmedCount;
      return remA - remB;
    }
    if (sortBy === "soonest") {
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    }
    if (sortBy === "free") {
      return a.fee - b.fee;
    }
    return 0;
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
        sound.playAlert();
        setRegisterStatus(
          `Joined Waitlist! Position: #${res.registration.waitlistPosition}. You will be auto-promoted when a seat frees up.`,
        );
      } else {
        sound.playSuccess();
        setRegisterStatus("Confirmed! Your admission pass has been issued.");
      }
      onRefresh();
    } catch (err: any) {
      setRegisterStatus(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Signature Hero: "The Campus After Dark" with Interactive Starfield Canvas */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-royal-950/70 to-ink-950 border border-royal-500/30 p-6 sm:p-10 text-left shadow-2xl">
        {/* Interactive Canvas Starfield Constellation */}
        <CampusNightCanvas fomoIntensity={1.2} />

        <div className="relative z-10 max-w-2xl space-y-3 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold border border-royal-500/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
            <span>CHRIST University Fest • Live Campus Feed</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-paper-50 via-gold-400 to-royal-300 font-display leading-[1.1]">
            The Campus After Dark
          </h1>

          <p className="text-royal-300 text-xs sm:text-sm font-body max-w-xl leading-relaxed">
            Floating lanterns reflect live venue capacities. Reserve your ticket
            before the Last Seat lock engages. Zero-trust verified door entry.
          </p>
        </div>

        {/* Floating Quick Metric Pills */}
        <div className="relative z-10 mt-6 pt-4 border-t border-royal-500/20 flex flex-wrap items-center gap-4 text-xs font-mono text-paper-50/80">
          <div className="flex items-center gap-1.5">
            <span className="text-gold-400">🔥</span>
            <span>Atomic Seat Locks Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-mint-400">⚡</span>
            <span>Door Scan Latency: &lt;500ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-royal-300">🎟️</span>
            <span>Anti-Scalping Dynamic Tokens</span>
          </div>
        </div>
      </section>

      {/* Sponsor Spotlight Lounge Card (Third Wave Coffee) */}
      <section
        onClick={() => onNavigate("/sponsor")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900 border border-gold-400/40 p-5 shadow-xl transition-all hover:border-gold-400 hover:shadow-gold-400/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-400/20 text-gold-400">
                CAMPUS SPONSOR
              </span>
              <span className="text-xs text-mint-400 font-semibold font-mono">
                FLAT 20% OFF
              </span>
            </div>
            <h3 className="text-base font-bold text-paper-50 group-hover:text-gold-400 transition-colors">
              Third Wave Coffee Campus Lounge (Central Block)
            </h3>
            <p className="text-xs text-paper-50/70">
              Present your confirmed event ticket badge for student brew
              discounts & free lucky draw vouchers.
            </p>
          </div>
        </div>

        <button className="px-4 py-2 rounded-xl bg-gold-400 group-hover:bg-gold-300 text-ink-950 text-xs font-black whitespace-nowrap shadow-md transition-colors">
          View Menu & Draw →
        </button>
      </section>

      {/* Category District Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-royal-500 text-paper-50 shadow-lg shadow-royal-500/30 border border-royal-400 scale-[1.02]"
                  : "bg-ink-800/70 hover:bg-ink-800 text-paper-50/70 hover:text-paper-50 border border-royal-500/20"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Fast Filtering Toolbar */}
      <div className="bg-ink-900/60 p-4 rounded-2xl border border-royal-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by workshop, speaker, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink-950 border border-royal-500/30 focus:border-royal-400 text-paper-50 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-royal-400 font-sans"
          />
          <span className="absolute left-3 top-2.5 text-xs text-paper-50/40">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-paper-50/40 hover:text-paper-50"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs select-none w-full md:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-paper-50/80 hover:text-paper-50">
            <input
              type="checkbox"
              checked={externalOnly}
              onChange={(e) => setExternalOnly(e.target.checked)}
              className="rounded bg-ink-950 border-royal-500/40 text-royal-500 focus:ring-0"
            />
            <span>External Open Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-paper-50/80 hover:text-paper-50">
            <input
              type="checkbox"
              checked={seatsOnly}
              onChange={(e) => setSeatsOnly(e.target.checked)}
              className="rounded bg-ink-950 border-royal-500/40 text-royal-500 focus:ring-0"
            />
            <span>Available Seats Only</span>
          </label>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-paper-50/50 font-mono">
              SORT:
            </span>
            <select
              aria-label="Sort events lineup"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-ink-950 border border-royal-500/30 text-paper-50 text-xs rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:border-royal-400"
            >
              <option value="default">Lineup</option>
              <option value="fomo">Seats Remaining (FOMO)</option>
              <option value="soonest">Event Date (Soonest)</option>
              <option value="free">Fee (Free First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {sortedEvents.map((event) => {
          const seatsLeft = event.capacity - event.confirmedCount;
          const isFull = seatsLeft <= 0;
          const isLastSeat = seatsLeft === 1;
          const isUrgent = seatsLeft > 0 && seatsLeft <= 3;
          const percentFilled = Math.min(
            100,
            Math.round((event.confirmedCount / event.capacity) * 100),
          );

          return (
            <article
              key={event.id}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between border ${
                isLastSeat
                  ? "bg-gradient-to-b from-ink-800 to-ink-900 border-ember-500/60 shadow-xl shadow-ember-500/10 glow-ember"
                  : isUrgent
                    ? "bg-gradient-to-b from-ink-800 to-ink-900 border-gold-400/50 shadow-xl shadow-gold-400/10 glow-gold"
                    : "bg-ink-800/70 hover:bg-ink-800 border-royal-500/25 hover:border-royal-400/60 shadow-xl hover:shadow-royal-500/10"
              }`}
            >
              {/* Top Accent Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-royal-500/20 text-royal-300 border border-royal-500/40">
                    {event.category}
                  </span>

                  {/* Seat Meter Badge */}
                  {isLastSeat ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-ember-500 text-ink-950 animate-pulse">
                      ⚡ THE LAST SEAT!
                    </span>
                  ) : isUrgent ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-400 border border-gold-400/40">
                      🔥 {seatsLeft} seats left
                    </span>
                  ) : isFull ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-ink-950 text-gold-400 border border-gold-400/30 font-mono">
                      Waitlist ({event.waitlistCount}/{event.waitlistCap})
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mint-400/15 text-mint-400 border border-mint-400/30 font-mono">
                      {seatsLeft} available
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-paper-50 leading-snug group-hover:text-gold-400 transition-colors">
                  {event.title}
                </h3>

                <p className="text-xs text-paper-50/70 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                {/* Venue & Time Meta */}
                <div className="space-y-1.5 text-xs text-paper-50/70 font-mono bg-ink-950/60 p-3 rounded-xl border border-royal-500/10">
                  <div className="flex items-center gap-2">
                    <span className="text-paper-50/40">📍</span>
                    <span className="truncate">
                      {event.venueName || "Main Campus Auditorium"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-paper-50/40">🕒</span>
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

                {/* Live Capacity Visual Track Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-paper-50/60">
                    <span>Capacity Occupied: {percentFilled}%</span>
                    <span>
                      {event.confirmedCount}/{event.capacity} seats
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden p-[1px] border border-royal-500/20">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull
                          ? "bg-gold-400"
                          : isUrgent
                            ? "bg-ember-500"
                            : "bg-mint-400"
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-royal-500/10 text-xs">
                  <div>
                    {event.isExternalOpen ? (
                      <span className="text-mint-400 font-semibold text-[11px]">
                        🌐 Open to External
                      </span>
                    ) : (
                      <span className="text-paper-50/40 text-[11px]">
                        🔒 CHRIST Students Only
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-paper-50 font-mono text-xs">
                    {event.fee === 0 ? "FREE" : `₹${event.fee}`}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-2">
                <button
                  onClick={() => {
                    setRegisteringEvent(event);
                    setRegisterStatus(null);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                    isLastSeat
                      ? "bg-ember-500 hover:bg-ember-400 text-ink-950 shadow-ember-500/20"
                      : isFull
                        ? "bg-gold-400/20 hover:bg-gold-400 text-gold-400 hover:text-ink-950 border border-gold-400/40"
                        : "bg-royal-500 hover:bg-royal-400 text-paper-50 shadow-royal-500/25"
                  }`}
                >
                  {isLastSeat
                    ? "⚡ Claim The Last Seat"
                    : isFull
                      ? "Join Automated Waitlist"
                      : "Register Now (Instant Pass)"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-ink-900/40 rounded-2xl border border-royal-500/20 space-y-2">
          <p className="text-paper-50/70 text-base font-semibold">
            No campus events match your active filters.
          </p>
          <p className="text-xs text-paper-50/40">
            Try switching categories or clearing search keywords.
          </p>
        </div>
      )}

      {/* Registration Modal Dialog */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <div className="bg-ink-900 border border-royal-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-royal-500/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-royal-300 block uppercase">
                  CONFIRM PARTICIPATION
                </span>
                <h3 className="font-bold text-paper-50 text-base">
                  {registeringEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setRegisteringEvent(null)}
                className="text-paper-50/50 hover:text-paper-50 text-base p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Attendee Name
                </label>
                <input
                  type="text"
                  disabled
                  value={activePersona.name}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50/60 font-sans"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Account Email (Masked)
                </label>
                <input
                  type="text"
                  disabled
                  value={activePersona.email}
                  className="w-full bg-ink-950 border border-royal-500/30 rounded-xl p-2.5 text-paper-50/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Mobile Number (Required for Gate SMS alerts)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/40 rounded-xl p-2.5 text-paper-50 focus:border-royal-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-paper-50/70 mb-1 font-semibold">
                  Department / University
                </label>
                <input
                  type="text"
                  required
                  value={institutionInput}
                  onChange={(e) => setInstitutionInput(e.target.value)}
                  className="w-full bg-ink-950 border border-royal-500/40 rounded-xl p-2.5 text-paper-50 focus:border-royal-400"
                />
              </div>

              {registerStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono ${
                    registerStatus.includes("failed")
                      ? "bg-ember-500/20 text-ember-300 border border-ember-500/40"
                      : "bg-mint-400/20 text-mint-300 border border-mint-400/40"
                  }`}
                >
                  {registerStatus}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRegisteringEvent(null)}
                  className="px-4 py-2 rounded-xl text-paper-50/70 hover:text-paper-50 bg-ink-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-royal-500 hover:bg-royal-400 text-paper-50 font-bold shadow-lg shadow-royal-500/30"
                >
                  {loading ? "Confirming Seat..." : "Lock In Admission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
