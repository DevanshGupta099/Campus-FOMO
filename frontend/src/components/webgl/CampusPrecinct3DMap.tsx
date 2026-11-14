import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  Building2,
  CloudRain,
  Compass,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import type { EventItem, VenueItem } from "../../api/types";
import { computeSeatState, formatIstTime } from "../../utils/format";

interface CampusPrecinct3DMapProps {
  venues: VenueItem[];
  events: EventItem[];
  onSelectEvent?: (evt: EventItem) => void;
}

const BLOCK_COORDS: Array<{
  x: number;
  z: number;
  h: number;
  w: number;
  d: number;
}> = [
  { x: -2.2, z: -0.9, h: 1.45, w: 1.35, d: 1.05 }, // Main Auditorium
  { x: 0.0, z: -1.35, h: 2.15, w: 1.5, d: 1.1 }, // Central Block
  { x: 2.25, z: -0.8, h: 1.3, w: 1.25, d: 1.0 }, // KE Auditorium Block IV
  { x: -0.1, z: 0.25, h: 0.32, w: 1.9, d: 1.25 }, // Quadrangle Stage
  { x: -2.4, z: 1.25, h: 0.45, w: 1.3, d: 1.1 }, // Birds Park Amphitheatre
  { x: 2.2, z: 1.25, h: 1.15, w: 1.15, d: 0.95 }, // Block I
  { x: 0.1, z: -2.6, h: 2.55, w: 1.2, d: 0.85 }, // Skyview 10F
  { x: -1.6, z: -2.35, h: 1.1, w: 1.1, d: 0.9 }, // Block II
  { x: 1.85, z: 2.45, h: 0.22, w: 1.65, d: 1.05 }, // Floodlit Turf
];

function supportsWebGL(): boolean {
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

export const CampusPrecinct3DMap: React.FC<CampusPrecinct3DMapProps> = ({
  venues,
  events,
  onSelectEvent,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [webglReady, setWebglReady] = useState<boolean>(() => supportsWebGL());
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedIdxRef = useRef(0);
  selectedIdxRef.current = selectedIndex;

  const activeVenue = venues[selectedIndex] || venues[0] || null;

  const venueEvents = useMemo(() => {
    if (!activeVenue) return [];
    return events.filter(
      (e) =>
        e.venueId === activeVenue.id ||
        e.venueName
          .toLowerCase()
          .includes(activeVenue.name.split("—")[0].trim().toLowerCase()),
    );
  }, [activeVenue, events]);

  useEffect(() => {
    if (!webglReady || !mountRef.current || venues.length === 0) return;
    const host = mountRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglReady(false);
      return;
    }

    const w = Math.max(host.clientWidth, 300);
    const h = Math.max(host.clientHeight, 340);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    host.innerHTML = "";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 60);
    camera.position.set(5.4, 5.2, 6.4);
    camera.lookAt(0, 0.4, 0);

    scene.add(new THREE.AmbientLight(0xf4f0e6, 0.85));
    const dirLight = new THREE.DirectionalLight(0xfff0d8, 1.9);
    dirLight.position.set(6, 9, 5);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xff4d1c, 3.8, 15);
    accentLight.position.set(0, 3.2, 0);
    scene.add(accentLight);

    const world = new THREE.Group();
    scene.add(world);

    // Tactical Campus Ground Grid
    const grid = new THREE.GridHelper(9.5, 19, 0xff4d1c, 0x222c3c);
    grid.position.y = 0;
    world.add(grid);

    // Hosur Road Highway Axis Strip
    const roadGeo = new THREE.PlaneGeometry(9.5, 0.55);
    const roadMat = new THREE.MeshBasicMaterial({
      color: 0x182130,
      side: THREE.DoubleSide,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, 3.35);
    world.add(road);

    // Architectural Campus Blocks
    const blockMeshes: THREE.Mesh[] = [];
    const beaconMeshes: THREE.Mesh[] = [];

    venues.slice(0, 9).forEach((v, idx) => {
      const spec = BLOCK_COORDS[idx % BLOCK_COORDS.length];
      const geo = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
      const mat = new THREE.MeshStandardMaterial({
        color: v.isOutdoor ? 0x162925 : 0x18202e,
        roughness: 0.35,
        metalness: 0.45,
        emissive: new THREE.Color(idx === 0 ? 0xff4d1c : 0x000000),
        emissiveIntensity: idx === 0 ? 0.35 : 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(spec.x, spec.h / 2, spec.z);
      mesh.userData = { index: idx };
      world.add(mesh);
      blockMeshes.push(mesh);

      // Edge wireframe for AAA architectural CAD precision
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: v.isOutdoor ? 0x2ee59d : 0xe2b45a,
          transparent: true,
          opacity: 0.42,
        }),
      );
      mesh.add(line);

      // Glowing Telemetry Beacon
      const bGeo = new THREE.SphereGeometry(0.11, 16, 16);
      const bMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0xff4d1c : 0x2ee59d,
      });
      const beacon = new THREE.Mesh(bGeo, bMat);
      beacon.position.set(spec.x, spec.h + 0.32, spec.z);
      world.add(beacon);
      beaconMeshes.push(beacon);
    });

    // Raycaster so clicking any 3D building selects that CHRIST block!
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = -(
        ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 -
        1
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(blockMeshes, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.index;
        if (typeof idx === "number") setSelectedIndex(idx);
      }
    };

    renderer.domElement.addEventListener("click", handleCanvasClick);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const nw = Math.max(entry.contentRect.width, 280);
            const nh = Math.max(entry.contentRect.height, 300);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
          })
        : null;
    ro?.observe(host);

    let raf = 0;
    const clock = new THREE.Clock();
    const targetLook = new THREE.Vector3(0, 0.4, 0);

    const animate = () => {
      raf = window.requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const activeIdx = selectedIdxRef.current;
      const focusSpec = BLOCK_COORDS[activeIdx % BLOCK_COORDS.length];

      world.rotation.y = Math.sin(t * 0.22) * 0.18;

      if (focusSpec) {
        targetLook.lerp(
          new THREE.Vector3(focusSpec.x * 0.35, 0.45, focusSpec.z * 0.35),
          0.06,
        );
        accentLight.position.lerp(
          new THREE.Vector3(focusSpec.x, focusSpec.h + 1.8, focusSpec.z),
          0.08,
        );
      }
      camera.lookAt(targetLook);

      blockMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        const isSel = idx === activeIdx;
        mat.emissive.setHex(isSel ? 0xff4d1c : 0x000000);
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          isSel ? 0.42 : 0.0,
          0.12,
        );
      });

      beaconMeshes.forEach((b, idx) => {
        const spec = BLOCK_COORDS[idx % BLOCK_COORDS.length];
        const isSel = idx === activeIdx;
        b.position.y =
          spec.h + 0.3 + Math.sin(t * 3.2 + idx) * (isSel ? 0.1 : 0.04);
        b.scale.setScalar(isSel ? 1.45 : 0.85);
        (b.material as THREE.MeshBasicMaterial).color.setHex(
          isSel ? 0xff4d1c : 0x2ee59d,
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      ro?.disconnect();
      roadGeo.dispose();
      roadMat.dispose();
      blockMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      beaconMeshes.forEach((b) => {
        b.geometry.dispose();
        (b.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, [webglReady, venues]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left 3D Digital Twin / Tactical Blueprint Stage */}
      <div className="hud-frame overflow-hidden rounded-xl border border-rule-strong bg-obsidian lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-4 py-3 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-gold">
            <Compass className="h-3.5 w-3.5 text-vermilion" />
            <span>CHRIST CENTRAL PRECINCT DIGITAL TWIN // HOSUR ROAD</span>
          </div>
          <span className="text-silver">
            {webglReady
              ? "WEBGL 3D CAD ACTIVE · CLICK ANY BLOCK"
              : "2D TACTICAL RADAR"}
          </span>
        </div>

        {webglReady ? (
          <div
            ref={mountRef}
            className="h-[340px] w-full cursor-pointer bg-architectural-grid sm:h-[420px]"
          />
        ) : (
          <div className="bg-architectural-grid p-6">
            <svg
              viewBox="0 0 600 320"
              className="h-72 w-full"
              role="img"
              aria-label="CHRIST Central Campus Tactical Precinct Blueprint"
            >
              <rect
                x="12"
                y="12"
                width="576"
                height="296"
                rx="8"
                fill="#090C12"
                stroke="rgba(244,240,230,0.16)"
              />
              <line
                x1="24"
                y1="274"
                x2="576"
                y2="274"
                stroke="#FF4D1C"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text
                x="32"
                y="294"
                fill="#A2AEBE"
                fontFamily="monospace"
                fontSize="10"
              >
                HOSUR ROAD GATE-1 CORRIDOR →
              </text>
              {venues.slice(0, 9).map((v, idx) => {
                const col = idx % 3;
                const row = Math.floor(idx / 3);
                const bx = 54 + col * 182;
                const by = 34 + row * 76;
                const active = idx === selectedIndex;
                return (
                  <g
                    key={v.id}
                    onClick={() => setSelectedIndex(idx)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={bx}
                      y={by}
                      width="148"
                      height="56"
                      rx="6"
                      fill={active ? "rgba(255,77,28,0.2)" : "#101620"}
                      stroke={active ? "#FF4D1C" : "rgba(244,240,230,0.22)"}
                      strokeWidth={active ? "2" : "1"}
                    />
                    <text
                      x={bx + 10}
                      y={by + 24}
                      fill="#F4F0E6"
                      fontFamily="sans-serif"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {v.name.slice(0, 20)}
                    </text>
                    <text
                      x={bx + 10}
                      y={by + 42}
                      fill={active ? "#E2B45A" : "#2EE59D"}
                      fontFamily="monospace"
                      fontSize="9"
                    >
                      CAP {v.capacity} · {v.isOutdoor ? "OUTDOOR" : "INDOOR"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Quick Block Selector Strip */}
        <div className="flex gap-1.5 overflow-x-auto border-t border-rule bg-carbon p-3">
          {venues.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold transition ${
                idx === selectedIndex
                  ? "bg-vermilion text-void"
                  : "border border-rule bg-gunmetal text-silver hover:border-bone/40 hover:text-bone"
              }`}
            >
              {v.name.split("—")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Right Selected Block Telemetry & Active Conclaves */}
      <div className="flex flex-col justify-between rounded-xl border border-rule-strong bg-paper-elevated p-6 lg:col-span-5">
        {activeVenue ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded border border-gold/40 bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                {activeVenue.block}
              </span>
              {activeVenue.isOutdoor ? (
                <span className="inline-flex items-center gap-1 rounded border border-ochre/40 bg-ochre-soft px-2.5 py-0.5 font-mono text-[10px] font-semibold text-ochre">
                  <CloudRain className="h-3 w-3" />
                  <span>Monsoon Backup Enforced</span>
                </span>
              ) : (
                <span className="rounded border border-phosphor/35 bg-phosphor-soft px-2.5 py-0.5 font-mono text-[10px] font-semibold text-phosphor">
                  Climate-Controlled Acoustic Hall
                </span>
              )}
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-bone">
                {activeVenue.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-silver">
                <MapPin className="h-3.5 w-3.5 text-vermilion" />
                <span>{activeVenue.location}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-rule bg-carbon p-3.5 font-mono text-xs">
              <div>
                <span className="block text-[10px] uppercase text-ink-muted">
                  Certified Seating
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-base font-bold text-bone">
                  <Users className="h-4 w-4 text-vermilion" />
                  {activeVenue.capacity.toLocaleString("en-IN")} seats
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-ink-muted">
                  Active Schedules
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-base font-bold text-phosphor">
                  <Sparkles className="h-4 w-4" />
                  {venueEvents.length} live
                </span>
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                Installed Technical Rig
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeVenue.resources.map((res) => (
                  <span
                    key={res}
                    className="rounded border border-rule-strong bg-carbon px-2.5 py-1 font-mono text-[11px] text-bone"
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-rule pt-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                Scheduled at This Precinct Block
              </span>
              <div className="mt-2.5 space-y-2">
                {venueEvents.length === 0 ? (
                  <p className="rounded-lg border border-rule bg-carbon p-3 font-mono text-xs text-silver">
                    Slot open for Faculty/Deanery proposal booking (&lt;150ms
                    clash check clear).
                  </p>
                ) : (
                  venueEvents.slice(0, 3).map((ev) => {
                    const seat = computeSeatState(ev);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onSelectEvent?.(ev)}
                        className="flex w-full items-center justify-between rounded-lg border border-rule bg-carbon px-3.5 py-2.5 text-left transition hover:border-vermilion"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-xs font-semibold text-bone">
                            {ev.title}
                          </p>
                          <p className="font-mono text-[10px] text-silver">
                            {formatIstTime(ev.startsAt)} · {seat.label}
                          </p>
                        </div>
                        <Building2 className="h-4 w-4 shrink-0 text-vermilion" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
