import React, { useRef, useState, useEffect } from "react";
import type { EventItem } from "../api/types.js";

interface EventCard3DProps {
  event: EventItem;
  onRegister: (event: EventItem) => void;
  isRegistered?: boolean;
  userRole?: string;
  onOpenDetails?: (event: EventItem) => void;
}

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Technical: {
    bg: "rgba(124, 58, 237, 0.15)",
    text: "#a78bfa",
    border: "rgba(124, 58, 237, 0.3)",
  },
  Cultural: {
    bg: "rgba(244, 63, 94, 0.15)",
    text: "#fb7185",
    border: "rgba(244, 63, 94, 0.3)",
  },
  Sports: {
    bg: "rgba(16, 185, 129, 0.15)",
    text: "#34d399",
    border: "rgba(16, 185, 129, 0.3)",
  },
  Workshop: {
    bg: "rgba(14, 165, 233, 0.15)",
    text: "#38bdf8",
    border: "rgba(14, 165, 233, 0.3)",
  },
  Hackathon: {
    bg: "rgba(245, 158, 11, 0.15)",
    text: "#fbbf24",
    border: "rgba(245, 158, 11, 0.3)",
  },
  "Guest Lecture": {
    bg: "rgba(168, 85, 247, 0.15)",
    text: "#c084fc",
    border: "rgba(168, 85, 247, 0.3)",
  },
  Competition: {
    bg: "rgba(236, 72, 153, 0.15)",
    text: "#f472b6",
    border: "rgba(236, 72, 153, 0.3)",
  },
  Placement: {
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#4ade80",
    border: "rgba(34, 197, 94, 0.3)",
  },
};

export function EventCard3D({
  event,
  onRegister,
  isRegistered = false,
  onOpenDetails,
}: EventCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      try {
        setReducedMotion(
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        );
      } catch {
        setReducedMotion(true);
      }
    } else {
      setReducedMotion(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -10;
    const rY = ((x - centerX) / centerX) * 10;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const remaining = Math.max(0, event.capacity - event.confirmedCount);
  const percentFilled = Math.min(
    100,
    Math.round((event.confirmedCount / event.capacity) * 100),
  );
  const isFull = remaining === 0;
  const isHighFOMO = remaining > 0 && remaining <= 5;
  const catStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Technical;

  const startDate = new Date(event.startsAt);
  const dateFormatted = startDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
  const timeFormatted = startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      className="relative group h-full"
    >
      <div
        style={{
          transform: reducedMotion
            ? "none"
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? "scale3d(1.02, 1.02, 1.02)" : "scale3d(1, 1, 1)"}`,
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.2s ease"
            : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease",
        }}
        className={`h-full flex flex-col justify-between rounded-2xl bg-surface border transition-colors p-5 relative overflow-hidden ${
          isHighFOMO
            ? "border-rose-500/40 shadow-glow-rose hover:border-rose-500"
            : isHovered
              ? "border-violet-500/50 shadow-glow-violet"
              : "border-white/10 hover:border-white/20 shadow-card"
        }`}
      >
        {/* Subtle dynamic shine effect */}
        {isHovered && !reducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20 transition-opacity"
            style={{
              background: `radial-gradient(circle 280px at ${50 + rotateY * 3}% ${50 - rotateX * 3}%, rgba(255,255,255,0.4), transparent)`,
            }}
          />
        )}

        {/* Card Header: Category badge & FOMO status pill */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              style={{
                backgroundColor: catStyle.bg,
                color: catStyle.text,
                borderColor: catStyle.border,
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase font-mono"
            >
              {event.category}
            </span>

            {isHighFOMO && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <span>🔥</span>
                <span>{remaining} SEATS LEFT</span>
              </span>
            )}
            {isFull && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Waitlist #{event.waitlistCount + 1}
              </span>
            )}
            {!isHighFOMO && !isFull && (
              <span className="text-[11px] font-mono text-white/50">
                {event.fee === 0 ? "FREE ENTRY" : `₹${event.fee}`}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3
            onClick={() => onOpenDetails?.(event)}
            className="font-bold text-lg text-white group-hover:text-violet-300 transition-colors line-clamp-1 cursor-pointer tracking-tight"
          >
            {event.title}
          </h3>

          <p className="text-white/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Venue & Time Row */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-violet-400">📍</span>
              <span className="truncate font-medium">
                {event.venueName || "Central Campus"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-violet-400">🕒</span>
              <span>
                {dateFormatted} • {timeFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer: Live Capacity Meter & Quick Register Action */}
        <div className="mt-5 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-white/50">
              Capacity:{" "}
              <strong className="text-white">
                {event.confirmedCount}/{event.capacity}
              </strong>
            </span>
            <span
              className={
                isHighFOMO
                  ? "text-rose-400 font-bold"
                  : isFull
                    ? "text-amber-400"
                    : "text-mint-400"
              }
            >
              {percentFilled}% full
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHighFOMO
                  ? "bg-gradient-to-r from-rose-500 to-amber-500"
                  : isFull
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-violet-500 to-mint-400"
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Register Action CTA */}
          {isRegistered ? (
            <button
              disabled
              className="w-full py-2 rounded-xl bg-mint-500/20 border border-mint-500/40 text-mint-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default"
            >
              <span>✓</span>
              <span>Registered Pass Confirmed</span>
            </button>
          ) : isFull ? (
            <button
              onClick={() => onRegister(event)}
              className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>⏳</span>
              <span>Join Waitlist (Queue #{event.waitlistCount + 1})</span>
            </button>
          ) : (
            <button
              onClick={() => onRegister(event)}
              className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/30 hover:shadow-violet-600/50 transition-all active:scale-[0.98]"
            >
              <span>⚡</span>
              <span>Claim Spot ({remaining} left)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
