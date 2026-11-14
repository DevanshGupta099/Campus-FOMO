import React, { useState } from "react";
import { Check, KeyRound, ShieldCheck, User, X } from "lucide-react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ChristCrestMark } from "../../components/BrandMarks";
import { DESIGN_TOKENS } from "../../tokens";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: (msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  onUpdated,
}) => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(
    user?.department || DESIGN_TOKENS.departments[0],
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setErrorMsg("Name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      await apiClient.updateMe({
        name: name.trim(),
        department,
      });
      await refreshProfile();
      onUpdated("Campus profile metadata updated.");
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-rule-strong bg-paper-elevated shadow-anchor">
        {/* Institutional Smart-ID Header */}
        <div className="border-b border-obsidian-rule bg-obsidian px-6 py-5 text-bone">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <ChristCrestMark className="h-11 w-11" tone="light" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                  {DESIGN_TOKENS.campus.shortCode} · SMART ID
                </p>
                <h2
                  id="profile-modal-title"
                  className="mt-0.5 font-display text-2xl font-bold leading-tight text-bone"
                >
                  {user.name}
                </h2>
                <p className="font-mono text-xs text-paper-deep/80">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile dialog"
              className="rounded-md border border-obsidian-rule p-1.5 text-paper-deep transition hover:bg-obsidian-surface hover:text-bone"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-obsidian-rule bg-obsidian-surface p-3 font-mono text-[11px]">
            <div>
              <span className="block text-[10px] uppercase text-ink-muted">
                Subject ID
              </span>
              <span className="text-bone">{user.sub}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-ink-muted">
                Masked Phone
              </span>
              <span className="text-bone">{user.phone || "Not linked"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-ink-muted">
                Register / Dept
              </span>
              <span className="text-gold">
                {user.studentRegisterNumber || user.department || "Campus"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-bone">
              <User className="h-4 w-4 text-vermilion" />
              <span>Editable Directory Attributes</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="prof-name"
                  className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                >
                  Display Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-bone"
                />
              </div>
              <div>
                <label
                  htmlFor="prof-dept"
                  className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                >
                  Department / Unit
                </label>
                <select
                  id="prof-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-bone"
                >
                  {DESIGN_TOKENS.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && (
              <p className="rounded border border-vermilion/40 bg-vermilion-soft px-3 py-2 text-xs text-vermilion">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-vermilion px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-vermilion-hover disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{saving ? "Saving..." : "Save Directory Changes"}</span>
              </button>
            </div>
          </form>

          {/* Active PBAC Permission Grants */}
          <div className="border-t border-rule pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-bone">
                <KeyRound className="h-4 w-4 text-gold" />
                <span>Signed PBAC Permission Grants</span>
              </div>
              <span className="font-mono text-[11px] text-ink-muted">
                {user.permissions.length} active scopes
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1 rounded border border-rule-strong bg-paper px-2 py-1 font-mono text-[11px] text-bone"
                >
                  <ShieldCheck className="h-3 w-3 text-phosphor" />
                  <span>{perm}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
