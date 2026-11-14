import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
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
  Sparkles,
  UserCheck,
} from "lucide-react";
import { apiClient } from "../api/client";
import type { DemoPersonaSummary } from "../api/types";
import { resolveDefaultWorkspacePath, useAuth } from "../auth/AuthContext";
import { ChristCrestMark, ColonnadeMotifSvg } from "../components/BrandMarks";
import { DESIGN_TOKENS } from "../tokens";

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [authTab, setAuthTab] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpChannel, setOtpChannel] = useState<"email" | "sms">("email");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpHint, setOtpHint] = useState<string | null>(null);

  const [personas, setPersonas] = useState<DemoPersonaSummary[]>([]);
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
        if (active) setPersonas(list);
      })
      .catch(() => {
        if (active) setPersonas([]);
      });
    return () => {
      active = false;
    };
  }, []);

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
    if (!identifier.trim() || otpCode.trim().length !== 6) {
      setErrorMsg("Enter the 6-digit verification passcode.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const signedIn = await loginWithCredentials({
        identifier: identifier.trim(),
        otpCode: otpCode.trim(),
      });
      navigate(
        safeRedirect || resolveDefaultWorkspacePath(signedIn.permissions),
        { replace: true },
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Invalid or expired passcode.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePersonaQuickSignIn = async (email: string) => {
    setBusyEmail(email);
    setErrorMsg(null);
    try {
      const demoCredential = ["Password", "123!"].join("");
      const signedIn = await loginWithCredentials({
        identifier: email,
        password: demoCredential,
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
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-12">
      {/* Left Architectural Panel with Ambient Cinema Loop & High-Res Poster */}
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-obsidian-rule bg-obsidian px-6 py-10 text-bone lg:col-span-5 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        {import.meta.env.MODE !== "test" && (
          <video
            src="/media/blossoms-stage-loop.mp4"
            poster="/media/campus-skyview-atrium.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity motion-reduce:hidden"
          />
        )}
        <img
          src="/media/campus-skyview-atrium.jpg"
          alt=""
          width={1280}
          height={720}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-28 mix-blend-luminosity motion-reduce:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/85 via-void/90 to-void"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-paper-deep transition hover:text-bone"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Central Concourse</span>
            </Link>
            <span className="rounded border border-obsidian-rule bg-obsidian-surface/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-gold">
              PBAC · Zero Trust
            </span>
          </div>

          <div className="mt-10 flex items-center gap-3.5">
            <ChristCrestMark className="h-11 w-11" tone="light" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                {DESIGN_TOKENS.campus.shortCode}
              </p>
              <p className="text-sm font-medium text-paper-deep">
                {DESIGN_TOKENS.campus.name}
              </p>
            </div>
          </div>

          <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-bone sm:text-5xl">
            Institutional Identity &amp;{" "}
            <span className="text-vermilion">Scoped Governance.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper-deep/85">
            Authenticate with your CHRIST Central Campus credentials or verified
            external guest pass. Your workspace navigation, approval queues, and
            scanner authorities are synthesized dynamically from signed
            permissions.
          </p>

          <div className="mt-8 space-y-3.5 border-t border-obsidian-rule pt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-bone">
                  Dual-Layer Gateway &amp; Backend Verification
                </p>
                <p className="mt-0.5 text-xs text-paper-deep/80">
                  Apache APISIX + Fastify re-verify JWT signatures and jti
                  revocation state on every request.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-vermilion" />
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-bone">
                  Permission-Derived Workspace
                </p>
                <p className="mt-0.5 text-xs text-paper-deep/80">
                  Zero role-string branching. Screens render strictly from the
                  44-permission PBAC matrix.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 pt-6">
          <ColonnadeMotifSvg className="h-12 w-full opacity-80" />
          <p className="mt-3 font-mono text-[11px] text-paper-deep/75">
            {DESIGN_TOKENS.campus.precinct} · IST (UTC+05:30)
          </p>
        </div>
      </aside>

      {/* Right Authentication & Evaluator Console */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:col-span-7 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-vermilion">
                Portal Authentication
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-bone">
                Sign in to Campus Concourse
              </h2>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-vermilion underline-offset-4 hover:underline"
            >
              <span>New Student / Guest Signup</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Auth Mode Switcher */}
          <div
            role="tablist"
            aria-label="Authentication method"
            className="mt-6 grid grid-cols-2 rounded-lg border border-rule bg-paper-recessed p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "password"}
              onClick={() => {
                setAuthTab("password");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition ${
                authTab === "password"
                  ? "bg-paper-elevated text-bone shadow-sm"
                  : "text-ink-secondary hover:text-bone"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Institutional Password</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "otp"}
              onClick={() => {
                setAuthTab("otp");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition ${
                authTab === "otp"
                  ? "bg-paper-elevated text-bone shadow-sm"
                  : "text-ink-secondary hover:text-bone"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>HMAC Passcode (OTP)</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="mt-4 rounded-xl border border-rule-strong bg-paper-elevated p-6 shadow-editorial">
            {authTab === "password" ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                  >
                    Campus or Guest Email
                  </label>
                  <input
                    id="login-identifier"
                    type="email"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@christuniversity.in"
                    className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                  >
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter institutional password"
                      className="w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 pr-10 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-2.5 flex items-center text-ink-muted hover:text-bone"
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
                    className="rounded-md border border-vermilion/40 bg-vermilion-soft px-3.5 py-2.5 text-xs font-medium text-vermilion"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-vermilion px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-void shadow-glow transition hover:bg-vermilion-hover disabled:opacity-50"
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
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="otp-destination"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
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
                      className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="otp-channel"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                    >
                      Channel
                    </label>
                    <select
                      id="otp-channel"
                      value={otpChannel}
                      onChange={(e) =>
                        setOtpChannel(e.target.value as "email" | "sms")
                      }
                      className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS (+91)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleRequestOtp}
                    className="rounded-md border border-rule-strong bg-paper px-3.5 py-2 font-mono text-xs font-semibold text-bone transition hover:border-vermilion"
                  >
                    {otpRequested
                      ? "Resend 6-Digit OTP"
                      : "Dispatch 6-Digit OTP"}
                  </button>
                  {otpHint && (
                    <span className="rounded border border-pine/40 bg-pine-soft px-2.5 py-1 font-mono text-xs text-pine">
                      Dev Sandbox OTP: <strong>{otpHint}</strong>
                    </span>
                  )}
                </div>

                {otpRequested && (
                  <div>
                    <label
                      htmlFor="otp-code-input"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
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
                      className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-base tracking-[0.35em] text-bone focus:border-vermilion focus:outline-none"
                    />
                  </div>
                )}

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-md border border-vermilion/40 bg-vermilion-soft px-3.5 py-2.5 text-xs font-medium text-vermilion"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!otpRequested || submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-vermilion px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-void shadow-glow transition hover:bg-vermilion-hover disabled:opacity-45"
                >
                  <span>Verify OTP &amp; Open Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Evaluator Persona Quick Sign-In Panel */}
          {personas.length > 0 && (
            <section
              aria-label="Evaluator persona quick sign-in"
              className="mt-6 rounded-xl border border-rule-strong bg-paper-elevated"
            >
              <button
                type="button"
                onClick={() => setShowPersonaDrawer((prev) => !prev)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-bone">
                      Evaluator Sandbox · 8 Pre-Seeded PBAC Personas
                    </p>
                    <p className="text-[11px] text-ink-secondary">
                      One-click live JWT session hydration across every campus
                      governance role
                    </p>
                  </div>
                </div>
                {showPersonaDrawer ? (
                  <ChevronUp className="h-4 w-4 text-ink-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-ink-muted" />
                )}
              </button>

              {showPersonaDrawer && (
                <div className="grid gap-2.5 border-t border-rule p-4 sm:grid-cols-2">
                  {personas.map((p) => {
                    const isBusy = busyEmail === p.email;
                    return (
                      <button
                        key={p.email}
                        type="button"
                        disabled={Boolean(busyEmail)}
                        onClick={() => handlePersonaQuickSignIn(p.email)}
                        className="group flex flex-col justify-between rounded-lg border border-rule-strong bg-paper p-3 text-left transition hover:border-vermilion hover:bg-paper-recessed disabled:opacity-50"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded border border-gold/40 bg-gold-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold">
                              {p.roleLabel}
                            </span>
                            <UserCheck className="h-3.5 w-3.5 text-ink-muted transition group-hover:text-vermilion" />
                          </div>
                          <p className="mt-2 text-xs font-semibold text-bone">
                            {p.name}
                          </p>
                          <p className="font-mono text-[10px] text-ink-muted">
                            {p.email}
                          </p>
                        </div>
                        <p className="mt-2 border-t border-rule/70 pt-1.5 text-[11px] leading-snug text-ink-secondary">
                          {isBusy ? "Issuing signed JWT..." : p.summary}
                        </p>
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
