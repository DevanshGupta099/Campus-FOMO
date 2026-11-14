import React from "react";

export const ChristCrestMark: React.FC<{
  className?: string;
  tone?: "dark" | "light";
}> = ({ className = "w-9 h-9", tone = "dark" }) => {
  const frameFill = tone === "dark" ? "#0C1017" : "#121823";
  const strokePrimary = "#F4F0E6";
  const strokeBrass = "#E2B45A";
  const strokeAccent = "#FF4D1C";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="8" fill={frameFill} />
      <rect
        x="3.5"
        y="3.5"
        width="41"
        height="41"
        rx="5.5"
        stroke={strokeBrass}
        strokeWidth="1.2"
        strokeOpacity="0.65"
      />
      <path
        d="M11.5 34V18L24 9.5L36.5 18V34"
        stroke={strokePrimary}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 34V21.5M24 34V18.5M30.5 34V21.5"
        stroke={strokeBrass}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 35H38"
        stroke={strokeAccent}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const GovernanceSealSvg: React.FC<{ className?: string }> = ({
  className = "w-12 h-12",
}) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <circle
      cx="32"
      cy="32"
      r="29"
      stroke="#E2B45A"
      strokeWidth="1.2"
      strokeDasharray="3 3"
    />
    <circle cx="32" cy="32" r="22" stroke="#FF4D1C" strokeWidth="1.4" />
    <path
      d="M23 32.5L29 38.5L41.5 26"
      stroke="#2EE59D"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ColonnadeMotifSvg: React.FC<{ className?: string }> = ({
  className = "w-full h-16",
}) => (
  <svg
    viewBox="0 0 640 72"
    fill="none"
    preserveAspectRatio="none"
    className={className}
    aria-hidden="true"
  >
    <line
      x1="0"
      y1="12"
      x2="640"
      y2="12"
      stroke="rgba(244,240,230,0.16)"
      strokeWidth="1"
    />
    <line
      x1="0"
      y1="60"
      x2="640"
      y2="60"
      stroke="rgba(244,240,230,0.16)"
      strokeWidth="1"
    />
    {[40, 120, 200, 280, 360, 440, 520, 600].map((x) => (
      <g key={x}>
        <line
          x1={x}
          y1="12"
          x2={x}
          y2="60"
          stroke="#E2B45A"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <circle cx={x} cy="36" r="2.5" fill="#FF4D1C" fillOpacity="0.85" />
      </g>
    ))}
  </svg>
);
