import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";

const SOCIETY_VOICES = [
  {
    quote:
      "During Labyrinth registration peaks we used to reconcile duplicate Google Form spreadsheets manually. Atomic row locking capped our 50-seat lab sprint cleanly with automatic waitlist promotion.",
    author: "Rohan Kulkarni",
    role: "Student Event Head · ASCII Computer Science Association",
    metric: "0 Overbooked Seats / 50-Way Burst",
  },
  {
    quote:
      "Bengaluru monsoon showers used to stall outdoor Central Quadrangle events. Having K.E. Auditorium linked at proposal stage and broadcasting venue switchovers live over SSE saved In-Bloom.",
    author: "Dr. Lakshmi Nair",
    role: "Faculty Coordinator · Stage-1 Departmental Endorsements",
    metric: "3ms Automated Venue Clash Check",
  },
  {
    quote:
      "Gate-1 marshals scan 30-second rotating HMAC QR passes in under 180 milliseconds while seeing only the attendee's first name. Forwarded WhatsApp screenshots are rejected on the spot.",
    author: "OITS & SWO Gate Marshal Corps",
    role: "Hosur Road Gate-1 & Main Auditorium Operations",
    metric: "<180ms p95 Optical Verification",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do visiting students from other Bengaluru colleges enter Gate-1 on Hosur Road?",
    a: "Enroll via Track B (External Fest Guest) on /signup using your college email. Backend PBAC automatically scopes your feed to External-Open inter-collegiate fests (Magnovite, In-Bloom, Labyrinth) and issues a 30-second rotating HMAC QR boarding credential for Gate-1 security.",
  },
  {
    q: "Why does my ticket QR code re-sign every 30 seconds?",
    a: "Static QR codes are vulnerable to screenshot forwarding. Each confirmed registration receives a unique per-ticket cryptographic secret; /api/v1/checkin/token/:id signs the active 30-second epoch with HMAC-SHA256 so copied screenshots expire automatically.",
  },
  {
    q: "What happens if a sold-out conclave has a cancellation?",
    a: "Cancellations execute inside an atomic transaction that releases the confirmed seat and immediately promotes Waitlist Position #1 to CONFIRMED, unlocking their rotating QR pass and emitting a live waitlist.promoted SSE notification.",
  },
  {
    q: "How are permissions enforced across the 8 campus roles?",
    a: "Zero role-string checks exist in backend routes or frontend screens. Apache APISIX validates OIDC Bearer tokens at the gateway perimeter, and Fastify re-verifies JWT claims against 44 granular permissions (such as event:approve:dept or checkin:scan:own-event) plus resource ownership.",
  },
  {
    q: "Can students verify that Third Wave lucky draws are unrigged?",
    a: "Yes. Before a campaign accepts entries, the server publishes SHA256(seedSecret). When the draw runs, seedSecret is revealed and anyone can click Verify Cryptographic Proof to confirm the hash and deterministic modular winner index.",
  },
  {
    q: "Is student phone or email data ever shared with campus sponsors?",
    a: "Never. Phone numbers are masked (+91******XX) across API responses, gate scanners display first names only, and sponsor analytics expose strictly aggregated impression, CTR, and voucher counts.",
  },
];

export const CampusVoicesAndFaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-t border-rule bg-void py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-architectural-grid opacity-50"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Part 1: Campus Society & Faculty Operational Voices */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              <MessageSquareQuote className="h-3.5 w-3.5 text-vermilion" />
              <span>06 // PRECINCT FIELD TELEMETRY &amp; FAQ</span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-bone sm:text-6xl">
              Built for Real{" "}
              <span className="text-vermilion">Campus Contention.</span>
            </h2>
          </div>
          <span className="font-mono text-xs text-silver">
            CHRIST (Deemed to be University) · Central Campus Societies
          </span>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {SOCIETY_VOICES.map((v) => (
            <blockquote
              key={v.author}
              className="spotlight-card flex flex-col justify-between rounded-2xl border border-rule-strong p-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded border border-phosphor/40 bg-phosphor-soft px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-phosphor">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{v.metric}</span>
                </span>
                <p className="mt-4 text-sm leading-relaxed text-bone/95">
                  &ldquo;{v.quote}&rdquo;
                </p>
              </div>
              <footer className="mt-6 border-t border-rule pt-4">
                <p className="font-serif text-sm font-bold text-bone">
                  {v.author}
                </p>
                <p className="font-mono text-[11px] text-gold">{v.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Part 2: Interactive Zero-Trust & Gate-1 FAQ Console */}
        <div className="hud-frame glass-console mt-14 grid gap-8 rounded-2xl border border-rule-strong p-6 sm:p-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-vermilion">
                <HelpCircle className="h-4 w-4" />
                <span>INSTITUTIONAL PROTOCOL BRIEFING</span>
              </div>
              <h3 className="mt-3 font-display text-3xl font-extrabold leading-tight text-bone">
                Gate-1 Entry, Security &amp; Pass Mechanics
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-silver sm:text-sm">
                Everything CHRIST Central students, visiting college delegates,
                and faculty reviewers need before locking seats or running
                auditorium doors.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-rule bg-void/85 p-4">
              <p className="font-mono text-xs font-bold text-bone">
                Ready to inspect all 8 PBAC workspaces?
              </p>
              <p className="mt-1 text-xs text-silver">
                Hydrate Student, Guest, Event Head, Marshal, Faculty, Dean,
                Sponsor, or Admin in one click.
              </p>
              <Link
                to="/login"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-vermilion px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover"
              >
                <span>Open Concourse Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-7">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-xl border transition ${
                    isOpen
                      ? "border-vermilion bg-void/90"
                      : "border-rule bg-carbon/80 hover:border-rule-strong"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-serif text-sm font-bold text-bone sm:text-base">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-vermilion transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-rule px-5 py-3.5 text-xs leading-relaxed text-silver sm:text-sm">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
