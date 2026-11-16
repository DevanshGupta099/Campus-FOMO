import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { apiClient } from "../api/client";
import type { DemoPersonaSummary } from "../api/types";
import { resolveDefaultWorkspacePath, useAuth } from "../auth/AuthContext";
import { ChristCrestMark, ColonnadeMotifSvg } from "../components/BrandMarks";
import { DESIGN_TOKENS } from "../tokens";

const PERSONA_BLUEPRINT_META: Record<
  string,
  { grants: number; dest: string; samplePerms: string[]; highlight: string }
> = {
  "asha@christuniversity.in": {
    grants: 8,
    dest: "/app/discover",
    samplePerms: [
      "registration:create",
      "luckydraw:enter",
      "gamification:read:own",
    ],
    highlight: "Internal + Inter-Collegiate Seat Locks, Watchlist & XP League",
  },
  "priya.menon@pes.edu": {
    grants: 5,
    dest: "/app/discover",
    samplePerms: ["event:read:public", "registration:create", "gallery:read"],
    highlight: "External-Open Inter-Collegiate Scope & Gate-1 Rotating Pass",
  },
  "guest@external.edu": {
    grants: 5,
    dest: "/app/discover",
    samplePerms: ["event:read:public", "registration:create", "gallery:read"],
    highlight: "External-Open Inter-Collegiate Scope & Gate-1 Rotating Pass",
  },
  "rohan@christuniversity.in": {
    grants: 14,
    dest: "/app/manage-events",
    samplePerms: [
      "event:create",
      "volunteer:assign:own-event",
      "broadcast:send:own-event",
    ],
    highlight: "Proposal Composer, Monsoon Backup & Live SSE Broadcasts",
  },
  "karan@christuniversity.in": {
    grants: 14,
    dest: "/app/manage-events",
    samplePerms: [
      "event:create",
      "volunteer:assign:own-event",
      "broadcast:send:own-event",
    ],
    highlight: "Proposal Composer, Monsoon Backup & Live SSE Broadcasts",
  },
  "volunteer@christuniversity.in": {
    grants: 3,
    dest: "/app/scanner",
    samplePerms: ["checkin:scan:own-event", "event:read:public"],
    highlight: "Sub-300ms Optical HMAC Gate Terminal (First-Name Zero-PII)",
  },
  "dr.nair@christuniversity.in": {
    grants: 7,
    dest: "/app/approvals/department",
    samplePerms: ["event:approve:dept", "proposal:read:dept", "event:reject"],
    highlight: "Stage-1 Departmental Endorsement & <150ms Clash Inspector",
  },
  "dean@christuniversity.in": {
    grants: 11,
    dest: "/app/approvals/executive",
    samplePerms: ["event:approve:budget", "audit:read", "event:cancel:any"],
    highlight: "Stage-2 INR Budget Sanction & Concourse Publication",
  },
  "sponsor@thirdwavecoffee.in": {
    grants: 5,
    dest: "/app/sponsor",
    samplePerms: [
      "sponsor:profile:manage:own",
      "sponsor:analytics:view:own",
      "luckydraw:run",
    ],
    highlight: "Zero-PII Beverage Showcase & Commit-Reveal Voucher Draws",
  },
  "admin@christuniversity.in": {
    grants: 44,
    dest: "/app/admin/rbac",
    samplePerms: ["rbac:manage", "user:manage", "audit:read", "ops:view"],
    highlight: "Full 44-Permission PBAC Matrix, Direct Grants & Security Ops",
  },
};

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const personaParam = searchParams.get("persona");

  const [authTab, setAuthTab] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState(personaParam || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpChannel, setOtpChannel] = useState<"email" | "sms">("email");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpHint, setOtpHint] = useState<string | null>(null);

  const [personas, setPersonas] = useState<DemoPersonaSummary[]>([]);
  const [previewEmail, setPreviewEmail] = useState<string>(
    personaParam || "asha@christuniversity.in",
  );
  const [showPersonaDrawer, setShowPersonaDrawer] = useState(true);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rawRedirect = searchParams.get("redirect");
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(safeRedirect || resolveDefaultWorkspacePath(user.permissions), {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate, safeRedirect]);

  useEffect(() => {
    let active = true;
    apiClient
      .getDemoPersonas()
      .then((list) => {
        if (active) {
          setPersonas(list);
          if (personaParam) {
            setPreviewEmail(personaParam);
          } else if (list[0]) {
            setPreviewEmail(list[0].email);
          }
        }
      })
      .catch(() => {
        if (active) setPersonas([]);
      });
    return () => {
      active = false;
    };
  }, [personaParam]);

  const activePreviewPersona = useMemo(() => {
    const typed = identifier.trim().toLowerCase();
    const matchByTyped = personas.find((p) => p.email.toLowerCase() === typed);
    if (matchByTyped) return matchByTyped;
    return (
      personas.find((p) => p.email === previewEmail) ||
      personas[0] || {
        email: "asha@christuniversity.in",
        name: "Asha Nair",
        role: "STUDENT",
        roleLabel: "CHRIST Student",
        department: "Computer Science",
        summary: "Full internal & inter-collegiate seat locking and XP league",
      }
    );
  }, [identifier, personas, previewEmail]);

  const activeBlueprint =
    PERSONA_BLUEPRINT_META[activePreviewPersona.email] ||
    PERSONA_BLUEPRINT_META["asha@christuniversity.in"];

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg("Enter your campus email and password to continue.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const signedIn = await loginWithCredentials({
        identifier: identifier.trim(),
        password,
      });
      navigate(
        safeRedirect || resolveDefaultWorkspacePath(signedIn.permissions),
        { replace: true },
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Authentication failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      setErrorMsg("Enter your registered email or +91 mobile number first.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.requestOtp(identifier.trim(), otpChannel);
      setOtpRequested(true);
      setOtpHint(res.devPasscodeHint || null);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not dispatch passcode.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg("Enter the 6-digit passcode dispatched to your channel.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const signedIn = await loginWithCredentials({
        identifier: identifier.trim(),
        otpCode,
      });
      navigate(
        safeRedirect || resolveDefaultWorkspacePath(signedIn.permissions),
        { replace: true },
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "OTP verification failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePersonaQuickSignIn = async (email: string) => {
    setBusyEmail(email);
    setPreviewEmail(email);
    setErrorMsg(null);
    try {
      const otpRes = await apiClient.requestOtp(email, "email");
      if (!otpRes.devPasscodeHint) {
        setIdentifier(email);
        setErrorMsg("Enter institutional password to complete sign-in.");
        return;
      }
      const signedIn = await loginWithCredentials({
        identifier: email,
        otpCode: otpRes.devPasscodeHint,
      });
      navigate(
        safeRedirect || resolveDefaultWorkspacePath(signedIn.permissions),
        { replace: true },
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Quick persona sign-in failed.",
      );
    } finally {
      setBusyEmail(null);
    }
  };

  return (
    <div className="min-h-screen bg-void text-bone lg:grid lg:grid-cols-12">
      {/* =====================================================================
          LEFT DUAL PANEL (50%): STICKY CINEMA VIEWPORT & LIVE PBAC BLUEPRINT
         ===================================================================== */}
      <aside className="p-3 sm:p-5 lg:col-span-6 lg:sticky lg:top-0 lg:h-screen">
        <div className="hud-frame relative flex h-full min-h-[480px] flex-col justify-between overflow-hidden rounded-2xl border border-rule-strong bg-obsidian p-6 shadow-anchor sm:p-10">
          {/* Ambient Looping H.264 Cinema Reel + Static Reduced-Motion Poster */}
          {import.meta.env.MODE !== "test" && (
            <video
              src="/media/blossoms-stage-loop.mp4"
              poster="/media/auditorium-keynote-conclave.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity motion-reduce:hidden"
            />
          )}
          <img
            src="/media/auditorium-keynote-conclave.jpg"
            alt=""
            width={1280}
            height={720}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-32 mix-blend-luminosity motion-reduce:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/80 via-void/85 to-void/95"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-architectural-grid opacity-65"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-vermilion/20 blur-[110px]"
          />

          {/* Top Bar */}
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-rule-strong bg-void/80 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-silver backdrop-blur-md transition hover:border-vermilion hover:text-bone"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-vermilion" />
                <span>Central Concourse</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-void/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-phosphor" />
                <span>KEYCLOAK 26 · APISIX · PBAC</span>
              </span>
            </div>

            <div className="mt-8 flex items-center gap-3.5">
              <ChristCrestMark className="h-11 w-11" tone="light" />
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                  {DESIGN_TOKENS.campus.shortCode}
                </p>
                <p className="text-xs font-medium text-silver sm:text-sm">
                  {DESIGN_TOKENS.campus.name}
                </p>
              </div>
            </div>

            <h1 className="mt-6 font-display text-3xl font-extrabold leading-[1.04] tracking-tight text-bone sm:text-5xl">
              Institutional Identity &amp;{" "}
              <span className="text-vermilion">Scoped Governance.</span>
            </h1>

            <p className="mt-3 max-w-lg text-xs leading-relaxed text-silver sm:text-sm">
              Zero role-string branching. Every navigation surface, approval
              gate, and optical scanner terminal is synthesized live from your
              signed JWT permission claims.
            </p>
          </div>

          {/* Interactive Live PBAC Session Blueprint Card */}
          <div className="relative z-10 my-6 rounded-2xl border border-rule-strong bg-void/85 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-phosphor">
                <Activity className="h-3.5 w-3.5" />
                <span>LIVE PBAC SESSION BLUEPRINT</span>
              </div>
              <span className="rounded border border-gold/45 bg-gold-soft px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-gold">
                {activeBlueprint.grants} / 44 Signed Grants
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-serif text-lg font-bold text-bone">
                  {activePreviewPersona.name}{" "}
                  <span className="font-mono text-xs font-semibold text-vermilion">
                    ({activePreviewPersona.roleLabel})
                  </span>
                </p>
                <p className="font-mono text-[11px] text-silver">
                  {activePreviewPersona.department} · Default Route{" "}
                  <code className="text-gold">{activeBlueprint.dest}</code>
                </p>
              </div>
            </div>

            <p className="mt-2.5 text-xs text-bone/90">
              {activeBlueprint.highlight}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeBlueprint.samplePerms.map((perm) => (
                <code
                  key={perm}
                  className="rounded border border-vermilion/35 bg-vermilion-soft px-2 py-0.5 font-mono text-[10px] text-vermilion"
                >
                  {perm}
                </code>
              ))}
            </div>
          </div>

          {/* Bottom Colonnade & Security Telemetry */}
          <div className="relative z-10 border-t border-rule pt-4">
            <ColonnadeMotifSvg className="h-9 w-full opacity-75" />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-silver">
              <span>{DESIGN_TOKENS.campus.precinct}</span>
              <span className="text-gold">
                JTI REVOCATION · IST (UTC+05:30)
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          RIGHT DUAL PANEL (50%): PRECISION AUTH CONSOLE & 8-ROLE SANDBOX
         ===================================================================== */}
      <main className="relative flex flex-col justify-center bg-carbon/55 px-4 py-8 sm:px-10 lg:col-span-6 lg:px-12 lg:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-gold/5 blur-[120px]"
        />

        <div className="relative z-10 mx-auto w-full max-w-xl">
          {/* Top Dual-Page Route Switcher Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-vermilion">
                01 // PORTAL AUTHENTICATION
              </p>
              <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-bone sm:text-4xl">
                Sign in to Concourse
              </h2>
            </div>

            <div className="inline-flex rounded-lg border border-rule-strong bg-obsidian p-1 font-mono text-xs">
              <span className="rounded-md bg-vermilion px-3 py-1.5 font-bold uppercase text-void">
                Sign In
              </span>
              <Link
                to="/signup"
                className="rounded-md px-3 py-1.5 font-semibold uppercase text-silver transition hover:text-bone"
              >
                Create Pass
              </Link>
            </div>
          </div>

          {safeRedirect && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/40 bg-gold-soft px-3.5 py-2 font-mono text-xs text-gold">
              <KeyRound className="h-3.5 w-3.5 shrink-0" />
              <span>
                Destination locked: authenticating will route directly to{" "}
                <strong>{safeRedirect}</strong>
              </span>
            </div>
          )}

          {/* Main Anodized Auth Form Console */}
          <div className="hud-frame glass-console mt-5 rounded-2xl border border-rule-strong p-6 sm:p-7">
            {/* Segmented Auth Mode Switcher */}
            <div
              role="tablist"
              aria-label="Authentication method"
              className="grid grid-cols-2 rounded-xl border border-rule bg-void p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={authTab === "password"}
                onClick={() => {
                  setAuthTab("password");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                  authTab === "password"
                    ? "bg-gunmetal text-bone shadow-sm ring-1 ring-vermilion/50"
                    : "text-silver hover:text-bone"
                }`}
              >
                <Lock className="h-3.5 w-3.5 text-vermilion" />
                <span>Password</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authTab === "otp"}
                onClick={() => {
                  setAuthTab("otp");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                  authTab === "otp"
                    ? "bg-gunmetal text-bone shadow-sm ring-1 ring-vermilion/50"
                    : "text-silver hover:text-bone"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-gold" />
                <span>HMAC OTP</span>
              </button>
            </div>

            {authTab === "password" ? (
              <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                  >
                    Campus or Guest Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="login-identifier"
                      type="email"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="name@christuniversity.in"
                      className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-3.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                  >
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter institutional passphrase"
                      className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-10 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-1 flex w-9 items-center justify-center text-ink-muted hover:text-bone"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-lg border border-vermilion/45 bg-vermilion-soft px-3.5 py-2.5 text-xs font-medium text-vermilion"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-vermilion px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-void shadow-glow transition hover:bg-vermilion-hover disabled:opacity-50"
                >
                  <span>
                    {submitting
                      ? "Verifying Credentials..."
                      : "Authenticate & Enter Concourse"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="otp-destination"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                    >
                      Registered Email or +91 Mobile
                    </label>
                    <input
                      id="otp-destination"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="asha@christuniversity.in"
                      className="mt-1.5 w-full rounded-lg border border-rule-strong bg-void px-3.5 py-2.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="otp-channel"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                    >
                      Channel
                    </label>
                    <select
                      id="otp-channel"
                      value={otpChannel}
                      onChange={(e) =>
                        setOtpChannel(e.target.value as "email" | "sms")
                      }
                      className="mt-1.5 w-full rounded-lg border border-rule-strong bg-void px-3 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS (+91)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleRequestOtp}
                    className="rounded-lg border border-rule-strong bg-gunmetal px-4 py-2 font-mono text-xs font-semibold text-bone transition hover:border-vermilion"
                  >
                    {otpRequested
                      ? "Resend 6-Digit OTP"
                      : "Dispatch 6-Digit OTP"}
                  </button>
                  {otpHint && (
                    <span className="rounded-lg border border-phosphor/40 bg-phosphor-soft px-3 py-1 font-mono text-xs text-phosphor">
                      Dev Sandbox OTP: <strong>{otpHint}</strong>
                    </span>
                  )}
                </div>

                {otpRequested && (
                  <div>
                    <label
                      htmlFor="otp-code-input"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                    >
                      6-Digit HMAC Passcode
                    </label>
                    <input
                      id="otp-code-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      className="mt-1.5 w-full rounded-lg border border-rule-strong bg-void px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.45em] text-bone focus:border-vermilion focus:outline-none"
                    />
                  </div>
                )}

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-lg border border-vermilion/45 bg-vermilion-soft px-3.5 py-2.5 text-xs font-medium text-vermilion"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!otpRequested || submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-vermilion px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-void shadow-glow transition hover:bg-vermilion-hover disabled:opacity-45"
                >
                  <span>Verify OTP &amp; Open Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Evaluator Persona 1-Click Hydration Matrix */}
          {personas.length > 0 && (
            <section
              aria-label="Evaluator persona quick sign-in"
              className="mt-5 overflow-hidden rounded-2xl border border-rule-strong bg-obsidian/90"
            >
              <button
                type="button"
                onClick={() => setShowPersonaDrawer((prev) => !prev)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-gunmetal/40"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-bone">
                      Evaluator Sandbox · 8 Pre-Seeded PBAC Roles
                    </p>
                    <p className="text-[11px] text-silver">
                      Hover to preview PBAC blueprint on left · Click for
                      instant JWT sign-in
                    </p>
                  </div>
                </div>
                {showPersonaDrawer ? (
                  <ChevronUp className="h-4 w-4 text-silver" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-silver" />
                )}
              </button>

              {showPersonaDrawer && (
                <div className="grid gap-2 border-t border-rule p-4 sm:grid-cols-2">
                  {personas.map((p) => {
                    const isBusy = busyEmail === p.email;
                    const isHighlighted =
                      activePreviewPersona.email === p.email;
                    return (
                      <button
                        key={p.email}
                        type="button"
                        disabled={Boolean(busyEmail)}
                        onMouseEnter={() => setPreviewEmail(p.email)}
                        onFocus={() => setPreviewEmail(p.email)}
                        onClick={() => handlePersonaQuickSignIn(p.email)}
                        className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                          isHighlighted
                            ? "border-vermilion bg-gunmetal"
                            : "border-rule bg-void/80 hover:border-vermilion/60 hover:bg-gunmetal/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded border border-gold/40 bg-gold-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                              {p.roleLabel}
                            </span>
                            <UserCheck className="h-3.5 w-3.5 text-silver transition group-hover:text-vermilion" />
                          </div>
                          <p className="mt-1.5 text-xs font-bold text-bone">
                            {isBusy ? "Hydrating JWT..." : p.name}
                          </p>
                          <p className="truncate font-mono text-[10px] text-silver">
                            {p.email}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
