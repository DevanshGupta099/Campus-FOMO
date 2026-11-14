import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  KeyRound,
  Plus,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type {
  EventItem,
  OpsTelemetry,
  RbacMatrixResponse,
  UserProfile,
} from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { useWorkspace } from "../../components/WorkspaceShell";

export const AdminRbacView: React.FC = () => {
  const { hasPerm } = useAuth();
  const { notify, streamRevision } = useWorkspace();

  const [matrix, setMatrix] = useState<RbacMatrixResponse | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [ops, setOps] = useState<OpsTelemetry | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [selectedRole, setSelectedRole] = useState<string>("STUDENT");
  const [newBundleName, setNewBundleName] = useState("");
  const [newBundlePerms, setNewBundlePerms] = useState<string[]>([
    "event:read:public",
    "checkin:scan:own-event",
  ]);

  const [grantSub, setGrantSub] = useState("");
  const [grantPerm, setGrantPerm] = useState("checkin:scan:own-event");
  const [emergencyReason, setEmergencyReason] = useState(
    "Emergency precinct safety directive issued by Central Administration.",
  );

  const loadAdminData = useCallback(async () => {
    try {
      const [m, u, o, evs] = await Promise.all([
        apiClient.getRbacMatrix(),
        apiClient.listAdminUsers(),
        apiClient.getOpsMetrics(),
        apiClient.listEvents({ status: "PUBLISHED" }),
      ]);
      setMatrix(m);
      setUsers(u.users);
      setOps(o);
      setEvents(evs);
      if (u.users[0] && !grantSub) {
        setGrantSub(u.users[0].sub);
      }
    } catch (err: unknown) {
      notify(
        "error",
        "Admin Sync Error",
        err instanceof Error ? err.message : "Could not load PBAC console.",
      );
    }
  }, [grantSub, notify]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData, streamRevision]);

  const toggleBundlePerm = (perm: string) => {
    setNewBundlePerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleSaveCustomBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newBundleName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");
    if (formatted.length < 3 || newBundlePerms.length === 0) {
      notify(
        "warning",
        "Invalid Bundle",
        "Provide a bundle code and at least one permission scope.",
      );
      return;
    }
    try {
      await apiClient.saveRbacRole(formatted, newBundlePerms);
      setNewBundleName("");
      notify(
        "success",
        "PBAC Bundle Saved",
        `${formatted} registered with ${newBundlePerms.length} permissions.`,
      );
      await loadAdminData();
      setSelectedRole(formatted);
    } catch (err: unknown) {
      notify(
        "error",
        "Bundle Save Failed",
        err instanceof Error ? err.message : "Could not save role bundle.",
      );
    }
  };

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantSub) return;
    try {
      await apiClient.grantUserPermissions(grantSub, [grantPerm]);
      notify(
        "success",
        "Permission Scope Granted",
        `Appended ${grantPerm} to subject ${grantSub}.`,
      );
      await loadAdminData();
    } catch (err: unknown) {
      notify(
        "error",
        "Grant Failed",
        err instanceof Error ? err.message : "Could not grant permission.",
      );
    }
  };

  const handleEmergencyCancel = async (ev: EventItem) => {
    if (emergencyReason.trim().length < 10) {
      notify(
        "warning",
        "Audit Reason Required",
        "Emergency cancellation requires a 10+ character governance reason.",
      );
      return;
    }
    try {
      await apiClient.cancelEvent(ev.id, emergencyReason.trim());
      notify(
        "warning",
        "Emergency Cancellation Executed",
        `${ev.title} revoked and logged in immutable audit trail.`,
      );
      await loadAdminData();
    } catch (err: unknown) {
      notify(
        "error",
        "Emergency Action Failed",
        err instanceof Error ? err.message : "Could not cancel event.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Zero-Trust Authorization Control Plane (AD-01)
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            PBAC Permission Matrix &amp; Platform Ops
          </h1>
        </div>
      </div>

      {/* Live Ops Telemetry Strip */}
      {ops && (
        <div className="grid gap-3 rounded-xl border border-obsidian-rule bg-obsidian p-5 text-bone sm:grid-cols-5">
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-brass-light">
              <Activity className="h-3 w-3" />
              <span>Published</span>
            </span>
            <p className="mt-1 font-serif text-2xl">{ops.publishedEvents}</p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-paper-deep/65">
              Faculty Queue
            </span>
            <p className="mt-1 font-serif text-2xl">
              {ops.pendingFacultyCount}
            </p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-paper-deep/65">
              Deanery Queue
            </span>
            <p className="mt-1 font-serif text-2xl">{ops.pendingDeanCount}</p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-paper-deep/65">
              Confirmed Seats
            </span>
            <p className="mt-1 font-serif text-2xl text-emerald-300">
              {ops.totalConfirmedSeats}
            </p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-paper-deep/65">
              SSE Sequence
            </span>
            <p className="mt-1 font-mono text-xl text-brass-light">
              #{ops.sseSeq}
            </p>
          </div>
        </div>
      )}

      {/* PBAC Bundle Inspector & Custom Role Creator */}
      {matrix && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-rule-strong bg-paper-elevated p-6 lg:col-span-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                <KeyRound className="h-4 w-4 text-terracotta" />
                <span>Keycloak Permission Bundles</span>
              </div>
              <span className="font-mono text-xs text-ink-muted">
                {matrix.availablePermissions.length} total atomic permissions
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Object.keys(matrix.roles).map((roleName) => (
                <button
                  key={roleName}
                  type="button"
                  onClick={() => setSelectedRole(roleName)}
                  className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                    selectedRole === roleName
                      ? "bg-vermilion text-void"
                      : "border border-rule bg-paper text-ink-secondary hover:text-bone"
                  }`}
                >
                  {roleName}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-rule bg-paper p-4">
              <p className="font-mono text-[11px] font-semibold uppercase text-ink-secondary">
                {selectedRole} Grants (
                {(matrix.roles[selectedRole] || []).length})
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(matrix.roles[selectedRole] || []).map((perm) => (
                  <span
                    key={perm}
                    className="rounded border border-rule-strong bg-paper-elevated px-2 py-0.5 font-mono text-[11px] text-ink"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Create Custom Bundle + Direct Subject Grant */}
          <div className="space-y-5 lg:col-span-5">
            <form
              onSubmit={handleSaveCustomBundle}
              className="space-y-3 rounded-xl border border-rule-strong bg-paper-elevated p-5"
            >
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                <Plus className="h-4 w-4 text-terracotta" />
                <span>Define Custom Permission Bundle</span>
              </div>
              <input
                type="text"
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
                placeholder="FEST_STAGE_MARSHAL"
                className="w-full rounded-md border border-rule-strong bg-paper px-3 py-2 font-mono text-xs text-ink"
              />
              <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-rule bg-paper p-2.5">
                {matrix.availablePermissions.slice(0, 16).map((perm) => (
                  <label
                    key={perm}
                    className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={newBundlePerms.includes(perm)}
                      onChange={() => toggleBundlePerm(perm)}
                      className="accent-terracotta"
                    />
                    <span>{perm}</span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="w-full rounded-md border border-rule-strong bg-steel px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
              >
                Register Permission Bundle
              </button>
            </form>

            <form
              onSubmit={handleGrantPermission}
              className="space-y-3 rounded-xl border border-rule-strong bg-paper-elevated p-5"
            >
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                <UserCog className="h-4 w-4 text-pine" />
                <span>Granular Subject Scope Grant</span>
              </div>
              <select
                aria-label="Target campus account"
                value={grantSub}
                onChange={(e) => setGrantSub(e.target.value)}
                className="w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-ink"
              >
                {users.map((u) => (
                  <option key={u.sub} value={u.sub}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <select
                aria-label="Permission to grant"
                value={grantPerm}
                onChange={(e) => setGrantPerm(e.target.value)}
                className="w-full rounded-md border border-rule-strong bg-paper px-3 py-2 font-mono text-xs text-ink"
              >
                {matrix.availablePermissions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-md bg-pine px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void"
              >
                Append Scope to Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Event Cancellation Console (AD-01) */}
      {hasPerm("event:cancel:any") && (
        <section className="space-y-4 rounded-xl border border-terracotta/45 bg-paper-elevated p-6">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-terracotta">
            <ShieldAlert className="h-4 w-4" />
            <span>Emergency Precinct Cancellation Override (AD-01)</span>
          </div>

          <input
            type="text"
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            aria-label="Emergency cancellation audit reason"
            className="w-full rounded-md border border-rule-strong bg-paper px-3.5 py-2 text-xs text-ink"
          />

          <div className="grid gap-3 md:grid-cols-2">
            {events.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-rule bg-paper px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">
                    {ev.title}
                  </p>
                  <p className="font-mono text-[10px] text-ink-muted">
                    {ev.venueName} · {ev.confirmedCount} pass holders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEmergencyCancel(ev)}
                  className="inline-flex shrink-0 items-center gap-1 rounded border border-terracotta bg-terracotta-soft px-2.5 py-1.5 font-mono text-[11px] font-semibold text-terracotta hover:bg-terracotta hover:text-void"
                >
                  <AlertOctagon className="h-3 w-3" />
                  <span>Revoke</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
