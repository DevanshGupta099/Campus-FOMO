import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";

const SOCIETY_VOICES = [
  {
    quote:
      "During Labyrinth registration peaks we used to reconcile duplicate spreadsheet entries by hand. Atomic row locking capped our 50-seat lab sprint cleanly with instant waitlist promotion.",
    author: "Rohan Kulkarni",
    role: "Student Event Head · ASCII Computer Science Association",
    metric: "0 Overbooked Seats / 50-Way Burst",
  },
  {
    quote:
      "Bengaluru monsoon showers used to stall Central Quadrangle stages. Linking K.E. Auditorium at proposal submission and pushing venue switchovers live over SSE transformed In-Bloom.",
    author: "Dr. Lakshmi Nair",
    role: "Faculty Coordinator · Stage-1 Departmental Endorsements",
    metric: "3ms Automated Venue Clash Check",
  },
  {
    quote:
      "Gate-1 marshals scan 30-second rotating HMAC passes in under 180 milliseconds while seeing only the attendee's first name. Forwarded WhatsApp screenshots fail on the spot.",
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
    a: "Zero role-string checks exist in backend routes or frontend screens. Apache APISIX validates OIDC Bearer tokens at the gateway perimeter, and Fastify re-verifies JWT claims against 45 granular permissions (such as event:approve:dept or checkin:scan:own-event) plus resource ownership.",
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
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Editorial Chapter Masthead */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-10">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="editorial-italic text-3xl text-gold sm:text-4xl">
                07.
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">
                Field Voices &amp; Institutional Protocol Briefing
              </span>
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-bone sm:text-5xl lg:text-6xl">
              Proven Under Real{" "}
              <span className="editorial-italic font-normal text-gold">
                Campus Contention.
              </span>
            </h2>
          </div>
          <span className="text-xs font-medium text-silver">
            CHRIST (Deemed to be University) · Central Campus Societies
          </span>
        </div>

        {/* Editorial Magazine Pull-Quotes Divided by Swiss Hairlines */}
        <div className="grid divide-y divide-rule border-b border-rule lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {SOCIETY_VOICES.map((v, idx) => (
            <blockquote
              key={v.author}
              className={`flex flex-col justify-between py-8 ${
                idx === 0 ? "lg:pr-8" : idx === 1 ? "lg:px-8" : "lg:pl-8"
              }`}
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-phosphor/30 bg-phosphor-soft px-3 py-1 font-mono text-[10px] font-medium text-phosphor">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{v.metric}</span>
                </span>
                <p className="editorial-upright mt-5 text-2xl leading-[1.32] text-bone sm:text-[1.65rem]">
                  &ldquo;{v.quote}&rdquo;
                </p>
              </div>
              <footer className="mt-6 pt-4">
                <p className="text-sm font-semibold text-bone">{v.author}</p>
                <p className="mt-0.5 text-xs text-gold">{v.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Two-Column Hairline Protocol Briefing & FAQ */}
        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="editorial-italic text-xl text-gold">
                Institutional Protocol Briefing
              </p>
              <h3 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-bone sm:text-4xl">
                Gate-1 Entry, Security &amp; Pass Mechanics
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-silver">
                Essential guidance for CHRIST Central students, visiting
                inter-collegiate delegates, and faculty reviewers before locking
                seats or operating auditorium doors.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-rule bg-carbon/85 p-6">
              <p className="font-display text-lg font-bold text-bone">
                Ready to explore all 8 role workspaces?
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-silver">
                Launch Student, Guest, Event Head, Gate Marshal, Faculty, Dean,
                Sponsor, or Admin in a single click.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-xs font-semibold text-void transition hover:bg-gold"
              >
                <span>Open Concourse Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-rule rounded-3xl border border-rule bg-carbon/60 px-6 lg:col-span-7">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={item.q} className="py-5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-display text-base font-semibold tracking-tight text-bone sm:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gold transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 pr-6 text-sm leading-relaxed text-silver">
                      {item.a}
                    </p>
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
