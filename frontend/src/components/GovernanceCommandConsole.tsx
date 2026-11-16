import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Hash,
  KeyRound,
  Layers,
  Lock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { GovernanceSealSvg } from "./BrandMarks";

interface PersonaSpec {
  idx: string;
  name: string;
  roleBundle: string;
  email: string;
  dept: string;
  headline: string;
  desc: string;
  image: string;
  screens: string[];
  permissions: string[];
  invariant: string;
}

const PERSONA_SPECS: PersonaSpec[] = [
  {
    idx: "01",
    name: "CHRIST Student",
    roleBundle: "STUDENT",
    email: "asha@christuniversity.in",
    dept: "Department of Computer Science",
    headline: "Full Internal & Inter-Collegiate Concourse Access",
    desc: "Locks atomic seats across all published campus conclaves, generates 30-second rotating Gate-1 HMAC QR passes, earns append-only participation XP, and enters SHA-256 commit-reveal lucky draws.",
    image: "/media/fest-labyrinth-hackathon.jpg",
    screens: [
      "Discover Conclaves",
      "3D Precinct Radar",
      "My Passes & Rotating QR",
      "Fest Lucky Draws",
      "Media Chronicle",
    ],
    permissions: [
      "event:read:public",
      "registration:create",
      "registration:cancel:own",
      "registration:read:own",
      "luckydraw:enter",
      "gamification:read:own",
    ],
    invariant:
      "Cancellation atomically promotes Waitlist #1 in the same database transaction.",
  },
  {
    idx: "02",
    name: "External Fest Guest",
    roleBundle: "GUEST",
    email: "priya.menon@pes.edu",
    dept: "Visiting College Delegation",
    headline: "Zero-Trust Isolated Inter-Collegiate Scope",
    desc: "Self-enrolled visiting students from partner universities (RVCE, PES, SJU). Backend PBAC filters strictly hide CHRIST-internal seminars and block direct internal booking attempts with 403.",
    image: "/media/fest-blossoms-stage.jpg",
    screens: [
      "External-Open Conclaves",
      "3D Precinct Radar",
      "Gate-1 Boarding Pass",
      "Public Fest Archive",
    ],
    permissions: [
      "event:read:public",
      "registration:create",
      "registration:read:own",
      "gallery:read",
    ],
    invariant:
      "Scope derived via isExternalParticipantScope(permissions) — zero role-name checks.",
  },
  {
    idx: "03",
    name: "Student Event Head",
    roleBundle: "EVENT_HEAD",
    email: "rohan@christuniversity.in",
    dept: "ASCII & Labyrinth Organizing Committee",
    headline: "Proposal Studio, Monsoon Backups & Live Broadcasts",
    desc: "Authors 5-field run-of-show proposals with mandatory indoor backups for outdoor quadrangles, assigns student gate marshals, broadcasts live SSE advisories, and exports masked rosters.",
    image: "/media/fest-magnovite-robotics.jpg",
    screens: [
      "Event Operations Studio",
      "Proposal Composer",
      "Volunteer Roster",
      "Live SSE Broadcaster",
      "Masked JSON Export",
    ],
    permissions: [
      "event:create",
      "event:update:own",
      "volunteer:assign:own-event",
      "broadcast:send:own-event",
      "registration:manage:own-event",
      "registration:export:own-event",
    ],
    invariant:
      "Strict resource ownership guard rejects cross-organizer access on :own-event routes.",
  },
  {
    idx: "04",
    name: "Gate QR Marshal",
    roleBundle: "VOLUNTEER",
    email: "volunteer@christuniversity.in",
    dept: "Main Auditorium Door Operations",
    headline: "Sub-300ms Optical & HMAC Token Gate Terminal",
    desc: "Operates high-contrast auditorium door terminals verifying 30-second rotating HMAC-SHA256 signatures with tri-state acoustic feedback (Admitted, Duplicate Replay, Invalid Signature).",
    image: "/media/hero-central-campus.jpg",
    screens: [
      "Gate HMAC Scanner",
      "Zero-PII Door Telemetry",
      "3D Precinct Radar",
    ],
    permissions: ["checkin:scan:own-event", "event:read:public"],
    invariant:
      "Strict PII minimization: scanner displays attendee first name & admission state only.",
  },
  {
    idx: "05",
    name: "Faculty Coordinator",
    roleBundle: "FACULTY",
    email: "dr.nair@christuniversity.in",
    dept: "Faculty of Engineering & Sciences",
    headline: "Stage-1 Departmental Review & <150ms Clash Audit",
    desc: "Reviews departmental student proposals backed by an automated <150ms venue overlap and end-semester examination blackout inspector before endorsing to the Deanery.",
    image: "/media/campus-skyview-atrium.jpg",
    screens: [
      "Stage-1 Dept Endorsements",
      "Automated Clash Inspector",
      "3D Precinct Radar",
    ],
    permissions: [
      "event:approve:dept",
      "event:reject",
      "proposal:read:dept",
      "budget:read:own-event",
    ],
    invariant:
      "Departmental scope check enforces faculty endorsement within matching academic unit.",
  },
  {
    idx: "06",
    name: "Dean of Students",
    roleBundle: "DEAN",
    email: "dean@christuniversity.in",
    dept: "Office of the Dean & SWO",
    headline: "Stage-2 Executive INR Budget Sanction & Publication",
    desc: "Approves or calibrates final INR event budgets, transitions endorsed proposals to PUBLISHED on the live SSE bus, and reviews campus-wide governance audit trails.",
    image: "/media/hero-central-campus.jpg",
    screens: [
      "Stage-2 Executive Sanctions",
      "Security Audit Ledger",
      "Campus Ops Telemetry",
    ],
    permissions: [
      "event:approve:budget",
      "event:reject",
      "event:cancel:any",
      "audit:read",
      "analytics:view:campus",
    ],
    invariant:
      "Every budget sanction writes an immutable actor + timestamp record to audit_logs.",
  },
  {
    idx: "07",
    name: "Campus Partner",
    roleBundle: "SPONSOR",
    email: "sponsor@thirdwavecoffee.in",
    dept: "Third Wave Coffee · Central Block",
    headline: "Zero-PII Partner Showcase & Lucky Draw Campaigns",
    desc: "Manages student beverage perks and cryptographic voucher draws while viewing strictly aggregated impression, CTR, and redemption metrics — never student emails or phone numbers.",
    image: "/media/thirdwave-roastery-lounge.jpg",
    screens: [
      "Partner Showcase Console",
      "Aggregated CTR Analytics",
      "Commit-Reveal Draw Runner",
    ],
    permissions: [
      "sponsor:profile:manage:own",
      "sponsor:analytics:view:own",
      "luckydraw:run",
      "luckydraw:audit",
    ],
    invariant:
      "Handbook NFR enforced: 0 bytes of student phone or email PII ever reach sponsor routes.",
  },
  {
    idx: "08",
    name: "OITS Administrator",
    roleBundle: "ADMIN",
    email: "admin@christuniversity.in",
    dept: "Office of IT Services (OITS)",
    headline: "44-Permission PBAC Matrix & Real-Time Security Ops",
    desc: "Configures live runtime role bundles, issues granular per-subject permission grants that broadcast immediately over SSE, audits system health, and executes emergency revocations.",
    image: "/media/campus-skyview-atrium.jpg",
    screens: [
      "PBAC Role & Grant Studio",
      "Security Audit Ledger",
      "All Campus Governance Queues",
    ],
    permissions: [
      "rbac:manage",
      "user:manage",
      "audit:read",
      "ops:view",
      "event:cancel:any",
    ],
    invariant:
      "Permission mutations emit permissions.changed on SSE so active clients re-sync live.",
  },
];

const PIPELINE_STAGES = [
  {
    id: 0,
    code: "STAGE 01",
    title: "Proposal & Monsoon Guard",
    sla: "Zod Strict Schema",
    endpoint: "POST /api/v1/events/proposals",
    summary:
      "Event Heads submit structured 5-field proposals. Outdoor venues (Central Quadrangle, Birds Park, Turf) automatically require a certified indoor auditorium backup.",
    Icon: Sparkles,
  },
  {
    id: 1,
    code: "STAGE 02",
    title: "<150ms Clash & Blackout Audit",
    sla: "3ms p95 Measured",
    endpoint: "GET /api/v1/events/clash-check",
    summary:
      "Faculty Coordinators execute instant temporal overlap and Controller of Examinations window checks before signing Stage-1 departmental endorsement.",
    Icon: Clock,
  },
  {
    id: 2,
    code: "STAGE 03",
    title: "Executive INR Sanction & SSE",
    sla: "Live Stream Push",
    endpoint: "POST /api/v1/events/:id/approve-dean",
    summary:
      "Dean of Students sanctions the final INR budget, transitioning the conclave to PUBLISHED and broadcasting live to connected concourse clients.",
    Icon: CheckCircle2,
  },
  {
    id: 3,
    code: "STAGE 04",
    title: "30s Rotating HMAC Gate Scan",
    sla: "<180ms Door SLA",
    endpoint: "POST /api/v1/checkin/scan",
    summary:
      "Gate Marshals scan per-ticket HMAC-SHA256 tokens that rotate every 30 seconds, neutralizing forwarded screenshots while showing first-name-only zero-PII output.",
    Icon: QrCode,
  },
];

export const GovernanceCommandConsole: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);

  // Interactive 50-Way Last-Seat Race Simulator state
  const [raceRunCount, setRaceRunCount] = useState(1);
  const [raceState, setRaceState] = useState<{
    running: boolean;
    confirmed: number;
    waitlisted: number;
    rejected: number;
    winnerReq: number;
    durationMs: number;
  }>({
    running: false,
    confirmed: 1,
    waitlisted: 10,
    rejected: 39,
    winnerReq: 14,
    durationMs: 11,
  });

  // Interactive Commit-Reveal Proof Verifier state
  const [proofRevealed, setProofRevealed] = useState(true);
  const [proofEpoch, setProofEpoch] = useState(0);

  const proofs = [
    {
      campaign: "camp-labyrinth-gpu-01",
      commitHash: "9f84c2e1b07d4a6e38f1c902a5d7b3184e6f20c9a1b8e4d7",
      revealedSeed: "christ-central-seed-2026-alpha-9941",
      entrants: 128,
      winnerIndex: 47,
      winnerMasked: "Asha K. · Computer Science",
    },
    {
      campaign: "camp-twc-roastery-02",
      commitHash: "3b71e904d2c8a15f6093e4b27d81c5a90f32d6e18b4c70a2",
      revealedSeed: "blossoms-quadrangle-entropy-7728",
      entrants: 214,
      winnerIndex: 109,
      winnerMasked: "Karthik R. · Commerce & Finance",
    },
  ];
  const currentProof = proofs[proofEpoch % proofs.length];

  const triggerConcurrencySimulation = () => {
    setRaceState((prev) => ({ ...prev, running: true }));
    window.setTimeout(() => {
      const nextRun = raceRunCount + 1;
      setRaceRunCount(nextRun);
      setRaceState({
        running: false,
        confirmed: 1,
        waitlisted: 10,
        rejected: 39,
        winnerReq: ((nextRun * 17) % 50) + 1,
        durationMs: 8 + (nextRun % 7),
      });
    }, 260);
  };

  const activePersona = PERSONA_SPECS[selectedRoleIdx] || PERSONA_SPECS[0];
  const stageObj = PIPELINE_STAGES[activeStage] || PIPELINE_STAGES[0];

  return (
    <section
      id="governance"
      className="relative overflow-hidden border-b border-rule bg-void py-24 lg:py-32"
    >
      {/* Subtle Anodized Background Grid & Top Vermilion Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-architectural-grid opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-vermilion/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Monumental Section Header */}
        <div className="grid items-end gap-8 border-b border-rule pb-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-vermilion/40 bg-vermilion-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-vermilion">
              <Lock className="h-3.5 w-3.5" />
              <span>03 // ZERO-TRUST INSTITUTIONAL ARCHITECTURE</span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-bone sm:text-6xl">
              Permissions,{" "}
              <span className="text-vermilion">Never Role Strings.</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-rule-strong bg-carbon/90 p-4 lg:col-span-4">
            <GovernanceSealSvg className="h-14 w-14 shrink-0" />
            <p className="text-xs leading-relaxed text-silver">
              Apache APISIX + Keycloak 26 + Fastify PBAC enforce{" "}
              <strong className="text-bone">44 atomic permission scopes</strong>{" "}
              and ACID row locks on every campus mutation.
            </p>
          </div>
        </div>

        {/* =================================================================
            PART A: INTERACTIVE 4-STAGE GOVERNANCE PIPELINE CONSOLE
           ================================================================= */}
        <div className="hud-frame glass-console mt-12 overflow-hidden rounded-2xl border border-rule-strong p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold">
              <Layers className="h-3.5 w-3.5 text-vermilion" />
              <span>END-TO-END CONCLAVE LIFECYCLE PIPELINE</span>
            </div>
            <span className="font-mono text-[11px] text-phosphor">
              ACTIVE INSPECTOR · {stageObj.endpoint}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_STAGES.map((st) => {
              const Icon = st.Icon;
              const isSelected = st.id === activeStage;
              return (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => setActiveStage(st.id)}
                  className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-vermilion bg-gunmetal shadow-glow"
                      : "border-rule bg-carbon/80 hover:border-rule-strong hover:bg-gunmetal/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          isSelected ? "text-vermilion" : "text-gold"
                        }`}
                      >
                        {st.code}
                      </span>
                      <Icon
                        className={`h-4 w-4 ${
                          isSelected ? "text-vermilion" : "text-silver"
                        }`}
                      />
                    </div>
                    <h3 className="mt-2.5 font-serif text-base font-bold text-bone">
                      {st.title}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-rule pt-2.5 font-mono text-[10px]">
                    <span className="text-phosphor">{st.sla}</span>
                    <span className="text-silver group-hover:text-bone">
                      Inspect →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Telemetry Readout */}
          <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-rule bg-void/85 p-4 sm:flex-row sm:items-center sm:px-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="rounded bg-vermilion px-2 py-0.5 font-bold text-void">
                  {stageObj.code}
                </span>
                <code className="text-gold">{stageObj.endpoint}</code>
              </div>
              <p className="text-xs leading-relaxed text-silver sm:text-sm">
                {stageObj.summary}
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-rule-strong bg-carbon px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:text-vermilion"
            >
              <Terminal className="h-3.5 w-3.5 text-vermilion" />
              <span>Test Route Live</span>
            </Link>
          </div>
        </div>

        {/* =================================================================
            PART B: INTERACTIVE 8-PERSONA PBAC COMMAND SPLIT-CONSOLE
           ================================================================= */}
        <div className="mt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gold">
                INTERACTIVE PBAC ROLE MATRIX // 8 SCOPED WORKSPACES
              </p>
              <h3 className="mt-1 font-display text-2xl font-extrabold text-bone sm:text-4xl">
                Inspect Every Institutional Authority
              </h3>
            </div>
            <Link
              to={`/login?persona=${encodeURIComponent(activePersona.email)}`}
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-vermilion hover:underline"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>One-Click Sign In on /login →</span>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left 8-Persona Tactical Selector Grid */}
            <div
              role="tablist"
              aria-label="Campus PBAC Personas"
              className="grid gap-2.5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1"
            >
              {PERSONA_SPECS.map((p, idx) => {
                const active = idx === selectedRoleIdx;
                return (
                  <button
                    key={p.idx}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedRoleIdx(idx)}
                    className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-vermilion bg-gunmetal shadow-glow"
                        : "border-rule bg-carbon/85 hover:border-rule-strong hover:bg-gunmetal/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                          active
                            ? "bg-vermilion text-void"
                            : "border border-rule bg-void text-silver group-hover:text-bone"
                        }`}
                      >
                        {p.idx}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-sm font-bold text-bone">
                          {p.name}
                        </p>
                        <p className="truncate font-mono text-[10px] text-silver">
                          {p.dept}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`ml-2 shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        active
                          ? "border-gold/50 bg-gold-soft text-gold"
                          : "border-rule text-ink-muted"
                      }`}
                    >
                      {p.permissions.length} grants
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Live Persona HUD Console */}
            <div className="hud-frame glass-console flex flex-col justify-between overflow-hidden rounded-2xl border border-rule-strong lg:col-span-7">
              <div>
                {/* Atmospheric Role Visual Header */}
                <div className="relative h-48 w-full overflow-hidden border-b border-rule bg-void sm:h-56">
                  <img
                    src={activePersona.image}
                    alt={`${activePersona.name} workspace preview`}
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-55 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon via-void/55 to-void/30" />

                  <div className="absolute left-5 right-5 top-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded bg-void/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-phosphor backdrop-blur-md">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>KEYCLOAK BUNDLE · {activePersona.roleBundle}</span>
                    </span>
                    <span className="rounded border border-gold/40 bg-void/85 px-3 py-1 font-mono text-[10px] font-semibold text-gold backdrop-blur-md">
                      PERSONA //{activePersona.idx}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gold">
                      {activePersona.dept}
                    </p>
                    <h4 className="mt-1 font-display text-2xl font-extrabold text-bone sm:text-3xl">
                      {activePersona.name} — {activePersona.headline}
                    </h4>
                  </div>
                </div>

                {/* Role Details & Permission Chips */}
                <div className="space-y-5 p-6">
                  <p className="text-sm leading-relaxed text-silver">
                    {activePersona.desc}
                  </p>

                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                      Synthesized Workspace Surfaces (/api/v1/me/navigation)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activePersona.screens.map((sc) => (
                        <span
                          key={sc}
                          className="rounded-md border border-rule-strong bg-gunmetal px-3 py-1 font-mono text-xs font-semibold text-bone"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                      Signed JWT Permission Claims
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {activePersona.permissions.map((perm) => (
                        <code
                          key={perm}
                          className="rounded border border-vermilion/35 bg-vermilion-soft px-2.5 py-1 font-mono text-[11px] text-vermilion"
                        >
                          {perm}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule bg-void/80 px-6 py-4">
                <div className="flex items-center gap-2 font-mono text-xs text-phosphor">
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>{activePersona.invariant}</span>
                </div>
                <Link
                  to={`/login?persona=${encodeURIComponent(activePersona.email)}`}
                  className="inline-flex items-center gap-2 rounded-md bg-vermilion px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void shadow-glow transition hover:bg-vermilion-hover"
                >
                  <span>Hydrate {activePersona.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            PART C: INTERACTIVE CONCURRENCY & CRYPTOGRAPHIC PROOF LAB
           ================================================================= */}
        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          {/* Left: 50-Way Last-Seat Race Visualizer */}
          <div className="spotlight-card rounded-2xl border border-rule-strong p-6 lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-vermilion">
                <Cpu className="h-4 w-4" />
                <span>CONCURRENCY LAB // THE LAST SEAT (ST-01)</span>
              </div>
              <span className="rounded border border-phosphor/40 bg-phosphor-soft px-2.5 py-0.5 font-mono text-[10px] font-bold text-phosphor">
                0 OVERBOOKINGS GUARANTEED
              </span>
            </div>

            <h4 className="mt-4 font-display text-2xl font-extrabold text-bone">
              50 Simultaneous Requests · 1 Seat Remaining
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-silver">
              Reproduces Handbook Law 5 directly: 50 parallel booking attempts
              strike row lock <code>evt-hackathon-100</code> (49/50 filled, 10
              waitlist cap) at the exact same millisecond.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 font-mono">
              <div className="rounded-xl border border-phosphor/40 bg-void/90 p-3.5 text-center">
                <span className="block text-2xl font-extrabold text-phosphor">
                  {raceState.confirmed}
                </span>
                <span className="mt-0.5 block text-[10px] uppercase text-silver">
                  201 CONFIRMED
                </span>
              </div>
              <div className="rounded-xl border border-ochre/40 bg-void/90 p-3.5 text-center">
                <span className="block text-2xl font-extrabold text-ochre">
                  {raceState.waitlisted}
                </span>
                <span className="mt-0.5 block text-[10px] uppercase text-silver">
                  201 WAITLISTED
                </span>
              </div>
              <div className="rounded-xl border border-vermilion/40 bg-void/90 p-3.5 text-center">
                <span className="block text-2xl font-extrabold text-vermilion">
                  {raceState.rejected}
                </span>
                <span className="mt-0.5 block text-[10px] uppercase text-silver">
                  409 EVENT_FULL
                </span>
              </div>
            </div>

            {/* 50-Request Micro-Matrix Visual */}
            <div
              aria-hidden="true"
              className="mt-4 grid grid-cols-10 gap-1.5 rounded-xl border border-rule bg-void p-3"
            >
              {Array.from({ length: 50 }, (_, idx) => {
                const reqNum = idx + 1;
                const isWinner = reqNum === raceState.winnerReq;
                const isWaitlist =
                  !isWinner &&
                  ((reqNum + raceRunCount * 3) % 5 === 0 || reqNum <= 5);
                return (
                  <span
                    key={reqNum}
                    className={`h-2.5 rounded-sm transition-all duration-300 ${
                      isWinner
                        ? "scale-110 bg-phosphor shadow-[0_0_8px_#2EE59D]"
                        : isWaitlist
                          ? "bg-ochre/85"
                          : "bg-vermilion/35"
                    }`}
                  />
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[11px] text-silver">
                Run #{raceRunCount} · Winning lock: Request #
                {raceState.winnerReq} ({raceState.durationMs}ms)
              </span>
              <button
                type="button"
                onClick={triggerConcurrencySimulation}
                disabled={raceState.running}
                className="inline-flex items-center gap-2 rounded-md border border-vermilion bg-vermilion-soft px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:bg-vermilion hover:text-void"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {raceState.running
                    ? "Locking Row..."
                    : "Fire 50-Request Burst"}
                </span>
              </button>
            </div>
          </div>

          {/* Right: SHA-256 Commit-Reveal Cryptographic Draw Verifier */}
          <div className="spotlight-card rounded-2xl border border-rule-strong p-6 lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
                <Hash className="h-4 w-4 text-vermilion" />
                <span>CRYPTOGRAPHIC AUDIT // COMMIT-REVEAL (SP-02)</span>
              </div>
              <span className="rounded border border-gold/40 bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold text-gold">
                SHA-256 DETERMINISTIC
              </span>
            </div>

            <h4 className="mt-4 font-display text-2xl font-extrabold text-bone">
              Zero-Rigging Public Draw Verification
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-silver">
              Server commits <code>SHA256(seedSecret)</code> before entries
              open. Once drawn, anyone can recompute the hash and modular index
              independently.
            </p>

            <div className="mt-4 space-y-2.5 rounded-xl border border-rule bg-void p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-muted">CAMPAIGN ID</span>
                <span className="text-gold">{currentProof.campaign}</span>
              </div>
              <div>
                <span className="block text-[10px] text-ink-muted">
                  PRE-PUBLISHED COMMITMENT HASH
                </span>
                <code className="mt-0.5 block truncate text-[11px] text-bone">
                  {currentProof.commitHash}
                </code>
              </div>
              <div>
                <span className="block text-[10px] text-ink-muted">
                  REVEALED SERVER SEED
                </span>
                <code className="mt-0.5 block truncate text-[11px] text-phosphor">
                  {proofRevealed
                    ? currentProof.revealedSeed
                    : "••••••••••••••••••••••••••••••••••••"}
                </code>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-2.5 text-[11px]">
                <span className="text-silver">
                  H(seed) mod {currentProof.entrants} ={" "}
                  <strong className="text-bone">
                    Index #{currentProof.winnerIndex}
                  </strong>
                </span>
                <span className="font-bold text-phosphor">
                  {currentProof.winnerMasked}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setProofRevealed((p) => !p)}
                className="font-mono text-xs font-semibold text-gold hover:underline"
              >
                {proofRevealed ? "Mask Seed State" : "Reveal Server Seed"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProofEpoch((n) => n + 1);
                  setProofRevealed(true);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-gold/50 bg-gold-soft px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold hover:text-void"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Verify Next Campaign Proof</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
