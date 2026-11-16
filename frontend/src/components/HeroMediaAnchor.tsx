import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Box,
  Film,
  QrCode,
  ShieldCheck,
  Ticket,
} from "lucide-react";
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
      t += 0.055;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 26;
      const bw = canvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const amp =
          0.22 +
          0.46 * Math.abs(Math.sin(t + i * 0.36)) +
          0.24 * Math.abs(Math.cos(t * 0.65 - i * 0.2));
        const bh = Math.max(3, amp * canvas.height);
        ctx.fillStyle = i % 6 === 0 ? "#E5BA6B" : "#34D399";
        ctx.fillRect(i * bw + 1.5, canvas.height - bh, bw - 3, bh);
      }
    };
    draw();
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={156}
      height={26}
      aria-hidden="true"
      className="h-6 w-32 opacity-85"
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
        const h = Math.max(host.clientHeight, 260);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h);
        host.innerHTML = "";
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 40);
        camera.position.set(4.2, 3.5, 4.8);
        camera.lookAt(0, 0.4, 0);

        scene.add(new THREE.AmbientLight(0xf5f2eb, 1.05));
        const pLight = new THREE.PointLight(0xe5ba6b, 4.2, 12);
        pLight.position.set(1.8, 3.2, 2.2);
        scene.add(pLight);

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.GridHelper(6, 12, 0xe5ba6b, 0x1c2536));

        const specs = [
          { x: -1.3, z: -0.6, h: 1.25, c: 0x131b29 },
          { x: 0.1, z: -0.8, h: 1.95, c: 0x1a2538 },
          { x: 1.4, z: -0.4, h: 1.15, c: 0x131b29 },
          { x: 0.0, z: 0.9, h: 0.35, c: 0x152b25 },
        ];
        const meshes: import("three").Mesh[] = [];
        specs.forEach((s, idx) => {
          const geo = new THREE.BoxGeometry(1.0, s.h, 0.85);
          const mat = new THREE.MeshStandardMaterial({
            color: s.c,
            metalness: 0.45,
            roughness: 0.32,
            emissive: idx === 1 ? 0xe5ba6b : 0x000000,
            emissiveIntensity: idx === 1 ? 0.22 : 0,
          });
          const m = new THREE.Mesh(geo, mat);
          m.position.set(s.x, s.h / 2, s.z);
          const edge = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({
              color: idx === 1 ? 0xff5224 : 0xe5ba6b,
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
          group.rotation.y = clock.getElapsedTime() * 0.28;
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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-rule bg-void p-6 text-center">
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
            rx="8"
            fill="#0B0F17"
            stroke="#E5BA6B"
            strokeDasharray="4 4"
          />
          <rect
            x="40"
            y="42"
            width="72"
            height="68"
            rx="4"
            fill="#141B28"
            stroke="#FF5224"
          />
          <rect
            x="140"
            y="26"
            width="84"
            height="84"
            rx="4"
            fill="#141B28"
            stroke="#34D399"
          />
          <rect
            x="248"
            y="48"
            width="70"
            height="62"
            rx="4"
            fill="#141B28"
            stroke="#E5BA6B"
          />
        </svg>
        <p className="mt-2 font-mono text-[11px] text-silver">
          2D Architectural Blueprint · Central Block &amp; Main Auditorium
        </p>
      </div>
    );
  }

  return (
    <div ref={hostRef} className="h-64 w-full rounded-2xl bg-void sm:h-72" />
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
    <div className="studio-bezel">
      <div className="overflow-hidden rounded-[20px] border border-rule bg-carbon/95 backdrop-blur-2xl">
        {/* Studio Window Bar & Segmented Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-obsidian/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="hidden items-center gap-1.5 sm:flex"
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-phosphor/70" />
            </div>
            <span className="text-xs font-medium text-silver">
              Live Campus Showcase{" "}
              <span className="hidden font-mono text-[11px] text-ink-muted md:inline">
                · Hosur Road Precinct
              </span>
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Hero media anchor view mode"
            className="flex rounded-full border border-rule bg-void/90 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "console"}
              onClick={() => setTab("console")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === "console"
                  ? "bg-bone text-void shadow-sm"
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === "precinct"
                  ? "bg-bone text-void shadow-sm"
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === "pass"
                  ? "bg-bone text-void shadow-sm"
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
              {/* Looping H.264 Campus Cinema Showreel */}
              <div className="relative overflow-hidden rounded-2xl border border-rule lg:col-span-7">
                <CinemaVideoFrame
                  src="/media/christ-concourse-reel.mp4"
                  poster="/media/fest-blossoms-stage.webp"
                  alt="CHRIST Central Campus Concourse Cinema Showreel — Block IV, Labyrinth Hackathon, Blossoms Stage, and Magnovite Robotics"
                  className="h-64 w-full sm:h-[310px]"
                  eagerPoster
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />

                <div className="pointer-events-none absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-void/80 px-3 py-1 text-[11px] font-medium text-bone backdrop-blur-md">
                    <Activity className="h-3 w-3 text-phosphor" />
                    <span>Central Quadrangle · Live Feed</span>
                  </span>
                  <span className="rounded-full border border-white/10 bg-void/80 px-3 py-1 font-mono text-[10px] text-gold backdrop-blur-md">
                    APISIX · KEYCLOAK 26
                  </span>
                </div>

                <div className="pointer-events-none absolute bottom-4 left-4 right-28 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="editorial-italic text-base text-gold">
                      Featured Campus Flagship
                    </p>
                    <h2 className="font-display text-xl font-bold tracking-tight text-bone sm:text-2xl">
                      {featuredEvent?.title ||
                        "Labyrinth 24-Hour Systems Hackathon"}
                    </h2>
                  </div>
                  <div className="max-sm:hidden">
                    <LiveTelemetryBars />
                  </div>
                </div>
              </div>

              {/* Right Atomic Seat Lock & Scarcity Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-rule bg-gunmetal/80 p-5 sm:p-6 lg:col-span-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-vermilion/35 bg-vermilion-soft px-3 py-1 text-[11px] font-semibold text-vermilion">
                      <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
                      <span>Atomic Row-Locked Seat</span>
                    </span>
                    <span className="font-mono text-xs text-silver">
                      {featuredEvent
                        ? formatIstDate(featuredEvent.startsAt)
                        : "Nov 2026 · IST"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-bone">
                      {featuredEvent?.venueName ||
                        "Main Auditorium — Audi Block"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-silver">
                      {featuredEvent
                        ? formatIstTime(featuredEvent.startsAt)
                        : "09:00 AM IST"}{" "}
                      · Zero Double-Booking Guarantee
                    </p>
                  </div>

                  <div className="rounded-xl border border-rule bg-void/75 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-silver">
                        Live Auditorium Capacity
                      </span>
                      <span className="font-mono font-semibold text-vermilion">
                        {seat.label}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-steel">
                      <div
                        style={{ width: `${seat.fillPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-gold to-vermilion"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-rule bg-void/60 p-3">
                      <span className="block text-[11px] text-ink-muted">
                        Clash Verification
                      </span>
                      <span className="mt-0.5 block font-mono text-sm font-semibold text-phosphor">
                        3ms Clear
                      </span>
                    </div>
                    <div className="rounded-xl border border-rule bg-void/60 p-3">
                      <span className="block text-[11px] text-ink-muted">
                        Gate-1 QR Scan
                      </span>
                      <span className="mt-0.5 block font-mono text-sm font-semibold text-gold">
                        &lt;180ms p95
                      </span>
                    </div>
                  </div>
                </div>

                {featuredEvent && onInspectEvent && (
                  <button
                    type="button"
                    onClick={() => onInspectEvent(featuredEvent)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-bone px-5 py-3 text-xs font-semibold text-void transition hover:bg-gold"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>Reserve Pass &amp; Lock Seat</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === "precinct" && (
            <div className="space-y-3">
              <MiniThreePrecinct />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-silver">
                <span>
                  Interactive Three.js massing of Audi Block, Central Block
                  &amp; Quadrangle
                </span>
                <a
                  href="#precinct-3d"
                  className="font-semibold text-gold transition hover:text-bone"
                >
                  Explore Full 9-Block Digital Twin →
                </a>
              </div>
            </div>
          )}

          {tab === "pass" && (
            <div className="grid items-center gap-6 rounded-2xl border border-rule bg-gunmetal/75 p-6 md:grid-cols-12">
              <div className="space-y-3 md:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-phosphor/35 bg-phosphor-soft px-3 py-1 text-[11px] font-semibold text-phosphor">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Rotating HMAC-SHA256 Boarding Credential</span>
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-bone sm:text-3xl">
                  Gate-1 Hosur Road{" "}
                  <span className="editorial-italic font-normal text-gold">
                    Live Pass.
                  </span>
                </h3>
                <p className="text-sm leading-relaxed text-silver">
                  Every confirmed seat generates an isolated per-ticket
                  cryptographic secret. The payload re-signs every 30 seconds so
                  forwarded WhatsApp screenshots expire automatically before
                  reaching the auditorium door.
                </p>
                <div className="font-mono text-xs text-gold">
                  Next cryptographic epoch in <strong>{qrWindow}s</strong>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center md:col-span-5">
                <div className="rounded-2xl border border-rule-strong bg-bone p-3 shadow-xl">
                  <QrMatrixCanvas
                    value={`christ-gate1.${Math.floor(Date.now() / 30000)}.hmac-${qrWindow}`}
                    size={156}
                    darkColor="#06080C"
                    lightColor="#F5F2EB"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
