import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  CloudRain,
  Coffee,
  Compass,
  Film,
  Flame,
  Maximize2,
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  X,
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
import { ChristCrestMark, ColonnadeMotifSvg } from "../components/BrandMarks";
import { CinemaVideoFrame } from "../components/CinemaVideoFrame";
import { dispatchOpenCommandPalette } from "../components/CommandPalette";
import { EventDetailModal } from "../components/EventDetailModal";
import { GovernanceCommandConsole } from "../components/GovernanceCommandConsole";
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

export const CATEGORY_THUMBS: Record<string, string> = {
  Hackathon: "/media/fest-labyrinth-hackathon.jpg",
  Technical: "/media/fest-magnovite-robotics.jpg",
  Workshop: "/media/campus-skyview-atrium.jpg",
  Cultural: "/media/fest-blossoms-stage.jpg",
  Competition: "/media/auditorium-keynote-conclave.jpg",
  "Guest Lecture": "/media/auditorium-keynote-conclave.jpg",
  Placement: "/media/campus-skyview-atrium.jpg",
  Sports: "/media/southgate-floodlit-futsal.jpg",
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [externalFilterOnly, setExternalFilterOnly] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [gpuReady, setGpuReady] = useState(false);
  const [mapInView, setMapInView] = useState(false);

  const mapSectionRef = useRef<HTMLElement | null>(null);

  // Progressive WebGL Hydration: Instant zero-CLS HTML/CSS paint first,
  // upgrading to GPU Three.js SDF typography on first interaction or post-load idle.
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

  // Auto-hydrate 9-Block 3D Precinct Twin before user reaches Section 02
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      import.meta.env.MODE === "test" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const el = mapSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMapInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "650px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard Escape closes gallery lightbox
  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxItem]);

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
    const q = searchQuery.trim().toLowerCase();
    return events
      .filter((e) => {
        if (
          activeCategory !== "All" &&
          e.category.toLowerCase() !== activeCategory.toLowerCase()
        ) {
          return false;
        }
        if (externalFilterOnly && !e.isExternalOpen) return false;
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          (e.clubName || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 7);
  }, [events, activeCategory, searchQuery, externalFilterOnly]);

  const featuredEvent = useMemo(
    () => events.find((e) => e.id === "evt-hackathon-100") || events[0] || null,
    [events],
  );

  const spotlightConclave = filteredEvents[0] || featuredEvent;
  const bentoConclaves = useMemo(() => {
    if (!spotlightConclave) return filteredEvents.slice(0, 6);
    const rest = filteredEvents.filter((e) => e.id !== spotlightConclave.id);
    return rest.length > 0 ? rest.slice(0, 6) : filteredEvents.slice(0, 6);
  }, [filteredEvents, spotlightConclave]);

  const maxDeaneryXp = useMemo(() => {
    if (!leaderboard?.deaneries.length) return 20000;
    return Math.max(...leaderboard.deaneries.map((d) => d.totalXp), 1);
  }, [leaderboard]);

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

            {/* AAA Game-Engine GPU SDF 3D Kinetic Typography */}
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
            SECTION 01: ASYMMETRIC SPOTLIGHT DECK & BENTO CONCLAVE MATRIX
           ===================================================================== */}
        <section
          id="conclaves"
          className="relative overflow-hidden border-b border-rule py-24 lg:py-32"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-16 h-[420px] w-[520px] rounded-full bg-gold/5 blur-[140px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
            {/* Architectural Section Header + Live Search & Filter Console */}
            <div className="flex flex-col gap-6 border-b border-rule pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-vermilion/40 bg-vermilion-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-vermilion">
                  <Flame className="h-3.5 w-3.5" />
                  <span>01 // LIVE PRECINCT SCHEDULE (IST · UTC+05:30)</span>
                </div>
                <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-bone sm:text-6xl">
                  Active Conclaves &amp;{" "}
                  <span className="text-gold">Flagships.</span>
                </h2>
              </div>

              {/* Live Search & External Scope Toggle */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[230px] flex-1 sm:w-72">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-vermilion" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Filter campus conclaves"
                    placeholder="Filter title, auditorium, or club..."
                    className="w-full rounded-lg border border-rule-strong bg-carbon py-2.5 pl-9 pr-3.5 font-mono text-xs text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  aria-pressed={externalFilterOnly}
                  onClick={() => setExternalFilterOnly((p) => !p)}
                  className={`rounded-lg border px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                    externalFilterOnly
                      ? "border-phosphor bg-phosphor text-void"
                      : "border-rule-strong bg-carbon text-silver hover:border-phosphor/60 hover:text-bone"
                  }`}
                >
                  External-Open
                </button>
              </div>
            </div>

            {/* Category Selector Ribbon */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {DESIGN_TOKENS.categories.slice(0, 7).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold uppercase transition ${
                      activeCategory === cat
                        ? "bg-vermilion text-void shadow-glow"
                        : "border border-rule bg-carbon text-silver hover:border-bone/40 hover:text-bone"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-silver">
                Showing{" "}
                <strong className="text-bone">{filteredEvents.length}</strong>{" "}
                sanctioned schedules
              </span>
            </div>

            {/* Monumental Lead Spotlight Flagship Card */}
            {spotlightConclave &&
              (() => {
                const leadSeat = computeSeatState(spotlightConclave);
                const leadImg =
                  CATEGORY_THUMBS[spotlightConclave.category] ||
                  "/media/fest-labyrinth-hackathon.jpg";
                return (
                  <article className="hud-frame glass-console mt-8 grid overflow-hidden rounded-2xl border border-rule-strong lg:grid-cols-12">
                    <div className="relative min-h-[260px] overflow-hidden bg-void lg:col-span-7">
                      <img
                        src={leadImg}
                        alt={spotlightConclave.title}
                        width={1280}
                        height={720}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover opacity-85 transition duration-700 hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent lg:bg-gradient-to-r lg:from-void/20 lg:via-transparent lg:to-carbon/90" />

                      <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded bg-vermilion px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-void shadow-glow">
                          <Sparkles className="h-3 w-3" />
                          <span>
                            SPOTLIGHT CONCLAVE · {spotlightConclave.category}
                          </span>
                        </span>
                        {spotlightConclave.isExternalOpen ? (
                          <span className="rounded border border-phosphor/50 bg-void/85 px-3 py-1 font-mono text-[10px] font-bold uppercase text-phosphor backdrop-blur-md">
                            External Colleges Permitted
                          </span>
                        ) : (
                          <span className="rounded border border-rule-strong bg-void/85 px-3 py-1 font-mono text-[10px] font-semibold uppercase text-gold backdrop-blur-md">
                            CHRIST Central Internal
                          </span>
                        )}
                      </div>

                      {spotlightConclave.indoorBackupVenueName && (
                        <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-md border border-ochre/45 bg-void/85 px-3 py-1.5 font-mono text-[11px] text-ochre backdrop-blur-md">
                          <CloudRain className="h-3.5 w-3.5" />
                          <span>
                            Monsoon Backup:{" "}
                            {spotlightConclave.indoorBackupVenueName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
                      <div>
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="uppercase tracking-wider text-gold">
                            {spotlightConclave.clubName ||
                              spotlightConclave.department}
                          </span>
                          <span className="font-bold text-bone">
                            {formatInr(spotlightConclave.fee)}
                          </span>
                        </div>

                        <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-bone sm:text-3xl">
                          {spotlightConclave.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-silver sm:text-sm">
                          {spotlightConclave.description}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-rule bg-void/85 p-3.5 font-mono text-xs">
                          <div>
                            <span className="block text-[10px] uppercase text-ink-muted">
                              SCHEDULE (IST)
                            </span>
                            <span className="mt-0.5 block font-semibold text-bone">
                              {formatIstDate(spotlightConclave.startsAt)}
                            </span>
                            <span className="text-[11px] text-silver">
                              {formatIstTime(spotlightConclave.startsAt)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase text-ink-muted">
                              PRECINCT VENUE
                            </span>
                            <span className="mt-0.5 block truncate font-semibold text-bone">
                              {spotlightConclave.venueName}
                            </span>
                            <span className="text-[11px] text-gold">
                              Cap {spotlightConclave.capacity} · Waitlist{" "}
                              {spotlightConclave.waitlistCap}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3 border-t border-rule pt-4">
                        <div>
                          <div className="flex items-center justify-between font-mono text-xs">
                            <span className="text-silver">
                              Live Seat Telemetry
                            </span>
                            <span
                              className={`font-bold ${
                                leadSeat.state === "CRITICAL"
                                  ? "text-vermilion"
                                  : leadSeat.state === "WAITLIST"
                                    ? "text-ochre"
                                    : "text-phosphor"
                              }`}
                            >
                              {leadSeat.label}
                            </span>
                          </div>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-void">
                            <div
                              style={{ width: `${leadSeat.fillPercent}%` }}
                              className="h-full bg-gradient-to-r from-gold via-vermilion to-vermilion"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedEvent(spotlightConclave)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-vermilion px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-void shadow-glow transition hover:bg-vermilion-hover"
                        >
                          <Ticket className="h-4 w-4" />
                          <span>Inspect &amp; Lock Atomic Seat</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })()}

            {/* Numbered Kinetic Bento Conclave Grid */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bentoConclaves.map((evt, index) => {
                const seat = computeSeatState(evt);
                const coverImg =
                  CATEGORY_THUMBS[evt.category] ||
                  "/media/hero-central-campus.jpg";
                const idxLabel = String(index + 1).padStart(2, "0");
                return (
                  <article
                    key={evt.id}
                    className="spotlight-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-rule-strong transition duration-300 hover:-translate-y-1 hover:border-vermilion"
                  >
                    <div>
                      <div className="relative h-48 w-full overflow-hidden bg-void">
                        <img
                          src={coverImg}
                          alt={evt.title}
                          width={1280}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />

                        <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-vermilion px-2 py-0.5 font-mono text-[10px] font-bold text-void">
                              //{idxLabel}
                            </span>
                            <span className="rounded bg-void/85 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-bone backdrop-blur-md">
                              {evt.category}
                            </span>
                          </div>
                          {evt.isExternalOpen ? (
                            <span className="rounded border border-phosphor/45 bg-void/85 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-phosphor backdrop-blur-md">
                              External-Open
                            </span>
                          ) : (
                            <span className="rounded border border-rule-strong bg-void/85 px-2.5 py-0.5 font-mono text-[10px] text-silver backdrop-blur-md">
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

                    <div className="border-t border-rule bg-void/55 p-5">
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
          </div>
        </section>

        {/* =====================================================================
            SECTION 02: INTERACTIVE 3D CHRIST CENTRAL PRECINCT DIGITAL TWIN
           ===================================================================== */}
        <section
          ref={mapSectionRef}
          id="precinct-3d"
          className="relative overflow-hidden border-b border-rule bg-obsidian py-24 lg:py-32"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-tactical-dots opacity-35"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                  <Compass className="h-3.5 w-3.5 text-vermilion" />
                  <span>02 // SPATIAL CAMPUS TOPOLOGY</span>
                </div>
                <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-bone sm:text-6xl">
                  9-Block 3D Precinct{" "}
                  <span className="text-vermilion">Digital Twin.</span>
                </h2>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-silver sm:text-sm">
                Click any auditorium, quadrangle, or floodlit turf block in the
                Three.js spatial CAD model to inspect certified seating, monsoon
                indoor backups, and live schedules.
              </p>
            </div>

            {/* 4 Spatial Telemetry Metrics */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "MAPPED CAMPUS BLOCKS",
                  val: `${venues.length || 9} Venues`,
                  sub: "Hosur Road Central Precinct",
                  accent: "text-bone",
                },
                {
                  label: "CERTIFIED CAPACITY",
                  val: "3,450+ Seats",
                  sub: "Main Audi, KE Audi & Halls",
                  accent: "text-gold",
                },
                {
                  label: "MONSOON CONTINGENCY",
                  val: "100% Backed",
                  sub: "Outdoor -> Indoor Auto-Link",
                  accent: "text-phosphor",
                },
                {
                  label: "TEMPORAL CLASH ENGINE",
                  val: "<3ms SLA",
                  sub: "Zero Double-Booked Slots",
                  accent: "text-vermilion",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="spotlight-card rounded-xl border border-rule-strong p-4"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    {stat.label}
                  </span>
                  <p
                    className={`mt-1.5 font-display text-2xl font-extrabold ${stat.accent}`}
                  >
                    {stat.val}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-silver">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="hud-frame mt-8 rounded-2xl">
              {gpuReady || mapInView ? (
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
                    width={1280}
                    height={720}
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
                      Central Block, K.E. Auditorium &amp; Birds Park
                      Amphitheatre
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMapInView(true)}
                      className="inline-flex items-center gap-2 rounded-md bg-vermilion px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
                    >
                      <span>Activate 3D Precinct Twin</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 03: ZERO-TRUST GOVERNANCE, 8-PERSONA PBAC & CONCURRENCY LAB
           ===================================================================== */}
        <GovernanceCommandConsole />

        {/* =====================================================================
            SECTION 04: CHAMPIONSHIP DEANERY & STUDENT APPEND-ONLY XP LEAGUE
           ===================================================================== */}
        {leaderboard && (
          <section
            id="league"
            className="relative overflow-hidden border-b border-rule bg-obsidian py-24 lg:py-32"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-20 h-[360px] w-[480px] rounded-full bg-phosphor/5 blur-[130px]"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-phosphor/40 bg-phosphor-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-phosphor">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>04 // GAMIFIED PARTICIPATION LEDGER (ST-06)</span>
                  </div>
                  <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-bone sm:text-6xl">
                    Inter-Deanery{" "}
                    <span className="text-gold">Season Standings.</span>
                  </h2>
                </div>
                <div className="rounded-lg border border-rule-strong bg-carbon px-4 py-2.5 font-mono text-xs text-silver">
                  <span className="text-phosphor">+10 XP</span> Seat Confirmed ·{" "}
                  <span className="text-gold">+50 XP</span> Gate QR Verified
                </div>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-12">
                {/* Left: Deanery Championship Telemetry Bars */}
                <div className="space-y-4 lg:col-span-7">
                  {leaderboard.deaneries.map((d) => {
                    const barPct = Math.max(
                      18,
                      Math.round((d.totalXp / maxDeaneryXp) * 100),
                    );
                    const medalStyle =
                      d.rank === 1
                        ? "border-gold bg-gold text-void"
                        : d.rank === 2
                          ? "border-bone/60 bg-bone text-void"
                          : d.rank === 3
                            ? "border-vermilion bg-vermilion text-void"
                            : "border-rule-strong bg-gunmetal text-silver";
                    return (
                      <div
                        key={d.deanery}
                        className="spotlight-card rounded-2xl border border-rule-strong p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-extrabold ${medalStyle}`}
                            >
                              0{d.rank}
                            </span>
                            <div>
                              <h3 className="font-serif text-lg font-bold text-bone">
                                {d.deanery}
                              </h3>
                              <p className="font-mono text-[11px] text-gold">
                                {d.badge} · {d.activePasses} verified passes
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xl font-extrabold text-phosphor">
                              {d.totalXp.toLocaleString("en-IN")}
                            </span>
                            <span className="block text-[10px] uppercase tracking-wider text-silver">
                              DEANERY XP
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-void">
                          <div
                            style={{ width: `${barPct}%` }}
                            className={`h-full rounded-full ${
                              d.rank === 1
                                ? "bg-gradient-to-r from-gold to-vermilion"
                                : d.rank === 2
                                  ? "bg-gradient-to-r from-phosphor to-gold"
                                  : "bg-phosphor/80"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Top Concourse Laureates HUD */}
                <div className="hud-frame glass-console flex flex-col justify-between rounded-2xl border border-rule-strong p-6 lg:col-span-5">
                  <div>
                    <div className="flex items-center justify-between border-b border-rule pb-4">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-gold">
                        <Award className="h-4 w-4 text-vermilion" />
                        <span>Top Concourse Laureates</span>
                      </div>
                      <span className="rounded border border-phosphor/40 bg-phosphor-soft px-2 py-0.5 font-mono text-[10px] text-phosphor">
                        PII Masked
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {leaderboard.topParticipants.map((p) => (
                        <div
                          key={p.displayName}
                          className="flex items-center justify-between rounded-xl border border-rule bg-void/80 px-4 py-3.5 transition hover:border-gold/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gunmetal font-mono text-xs font-bold text-vermilion">
                              #{p.rank}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-bone">
                                {p.displayName}
                              </p>
                              <p className="font-mono text-[11px] text-silver">
                                {p.department} · {p.badgesCount} badges
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-extrabold text-gold">
                            {p.xp} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-rule bg-carbon p-4">
                    <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-bone">
                      <Users className="h-3.5 w-3.5 text-phosphor" />
                      <span>Immutable Append-Only XP Ledger</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-silver">
                      XP entries are written atomically upon confirmed seat
                      registration and auditorium gate scan — never editable or
                      publicly tied to student register numbers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            SECTION 05: CINEMA SHOWREELS, BENTO MOSAIC & PARTNER BOARDING PASS
           ===================================================================== */}
        <section id="chronicle" className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-vermilion/40 bg-vermilion-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-vermilion">
                  <Film className="h-3.5 w-3.5" />
                  <span>
                    05 // CINEMA SHOWREEL &amp; CLS-ZERO VISUAL ARCHIVE
                  </span>
                </div>
                <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-bone sm:text-6xl">
                  Central Campus{" "}
                  <span className="text-vermilion">Fest Chronicle.</span>
                </h2>
              </div>
              <Link
                to="/login?redirect=/app/gallery"
                className="inline-flex items-center gap-2 rounded-md border border-rule-strong bg-carbon px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-gold transition hover:border-gold"
              >
                <Film className="h-3.5 w-3.5 text-vermilion" />
                <span>Open Full Media Archive →</span>
              </Link>
            </div>

            {/* Dual-Channel Looping H.264 Campus Cinema Showreel */}
            <div className="mt-10 grid gap-5 lg:grid-cols-12">
              <div className="hud-frame overflow-hidden rounded-2xl border border-rule-strong bg-carbon shadow-editorial lg:col-span-7">
                <CinemaVideoFrame
                  src="/media/christ-concourse-reel.mp4"
                  poster="/media/hero-central-campus.jpg"
                  alt="CHRIST Central Campus 4-Stage Flagship Showreel — Block IV Twilight, Labyrinth Hackathon, Blossoms & Magnovite"
                  badgeLabel="SHOWREEL 01 · FLAGSHIP CONCLAVES"
                  caption="Block IV Concourse · Labyrinth 24-Hr Systems Arena · Magnovite Robotics"
                  className="aspect-video w-full"
                />
              </div>

              <div className="hud-frame overflow-hidden rounded-2xl border border-rule-strong bg-carbon shadow-editorial lg:col-span-5">
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

            {/* Asymmetric Bento Photographic Mosaic with Fullscreen Lightbox */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
              {gallery.slice(0, 6).map((item, idx) => {
                const spanClass =
                  idx === 0
                    ? "lg:col-span-7"
                    : idx === 1
                      ? "lg:col-span-5"
                      : idx === 2
                        ? "lg:col-span-4"
                        : idx === 3
                          ? "lg:col-span-4"
                          : idx === 4
                            ? "lg:col-span-4"
                            : "lg:col-span-12";
                return (
                  <figure
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className={`spotlight-card group relative cursor-pointer overflow-hidden rounded-2xl border border-rule-strong ${spanClass}`}
                  >
                    <div
                      className={`w-full overflow-hidden bg-void ${
                        idx === 5 ? "h-64 sm:h-72" : "aspect-video"
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        width={1280}
                        height={720}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
                    </div>

                    <button
                      type="button"
                      aria-label={`Expand ${item.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxItem(item);
                      }}
                      className="absolute right-3.5 top-3.5 rounded-lg border border-white/20 bg-void/80 p-2 text-bone backdrop-blur-md transition hover:border-vermilion hover:text-vermilion"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>

                    <figcaption className="absolute bottom-0 inset-x-0 p-5">
                      <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                        <span>{item.festName || item.category}</span>
                        <span>{item.venueName}</span>
                      </div>
                      <p className="mt-1 font-serif text-lg font-bold text-bone sm:text-xl">
                        {item.title}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>

            {/* Perforated Third Wave Coffee Campus Partner Voucher Pass */}
            {sponsor && (
              <div className="hud-frame glass-console mt-16 grid overflow-hidden rounded-2xl border border-rule-strong lg:grid-cols-12">
                <div className="relative min-h-[260px] lg:col-span-5">
                  <img
                    src="/media/thirdwave-roastery-lounge.jpg"
                    alt="Third Wave Coffee Central Block Roastery Lounge"
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-obsidian/90" />
                  <div className="absolute bottom-4 left-4 rounded-md border border-gold/50 bg-void/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur-md">
                    CENTRAL BLOCK · GROUND FLOOR
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-gold">
                        <Coffee className="h-4 w-4 text-vermilion" />
                        <span>OFFICIAL CAMPUS ROASTERY PARTNER</span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded border border-phosphor/40 bg-phosphor-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-phosphor">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Zero Student PII Shared</span>
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-3xl font-extrabold text-bone sm:text-4xl">
                      {sponsor.brand}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-silver">
                      {sponsor.location} ({sponsor.hours}).{" "}
                      <strong className="text-bone">
                        {sponsor.studentPerk}
                      </strong>
                    </p>
                  </div>

                  <div className="pass-perforation my-5 h-[2px] w-full" />

                  <div className="grid gap-3 sm:grid-cols-3">
                    {sponsor.menuHighlights.map((m) => (
                      <div
                        key={m.name}
                        className="rounded-xl border border-rule-strong bg-void/85 p-3.5"
                      >
                        <p className="text-xs font-bold text-bone">{m.name}</p>
                        <div className="mt-1.5 flex items-baseline gap-2 font-mono text-xs">
                          <span className="text-sm font-extrabold text-phosphor">
                            INR {m.studentPrice}
                          </span>
                          <span className="text-ink-muted line-through">
                            INR {m.price}
                          </span>
                        </div>
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
          MONUMENTAL ARCHITECTURAL FOOTER
         ===================================================================== */}
      <footer className="relative overflow-hidden border-t border-rule bg-obsidian pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          {/* Top 4-Column Institutional Directory */}
          <div className="grid gap-10 border-b border-rule pb-12 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div className="flex items-center gap-3.5">
                <ChristCrestMark className="h-11 w-11" tone="light" />
                <div>
                  <p className="font-display text-lg font-extrabold tracking-tight text-bone">
                    CONCOURSE // CHRIST CENTRAL
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-gold">
                    {DESIGN_TOKENS.campus.name}
                  </p>
                </div>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-silver">
                Zero-Trust permission-scoped campus event governance, atomic
                row-locked seat allocations, 30-second rotating HMAC gate
                credentials, and spatial 3D venue telemetry.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-phosphor/35 bg-phosphor-soft px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-phosphor">
                <Activity className="h-3 w-3" />
                <span>APISIX · KEYCLOAK 26 · FASTIFY PBAC · NOMINAL</span>
              </div>
            </div>

            <div className="space-y-2.5 lg:col-span-2">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
                Concourse
              </p>
              <ul className="space-y-2 font-mono text-xs text-silver">
                <li>
                  <a href="#conclaves" className="hover:text-bone">
                    Live Schedule
                  </a>
                </li>
                <li>
                  <a href="#precinct-3d" className="hover:text-bone">
                    9-Block 3D Twin
                  </a>
                </li>
                <li>
                  <a href="#governance" className="hover:text-bone">
                    PBAC Matrix
                  </a>
                </li>
                <li>
                  <a href="#league" className="hover:text-bone">
                    Deanery League
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 lg:col-span-2">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
                Identity &amp; Access
              </p>
              <ul className="space-y-2 font-mono text-xs text-silver">
                <li>
                  <Link to="/login" className="hover:text-vermilion">
                    Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-vermilion">
                    Student &amp; Guest Pass
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={dispatchOpenCommandPalette}
                    className="hover:text-vermilion"
                  >
                    Command Palette (Ctrl+K)
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 lg:col-span-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
                Precinct Coordinates
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-silver">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
                <span>
                  Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka
                  560029 · Gate-1 Admission Corridor
                </span>
              </p>
              <p className="font-mono text-[11px] text-ink-muted">
                12.9345° N, 77.6060° E · IST (UTC+05:30)
              </p>
            </div>
          </div>

          {/* Architectural Colonnade Vector & Monumental Outline Watermark */}
          <div className="mt-8">
            <ColonnadeMotifSvg className="h-10 w-full opacity-75" />
            <svg
              viewBox="0 0 1200 170"
              aria-hidden="true"
              className="mt-4 h-auto w-full select-none"
            >
              <text
                x="600"
                y="142"
                textAnchor="middle"
                fill="none"
                stroke="rgba(244,240,230,0.12)"
                strokeWidth="1.5"
                fontFamily="Syne Variable, Syne, sans-serif"
                fontWeight="800"
                fontSize="162"
                letterSpacing="-4"
              >
                CONCOURSE
              </text>
            </svg>
          </div>
        </div>
      </footer>

      {/* Fullscreen Chronicle Lightbox Modal */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-frame glass-console w-full max-w-4xl overflow-hidden rounded-2xl border border-rule-strong"
          >
            <div className="relative aspect-video w-full bg-void">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Close media preview"
                className="absolute right-4 top-4 rounded-lg border border-white/20 bg-void/85 p-2 text-bone hover:border-vermilion hover:text-vermilion"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-gold">
                  {lightboxItem.festName || lightboxItem.category} ·{" "}
                  {lightboxItem.venueName}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-bone">
                  {lightboxItem.title}
                </h3>
                {lightboxItem.caption && (
                  <p className="mt-1 text-xs text-silver">
                    {lightboxItem.caption}
                  </p>
                )}
              </div>
              <Link
                to="/login?redirect=/app/gallery"
                className="rounded-md bg-vermilion px-4 py-2.5 font-mono text-xs font-bold uppercase text-void hover:bg-vermilion-hover"
              >
                Explore Full Archive
              </Link>
            </div>
          </div>
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
