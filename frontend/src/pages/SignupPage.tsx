import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { resolveDefaultWorkspacePath, useAuth } from "../auth/AuthContext";
import { ChristCrestMark, ColonnadeMotifSvg } from "../components/BrandMarks";
import { QrMatrixCanvas } from "../components/QrMatrixCanvas";
import { DESIGN_TOKENS } from "../tokens";

const STRENGTH_LABELS = [
  "Enter 10+ chars",
  "Fair Entropy",
  "Good Entropy",
  "Strong Passphrase",
  "Institutional Grade",
];

export const SignupPage: React.FC = () => {
  const { signupAccount } = useAuth();
  const navigate = useNavigate();

  const [track, setTrack] = useState<"student" | "guest">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [department, setDepartment] = useState<string>(
    DESIGN_TOKENS.departments[0],
  );
  const [year, setYear] = useState<number>(3);
  const [institution, setInstitution] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const maskedPhonePreview = useMemo(() => {
    const clean = phone.trim();
    if (clean.length >= 4) {
      return `+91******${clean.slice(-2)}`;
    }
    return "+91******42";
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setErrorMsg("Enter your full official name as on your college ID card.");
      return;
    }

    if (password.length < 10) {
      setErrorMsg("Password must be at least 10 characters long.");
      return;
    }

    if (trimmedPhone && !/^\+91[6-9]\d{9}$/.test(trimmedPhone)) {
      setErrorMsg(
        "Mobile number must follow Indian E.164 format (+91XXXXXXXXXX).",
      );
      return;
    }

    if (track === "student") {
      if (!trimmedEmail.endsWith("@christuniversity.in")) {
        setErrorMsg(
          "CHRIST Student enrollment requires an @christuniversity.in email address.",
        );
        return;
      }
      if (!/^\d{7}$/.test(registerNumber.trim())) {
        setErrorMsg(
          "Enter a valid 7-digit CHRIST Register Number (e.g. 2341108).",
        );
        return;
      }
    } else {
      if (trimmedEmail.endsWith("@christuniversity.in")) {
        setErrorMsg(
          "Switch to the CHRIST Student tab to enroll with an @christuniversity.in address.",
        );
        return;
      }
      if (institution.trim().length < 3) {
        setErrorMsg("Enter your visiting college or university name.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const created = await signupAccount({
        email: trimmedEmail,
        password,
        name: trimmedName,
        phone: trimmedPhone || undefined,
        accountType: track,
        studentRegisterNumber:
          track === "student" ? registerNumber.trim() : undefined,
        department: track === "student" ? department : undefined,
        year: track === "student" ? year : undefined,
        institution:
          track === "student" ? DESIGN_TOKENS.campus.name : institution.trim(),
      });
      navigate(resolveDefaultWorkspacePath(created.permissions), {
        replace: true,
      });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not complete registration.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const liveDisplayName = name.trim() || "Rohan Kulkarni";
  const liveEmail =
    email.trim() ||
    (track === "student"
      ? "rohan.k@christuniversity.in"
      : "delegate@sju.edu.in");
  const liveAffiliation =
    track === "student"
      ? `${department} · Year ${year}`
      : institution.trim() || "Visiting College Delegation";
  const liveBadgeCode =
    track === "student"
      ? `REG #${registerNumber.trim() || "2341109"}`
      : "GATE-1 VISITOR";

  return (
    <div className="min-h-screen bg-void text-bone lg:grid lg:grid-cols-12">
      {/* =====================================================================
          LEFT DUAL PANEL (50%): STICKY CINEMA VIEWPORT & LIVE HOLOGRAPHIC PASS
         ===================================================================== */}
      <aside className="p-3 sm:p-5 lg:col-span-6 lg:sticky lg:top-0 lg:h-screen">
        <div className="hud-frame relative flex h-full min-h-[500px] flex-col justify-between overflow-hidden rounded-2xl border border-rule-strong bg-obsidian p-6 shadow-anchor sm:p-10">
          {import.meta.env.MODE !== "test" && (
            <video
              src="/media/christ-concourse-reel.mp4"
              poster="/media/hero-central-campus.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-32 mix-blend-luminosity motion-reduce:hidden"
            />
          )}
          <img
            src="/media/hero-central-campus.jpg"
            alt=""
            width={1280}
            height={720}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-28 mix-blend-luminosity motion-reduce:block"
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
            className={`pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-[115px] transition-colors duration-500 ${
              track === "student" ? "bg-vermilion/25" : "bg-phosphor/20"
            }`}
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
                <Sparkles className="h-3.5 w-3.5 text-vermilion" />
                <span>DUAL-TRACK ONBOARDING</span>
              </span>
            </div>

            <div className="mt-7 flex items-center gap-3.5">
              <ChristCrestMark className="h-11 w-11" tone="light" />
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                  {DESIGN_TOKENS.campus.shortCode}
                </p>
                <p className="text-xs font-medium text-silver sm:text-sm">
                  Hosur Road Precinct · Gate-1 Admission
                </p>
              </div>
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.03] tracking-tight text-bone sm:text-5xl">
              Enroll Your{" "}
              <span
                className={`editorial-italic font-normal ${
                  track === "student" ? "text-gold" : "text-phosphor"
                }`}
              >
                Campus Pass.
              </span>
            </h1>
          </div>

          {/* LIVE INTERACTIVE BOARDING CREDENTIAL PREVIEW */}
          <div className="relative z-10 my-5 overflow-hidden rounded-2xl border border-rule-strong bg-void/90 shadow-editorial backdrop-blur-xl">
            <div
              className={`flex items-center justify-between px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest ${
                track === "student"
                  ? "bg-vermilion text-void"
                  : "bg-phosphor text-void"
              }`}
            >
              <span>
                {track === "student"
                  ? "TRACK A · CHRIST CENTRAL STUDENT CREDENTIAL"
                  : "TRACK B · VISITING DELEGATION GATE-1 PASS"}
              </span>
              <span>{liveBadgeCode}</span>
            </div>

            <div className="grid items-center gap-4 p-5 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
                  LIVE CREDENTIAL PREVIEW
                </p>
                <h2 className="truncate font-display text-2xl font-extrabold text-bone">
                  {liveDisplayName}
                </h2>
                <p className="truncate font-mono text-xs text-silver">
                  {liveAffiliation}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-silver">
                  <span className="rounded border border-rule bg-carbon px-2 py-0.5">
                    {liveEmail}
                  </span>
                  <span className="rounded border border-rule bg-carbon px-2 py-0.5 text-phosphor">
                    {maskedPhonePreview}
                  </span>
                </div>
              </div>

              <div className="flex justify-center sm:col-span-4">
                <QrMatrixCanvas
                  value={`concourse-${track}-${liveEmail}-${liveBadgeCode}`}
                  size={104}
                  darkColor="#07090D"
                  lightColor="#F4F0E6"
                />
              </div>
            </div>

            <div className="pass-perforation h-[2px] w-full" />

            <div className="flex flex-wrap items-center justify-between gap-2 bg-carbon/80 px-5 py-3 font-mono text-[10px]">
              <span className="text-silver">
                {track === "student"
                  ? "Unlocks: All Internal Seminars + Inter-Collegiate Fests + XP League"
                  : "Unlocks: External-Open Fests (Internal Events Strictly Filtered)"}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-gold">
                <ShieldCheck className="h-3 w-3 text-phosphor" />
                <span>30s HMAC</span>
              </span>
            </div>
          </div>

          {/* Bottom Privacy Guarantee */}
          <div className="relative z-10 border-t border-rule pt-4">
            <ColonnadeMotifSvg className="h-9 w-full opacity-75" />
            <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-silver">
              <Shield className="h-3.5 w-3.5 text-phosphor" />
              <span>
                E.164 phones stored masked · Zero student PII shared with
                sponsors
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          RIGHT DUAL PANEL (50%): ENROLLMENT STUDIO & DUAL-TRACK FORM
         ===================================================================== */}
      <main className="relative flex flex-col justify-center bg-carbon/55 px-4 py-8 sm:px-10 lg:col-span-6 lg:px-12 lg:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-vermilion/5 blur-[120px]"
        />

        <div className="relative z-10 mx-auto w-full max-w-xl">
          {/* Top Dual-Page Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="editorial-italic text-lg text-gold">
                02. Identity Provisioning
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
                Create Concourse Pass
              </h2>
            </div>

            <div className="inline-flex rounded-full border border-rule-strong bg-obsidian p-1 text-xs">
              <Link
                to="/login"
                className="rounded-full px-3.5 py-1.5 font-medium text-silver transition hover:text-bone"
              >
                Sign In
              </Link>
              <span className="rounded-full bg-bone px-3.5 py-1.5 font-semibold text-void">
                Create Pass
              </span>
            </div>
          </div>

          {/* Dual Track Selector Cards (Preserves exact ARIA tab roles & names) */}
          <div
            role="tablist"
            aria-label="Account affiliation track"
            className="mt-5 grid grid-cols-2 gap-3"
          >
            <button
              type="button"
              role="tab"
              aria-selected={track === "student"}
              onClick={() => {
                setTrack("student");
                setErrorMsg(null);
              }}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                track === "student"
                  ? "border-vermilion bg-gunmetal shadow-glow"
                  : "border-rule-strong bg-obsidian/80 text-silver hover:border-bone/40 hover:text-bone"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <GraduationCap
                  className={`h-4 w-4 ${
                    track === "student" ? "text-vermilion" : "text-silver"
                  }`}
                />
                <span className="font-mono text-[10px] font-bold uppercase text-gold">
                  TRACK A
                </span>
              </div>
              <span className="mt-2 font-serif text-sm font-bold text-bone">
                CHRIST University Student
              </span>
              <span className="mt-0.5 font-mono text-[10px] text-silver">
                @christuniversity.in + 7-Digit Reg
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={track === "guest"}
              onClick={() => {
                setTrack("guest");
                setErrorMsg(null);
              }}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                track === "guest"
                  ? "border-phosphor bg-gunmetal shadow-[0_0_28px_-8px_rgba(46,229,157,0.35)]"
                  : "border-rule-strong bg-obsidian/80 text-silver hover:border-bone/40 hover:text-bone"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Building2
                  className={`h-4 w-4 ${
                    track === "guest" ? "text-phosphor" : "text-silver"
                  }`}
                />
                <span className="font-mono text-[10px] font-bold uppercase text-phosphor">
                  TRACK B
                </span>
              </div>
              <span className="mt-2 font-serif text-sm font-bold text-bone">
                External Fest Guest
              </span>
              <span className="mt-0.5 font-mono text-[10px] text-silver">
                Visiting College Delegation
              </span>
            </button>
          </div>

          {/* Anodized Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="hud-frame glass-console mt-4 space-y-4 rounded-2xl border border-rule-strong p-6 sm:p-7"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                >
                  Full Official Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rohan Kulkarni"
                    className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-3.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                >
                  {track === "student"
                    ? "CHRIST Institutional Email"
                    : "Visiting College Email"}
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      track === "student"
                        ? "rohan.k@christuniversity.in"
                        : "delegate@rvce.edu.in"
                    }
                    className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-3.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {track === "student" ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="signup-regno"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                  >
                    7-Digit Reg No.
                  </label>
                  <div className="relative mt-1.5">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="signup-regno"
                      type="text"
                      inputMode="numeric"
                      maxLength={7}
                      required
                      value={registerNumber}
                      onChange={(e) =>
                        setRegisterNumber(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="2341109"
                      className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-8 pr-3 font-mono text-sm text-bone focus:border-vermilion focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="signup-dept"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                  >
                    Department
                  </label>
                  <select
                    id="signup-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-rule-strong bg-void px-3 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                  >
                    {DESIGN_TOKENS.departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="signup-year"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                  >
                    Year of Study
                  </label>
                  <select
                    id="signup-year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-rule-strong bg-void px-3 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="signup-institution"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                >
                  Visiting College / University Name
                </label>
                <div className="relative mt-1.5">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="signup-institution"
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="St. Joseph's University, Bengaluru"
                    className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-3.5 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-phone"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                >
                  Mobile Number (E.164 Optional)
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919845012345"
                    className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-3.5 font-mono text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-silver"
                >
                  Password (Min 10 Characters)
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={10}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Strong passphrase"
                    className="w-full rounded-lg border border-rule-strong bg-void py-2.5 pl-10 pr-10 text-sm text-bone placeholder:text-ink-muted focus:border-vermilion focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
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
                <div className="mt-2">
                  <div aria-hidden="true" className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 rounded-full transition-colors ${
                          passwordScore >= step
                            ? passwordScore >= 3
                              ? "bg-phosphor"
                              : "bg-gold"
                            : "bg-gunmetal"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-silver">
                    Security: {STRENGTH_LABELS[passwordScore]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-rule bg-void/80 px-3.5 py-2.5 text-xs text-silver">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-phosphor" />
              <span>
                {track === "student"
                  ? "Provisioned grants: event:read:public, registration:create, registration:cancel:own, luckydraw:enter, gamification:read:own, gallery:read."
                  : "Provisioned grants: event:read:public (External-Open scoped), registration:create, registration:cancel:own, luckydraw:enter, gallery:read."}
              </span>
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
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-void transition disabled:opacity-50 ${
                track === "student"
                  ? "bg-vermilion shadow-glow hover:bg-vermilion-hover"
                  : "bg-phosphor hover:opacity-90"
              }`}
            >
              <span>
                {submitting
                  ? "Provisioning PBAC Credentials..."
                  : track === "student"
                    ? "Issue CHRIST Student Concourse Pass"
                    : "Issue External Fest Guest Account"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
