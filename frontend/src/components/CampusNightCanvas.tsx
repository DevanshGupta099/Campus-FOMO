import { useEffect, useRef, useState } from "react";

interface CampusNightCanvasProps {
  fomoIntensity?: number;
}

interface VenueNode {
  name: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  pulsePhase: number;
  category: string;
  seatsLeft: number;
}

export function CampusNightCanvas({
  fomoIntensity = 1.0,
}: CampusNightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Capability detection: check prefers-reduced-motion safely
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    try {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mediaQuery.matches);

      const handleMotionChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleMotionChange);
      return () => mediaQuery.removeEventListener("change", handleMotionChange);
    } catch {
      // Fallback gracefully
    }
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    // In jsdom / headless test environments without node-canvas, avoid getContext
    if (
      typeof navigator !== "undefined" &&
      navigator.userAgent?.includes("jsdom")
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Campus landmark constellation nodes
    const venues: VenueNode[] = [
      {
        name: "Central Auditorium",
        x: 0.18,
        y: 0.42,
        color: "#1E4FD8",
        radius: 5,
        pulsePhase: 0,
        category: "Hackathon",
        seatsLeft: 1,
      },
      {
        name: "Amphitheatre",
        x: 0.45,
        y: 0.28,
        color: "#F2B705",
        radius: 6,
        pulsePhase: 1.5,
        category: "Cultural",
        seatsLeft: 2,
      },
      {
        name: "Block 2 Lab",
        x: 0.68,
        y: 0.65,
        color: "#3EE6B0",
        radius: 4.5,
        pulsePhase: 3.1,
        category: "Workshop",
        seatsLeft: 20,
      },
      {
        name: "Sports Complex",
        x: 0.85,
        y: 0.38,
        color: "#FF5A3C",
        radius: 5.5,
        pulsePhase: 4.6,
        category: "Sports",
        seatsLeft: 0,
      },
      {
        name: "Main Quadrangle",
        x: 0.32,
        y: 0.72,
        color: "#6E93FF",
        radius: 4,
        pulsePhase: 2.2,
        category: "Social",
        seatsLeft: 80,
      },
    ];

    // Background cosmic particle dust
    const stars = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      drift: (Math.random() - 0.5) * 0.0003,
    }));

    let mouseX = -100;
    let mouseY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    const render = () => {
      time += 0.02 * fomoIntensity;
      ctx.clearRect(0, 0, width, height);

      // Render cosmic background stars
      for (const star of stars) {
        star.y += star.drift;
        if (star.y < 0) star.y = 1;
        if (star.y > 1) star.y = 0;

        ctx.fillStyle = `rgba(110, 147, 255, ${star.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw constellation grid arcs between venues
      ctx.lineWidth = 1;
      for (let i = 0; i < venues.length; i++) {
        for (let j = i + 1; j < venues.length; j++) {
          const v1 = venues[i];
          const v2 = venues[j];
          const x1 = v1.x * width;
          const y1 = v1.y * height;
          const x2 = v2.x * width;
          const y2 = v2.y * height;

          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist < width * 0.5) {
            const alpha = Math.max(0.05, 0.25 - dist / (width * 0.5));
            ctx.strokeStyle = `rgba(110, 147, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Draw venue nodes and pulsing FOMO lanterns
      for (const v of venues) {
        const vx = v.x * width;
        const vy = v.y * height;
        const pulse = Math.sin(time * 3 + v.pulsePhase);
        const currentRadius = v.radius + pulse * 1.5;

        // Glow halo
        const gradient = ctx.createRadialGradient(
          vx,
          vy,
          0,
          vx,
          vy,
          currentRadius * 4,
        );
        gradient.addColorStop(0, v.color);
        gradient.addColorStop(0.4, `${v.color}33`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(vx, vy, currentRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = "#F6F8FF";
        ctx.beginPath();
        ctx.arc(vx, vy, currentRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Interactive mouse connection
        const mouseDist = Math.hypot(mouseX - vx, mouseY - vy);
        if (mouseDist < 120) {
          ctx.strokeStyle = `rgba(242, 183, 5, ${1 - mouseDist / 120})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(vx, vy);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();

          // Label
          ctx.font = "10px JetBrains Mono, monospace";
          ctx.fillStyle = "#F2B705";
          ctx.fillText(
            `${v.name} (${v.seatsLeft > 0 ? `${v.seatsLeft} seats left` : "Waitlist"})`,
            vx + 10,
            vy - 8,
          );
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion, fomoIntensity]);

  if (isReducedMotion) {
    // Tier 0 Non-WebGL Fallback (WCAG AA Compliance)
    return (
      <div
        className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-r from-ink-900 to-royal-950/40 border border-royal-500/20 rounded-2xl"
        role="img"
        aria-label="Cosmic Night Campus Constellation Map"
      >
        <div className="flex items-center gap-6 text-xs font-mono text-royal-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-royal-500"></span>
            Central Audi (Hackathon)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400"></span>
            Amphitheatre (Dhwani)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-mint-400"></span>
            Block 2 Lab (AI Workshop)
          </span>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0 pointer-events-auto rounded-2xl"
      aria-label="Interactive Campus After Dark Constellation Visualization"
    />
  );
}
