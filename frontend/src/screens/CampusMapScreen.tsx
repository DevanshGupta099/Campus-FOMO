import { useState } from "react";
import type { EventItem } from "../api/types.js";

interface CampusMapScreenProps {
  events: EventItem[];
  onNavigate: (path: string) => void;
  onSelectEvent?: (event: EventItem) => void;
}

interface VenueDetails {
  id: string;
  name: string;
  block: string;
  floor: string;
  capacity: number;
  occupancy: number;
  type:
    | "Auditorium"
    | "Computing Lab"
    | "Open Air"
    | "Sports Complex"
    | "Hospitality";
  icon: string;
  coordinates: { x: number; y: number }; // percentage on map
  description: string;
}

const VENUES: VenueDetails[] = [
  {
    id: "ven-auditorium",
    name: "Central Campus Auditorium",
    block: "Main Central Block",
    floor: "Level 1",
    capacity: 500,
    occupancy: 489,
    type: "Auditorium",
    icon: "🎭",
    coordinates: { x: 48, y: 38 },
    description:
      "Main university acoustic auditorium equipped with digital sound consoles and dual Christie 4K projectors.",
  },
  {
    id: "ven-lab-2",
    name: "Block 2 Advanced Computing Lab",
    block: "Block 2",
    floor: "3rd Floor",
    capacity: 70,
    occupancy: 58,
    type: "Computing Lab",
    icon: "💻",
    coordinates: { x: 72, y: 25 },
    description:
      "Gigabit fiber connected workstations with GPU clusters for hackathons and WebGL development sprints.",
  },
  {
    id: "ven-audi-2",
    name: "Audi Block 2",
    block: "Block 2",
    floor: "Ground Floor",
    capacity: 250,
    occupancy: 190,
    type: "Auditorium",
    icon: "🏛️",
    coordinates: { x: 75, y: 48 },
    description:
      "Mid-sized theatre suited for guest speaker keynotes, panel debates, and corporate masterclasses.",
  },
  {
    id: "ven-amphi",
    name: "Open-Air Amphitheatre",
    block: "North Quadrangle",
    floor: "Open Ground",
    capacity: 850,
    occupancy: 740,
    type: "Open Air",
    icon: "🎸",
    coordinates: { x: 28, y: 65 },
    description:
      "Tiered open-air performance arena for Dhwani battle of bands and western acoustic showcases.",
  },
  {
    id: "ven-twc",
    name: "Third Wave Coffee Campus Lounge",
    block: "Central Block Ground Floor",
    floor: "Ground Floor",
    capacity: 120,
    occupancy: 95,
    type: "Hospitality",
    icon: "☕",
    coordinates: { x: 42, y: 48 },
    description:
      "Official festival hospitality hub. Flat 20% discount on single-origin coffees with verified fest pass.",
  },
  {
    id: "ven-ground",
    name: "Campus Sports Complex & Turf Ground",
    block: "South Campus Field",
    floor: "Outdoor Field",
    capacity: 1200,
    occupancy: 620,
    type: "Sports Complex",
    icon: "⚽",
    coordinates: { x: 22, y: 28 },
    description:
      "Floodlit turf field for night futsal, basketball finals, and inter-collegiate athletics showdowns.",
  },
];

export function CampusMapScreen({ events, onNavigate }: CampusMapScreenProps) {
  const [selectedVenue, setSelectedVenue] = useState<VenueDetails>(VENUES[0]);

  const venueEvents = events.filter(
    (e) =>
      e.venueId === selectedVenue.id ||
      (selectedVenue.id === "ven-auditorium" && !e.venueId),
  );

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-mono font-semibold border border-violet-500/30">
          <span>🗺️ SPATIAL NAVIGATION</span>
          <span>•</span>
          <span>CHRIST UNIVERSITY CENTRAL CAMPUS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
          Interactive Campus Venue Explorer
        </h2>
        <p className="text-xs text-white/60 max-w-xl mt-1">
          Explore real-time venue status, capacity heatmaps, and scheduled
          events across CHRIST University's festival grounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Stylized Campus Map (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-[16/10] bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-card p-6 flex flex-col justify-between">
            {/* Grid pattern background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Stylized Campus Boundaries */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M10,20 L40,15 L85,20 L90,80 L50,90 L15,85 Z"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <path
                d="M40,15 L48,38 L72,25 L75,48 L42,48 Z"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="0.4"
              />
            </svg>

            {/* Top Bar on Map */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-void/80 border border-white/10 text-white/70 backdrop-blur-md">
                CHRIST BANGALORE CENTRAL CAMPUS
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-500/20 text-mint-300 border border-mint-500/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse"></span>
                <span>Live Heatmap Active</span>
              </span>
            </div>

            {/* Venue Pins on Map */}
            <div className="absolute inset-0 z-20 pointer-events-auto">
              {VENUES.map((venue) => {
                const isSelected = selectedVenue.id === venue.id;
                const percent = Math.round(
                  (venue.occupancy / venue.capacity) * 100,
                );
                const isHot = percent >= 85;

                return (
                  <button
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    style={{
                      left: `${venue.coordinates.x}%`,
                      top: `${venue.coordinates.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute flex flex-col items-center group transition-all cursor-pointer ${
                      isSelected ? "scale-125 z-30" : "hover:scale-110 z-10"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-lg border transition-all ${
                        isSelected
                          ? "bg-violet-600 border-white text-white shadow-glow-violet scale-110"
                          : isHot
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                            : "bg-surface-2 border-white/20 text-white/80 hover:border-violet-400"
                      }`}
                    >
                      {venue.icon}
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold mt-1 px-2 py-0.5 rounded-full border whitespace-nowrap backdrop-blur-md transition-all ${
                        isSelected
                          ? "bg-violet-600 text-white border-violet-400 shadow-md"
                          : "bg-void/80 text-white/70 border-white/10 group-hover:text-white"
                      }`}
                    >
                      {venue.name.split(" ")[0]} ({percent}%)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Legend on Map */}
            <div className="relative z-10 flex flex-wrap items-center gap-4 text-[11px] font-mono text-white/60 bg-void/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-mint-400"></span>
                <span>Normal (&lt;70%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Bustling (70-85%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Near Full (&gt;85%)</span>
              </span>
            </div>
          </div>

          {/* Quick Venue Filter Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {VENUES.map((venue) => {
              const isSelected = selectedVenue.id === venue.id;
              return (
                <button
                  key={venue.id}
                  onClick={() => setSelectedVenue(venue)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                      : "bg-surface-2 hover:bg-surface-3 text-white/70 hover:text-white border border-white/5"
                  }`}
                >
                  <span>{venue.icon}</span>
                  <span>{venue.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Venue Detail Sidebar (Right col) */}
        <div className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-7 shadow-card space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-white/10 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-600/20 text-violet-300 border border-violet-600/30">
                  {selectedVenue.type}
                </span>
                <span className="text-xs font-mono text-white/50">
                  {selectedVenue.floor}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                {selectedVenue.name}
              </h3>
              <p className="text-xs text-violet-400 font-mono">
                📍 {selectedVenue.block}
              </p>
              <p className="text-xs text-white/70 leading-relaxed pt-1">
                {selectedVenue.description}
              </p>
            </div>

            {/* Live Occupancy Gauge */}
            <div className="bg-surface-2 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/50">Current Headcount</span>
                <span className="text-white font-bold">
                  {selectedVenue.occupancy} / {selectedVenue.capacity}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-mint-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (selectedVenue.occupancy / selectedVenue.capacity) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>Door sensors online</span>
                <span>
                  {Math.round(
                    (selectedVenue.occupancy / selectedVenue.capacity) * 100,
                  )}
                  % capacity
                </span>
              </div>
            </div>

            {/* Scheduled Events at this venue */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white/60">
                Scheduled Festival Lineup at Venue:
              </h4>

              {venueEvents.length === 0 ? (
                <p className="text-xs text-white/40 italic p-3 bg-surface-2 rounded-xl">
                  No public fests currently scheduled for this slot. Open for
                  walk-ins & rehearsals.
                </p>
              ) : (
                <div className="space-y-2">
                  {venueEvents.map((e) => (
                    <div
                      key={e.id}
                      className="p-3 bg-surface-2 border border-white/5 rounded-xl space-y-1 hover:border-violet-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[180px]">
                          {e.title}
                        </span>
                        <span className="text-[10px] font-mono text-mint-400">
                          {e.capacity - e.confirmedCount} seats left
                        </span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        {new Date(e.startsAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("/")}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/30 transition-all"
          >
            Browse & Book All Campus Events →
          </button>
        </div>
      </div>
    </div>
  );
}
