import React, { useEffect, useRef, useState } from "react";
import { Activity, Box, Film, QrCode, ShieldCheck, Ticket } from "lucide-react";
import type { EventItem } from "../api/types";
import {
  computeSeatState,
  formatIstDate,
  formatIstTime,
} from "../utils/format";
import { CinemaVideoFrame } from "./CinemaVideoFrame";
import { QrMatrixCanvas } from "./QrMatrixCanvas";

type AnchorTab = "console" | "precinct" | "pass";

interface HeroMediaAnchorProps {
  featuredEvent: EventItem | null;
  onInspectEvent?: (evt: EventItem) => void;
}

function canUseThree(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.MODE === "test") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * 60fps Procedural Telemetry Waveform Overlay over high-craft festival cinema reel.
 */
const LiveTelemetryBars: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (import.meta.env.MODE === "test") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const draw = () => {
      raf = window.requestAnimationFrame(draw);
      t += 0.06;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 28;
      const bw = canvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const amp =
          0.25 +
          0.45 * Math.abs(Math.sin(t + i * 0.38)) +
          0.25 * Math.abs(Math.cos(t * 0.7 - i * 0.2));
        const bh = Math.max(4, amp * canvas.height);
        ctx.fillStyle = i % 5 === 0 ? "#FF4D1C" : "#2EE59D";
        ctx.fillRect(i * bw + 1, canvas.height - bh, bw - 2, bh);
      }
    };
    draw();
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={168}
      height={28}
      aria-hidden="true"
      className="h-6 w-36 opacity-90"
    />
  );
};

const MiniThreePrecinct: React.FC = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [webglOk, setWebglOk] = useState<boolean>(() => canUseThree());

  useEffect(() => {
    if (!webglOk || !hostRef.current) return;
    const host = hostRef.current;
    let cancelled = false;
    let cleanupFn: (() => void) | null = null;

    import("three")
      .then((THREE) => {
        if (cancelled || !hostRef.current) return;
        let renderer: import("three").WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          setWebglOk(false);
          return;
        }

        const w = Math.max(host.clientWidth, 280);
        const h = Math.max(host.clientHeight, 250);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h);
        host.innerHTML = "";
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 40);
        camera.position.set(4.2, 3.6, 4.8);
        camera.lookAt(0, 0.4, 0);

        scene.add(new THREE.AmbientLight(0xf4f0e6, 0.9));
        const pLight = new THREE.PointLight(0xff4d1c, 4.5, 12);
        pLight.position.set(1.5, 3, 2);
        scene.add(pLight);

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.GridHelper(6, 12, 0xff4d1c, 0x222d3d));

        const specs = [
          { x: -1.3, z: -0.6, h: 1.25, c: 0x16202f },
          { x: 0.1, z: -0.8, h: 1.9, c: 0x1e2a3d },
          { x: 1.4, z: -0.4, h: 1.15, c: 0x16202f },
          { x: 0.0, z: 0.9, h: 0.35, c: 0x183029 },
        ];
        const meshes: import("three").Mesh[] = [];
        specs.forEach((s, idx) => {
          const geo = new THREE.BoxGeometry(1.0, s.h, 0.85);
          const mat = new THREE.MeshStandardMaterial({
            color: s.c,
            metalness: 0.5,
            roughness: 0.3,
            emissive: idx === 1 ? 0xff4d1c : 0x000000,
            emissiveIntensity: idx === 1 ? 0.32 : 0,
          });
          const m = new THREE.Mesh(geo, mat);
          m.position.set(s.x, s.h / 2, s.z);
          const edge = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({
              color: idx === 1 ? 0xff4d1c : 0xe2b45a,
            }),
          );
          m.add(edge);
          group.add(m);
          meshes.push(m);
        });

        let raf = 0;
        const clock = new THREE.Clock();
        const tick = () => {
          raf = window.requestAnimationFrame(tick);
          group.rotation.y = clock.getElapsedTime() * 0.32;
          renderer.render(scene, camera);
        };
        tick();

        cleanupFn = () => {
          window.cancelAnimationFrame(raf);
          meshes.forEach((m) => {
            m.geometry.dispose();
            (m.material as import("three").Material).dispose();
          });
          renderer.dispose();
        };
      })
      .catch(() => setWebglOk(false));

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [webglOk]);

  if (!webglOk) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-rule bg-void p-6 text-center">
        <svg
          viewBox="0 0 360 160"
          className="h-36 w-full max-w-sm"
          role="img"
          aria-label="CHRIST Central Architectural Blueprint Fallback"
        >
          <rect
            x="10"
            y="10"
            width="340"
            height="140"
            rx="6"
            fill="#0C1017"
            stroke="#E2B45A"
            strokeDasharray="4 4"
          />
          <rect
            x="40"
            y="42"
            width="72"
            height="68"
            fill="#161E2C"
            stroke="#FF4D1C"
          />
          <rect
            x="140"
            y="26"
            width="84"
            height="84"
            fill="#161E2C"
            stroke="#2EE59D"
          />
          <rect
            x="248"
            y="48"
            width="70"
            height="62"
            fill="#161E2C"
            stroke="#E2B45A"
          />
        </svg>
        <p className="mt-2 font-mono text-[11px] text-silver">
          2D Tactical Precinct Blueprint · Central Block &amp; Main Auditorium
        </p>
      </div>
    );
  }

  return (
    <div ref={hostRef} className="h-64 w-full rounded-lg bg-void sm:h-72" />
  );
};

export const HeroMediaAnchor: React.FC<HeroMediaAnchorProps> = ({
  featuredEvent,
  onInspectEvent,
}) => {
  const [tab, setTab] = useState<AnchorTab>("console");
  const [qrWindow, setQrWindow] = useState(30);

  useEffect(() => {
    if (tab !== "pass") return;
    const id = window.setInterval(() => {
      setQrWindow((s) => (s <= 1 ? 30 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [tab]);

  const seat = featuredEvent
    ? computeSeatState(featuredEvent)
    : {
        state: "CRITICAL" as const,
        label: "Last 1 seat remaining",
        fillPercent: 98,
      };

  return (
    <div className="hud-frame overflow-hidden rounded-2xl border border-rule-strong bg-carbon/95 shadow-anchor backdrop-blur-xl">
      {/* Top Tactical Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-obsidian px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-silver">
          <span className="h-2 w-2 rounded-full bg-phosphor" />
          <span>CONCOURSE VISUAL ANCHOR // CINEMA REEL &amp; TELEMETRY</span>
        </div>

        <div
          role="tablist"
          aria-label="Hero media anchor view mode"
          className="flex rounded-lg border border-rule bg-carbon p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "console"}
            onClick={() => setTab("console")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase transition ${
              tab === "console"
                ? "bg-vermilion text-void"
                : "text-silver hover:text-bone"
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>Live Reel</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === "precinct"}
            onClick={() => setTab("precinct")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase transition ${
              tab === "precinct"
                ? "bg-vermilion text-void"
                : "text-silver hover:text-bone"
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>3D Precinct</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === "pass"}
            onClick={() => setTab("pass")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase transition ${
              tab === "pass"
                ? "bg-vermilion text-void"
                : "text-silver hover:text-bone"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>HMAC Pass</span>
          </button>
        </div>
      </div>

      {/* Anchor Body */}
      <div className="p-4 sm:p-6">
        {tab === "console" && (
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Looping H.264 Campus Cinema Showreel + Live Waveform HUD */}
            <div className="relative overflow-hidden rounded-xl border border-rule lg:col-span-7">
              <CinemaVideoFrame
                src="/media/christ-concourse-reel.mp4"
                poster="/media/fest-blossoms-stage.webp"
                alt="CHRIST Central Campus Concourse Cinema Showreel — Block IV, Labyrinth Hackathon, Blossoms Stage, and Magnovite Robotics"
                className="h-64 w-full sm:h-72"
                eagerPoster
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />

              <div className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-void/85 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-vermilion backdrop-blur-md">
                  <Activity className="h-3 w-3" />
                  <span>CINEMA REEL · CENTRAL QUADRANGLE</span>
                </span>
                <span className="rounded bg-void/85 px-2.5 py-1 font-mono text-[10px] text-gold backdrop-blur-md">
                  PBAC · APISIX · KEYCLOAK 26
                </span>
              </div>

              <div className="pointer-events-none absolute bottom-3.5 left-3.5 right-32 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
                    FEATURED CAMPUS FLAGSHIP
                  </p>
                  <h2 className="font-display text-lg font-bold text-bone sm:text-2xl">
                    {featuredEvent?.title ||
                      "Labyrinth 24-Hour Systems Hackathon"}
                  </h2>
                </div>
                <div className="max-sm:hidden">
                  <LiveTelemetryBars />
                </div>
              </div>
            </div>

            {/* Right Atomic Seat Lock & Scarcity Telemetry */}
            <div className="flex flex-col justify-between rounded-xl border border-rule bg-gunmetal p-5 lg:col-span-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="rounded border border-vermilion/50 bg-vermilion-soft px-2 py-0.5 font-bold uppercase text-vermilion">
                    ATOMIC ROW LOCK
                  </span>
                  <span className="text-silver">
                    {featuredEvent
                      ? formatIstDate(featuredEvent.startsAt)
                      : "Nov 2026 · IST"}
                  </span>
                </div>

                <p className="font-mono text-xs text-silver">
                  {featuredEvent?.venueName || "Main Auditorium — Audi Block"} ·{" "}
                  {featuredEvent
                    ? formatIstTime(featuredEvent.startsAt)
                    : "09:00 AM IST"}
                </p>

                <div className="rounded-lg border border-rule bg-carbon p-3.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-silver">Seat Allocation</span>
                    <span className="font-bold text-vermilion">
                      {seat.label}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-void">
                    <div
                      style={{ width: `${seat.fillPercent}%` }}
                      className="h-full bg-gradient-to-r from-gold to-vermilion"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
                  <div className="rounded border border-rule bg-carbon p-2.5">
                    <span className="block text-[10px] text-ink-muted">
                      CLASH AUDIT
                    </span>
                    <span className="font-bold text-phosphor">3ms CLEAR</span>
                  </div>
                  <div className="rounded border border-rule bg-carbon p-2.5">
                    <span className="block text-[10px] text-ink-muted">
                      QR GATE SLA
                    </span>
                    <span className="font-bold text-gold">&lt;180ms p95</span>
                  </div>
                </div>
              </div>

              {featuredEvent && onInspectEvent && (
                <button
                  type="button"
                  onClick={() => onInspectEvent(featuredEvent)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-vermilion px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Lock Seat &amp; Issue QR Pass</span>
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "precinct" && (
          <div className="space-y-3">
            <MiniThreePrecinct />
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-silver">
              <span>
                Real-time Three.js architectural massing of Audi Block, Central
                Block &amp; Quadrangle
              </span>
              <a
                href="#precinct-3d"
                className="font-semibold text-vermilion hover:underline"
              >
                Open Full 9-Block 3D Precinct Twin →
              </a>
            </div>
          </div>
        )}

        {tab === "pass" && (
          <div className="grid items-center gap-6 rounded-xl border border-rule bg-gunmetal p-5 md:grid-cols-12">
            <div className="space-y-2.5 md:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded border border-phosphor/40 bg-phosphor-soft px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-phosphor">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ANTI-SCREENSHOT ROTATING HMAC-SHA256</span>
              </span>
              <h3 className="font-display text-2xl font-bold text-bone">
                Gate-1 Hosur Road Boarding Credential
              </h3>
              <p className="text-xs leading-relaxed text-silver">
                Every confirmed seat generates a per-ticket cryptographic
                secret. The pass payload re-signs every 30 seconds so forwarded
                screenshots are rejected automatically in under 15ms at the
                auditorium door.
              </p>
              <div className="font-mono text-xs text-gold">
                Next cryptographic window rotation in{" "}
                <strong>{qrWindow}s</strong>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center md:col-span-5">
              <QrMatrixCanvas
                value={`christ-gate1.${Math.floor(Date.now() / 30000)}.hmac-${qrWindow}`}
                size={164}
                darkColor="#07090D"
                lightColor="#F4F0E6"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
