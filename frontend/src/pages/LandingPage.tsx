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
  Film,
  MapPin,
  Maximize2,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
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
import { CampusVoicesAndFaqSection } from "../components/CampusVoicesAndFaqSection";
import { CinemaVideoFrame } from "../components/CinemaVideoFrame";
import { dispatchOpenCommandPalette } from "../components/CommandPalette";
import { ConclaveItineraryPlanner } from "../components/ConclaveItineraryPlanner";
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
  <div className="flex h-[230px] w-full flex-col items-center justify-center px-1 text-center sm:h-[295px] lg:h-[340px]">
    <h1 className="max-w-full">
      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-silver sm:text-[11px]">
        12.9345° N · 77.6060° E · ZERO-TRUST CAMPUS EVENT OPERATING SYSTEM
      </span>
      <span className="mt-3 block font-display text-[2.85rem] font-bold leading-none tracking-[-0.045em] text-bone sm:text-7xl lg:text-[6.25rem]">
        CONCOURSE
      </span>
      <span className="editorial-italic mt-2 block text-2xl text-gold sm:text-4xl">
        Christ Central Campus — Bengaluru
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

  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxItem]);

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
        duration: 1.08,
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
      {/* Subtle Champagne-to-Vermilion Scroll Progress Hairline */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-50 h-[2px] bg-gradient-to-r from-gold via-vermilion to-phosphor transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <PublicNavbar />

      <main id="main-content">
        {/* =====================================================================
            HERO SECTION: EDITORIAL LUXURY + 3D SDF TYPOGRAPHY + STUDIO ANCHOR
           ===================================================================== */}
        <section className="relative overflow-hidden border-b border-rule">
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
              className="h-full w-full object-cover opacity-22"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/92 to-void" />
            <div className="absolute inset-0 bg-architectural-grid" />
            <div className="absolute left-1/2 top-8 h-[360px] w-[780px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[150px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-12">
            {/* Centered Delicate Live Campus Capsule (Zero CLS) */}
            <div className="mb-4 flex justify-center">
              <div className="inline-flex min-h-[34px] max-w-full items-center gap-2.5 rounded-full border border-rule-strong bg-carbon/80 px-4 py-1.5 text-xs backdrop-blur-xl">
                <span className="h-2 w-2 shrink-0 rounded-full bg-phosphor shadow-[0_0_8px_#34D399]" />
                <span className="truncate font-medium text-bone">
                  {pulse[0]?.label ||
                    "Main Auditorium & Central Quadrangle Operational"}
                </span>
                <span className="hidden font-mono text-[11px] text-gold md:inline">
                  · {DESIGN_TOKENS.campus.name}
                </span>
              </div>
            </div>

            {/* Studio WebGL SDF 3D Kinetic Typography (Bricolage 800 + Instrument Serif Italic) */}
            {gpuReady ? (
              <Suspense fallback={<InstantHeroHeadingFallback />}>
                <WebGLKineticHeroText
                  primaryLine="CONCOURSE"
                  secondaryLine="Christ Central Campus — Bengaluru"
                  telemetryLine="12.9345° N · 77.6060° E · ZERO-TRUST CAMPUS EVENT OPERATING SYSTEM"
                />
              </Suspense>
            ) : (
              <InstantHeroHeadingFallback />
            )}

            {/* Editorial Lead Copy & Sculpted Pill CTAs */}
            <div className="mx-auto mt-3 max-w-2xl text-center">
              <p className="text-base leading-relaxed text-silver sm:text-lg">
                Designed for{" "}
                <strong className="font-semibold text-bone">
                  {DESIGN_TOKENS.campus.name}
                </strong>{" "}
                on Hosur Road. Atomic seat locking, instant faculty venue-clash
                audits, 30-second rotating HMAC gate passes, and verifiable
                commit-reveal draws across eight institutional roles.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  to={primaryCtaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-void shadow-[0_12px_32px_-8px_rgba(245,242,235,0.35)] transition hover:bg-gold"
                >
                  <span>
                    {isAuthenticated
                      ? "Open Role Workspace"
                      : "Enter Concourse Portal"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-rule-strong bg-carbon/85 px-7 py-3.5 text-sm font-semibold text-bone backdrop-blur-xl transition hover:border-gold hover:text-gold"
                >
                  <span>Student &amp; Visiting College Pass</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Double-Bezel Interactive Visual Showcase */}
            <div className="mt-14">
              <HeroMediaAnchor
                featuredEvent={featuredEvent}
                onInspectEvent={(evt) => setSelectedEvent(evt)}
              />
            </div>

            {/* 4-Column Swiss Hairline Institutional Scale Bar */}
            <div className="mt-12 grid divide-y divide-rule rounded-3xl border border-rule bg-carbon/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {[
                {
                  num: "09",
                  unit: "Precinct Venues",
                  sub: "Main Audi, KE Audi & Block Halls",
                },
                {
                  num: "45",
                  unit: "PBAC Permissions",
                  sub: "Zero hardcoded role strings",
                },
                {
                  num: "30s",
                  unit: "Rotating HMAC QR",
                  sub: "Anti-screenshot Gate-1 verification",
                },
                {
                  num: "<3ms",
                  unit: "Clash Engine SLA",
                  sub: "Automated monsoon & exam checks",
                },
              ].map((item) => (
                <div key={item.unit} className="px-6 py-5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-3xl font-bold tracking-tight text-bone">
                      {item.num}
                    </span>
                    <span className="editorial-italic text-xl text-gold">
                      {item.unit}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-silver">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SILK WEBGL TYPOGRAPHY RIBBON
           ===================================================================== */}
        {gpuReady ? (
          <Suspense
            fallback={
              <div className="overflow-hidden border-y border-rule bg-obsidian/90 py-4">
                <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-xl font-semibold tracking-tight text-bone/90 sm:text-2xl">
                  <span>
                    Christ Central Campus · Atomic Row-Locked Seats · 30s
                    Rotating HMAC Gate Passes · SHA-256 Commit-Reveal Draws ·
                  </span>
                  <span className="editorial-italic text-gold">
                    Christ Central Campus · Atomic Row-Locked Seats · 30s
                    Rotating HMAC Gate Passes · SHA-256 Commit-Reveal Draws ·
                  </span>
                </div>
              </div>
            }
          >
            <WebGLShaderMarquee />
          </Suspense>
        ) : (
          <div className="overflow-hidden border-y border-rule bg-obsidian/90 py-4">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-xl font-semibold tracking-tight text-bone/90 sm:text-2xl">
              <span>
                Christ Central Campus · Atomic Row-Locked Seats · 30s Rotating
                HMAC Gate Passes · SHA-256 Commit-Reveal Draws ·
              </span>
              <span className="editorial-italic text-gold">
                Christ Central Campus · Atomic Row-Locked Seats · 30s Rotating
                HMAC Gate Passes · SHA-256 Commit-Reveal Draws ·
              </span>
            </div>
          </div>
        )}

        {/* =====================================================================
            CHAPTER 01: CURATED CONCLAVE SEASON & MAGAZINE FEATURE GRID
           ===================================================================== */}
        <section
          id="conclaves"
          className="relative overflow-hidden border-b border-rule py-24 lg:py-32"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-20 h-[440px] w-[540px] rounded-full bg-gold/[0.05] blur-[150px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
            {/* Editorial Chapter Masthead */}
            <div className="flex flex-col gap-6 border-b border-rule pb-10 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="editorial-italic text-3xl text-gold sm:text-4xl">
                    01.
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">
                    Live Campus Season · Asia/Kolkata (IST)
                  </span>
                </div>
                <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
                  Active Conclaves &amp;{" "}
                  <span className="editorial-italic font-normal text-gold">
                    Campus Flagships.
                  </span>
                </h2>
              </div>

              {/* Clean Search & External Scope Capsule */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[240px] flex-1 sm:w-72">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gold" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Filter campus conclaves"
                    placeholder="Search title, auditorium, or society..."
                    className="w-full rounded-full border border-rule-strong bg-carbon py-2.5 pl-10 pr-4 text-xs text-bone placeholder:text-ink-muted focus:border-gold focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  aria-pressed={externalFilterOnly}
                  onClick={() => setExternalFilterOnly((p) => !p)}
                  className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    externalFilterOnly
                      ? "border-phosphor bg-phosphor text-void"
                      : "border-rule-strong bg-carbon text-silver hover:border-phosphor/60 hover:text-bone"
                  }`}
                >
                  External-Open Only
                </button>
              </div>
            </div>

            {/* Refined Pill Category Filter Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {DESIGN_TOKENS.categories.slice(0, 7).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      activeCategory === cat
                        ? "bg-bone text-void shadow-sm"
                        : "border border-rule bg-carbon/80 text-silver hover:border-rule-strong hover:text-bone"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="font-mono text-xs text-silver">
                Showing{" "}
                <strong className="font-semibold text-bone">
                  {filteredEvents.length}
                </strong>{" "}
                published schedules
              </span>
            </div>

            {/* Lead Magazine Feature Spread */}
            {spotlightConclave &&
              (() => {
                const leadSeat = computeSeatState(spotlightConclave);
                const leadImg =
                  CATEGORY_THUMBS[spotlightConclave.category] ||
                  "/media/fest-labyrinth-hackathon.jpg";
                return (
                  <div className="studio-bezel mt-10">
                    <article className="grid overflow-hidden rounded-[20px] border border-rule bg-carbon lg:grid-cols-12">
                      <div className="relative min-h-[280px] overflow-hidden bg-void lg:col-span-7">
                        <img
                          src={leadImg}
                          alt={spotlightConclave.title}
                          width={1280}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover opacity-85 transition duration-700 hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent lg:bg-gradient-to-r lg:from-void/15 lg:via-transparent lg:to-carbon/90" />

                        <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-bone px-3.5 py-1 text-[11px] font-semibold text-void shadow-sm">
                            <Sparkles className="h-3 w-3 text-vermilion" />
                            <span>
                              Featured Flagship · {spotlightConclave.category}
                            </span>
                          </span>
                          {spotlightConclave.isExternalOpen ? (
                            <span className="rounded-full border border-phosphor/45 bg-void/80 px-3 py-1 text-[11px] font-medium text-phosphor backdrop-blur-md">
                              Visiting Colleges Welcome
                            </span>
                          ) : (
                            <span className="rounded-full border border-white/15 bg-void/80 px-3 py-1 text-[11px] font-medium text-gold backdrop-blur-md">
                              CHRIST Central Internal
                            </span>
                          )}
                        </div>

                        {spotlightConclave.indoorBackupVenueName && (
                          <div className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full border border-ochre/40 bg-void/85 px-3.5 py-1.5 text-xs text-ochre backdrop-blur-md">
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
                          <div className="flex items-center justify-between text-xs">
                            <span className="editorial-italic text-lg text-gold">
                              {spotlightConclave.clubName ||
                                spotlightConclave.department}
                            </span>
                            <span className="font-mono font-semibold text-bone">
                              {formatInr(spotlightConclave.fee)}
                            </span>
                          </div>

                          <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-bone sm:text-3xl">
                            {spotlightConclave.title}
                          </h3>

                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-silver">
                            {spotlightConclave.description}
                          </p>

                          <div className="mt-6 grid grid-cols-2 divide-x divide-rule rounded-2xl border border-rule bg-void/70 py-3.5">
                            <div className="px-4">
                              <span className="block text-[11px] text-ink-muted">
                                Schedule (IST)
                              </span>
                              <span className="mt-0.5 block font-mono text-xs font-medium text-bone">
                                {formatIstDate(spotlightConclave.startsAt)}
                              </span>
                              <span className="font-mono text-[11px] text-silver">
                                {formatIstTime(spotlightConclave.startsAt)}
                              </span>
                            </div>
                            <div className="px-4">
                              <span className="block text-[11px] text-ink-muted">
                                Precinct Venue
                              </span>
                              <span className="mt-0.5 block truncate text-xs font-semibold text-bone">
                                {spotlightConclave.venueName}
                              </span>
                              <span className="font-mono text-[11px] text-gold">
                                {spotlightConclave.capacity} seats ·{" "}
                                {spotlightConclave.waitlistCap} waitlist
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4 border-t border-rule pt-5">
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-silver">
                                Live Seat Availability
                              </span>
                              <span
                                className={`font-mono font-semibold ${
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
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-void">
                              <div
                                style={{ width: `${leadSeat.fillPercent}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-gold to-vermilion"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedEvent(spotlightConclave)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bone px-6 py-3.5 text-xs font-semibold text-void transition hover:bg-gold"
                          >
                            <Ticket className="h-4 w-4" />
                            <span>Inspect &amp; Lock Atomic Seat</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })()}

            {/* Curated 3-Column Editorial Conclave Grid */}
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
                    className="spotlight-card group flex flex-col justify-between overflow-hidden rounded-3xl border border-rule transition duration-300 hover:-translate-y-1 hover:border-gold/45"
                  >
                    <div>
                      <div className="relative h-52 w-full overflow-hidden bg-void">
                        <img
                          src={coverImg}
                          alt={evt.title}
                          width={1280}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/20 to-transparent" />

                        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="editorial-italic rounded-full bg-void/85 px-2.5 py-0.5 text-sm text-gold backdrop-blur-md">
                              {idxLabel}
                            </span>
                            <span className="rounded-full border border-white/10 bg-void/80 px-3 py-0.5 text-[11px] font-medium text-bone backdrop-blur-md">
                              {evt.category}
                            </span>
                          </div>
                          {evt.isExternalOpen ? (
                            <span className="rounded-full border border-phosphor/40 bg-void/80 px-2.5 py-0.5 text-[10px] font-medium text-phosphor backdrop-blur-md">
                              External-Open
                            </span>
                          ) : (
                            <span className="rounded-full border border-white/10 bg-void/80 px-2.5 py-0.5 text-[10px] text-silver backdrop-blur-md">
                              Internal
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        <p className="text-xs font-medium text-gold">
                          {evt.clubName || evt.department}
                        </p>
                        <h3 className="mt-1.5 font-display text-xl font-bold leading-snug tracking-tight text-bone transition group-hover:text-gold">
                          {evt.title}
                        </h3>

                        {evt.lastUpdateBanner && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-ochre/35 bg-ochre-soft px-3 py-2 text-xs text-bone">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ochre" />
                            <span className="line-clamp-2">
                              {evt.lastUpdateBanner}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 space-y-1.5 border-t border-rule pt-3.5 text-xs text-silver">
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <Calendar className="h-3.5 w-3.5 text-gold" />
                            <span>
                              {formatIstDate(evt.startsAt)} ·{" "}
                              {formatIstTime(evt.startsAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-silver" />
                            <span className="truncate text-bone/90">
                              {evt.venueName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-rule bg-void/45 px-6 py-5">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-mono font-medium ${
                            seat.state === "CRITICAL"
                              ? "text-vermilion"
                              : seat.state === "WAITLIST"
                                ? "text-ochre"
                                : "text-phosphor"
                          }`}
                        >
                          {seat.label}
                        </span>
                        <span className="font-mono font-semibold text-bone">
                          {formatInr(evt.fee)}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-void">
                        <div
                          style={{ width: `${seat.fillPercent}%` }}
                          className={`h-full rounded-full ${
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
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-rule-strong bg-carbon px-4 py-2.5 text-xs font-semibold text-bone transition group-hover:border-bone group-hover:bg-bone group-hover:text-void"
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
            CHAPTER 02: INTERACTIVE PERSONAL FEST ITINERARY & CLASH PLANNER
           ===================================================================== */}
        <ConclaveItineraryPlanner
          events={events}
          onInspectEvent={(evt) => setSelectedEvent(evt)}
        />

        {/* =====================================================================
            CHAPTER 03: INTERACTIVE 9-BLOCK 3D PRECINCT DIGITAL TWIN
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
            <div className="grid items-end gap-6 border-b border-rule pb-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="flex items-baseline gap-3">
                  <span className="editorial-italic text-3xl text-gold sm:text-4xl">
                    03.
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">
                    Spatial Campus Topology · Three.js CAD
                  </span>
                </div>
                <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
                  9-Block Precinct{" "}
                  <span className="editorial-italic font-normal text-gold">
                    Digital Twin.
                  </span>
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-silver lg:col-span-4">
                Select any auditorium, quadrangle, or floodlit turf block inside
                the interactive Three.js spatial model to inspect seating
                capacity, monsoon indoor backups, and live schedules.
              </p>
            </div>

            {/* Swiss Hairline Spatial Metrics Ledger */}
            <div className="mt-10 grid divide-y divide-rule rounded-3xl border border-rule bg-carbon/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {[
                {
                  label: "Mapped Campus Blocks",
                  val: `${venues.length || 9} Venues`,
                  sub: "Hosur Road Central Precinct",
                  accent: "text-bone",
                },
                {
                  label: "Certified Seating",
                  val: "3,450+ Seats",
                  sub: "Main Audi, KE Audi & Seminar Halls",
                  accent: "text-gold",
                },
                {
                  label: "Monsoon Contingency",
                  val: "100% Linked",
                  sub: "Outdoor -> Indoor Auto-Fallback",
                  accent: "text-phosphor",
                },
                {
                  label: "Venue Clash SLA",
                  val: "<3ms p95",
                  sub: "Zero Double-Booked Auditoriums",
                  accent: "text-bone",
                },
              ].map((stat) => (
                <div key={stat.label} className="px-6 py-5">
                  <span className="text-xs font-medium text-ink-muted">
                    {stat.label}
                  </span>
                  <p
                    className={`mt-1.5 font-display text-2xl font-bold tracking-tight ${stat.accent}`}
                  >
                    {stat.val}
                  </p>
                  <p className="mt-0.5 text-xs text-silver">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="studio-bezel mt-8">
              <div className="overflow-hidden rounded-[20px]">
                {gpuReady || mapInView ? (
                  <Suspense
                    fallback={
                      <div className="flex h-[440px] items-center justify-center bg-carbon font-mono text-xs text-silver">
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
                  <div className="relative flex h-[380px] flex-col items-center justify-center overflow-hidden bg-carbon p-6 text-center sm:h-[440px]">
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
                    <div className="relative z-10 max-w-lg space-y-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-void/80 px-3.5 py-1 font-mono text-[10px] uppercase tracking-widest text-gold">
                        9 Mapped Architectural Blocks · WebGL Spatial Twin
                      </span>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-bone sm:text-3xl">
                        Central Block, K.E. Auditorium &amp; Birds Park
                        Amphitheatre
                      </h3>
                      <button
                        type="button"
                        onClick={() => setMapInView(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 text-xs font-semibold text-void transition hover:bg-gold"
                      >
                        <span>Activate 3D Precinct Twin</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 04: ZERO-TRUST ARCHITECTURE & 8-PERSONA PBAC STUDIO
           ===================================================================== */}
        <GovernanceCommandConsole />

        {/* =====================================================================
            CHAPTER 05: INTER-DEANERY PODIUM & APPEND-ONLY XP STANDINGS
           ===================================================================== */}
        {leaderboard && (
          <section
            id="league"
            className="relative overflow-hidden border-b border-rule bg-obsidian py-24 lg:py-32"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-20 h-[360px] w-[480px] rounded-full bg-phosphor/[0.04] blur-[140px]"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-10">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="editorial-italic text-3xl text-gold sm:text-4xl">
                      05.
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">
                      Append-Only Participation Ledger · ST-06
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
                    Inter-Deanery{" "}
                    <span className="editorial-italic font-normal text-gold">
                      Season Standings.
                    </span>
                  </h2>
                </div>
                <div className="rounded-full border border-rule-strong bg-carbon px-4 py-2 text-xs text-silver">
                  <span className="font-mono font-semibold text-phosphor">
                    +10 XP
                  </span>{" "}
                  Seat Reserved ·{" "}
                  <span className="font-mono font-semibold text-gold">
                    +50 XP
                  </span>{" "}
                  Gate-1 Verified
                </div>
              </div>

              <div className="mt-12 grid gap-8 lg:grid-cols-12">
                {/* Left: Deanery Championship Standings */}
                <div className="space-y-4 lg:col-span-7">
                  {leaderboard.deaneries.map((d) => {
                    const barPct = Math.max(
                      18,
                      Math.round((d.totalXp / maxDeaneryXp) * 100),
                    );
                    const rankBadge =
                      d.rank === 1
                        ? "border-gold/60 bg-gold/15 text-gold"
                        : d.rank === 2
                          ? "border-bone/40 bg-white/10 text-bone"
                          : d.rank === 3
                            ? "border-vermilion/45 bg-vermilion-soft text-vermilion"
                            : "border-rule bg-void text-silver";
                    return (
                      <div
                        key={d.deanery}
                        className="spotlight-card rounded-3xl border border-rule p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span
                              className={`editorial-italic flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${rankBadge}`}
                            >
                              0{d.rank}
                            </span>
                            <div>
                              <h3 className="font-display text-lg font-bold tracking-tight text-bone">
                                {d.deanery}
                              </h3>
                              <p className="mt-0.5 text-xs text-silver">
                                <span className="text-gold">{d.badge}</span> ·{" "}
                                {d.activePasses} verified passes
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-2xl font-semibold text-bone">
                              {d.totalXp.toLocaleString("en-IN")}
                            </span>
                            <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                              Deanery XP
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-void">
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

                {/* Right: Double-Bezel Top Concourse Laureates */}
                <div className="lg:col-span-5">
                  <div className="studio-bezel h-full">
                    <div className="flex h-full flex-col justify-between rounded-[20px] border border-rule bg-carbon p-6 sm:p-7">
                      <div>
                        <div className="flex items-center justify-between border-b border-rule pb-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-bone">
                            <Award className="h-4 w-4 text-gold" />
                            <span>Top Concourse Laureates</span>
                          </div>
                          <span className="rounded-full border border-phosphor/35 bg-phosphor-soft px-2.5 py-0.5 font-mono text-[10px] text-phosphor">
                            Surnames Masked
                          </span>
                        </div>

                        <div className="mt-4 divide-y divide-rule">
                          {leaderboard.topParticipants.map((p) => (
                            <div
                              key={p.displayName}
                              className="flex items-center justify-between py-3.5"
                            >
                              <div className="flex items-center gap-3.5">
                                <span className="editorial-italic flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-void text-base text-gold">
                                  {p.rank}
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-bone">
                                    {p.displayName}
                                  </p>
                                  <p className="text-xs text-silver">
                                    {p.department} · {p.badgesCount} badges
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono text-sm font-semibold text-gold">
                                {p.xp} XP
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl border border-rule bg-void/70 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-bone">
                          <Users className="h-3.5 w-3.5 text-phosphor" />
                          <span>Immutable Append-Only XP Ledger</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-silver">
                          XP entries are written atomically upon confirmed seat
                          registration and auditorium gate scan — never editable
                          or publicly tied to student register numbers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            CHAPTER 06: CINEMA SHOWREELS, EDITORIAL PHOTO ESSAY & PARTNER PASS
           ===================================================================== */}
        <section id="chronicle" className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-10">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="editorial-italic text-3xl text-gold sm:text-4xl">
                    06.
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">
                    Cinema Showreel &amp; CLS-Zero Visual Archive
                  </span>
                </div>
                <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
                  Central Campus{" "}
                  <span className="editorial-italic font-normal text-gold">
                    Fest Chronicle.
                  </span>
                </h2>
              </div>
              <Link
                to="/login?redirect=/app/gallery"
                className="inline-flex items-center gap-2 rounded-full border border-rule-strong bg-carbon px-5 py-2.5 text-xs font-semibold text-bone transition hover:border-gold hover:text-gold"
              >
                <Film className="h-3.5 w-3.5 text-gold" />
                <span>Open Full Media Archive →</span>
              </Link>
            </div>

            {/* Dual-Channel Looping H.264 Campus Cinema Showreels */}
            <div className="mt-12 grid gap-6 lg:grid-cols-12">
              <div className="studio-bezel lg:col-span-7">
                <div className="overflow-hidden rounded-[20px] border border-rule bg-carbon">
                  <CinemaVideoFrame
                    src="/media/christ-concourse-reel.mp4"
                    poster="/media/hero-central-campus.jpg"
                    alt="CHRIST Central Campus 4-Stage Flagship Showreel — Block IV Twilight, Labyrinth Hackathon, Blossoms & Magnovite"
                    badgeLabel="SHOWREEL 01 · FLAGSHIP CONCLAVES"
                    caption="Block IV Concourse · Labyrinth 24-Hr Systems Arena · Magnovite Robotics"
                    className="aspect-video w-full"
                  />
                </div>
              </div>

              <div className="studio-bezel lg:col-span-5">
                <div className="h-full overflow-hidden rounded-[20px] border border-rule bg-carbon">
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
            </div>

            {/* Asymmetric Editorial Photo Essay Grid */}
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
                    className={`spotlight-card group relative cursor-pointer overflow-hidden rounded-3xl border border-rule ${spanClass}`}
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
                      className="absolute right-4 top-4 rounded-full border border-white/15 bg-void/80 p-2 text-bone backdrop-blur-md transition hover:border-gold hover:text-gold"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>

                    <figcaption className="absolute inset-x-0 bottom-0 p-6">
                      <div className="flex items-center justify-between text-xs text-gold">
                        <span className="editorial-italic text-base">
                          {item.festName || item.category}
                        </span>
                        <span className="font-mono text-[11px] text-silver">
                          {item.venueName}
                        </span>
                      </div>
                      <p className="mt-0.5 font-display text-lg font-bold tracking-tight text-bone sm:text-xl">
                        {item.title}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>

            {/* Perforated Third Wave Coffee Campus Partner Boarding Pass */}
            {sponsor && (
              <div className="studio-bezel mt-16">
                <div className="grid overflow-hidden rounded-[20px] border border-rule bg-carbon lg:grid-cols-12">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-carbon/90" />
                    <div className="absolute bottom-5 left-5 rounded-full border border-gold/40 bg-void/85 px-3.5 py-1 font-mono text-[10px] uppercase tracking-widest text-gold backdrop-blur-md">
                      Central Block · Ground Floor
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold">
                          <Coffee className="h-4 w-4" />
                          <span>Official Campus Roastery Partner</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-phosphor/35 bg-phosphor-soft px-3 py-0.5 font-mono text-[10px] font-medium text-phosphor">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Zero Student PII Shared</span>
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
                        {sponsor.brand}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-silver">
                        {sponsor.location} ({sponsor.hours}).{" "}
                        <strong className="font-semibold text-bone">
                          {sponsor.studentPerk}
                        </strong>
                      </p>
                    </div>

                    <div className="pass-perforation my-6 h-[2px] w-full" />

                    <div className="grid gap-3 sm:grid-cols-3">
                      {sponsor.menuHighlights.map((m) => (
                        <div
                          key={m.name}
                          className="rounded-2xl border border-rule bg-void/75 p-4"
                        >
                          <p className="text-xs font-semibold text-bone">
                            {m.name}
                          </p>
                          <div className="mt-1.5 flex items-baseline gap-2 font-mono text-xs">
                            <span className="text-sm font-semibold text-phosphor">
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
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 07: EDITORIAL VOICES & INSTITUTIONAL PROTOCOL BRIEFING
           ===================================================================== */}
        <CampusVoicesAndFaqSection />
      </main>

      {/* =====================================================================
          MONUMENTAL ARCHITECTURAL FOOTER
         ===================================================================== */}
      <footer className="relative overflow-hidden border-t border-rule bg-obsidian pb-12 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-10 border-b border-rule pb-12 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div className="flex items-center gap-3.5">
                <ChristCrestMark className="h-11 w-11" tone="light" />
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-bone">
                    Concourse · Christ Central
                  </p>
                  <p className="editorial-italic text-base text-gold">
                    {DESIGN_TOKENS.campus.name}
                  </p>
                </div>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-silver">
                Zero-Trust permission-scoped campus event governance, atomic
                row-locked seat allocations, 30-second rotating HMAC gate
                credentials, and spatial 3D venue telemetry.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-phosphor/30 bg-phosphor-soft px-3.5 py-1 font-mono text-[10px] font-medium text-phosphor">
                <Activity className="h-3 w-3" />
                <span>APISIX · KEYCLOAK 26 · FASTIFY PBAC · NOMINAL</span>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold text-bone">Chapters</p>
              <ul className="space-y-2 text-xs text-silver">
                <li>
                  <a href="#conclaves" className="transition hover:text-bone">
                    Live Schedule
                  </a>
                </li>
                <li>
                  <a href="#precinct-3d" className="transition hover:text-bone">
                    9-Block 3D Twin
                  </a>
                </li>
                <li>
                  <a href="#governance" className="transition hover:text-bone">
                    PBAC Architecture
                  </a>
                </li>
                <li>
                  <a href="#league" className="transition hover:text-bone">
                    Deanery Standings
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold text-bone">
                Identity &amp; Access
              </p>
              <ul className="space-y-2 text-xs text-silver">
                <li>
                  <Link to="/login" className="transition hover:text-gold">
                    Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="transition hover:text-gold">
                    Student &amp; Guest Pass
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={dispatchOpenCommandPalette}
                    className="transition hover:text-gold"
                  >
                    Quick Find (Ctrl+K)
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-3">
              <p className="text-xs font-semibold text-bone">
                Precinct Coordinates
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-silver">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
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
            <ColonnadeMotifSvg className="h-10 w-full opacity-70" />
            <svg
              viewBox="0 0 1200 165"
              aria-hidden="true"
              className="mt-4 h-auto w-full select-none"
            >
              <text
                x="600"
                y="138"
                textAnchor="middle"
                fill="none"
                stroke="rgba(245,242,235,0.11)"
                strokeWidth="1.4"
                fontFamily="Bricolage Grotesque Variable, Plus Jakarta Sans Variable, sans-serif"
                fontWeight="800"
                fontSize="158"
                letterSpacing="-5"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="studio-bezel w-full max-w-4xl"
          >
            <div className="overflow-hidden rounded-[20px] border border-rule bg-carbon">
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
                  className="absolute right-4 top-4 rounded-full border border-white/20 bg-void/85 p-2 text-bone transition hover:border-gold hover:text-gold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <p className="editorial-italic text-lg text-gold">
                    {lightboxItem.festName || lightboxItem.category} ·{" "}
                    {lightboxItem.venueName}
                  </p>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-bone">
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
                  className="rounded-full bg-bone px-5 py-2.5 text-xs font-semibold text-void transition hover:bg-gold"
                >
                  Explore Full Archive
                </Link>
              </div>
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
