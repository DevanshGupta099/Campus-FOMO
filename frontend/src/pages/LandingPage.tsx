import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Film,
  Lock,
  QrCode,
  Radio,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { apiClient } from "../api/client";
import type {
  CampusLeaderboard,
  CampusPulseItem,
  EventItem,
  GalleryItem,
  SponsorShowcase,
  VenueItem,
} from "../api/types";
import { resolveDefaultWorkspacePath, useAuth } from "../auth/AuthContext";
import {
  ChristCrestMark,
  ColonnadeMotifSvg,
  GovernanceSealSvg,
} from "../components/BrandMarks";
import { CinemaVideoFrame } from "../components/CinemaVideoFrame";
import { EventDetailModal } from "../components/EventDetailModal";
import { HeroMediaAnchor } from "../components/HeroMediaAnchor";
import { PublicNavbar } from "../components/PublicNavbar";
import { DESIGN_TOKENS } from "../tokens";
import {
  computeSeatState,
  formatInr,
  formatIstDate,
  formatIstTime,
} from "../utils/format";

const WebGLKineticHeroText = lazy(() =>
  import("../components/webgl/WebGLKineticHeroText").then((m) => ({
    default: m.WebGLKineticHeroText,
  })),
);
const WebGLShaderMarquee = lazy(() =>
  import("../components/webgl/WebGLShaderMarquee").then((m) => ({
    default: m.WebGLShaderMarquee,
  })),
);
const CampusPrecinct3DMap = lazy(() =>
  import("../components/webgl/CampusPrecinct3DMap").then((m) => ({
    default: m.CampusPrecinct3DMap,
  })),
);

const InstantHeroHeadingFallback: React.FC = () => (
  <div className="flex h-[230px] w-full flex-col items-center justify-center px-1 text-center sm:h-[300px] lg:h-[350px]">
    <h1 className="max-w-full">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-silver sm:text-[11px] sm:tracking-[0.26em]">
        12.9345 N · 77.6060 E · ZERO-TRUST CAMPUS EVENT OPERATING SYSTEM
      </span>
      <span className="mt-2 block font-display text-[2.25rem] font-extrabold leading-none tracking-tight text-bone sm:text-7xl lg:text-8xl">
        CONCOURSE
      </span>
      <span className="mt-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-sm sm:tracking-[0.28em]">
        CHRIST CENTRAL CAMPUS // BENGALURU
      </span>
    </h1>
  </div>
);

const ROLE_MATRICES = [
  {
    idx: "01",
    name: "CHRIST Student",
    perm: "registration:create · luckydraw:enter · gamification:read:own",
    desc: "Full internal & inter-collegiate seat locking, 30s rotating QR passes, append-only XP league, and SHA-256 commit-reveal draws.",
  },
  {
    idx: "02",
    name: "External Fest Guest",
    perm: "event:read:public · registration:create (External-Open)",
    desc: "Zero-trust isolated onboarding for visiting college delegations with Gate-1 Hosur Road admission passes.",
  },
  {
    idx: "03",
    name: "Student Event Head",
    perm: "event:create · volunteer:assign:own-event · broadcast:send",
    desc: "5-field proposal studio, mandatory monsoon indoor backups, masked roster export, and live SSE attendee advisories.",
  },
  {
    idx: "04",
    name: "Gate QR Marshal",
    perm: "checkin:scan:own-event",
    desc: "Sub-300ms HMAC optical scan terminal with tri-state acoustic feedback and strict first-name-only zero-PII display.",
  },
  {
    idx: "05",
    name: "Faculty Coordinator",
    perm: "event:approve:dept · proposal:read:dept",
    desc: "Stage-1 departmental review powered by automated <150ms venue clash & exam blackout verification.",
  },
  {
    idx: "06",
    name: "Dean of Students",
    perm: "event:approve:budget · audit:read",
    desc: "Stage-2 executive INR budget sanction, live concourse publication sign-off, and governance audit ledger.",
  },
  {
    idx: "07",
    name: "Campus Partner",
    perm: "sponsor:profile:manage:own · sponsor:analytics:view:own",
    desc: "Third Wave Coffee Central Block showcase and aggregated CTR/voucher telemetry with zero student PII.",
  },
  {
    idx: "08",
    name: "OITS Administrator",
    perm: "rbac:manage · event:cancel:any · ops:view",
    desc: "44-permission PBAC bundle studio, granular subject grants, live SSE ops metrics, and emergency revocation.",
  },
];

const CATEGORY_THUMBS: Record<string, string> = {
  Hackathon: "/media/fest-labyrinth-hackathon.jpg",
  Technical: "/media/fest-magnovite-robotics.jpg",
  Cultural: "/media/fest-blossoms-stage.jpg",
  "Guest Lecture": "/media/campus-skyview-atrium.jpg",
  Placement: "/media/campus-skyview-atrium.jpg",
  Sports: "/media/hero-central-campus.jpg",
};

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [sponsor, setSponsor] = useState<SponsorShowcase | null>(null);
  const [leaderboard, setLeaderboard] = useState<CampusLeaderboard | null>(
    null,
  );
  const [pulse, setPulse] = useState<CampusPulseItem[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [gpuReady, setGpuReady] = useState(false);

  // Progressive WebGL Hydration: Instant zero-CLS HTML/CSS paint first,
  // upgrading to GPU Three.js SDF typography & 3D twin on interaction or post-load idle.
  useEffect(() => {
    if (typeof window === "undefined" || import.meta.env.MODE === "test") {
      return;
    }
    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      setGpuReady(true);
    };

    const eventsToWatch: Array<keyof WindowEventMap> = [
      "pointermove",
      "touchstart",
      "keydown",
      "scroll",
    ];
    eventsToWatch.forEach((ev) =>
      window.addEventListener(ev, activate, { once: true, passive: true }),
    );
    const timer = window.setTimeout(activate, 6500);

    return () => {
      window.clearTimeout(timer);
      eventsToWatch.forEach((ev) => window.removeEventListener(ev, activate));
    };
  }, []);

  // Smooth Awwwards Lenis Inertia Scroll (respects reduced-motion & test env)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      import.meta.env.MODE === "test" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let lenis: Lenis | null = null;
    let raf = 0;
    try {
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
      });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = window.requestAnimationFrame(loop);
      };
      raf = window.requestAnimationFrame(loop);
    } catch {
      // Fallback to native browser scroll
    }

    const onScroll = () => {
      const docH =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      setScrollProgress(
        Math.min(100, Math.max(0, (window.scrollY / docH) * 100)),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      lenis?.destroy();
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiClient.listEvents(),
      apiClient.getVenues(),
      apiClient.getGallery(),
      apiClient.getSponsorShowcase().catch(() => null),
      apiClient.getLeaderboard().catch(() => null),
      apiClient.getPulse().catch(() => []),
    ])
      .then(([ev, vn, gal, sp, lb, pl]) => {
        if (!active) return;
        setEvents(ev);
        setVenues(vn);
        setGallery(gal);
        setSponsor(sp);
        setLeaderboard(lb);
        setPulse(pl);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All") return events.slice(0, 6);
    return events
      .filter((e) => e.category.toLowerCase() === activeCategory.toLowerCase())
      .slice(0, 6);
  }, [events, activeCategory]);

  const featuredEvent = useMemo(
    () => events.find((e) => e.id === "evt-hackathon-100") || events[0] || null,
    [events],
  );

  const primaryCtaHref =
    isAuthenticated && user
      ? resolveDefaultWorkspacePath(user.permissions)
      : "/login";

  return (
    <div className="min-h-screen overflow-x-hidden bg-void text-bone">
      {/* Top Scroll-Depth Telemetry Hairline */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-50 h-[2px] bg-gradient-to-r from-vermilion via-gold to-phosphor transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <PublicNavbar />

      <main id="main-content">
        {/* =====================================================================
          HERO SECTION: AAA WebGL SDF Typography + Twilight Campus Cinema + Anchor
         ===================================================================== */}
        <section className="relative overflow-hidden border-b border-rule">
          {/* Atmospheric Architectural Photography Backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <img
              src="/media/hero-central-campus.webp"
              alt=""
              width={960}
              height={540}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-28"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-void/85 via-void/90 to-void" />
            <div className="absolute inset-0 bg-architectural-grid" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-10">
            {/* Constant-Height Live Campus Telemetry Pulse Strip (Zero CLS) */}
            <div className="mb-6 flex min-h-[38px] items-center justify-between gap-3 rounded-lg border border-rule bg-carbon/80 px-4 py-2 font-mono text-[11px] backdrop-blur-md">
              <span className="inline-flex shrink-0 items-center gap-2 font-bold uppercase tracking-widest text-phosphor">
                <Radio className="h-3.5 w-3.5" />
                <span>LIVE PRECINCT PULSE</span>
              </span>
              <span className="truncate text-bone">
                {pulse[0]?.label ||
                  "Main Auditorium & Central Quadrangle Telemetry Nominal"}
              </span>
              <span className="hidden shrink-0 text-gold md:inline">
                {DESIGN_TOKENS.campus.name} · {DESIGN_TOKENS.campus.coordinates}
              </span>
            </div>

            {/* AAA Game-Engine GPU SDF 3D Kinetic Typography (Instant Zero-CLS LCP Anchor -> Idle GPU Upgrade) */}
            {gpuReady ? (
              <Suspense fallback={<InstantHeroHeadingFallback />}>
                <WebGLKineticHeroText
                  primaryLine="CONCOURSE"
                  secondaryLine="CHRIST CENTRAL CAMPUS // BENGALURU"
                  telemetryLine="12.9345 N · 77.6060 E · ZERO-TRUST CAMPUS EVENT OPERATING SYSTEM"
                />
              </Suspense>
            ) : (
              <InstantHeroHeadingFallback />
            )}

            {/* Editorial Subhead & Dual Tactical CTAs */}
            <div className="mx-auto mt-2 max-w-3xl text-center">
              <p className="text-sm leading-relaxed text-silver sm:text-base">
                Engineered for{" "}
                <strong className="font-semibold text-bone">
                  {DESIGN_TOKENS.campus.name}
                </strong>{" "}
                (Hosur Road Precinct). Atomic PostgreSQL seat locking, sub-150ms
                faculty clash verification, 30-second rotating HMAC gate passes,
                and SHA-256 commit-reveal lucky draws across 8 permission-scoped
                roles.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  to={primaryCtaHref}
                  className="inline-flex items-center gap-2 rounded-md bg-vermilion px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-void shadow-glow transition hover:bg-vermilion-hover"
                >
                  <span>
                    {isAuthenticated
                      ? "Open PBAC Workspace"
                      : "Launch Concourse Portal"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-md border border-rule-strong bg-carbon/85 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-widest text-bone backdrop-blur-md transition hover:border-gold hover:text-gold"
                >
                  <span>Student &amp; External Guest Pass</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Interactive 3-Mode Visual / Media Anchor */}
            <div className="mt-12">
              <HeroMediaAnchor
                featuredEvent={featuredEvent}
                onInspectEvent={(evt) => setSelectedEvent(evt)}
              />
            </div>
          </div>
        </section>

        {/* =====================================================================
          WEBGL GLSL LIQUID-VELOCITY SHADER TYPOGRAPHY RIBBON
         ===================================================================== */}
        {gpuReady ? (
          <Suspense
            fallback={
              <div className="overflow-hidden border-y border-rule bg-obsidian py-4">
                <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-xl font-extrabold uppercase tracking-wider text-bone sm:text-2xl">
                  <span>
                    CHRIST CENTRAL CAMPUS · ATOMIC SEAT LOCK · ROTATING HMAC QR
                    · COMMIT-REVEAL DRAWS · ZERO-TRUST PBAC ·
                  </span>
                  <span>
                    CHRIST CENTRAL CAMPUS · ATOMIC SEAT LOCK · ROTATING HMAC QR
                    · COMMIT-REVEAL DRAWS · ZERO-TRUST PBAC ·
                  </span>
                </div>
              </div>
            }
          >
            <WebGLShaderMarquee />
          </Suspense>
        ) : (
          <div className="overflow-hidden border-y border-rule bg-obsidian py-4">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-xl font-extrabold uppercase tracking-wider text-bone sm:text-2xl">
              <span>
                CHRIST CENTRAL CAMPUS · ATOMIC SEAT LOCK · ROTATING HMAC QR ·
                COMMIT-REVEAL DRAWS · ZERO-TRUST PBAC ·
              </span>
              <span>
                CHRIST CENTRAL CAMPUS · ATOMIC SEAT LOCK · ROTATING HMAC QR ·
                COMMIT-REVEAL DRAWS · ZERO-TRUST PBAC ·
              </span>
            </div>
          </div>
        )}

        {/* =====================================================================
          SECTION 1: LIVE CONCOURSE SCHEDULE & ATOMIC SCARCITY MATRIX
         ===================================================================== */}
        <section
          id="conclaves"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-8">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-vermilion">
                01 // LIVE PRECINCT SCHEDULE (IST)
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-bone sm:text-5xl">
                Active Conclaves &amp; Flagships
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DESIGN_TOKENS.categories.slice(0, 7).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold uppercase transition ${
                    activeCategory === cat
                      ? "bg-vermilion text-void"
                      : "border border-rule bg-carbon text-silver hover:border-bone/40 hover:text-bone"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((evt) => {
              const seat = computeSeatState(evt);
              const coverImg =
                CATEGORY_THUMBS[evt.category] ||
                "/media/hero-central-campus.jpg";
              return (
                <article
                  key={evt.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-rule-strong bg-carbon shadow-editorial transition duration-300 hover:-translate-y-1 hover:border-vermilion"
                >
                  <div>
                    {/* Photographic Cinema Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-void">
                      <img
                        src={coverImg}
                        alt={evt.title}
                        width={1408}
                        height={768}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
                      <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between">
                        <span className="rounded bg-void/85 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-bone backdrop-blur-md">
                          {evt.category}
                        </span>
                        {evt.isExternalOpen ? (
                          <span className="rounded border border-phosphor/45 bg-void/85 px-2.5 py-1 font-mono text-[10px] font-semibold text-phosphor backdrop-blur-md">
                            External-Open
                          </span>
                        ) : (
                          <span className="rounded border border-rule-strong bg-void/85 px-2.5 py-1 font-mono text-[10px] text-silver backdrop-blur-md">
                            CHRIST Internal
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                        {evt.clubName || evt.department}
                      </p>
                      <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-bone transition group-hover:text-vermilion">
                        {evt.title}
                      </h3>

                      {evt.lastUpdateBanner && (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-ochre/40 bg-ochre-soft px-3 py-2 text-[11px] text-bone">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ochre" />
                          <span className="line-clamp-2">
                            {evt.lastUpdateBanner}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 space-y-1.5 border-t border-rule pt-3 font-mono text-xs text-silver">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-vermilion" />
                          <span>
                            {formatIstDate(evt.startsAt)} ·{" "}
                            {formatIstTime(evt.startsAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-gold" />
                          <span className="truncate text-bone">
                            {evt.venueName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-rule bg-gunmetal/60 p-5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span
                        className={`font-bold ${
                          seat.state === "CRITICAL"
                            ? "text-vermilion"
                            : seat.state === "WAITLIST"
                              ? "text-ochre"
                              : "text-phosphor"
                        }`}
                      >
                        {seat.label}
                      </span>
                      <span className="font-bold text-bone">
                        {formatInr(evt.fee)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-void">
                      <div
                        style={{ width: `${seat.fillPercent}%` }}
                        className={`h-full ${
                          seat.state === "CRITICAL"
                            ? "bg-vermilion"
                            : seat.state === "WAITLIST"
                              ? "bg-ochre"
                              : "bg-phosphor"
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEvent(evt)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-rule-strong bg-carbon px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-bone transition group-hover:border-vermilion group-hover:bg-vermilion group-hover:text-void"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      <span>Inspect &amp; Reserve Pass</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
          SECTION 2: INTERACTIVE 3D CHRIST CENTRAL PRECINCT DIGITAL TWIN
         ===================================================================== */}
        <section
          id="precinct-3d"
          className="border-y border-rule bg-carbon/60 py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-gold">
                  02 // SPATIAL CAMPUS TOPOLOGY
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-bone sm:text-5xl">
                  9-Block 3D Precinct Digital Twin
                </h2>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-silver">
                Click any auditorium, quadrangle, or turf block in the Three.js
                spatial twin to inspect certified seating, monsoon indoor
                backups, and live schedules.
              </p>
            </div>

            {gpuReady ? (
              <Suspense
                fallback={
                  <div className="flex h-[440px] items-center justify-center rounded-2xl border border-rule-strong bg-carbon font-mono text-xs uppercase tracking-widest text-silver">
                    Streaming 9-Block 3D Precinct Twin...
                  </div>
                }
              >
                <CampusPrecinct3DMap
                  venues={venues}
                  events={events}
                  onSelectEvent={(ev) => setSelectedEvent(ev)}
                />
              </Suspense>
            ) : (
              <div className="relative flex h-[380px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-rule-strong bg-carbon p-6 text-center sm:h-[440px]">
                <img
                  src="/media/campus-skyview-atrium.jpg"
                  alt="CHRIST Central Campus Hosur Road Precinct Aerial Overview"
                  width={1408}
                  height={768}
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/80" />
                <div className="relative z-10 max-w-lg space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded border border-gold/40 bg-void/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                    9 MAPPED ARCHITECTURAL BLOCKS · WEBGL SPATIAL TWIN
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-bone sm:text-3xl">
                    Central Block, K.E. Auditorium &amp; Birds Park Amphitheatre
                  </h3>
                  <p className="text-xs leading-relaxed text-silver">
                    Interactive Three.js spatial radar initializes automatically
                    as you explore or on demand below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setGpuReady(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-vermilion px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
                  >
                    <span>Activate 3D Precinct Twin</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
          SECTION 3: STARK WARM-BONE CONTRAST CHAPTER — GOVERNANCE & 8-ROLE PBAC
         ===================================================================== */}
        <section
          id="governance"
          className="bg-[#F2EDE2] py-20 text-[#07090D] lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="grid items-end gap-8 border-b border-[#07090D]/15 pb-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#A82400]">
                  03 // ZERO-TRUST INSTITUTIONAL ARCHITECTURE
                </p>
                <h2 className="mt-2 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
                  Permissions, Never Role Strings.
                </h2>
              </div>
              <div className="flex items-center gap-4 lg:col-span-4 lg:justify-end">
                <GovernanceSealSvg className="h-14 w-14 shrink-0" />
                <p className="text-xs leading-relaxed text-[#2C3542]">
                  Apache APISIX + Keycloak 26 + Fastify PBAC enforce 44 atomic
                  permission scopes and database row locks on every mutation.
                </p>
              </div>
            </div>

            {/* 4-Stage Pipeline */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "STAGE 01",
                  title: "Organizer Proposal & Monsoon Backup",
                  detail:
                    "Event Heads submit 5-field run-of-show proposals; outdoor quadrangles enforce mandatory indoor auditorium backups.",
                  Icon: Sparkles,
                },
                {
                  step: "STAGE 02",
                  title: "<150ms Automated Clash Audit",
                  detail:
                    "Faculty Coordinators verify zero venue overlap and exam blackout compliance before signing departmental endorsement.",
                  Icon: Clock,
                },
                {
                  step: "STAGE 03",
                  title: "Deanery INR Sanction & SSE Publish",
                  detail:
                    "Dean of Students sanctions final INR budget and publishes live to the Concourse SSE stream.",
                  Icon: CheckCircle2,
                },
                {
                  step: "STAGE 04",
                  title: "30s Rotating HMAC Gate Scan",
                  detail:
                    "Door Marshals verify dynamic QR signatures in <180ms with strict first-name-only zero-PII exposure.",
                  Icon: QrCode,
                },
              ].map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.step}
                    className="rounded-xl border border-[#07090D]/15 bg-[#FAF8F3] p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#A82400]">
                        {item.step}
                      </span>
                      <Icon className="h-4 w-4 text-[#07090D]" />
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-bold text-[#07090D]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#374151]">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 8-Persona PBAC Matrix */}
            <div className="mt-12">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#07090D]">
                  8 Permission-Scoped Campus Workspaces
                </h3>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#A82400] hover:underline"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Test Any Persona in 1 Click on /login →</span>
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ROLE_MATRICES.map((r) => (
                  <div
                    key={r.idx}
                    className="flex flex-col justify-between rounded-xl border border-[#07090D]/15 bg-[#07090D] p-4 text-[#F4F0E6]"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-[#FF4D1C]">//{r.idx}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-[#2EE59D]" />
                      </div>
                      <h4 className="mt-2 font-serif text-base font-bold">
                        {r.name}
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#A2AEBE]">
                        {r.desc}
                      </p>
                    </div>
                    <p className="mt-3 truncate border-t border-white/10 pt-2 font-mono text-[10px] text-[#E2B45A]">
                      {r.perm}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
          SECTION 4: DEANERY & STUDENT APPEND-ONLY XP LEAGUE
         ===================================================================== */}
        {leaderboard && (
          <section
            id="league"
            className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-8">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-phosphor">
                  04 // GAMIFIED PARTICIPATION LEDGER (ST-06)
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-bone sm:text-5xl">
                  Inter-Deanery Season Standings
                </h2>
              </div>
              <span className="font-mono text-xs text-silver">
                Append-only XP credits · Masked participant identities
              </span>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                {leaderboard.deaneries.map((d) => (
                  <div
                    key={d.deanery}
                    className="flex items-center justify-between gap-4 rounded-xl border border-rule-strong bg-carbon p-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gunmetal font-mono text-sm font-bold text-vermilion">
                        0{d.rank}
                      </span>
                      <div>
                        <h3 className="font-serif text-base font-bold text-bone">
                          {d.deanery}
                        </h3>
                        <p className="font-mono text-[11px] text-gold">
                          {d.badge} · {d.activePasses} verified passes
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-lg font-bold text-phosphor">
                        {d.totalXp.toLocaleString("en-IN")}
                      </span>
                      <span className="block text-[10px] uppercase text-silver">
                        DEANERY XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-rule-strong bg-carbon p-6 lg:col-span-5">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-gold">
                  <Award className="h-4 w-4 text-vermilion" />
                  <span>Top Concourse Laureates (PII Redacted)</span>
                </div>
                <div className="mt-4 space-y-3">
                  {leaderboard.topParticipants.map((p) => (
                    <div
                      key={p.displayName}
                      className="flex items-center justify-between rounded-lg border border-rule bg-gunmetal px-4 py-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-bone">
                          #{p.rank} {p.displayName}
                        </p>
                        <p className="font-mono text-[11px] text-silver">
                          {p.department} · {p.badgesCount} badges
                        </p>
                      </div>
                      <span className="font-mono text-sm font-bold text-gold">
                        {p.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
          SECTION 5: CINEMATIC FEST CHRONICLE & THIRD WAVE ROASTERY PARTNER
         ===================================================================== */}
        <section
          id="chronicle"
          className="border-t border-rule bg-carbon/50 py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-8">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-vermilion">
                  05 // CINEMA SHOWREEL &amp; CLS-ZERO VISUAL ARCHIVE
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-bone sm:text-5xl">
                  Central Campus Cinema &amp; Fest Chronicle
                </h2>
              </div>
              <Link
                to="/login?redirect=/app/gallery"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-gold hover:underline"
              >
                <Film className="h-3.5 w-3.5 text-vermilion" />
                <span>Open Full Media Archive →</span>
              </Link>
            </div>

            {/* Dual-Channel Looping H.264 Campus Cinema Showreel */}
            <div className="mt-8 grid gap-5 lg:grid-cols-12">
              <div className="overflow-hidden rounded-2xl border border-rule-strong bg-carbon shadow-editorial lg:col-span-7">
                <CinemaVideoFrame
                  src="/media/christ-concourse-reel.mp4"
                  poster="/media/hero-central-campus.jpg"
                  alt="CHRIST Central Campus 4-Stage Flagship Showreel — Block IV Twilight, Labyrinth Hackathon, Blossoms & Magnovite"
                  badgeLabel="SHOWREEL 01 · FLAGSHIP CONCLAVES"
                  caption="Block IV Concourse · Labyrinth 24-Hr Systems Arena · Magnovite Robotics"
                  className="aspect-video w-full"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-rule-strong bg-carbon shadow-editorial lg:col-span-5">
                <CinemaVideoFrame
                  src="/media/blossoms-stage-loop.mp4"
                  poster="/media/fest-blossoms-stage.jpg"
                  alt="Blossoms Quadrangle Mainstage, Birds Park Skyview Atrium & Third Wave Campus Roastery Reel"
                  badgeLabel="SHOWREEL 02 · CULTURAL & PRECINCT LIFE"
                  caption="Blossoms Stage · Skyview Atrium · Central Block Roastery"
                  className="aspect-video w-full lg:h-full"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.slice(0, 6).map((item) => (
                <figure
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-rule-strong bg-carbon"
                >
                  <div className="aspect-video w-full overflow-hidden bg-void">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      width={1408}
                      height={768}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-4">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-gold">
                      <span>{item.festName || item.category}</span>
                      <span>{item.venueName}</span>
                    </div>
                    <p className="mt-1.5 font-serif text-base font-bold text-bone">
                      {item.title}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Third Wave Coffee Roastery Lounge Feature Card */}
            {sponsor && (
              <div className="mt-14 grid overflow-hidden rounded-2xl border border-rule-strong bg-obsidian shadow-anchor lg:grid-cols-12">
                <div className="relative min-h-[240px] lg:col-span-5">
                  <img
                    src="/media/thirdwave-roastery-lounge.jpg"
                    alt="Third Wave Coffee Central Block Roastery Lounge"
                    width={1408}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-obsidian/80 max-lg:hidden" />
                </div>
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-gold">
                      <Coffee className="h-4 w-4 text-vermilion" />
                      <span>OFFICIAL CAMPUS PARTNER · ZERO PII SHARING</span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-extrabold text-bone sm:text-3xl">
                      {sponsor.brand}
                    </h3>
                    <p className="mt-2 text-sm text-silver">
                      {sponsor.location} · {sponsor.hours}.{" "}
                      <strong className="text-bone">
                        {sponsor.studentPerk}
                      </strong>
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {sponsor.menuHighlights.map((m) => (
                      <div
                        key={m.name}
                        className="rounded-lg border border-rule bg-carbon p-3"
                      >
                        <p className="text-xs font-semibold text-bone">
                          {m.name}
                        </p>
                        <p className="mt-1 font-mono text-xs">
                          <span className="font-bold text-phosphor">
                            INR {m.studentPrice}
                          </span>{" "}
                          <span className="text-ink-muted line-through">
                            INR {m.price}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER
         ===================================================================== */}
      <footer className="border-t border-rule bg-obsidian py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <ColonnadeMotifSvg className="h-10 w-full opacity-75" />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChristCrestMark className="h-9 w-9" tone="light" />
              <div>
                <p className="font-display text-sm font-bold text-bone">
                  CONCOURSE // {DESIGN_TOKENS.campus.name}
                </p>
                <p className="font-mono text-[11px] text-silver">
                  {DESIGN_TOKENS.campus.precinct} · All timestamps rendered in
                  IST (UTC+05:30)
                </p>
              </div>
            </div>
            <div className="flex gap-5 font-mono text-xs uppercase text-silver">
              <Link to="/login" className="hover:text-vermilion">
                Portal Login
              </Link>
              <Link to="/signup" className="hover:text-vermilion">
                Dual-Track Signup
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
