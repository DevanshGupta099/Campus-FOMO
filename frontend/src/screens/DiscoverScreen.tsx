import { useState } from "react";
import type { EventItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";
import type { PersonaConfig } from "../auth/persona.js";
import { HeroCanvas } from "../components/HeroCanvas.js";
import { EventCard3D } from "../components/EventCard3D.js";
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
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
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
    <div className="space-y-8 animate-fadeIn text-left">
      {/* 3D Infinite Stage Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-surface border border-white/10 p-6 sm:p-12 shadow-2xl min-h-[340px] flex flex-col justify-between">
        {/* Floating 3D React Three Fiber Canvas Background */}
        <HeroCanvas className="opacity-70 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-semibold border border-violet-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
            <span>CHRIST University Fest '26 • Live Campus Lineup</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            Campus FOMO —{" "}
            <span className="text-gradient-violet">
              Where Every Moment Counts
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
            <strong className="text-white">The Campus After Dark</strong>:
            Floating 3D beacons reflect real-time venue capacity. Snag your
            ticket before the Last Seat lock engages. Zero-trust verified door
            access.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate("/map")}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
            >
              <span>🗺️</span>
              <span>Explore 3D Campus Map</span>
            </button>
            <button
              onClick={() => onNavigate("/feed")}
              className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-white/90 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Live Social Buzz</span>
            </button>
          </div>
        </div>

        {/* Live System Specs Pill Bar */}
        <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono text-white/70">
          <div className="flex items-center gap-2">
            <span className="text-rose-400">🔥</span>
            <span>Atomic Seat Locks Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-mint-400">⚡</span>
            <span>Door Scan Latency: &lt;500ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">🛡️</span>
            <span>Zero-Trust Token Verifier</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⭐</span>
            <span>Live XP Drops Enabled</span>
          </div>
        </div>
      </section>

      {/* Sponsor Spotlight Lounge Card (Third Wave Coffee) */}
      <section
        onClick={() => onNavigate("/sponsor")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-surface border border-amber-500/30 hover:border-amber-500/60 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                CAMPUS SPONSOR
              </span>
              <span className="text-xs text-mint-400 font-semibold font-mono">
                FLAT 20% OFF
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Third Wave Coffee Campus Lounge (Central Block)
            </h3>
            <p className="text-xs text-white/60">
              Show your confirmed event ticket badge for student brew discounts
              & free lucky draw vouchers.
            </p>
          </div>
        </div>

        <button className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-void text-xs font-bold whitespace-nowrap shadow-md transition-colors flex-shrink-0">
          View Menu & Draw →
        </button>
      </section>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]"
                  : "bg-surface-2 hover:bg-surface-3 text-white/70 hover:text-white border border-white/5"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Fast Filtering Toolbar */}
      <div className="bg-surface p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search events, speakers, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2 border border-white/10 focus:border-violet-500 text-white text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-xs text-white/40">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs select-none w-full md:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
            <input
              type="checkbox"
              checked={externalOnly}
              onChange={(e) => setExternalOnly(e.target.checked)}
              className="rounded bg-surface-2 border-white/20 text-violet-600 focus:ring-0"
            />
            <span>External Open Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
            <input
              type="checkbox"
              checked={seatsOnly}
              onChange={(e) => setSeatsOnly(e.target.checked)}
              className="rounded bg-surface-2 border-white/20 text-violet-600 focus:ring-0"
            />
            <span>Available Seats Only</span>
          </label>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-white/40 font-mono">SORT:</span>
            <select
              aria-label="Sort events lineup"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-2 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:border-violet-500"
            >
              <option value="default">Lineup</option>
              <option value="fomo">Seats Remaining (FOMO)</option>
              <option value="soonest">Event Date (Soonest)</option>
              <option value="free">Fee (Free First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3D Bento Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <EventCard3D
            key={event.id}
            event={event}
            userRole={activePersona.role}
            onOpenDetails={(ev) => setDetailEvent(ev)}
            onRegister={(ev) => {
              setRegisteringEvent(ev);
              setRegisterStatus(null);
            }}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-surface/40 rounded-2xl border border-white/10 space-y-2">
          <p className="text-white/70 text-base font-semibold">
            No campus events match your active filters.
          </p>
          <p className="text-xs text-white/40">
            Try switching categories or clearing search keywords.
          </p>
        </div>
      )}

      {/* Quick Event Detail Modal */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block">
                  {detailEvent.category} • FEST '26
                </span>
                <h3 className="font-bold text-white text-xl">
                  {detailEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailEvent(null)}
                className="text-white/50 hover:text-white text-base p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              {detailEvent.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-4 bg-surface-2 rounded-2xl border border-white/5 text-xs font-mono">
              <div>
                <span className="text-white/40 block">VENUE</span>
                <span className="font-semibold text-white">
                  {detailEvent.venueName || "Central Campus"}
                </span>
              </div>
              <div>
                <span className="text-white/40 block">ADMISSION</span>
                <span className="font-semibold text-white">
                  {detailEvent.fee === 0 ? "Free Entry" : `₹${detailEvent.fee}`}
                </span>
              </div>
              <div>
                <span className="text-white/40 block">CONFIRMED ATTENDEES</span>
                <span className="font-semibold text-white">
                  {detailEvent.confirmedCount} / {detailEvent.capacity}
                </span>
              </div>
              <div>
                <span className="text-white/40 block">WAITLIST QUEUE</span>
                <span className="font-semibold text-white">
                  {detailEvent.waitlistCount} students
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDetailEvent(null)}
                className="px-4 py-2 rounded-xl bg-surface-2 text-white/70 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setRegisteringEvent(detailEvent);
                  setDetailEvent(null);
                }}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30"
              >
                Register For This Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Atomic Registration Modal Dialog */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md">
          <div className="bg-surface border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-violet-400 block uppercase">
                  CONFIRM PARTICIPATION
                </span>
                <h3 className="font-bold text-white text-base">
                  {registeringEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setRegisteringEvent(null)}
                className="text-white/50 hover:text-white text-base p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-white/70 mb-1 font-semibold">
                  Attendee Name
                </label>
                <input
                  type="text"
                  disabled
                  value={activePersona.name}
                  className="w-full bg-surface-2 border border-white/10 rounded-xl p-2.5 text-white/60 font-sans"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">
                  Account Email (Masked)
                </label>
                <input
                  type="text"
                  disabled
                  value={activePersona.email}
                  className="w-full bg-surface-2 border border-white/10 rounded-xl p-2.5 text-white/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">
                  Mobile Number (Required for Gate SMS alerts)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-surface-2 border border-white/15 rounded-xl p-2.5 text-white focus:border-violet-500 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">
                  Department / University
                </label>
                <input
                  type="text"
                  required
                  value={institutionInput}
                  onChange={(e) => setInstitutionInput(e.target.value)}
                  className="w-full bg-surface-2 border border-white/15 rounded-xl p-2.5 text-white focus:border-violet-500 outline-none"
                />
              </div>

              {registerStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono ${
                    registerStatus.includes("failed")
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-mint-500/20 text-mint-300 border border-mint-500/40"
                  }`}
                >
                  {registerStatus}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRegisteringEvent(null)}
                  className="px-4 py-2 rounded-xl text-white/70 hover:text-white bg-surface-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-600/30"
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
