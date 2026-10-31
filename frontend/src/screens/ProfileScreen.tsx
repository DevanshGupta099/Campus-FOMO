import { useState } from "react";
import type { PersonaConfig } from "../auth/persona.js";
import { sound } from "../utils/audio.js";

interface ProfileScreenProps {
  activePersona: PersonaConfig;
  studentXp: number;
  onOpenGamification: () => void;
}

export function ProfileScreen({
  activePersona,
  studentXp,
  onOpenGamification,
}: ProfileScreenProps) {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sound.playSuccess();
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(activePersona.token);
    setCopied(true);
    sound.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const permissions = [
    "event:read:public",
    "event:register:own",
    "event:cancel:own",
    "ticket:read:own",
    "luckydraw:enter:own",
    "gamification:read:own",
    ...(activePersona.role === "EVENT_HEAD"
      ? ["event:create:dept", "event:broadcast:own", "volunteer:assign:own"]
      : []),
    ...(activePersona.role === "FACULTY" ? ["event:approve:dept"] : []),
    ...(activePersona.role === "DEAN" ? ["event:approve:exec"] : []),
    ...(activePersona.role === "VOLUNTEER" ? ["gate:scan:admit"] : []),
    ...(activePersona.role === "ADMIN" ? ["admin:rbac:manage", "*:*"] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-mono font-semibold border border-violet-500/30">
          <span>👤 STUDENT & ATTENDEE IDENTITY</span>
          <span>•</span>
          <span>KEYCLOAK 26 ZERO-TRUST REALM</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
          User Profile & Credentials
        </h2>
        <p className="text-xs text-white/60 max-w-xl mt-1">
          Cryptographically authenticated persona profile. Granular PBAC scopes
          determine screen access and gateway routing.
        </p>
      </div>

      {/* Main Profile Badge Card */}
      <section className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
            {activePersona.avatar}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white">
                {activePersona.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-600/20 text-violet-300 border border-violet-600/30">
                {activePersona.role}
              </span>
            </div>

            <p className="text-xs text-white/60 font-mono">
              {activePersona.email}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 pt-1">
              <span>
                Institution:{" "}
                <strong className="text-white">
                  {activePersona.institution}
                </strong>
              </span>
              <span>•</span>
              <span>
                Department:{" "}
                <strong className="text-white">
                  {activePersona.department}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Gamification Action */}
        <div className="z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {activePersona.role === "STUDENT" && (
            <button
              onClick={onOpenGamification}
              className="px-5 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <span>⭐</span>
              <span>{studentXp} Fest XP & Badges →</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className="px-4 py-2.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-white/80 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <span>{soundEnabled ? "🔊" : "🔇"}</span>
            <span>Festival Audio {soundEnabled ? "Enabled" : "Muted"}</span>
          </button>
        </div>
      </section>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Participation XP
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono mt-1 block">
            {studentXp}
          </span>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Confirmed Passes
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-mint-400 font-mono mt-1 block">
            2 Passes
          </span>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Lucky Draw Entries
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-violet-300 font-mono mt-1 block">
            1 Draw
          </span>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Sponsor Perks Used
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono mt-1 block">
            20% Off
          </span>
        </div>
      </div>

      {/* Permissions & Token Inspector */}
      <section className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-card">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-base">
              Active PBAC Permission Entitlements
            </h3>
            <p className="text-xs text-white/50">
              Assigned via Keycloak Composite Roles and validated by APISIX
              Gateway
            </p>
          </div>
          <span className="text-xs font-mono text-mint-400">
            {permissions.length} Active Grants
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {permissions.map((p) => (
            <span
              key={p}
              className="px-2.5 py-1 rounded-lg bg-surface-2 border border-white/10 text-white/80 font-mono text-xs flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400"></span>
              <span>{p}</span>
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50">
              Test Bearer Authorization Token:
            </span>
            <button
              onClick={handleCopyToken}
              className="text-violet-300 hover:text-white font-semibold transition-colors"
            >
              {copied ? "✓ Copied Token" : "Copy Token"}
            </button>
          </div>
          <div className="p-3 bg-surface-2 border border-white/5 rounded-xl font-mono text-xs text-white/70 break-all select-all">
            Bearer {activePersona.token}
          </div>
        </div>
      </section>
    </div>
  );
}
