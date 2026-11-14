import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react";
import { resolveDefaultWorkspacePath, useAuth } from "../auth/AuthContext";
import { ChristCrestMark, ColonnadeMotifSvg } from "../components/BrandMarks";
import { DESIGN_TOKENS } from "../tokens";

export const SignupPage: React.FC = () => {
  const { signupAccount } = useAuth();
  const navigate = useNavigate();

  const [track, setTrack] = useState<"student" | "guest">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-12">
      {/* Left Architectural Explainer with Ambient Cinema Loop & Campus Poster */}
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-obsidian-rule bg-obsidian px-6 py-10 text-bone lg:col-span-5 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
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
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-28 mix-blend-luminosity motion-reduce:hidden"
          />
        )}
        <img
          src="/media/hero-central-campus.jpg"
          alt=""
          width={1280}
          height={720}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-26 mix-blend-luminosity motion-reduce:block"
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
              Dual-Track Onboarding
            </span>
          </div>

          <div className="mt-10 flex items-center gap-3.5">
            <ChristCrestMark className="h-11 w-11" tone="light" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                {DESIGN_TOKENS.campus.shortCode}
              </p>
              <p className="text-sm font-medium text-paper-deep">
                Hosur Road Precinct · Gate-1 Admission
              </p>
            </div>
          </div>

          <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-bone sm:text-5xl">
            Enroll Your <span className="text-vermilion">Campus Pass.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper-deep/85">
            Choose the institutional track matching your affiliation.
            Permissions and event visibility boundaries are provisioned
            automatically at creation.
          </p>

          <div className="mt-8 space-y-4 border-t border-obsidian-rule pt-6">
            <div className="rounded-lg border border-obsidian-rule bg-obsidian-surface/90 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-gold">
                <GraduationCap className="h-4 w-4" />
                <span>Track A · CHRIST Central Student</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-paper-deep/85">
                Requires verified <code>@christuniversity.in</code> address and
                7-digit Register Number. Unlocks internal department seminars,
                Blossoms, Labyrinth, and append-only XP milestones.
              </p>
            </div>

            <div className="rounded-lg border border-obsidian-rule bg-obsidian-surface/90 p-4 backdrop-blur-xs">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-phosphor">
                <Users className="h-4 w-4" />
                <span>Track B · External Fest Guest</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-paper-deep/85">
                For visiting college delegations attending inter-collegiate
                conclaves (Magnovite, In-Bloom, Futsal Cup). Scoped strictly to
                External-Open events with Gate-1 rotating QR entry.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 pt-6">
          <ColonnadeMotifSvg className="h-12 w-full opacity-80" />
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-paper-deep/75">
            <Shield className="h-3.5 w-3.5 text-phosphor" />
            <span>Phones stored masked · Zero PII shared with sponsors</span>
          </div>
        </div>
      </aside>

      {/* Right Registration Form */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:col-span-7 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-vermilion">
                Identity Provisioning
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-bone">
                Create Concourse Account
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-vermilion underline-offset-4 hover:underline"
            >
              <span>Already registered? Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Dual Track Selector */}
          <div
            role="tablist"
            aria-label="Account affiliation track"
            className="mt-6 grid grid-cols-2 rounded-lg border border-rule bg-paper-recessed p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={track === "student"}
              onClick={() => {
                setTrack("student");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold transition ${
                track === "student"
                  ? "bg-paper-elevated text-bone shadow-sm"
                  : "text-ink-secondary hover:text-bone"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>CHRIST University Student</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={track === "guest"}
              onClick={() => {
                setTrack("guest");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold transition ${
                track === "guest"
                  ? "bg-paper-elevated text-bone shadow-sm"
                  : "text-ink-secondary hover:text-bone"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>External Fest Guest</span>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-4 rounded-xl border border-rule-strong bg-paper-elevated p-6 shadow-editorial"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  Full Official Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Kulkarni"
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  {track === "student"
                    ? "CHRIST Institutional Email"
                    : "Visiting College Email"}
                </label>
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
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                />
              </div>
            </div>

            {track === "student" ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="signup-regno"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                  >
                    7-Digit Reg No.
                  </label>
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
                    className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-sm text-bone focus:border-vermilion focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-dept"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                  >
                    Department
                  </label>
                  <select
                    id="signup-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
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
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                  >
                    Year of Study
                  </label>
                  <select
                    id="signup-year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
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
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  Visiting College / University Name
                </label>
                <input
                  id="signup-institution"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="St. Joseph's University, Bengaluru"
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-phone"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  Mobile Number (E.164 Optional)
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919845012345"
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-sm text-bone focus:border-vermilion focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary"
                >
                  Password (Min 10 Characters)
                </label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong passphrase"
                  className="mt-1.5 w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2.5 text-sm text-bone focus:border-vermilion focus:outline-none"
                />
                <div
                  aria-hidden="true"
                  className="mt-1.5 grid grid-cols-4 gap-1"
                >
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-1 rounded-full ${
                        passwordScore >= step
                          ? "bg-phosphor"
                          : "bg-paper-recessed"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-rule bg-paper px-3.5 py-2.5 text-xs text-ink-secondary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-phosphor" />
              <span>
                {track === "student"
                  ? "Provisioned permissions: event:read:public, registration:create, registration:cancel:own, luckydraw:enter, gamification:read:own, gallery:read."
                  : "Provisioned permissions: event:read:public (External-Open scoped), registration:create, registration:cancel:own, luckydraw:enter, gallery:read."}
              </span>
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
                  ? "Provisioning Campus Identity..."
                  : track === "student"
                    ? "Activate CHRIST Student Account"
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
