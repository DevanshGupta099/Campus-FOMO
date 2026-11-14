import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Gift,
  Hash,
  Lock,
  Play,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type {
  EventItem,
  LuckyCampaignItem,
  LuckyVerificationProof,
} from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { useWorkspace } from "../../components/WorkspaceShell";

export const LuckyDrawView: React.FC = () => {
  const { hasPerm } = useAuth();
  const { notify, streamRevision } = useWorkspace();

  const [campaigns, setCampaigns] = useState<LuckyCampaignItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCampaign, setBusyCampaign] = useState<string | null>(null);
  const [proof, setProof] = useState<LuckyVerificationProof | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrize, setNewPrize] = useState("");
  const [newEventId, setNewEventId] = useState("");

  const canEnter = hasPerm("luckydraw:enter");
  const canRun = hasPerm("luckydraw:run");

  const loadData = useCallback(async () => {
    try {
      const [list, evts] = await Promise.all([
        apiClient.listCampaigns(),
        apiClient.listEvents(),
      ]);
      setCampaigns(list);
      setEvents(evts);
      if (evts[0] && !newEventId) setNewEventId(evts[0].id);
    } catch (err: unknown) {
      notify(
        "error",
        "Could Not Load Campaigns",
        err instanceof Error ? err.message : "Failed to load lucky draws.",
      );
    } finally {
      setLoading(false);
    }
  }, [notify, newEventId]);

  useEffect(() => {
    loadData();
  }, [loadData, streamRevision]);

  const handleEnter = async (campaignId: string) => {
    setBusyCampaign(campaignId);
    try {
      const res = await apiClient.enterLuckyDraw(campaignId);
      notify(
        "success",
        "Entry Recorded",
        `${res.message} (${res.totalEntries} verified entries).`,
      );
      await loadData();
    } catch (err: unknown) {
      notify(
        "error",
        "Entry Rejected",
        err instanceof Error ? err.message : "Could not enter campaign.",
      );
    } finally {
      setBusyCampaign(null);
    }
  };

  const handleExecuteDraw = async (campaignId: string) => {
    setBusyCampaign(campaignId);
    try {
      const res = await apiClient.executeLuckyDraw(campaignId);
      notify(
        "success",
        "Commit-Reveal Draw Executed",
        `Winner: ${res.winnerName || "Selected"} · Seed revealed for public SHA-256 verification.`,
      );
      await loadData();
    } catch (err: unknown) {
      notify(
        "error",
        "Draw Execution Failed",
        err instanceof Error ? err.message : "Could not run draw.",
      );
    } finally {
      setBusyCampaign(null);
    }
  };

  const handleVerify = async (campaignId: string) => {
    setBusyCampaign(campaignId);
    try {
      const res = await apiClient.verifyLuckyDraw(campaignId);
      setProof(res);
    } catch (err: unknown) {
      notify(
        "error",
        "Verification Unavailable",
        err instanceof Error ? err.message : "Could not verify proof.",
      );
    } finally {
      setBusyCampaign(null);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEventId) return;
    try {
      await apiClient.createCampaign({
        eventId: newEventId,
        title: newTitle.trim(),
        prizeDescription: newPrize.trim() || undefined,
      });
      setNewTitle("");
      setNewPrize("");
      setShowCreateForm(false);
      notify(
        "success",
        "Campaign Committed",
        "Pre-draw SHA-256 seed hash published to ledger.",
      );
      await loadData();
    } catch (err: unknown) {
      notify(
        "error",
        "Creation Failed",
        err instanceof Error ? err.message : "Could not create campaign.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Provably Fair Commit-Reveal Protocol (SP-02)
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            Cryptographic Fest Lucky Draws
          </h1>
        </div>
        {canRun && (
          <button
            type="button"
            onClick={() => setShowCreateForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-steel px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Commit-Reveal Campaign</span>
          </button>
        )}
      </div>

      {showCreateForm && canRun && (
        <form
          onSubmit={handleCreateCampaign}
          className="grid gap-4 rounded-xl border border-rule-strong bg-paper-elevated p-5 sm:grid-cols-3"
        >
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Campaign Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Third Wave Espresso Kit Drop"
              className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-ink"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Associated Fest Event
            </label>
            <select
              value={newEventId}
              onChange={(e) => setNewEventId(e.target.value)}
              className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-ink"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Prize Specification
              </label>
              <input
                type="text"
                value={newPrize}
                onChange={(e) => setNewPrize(e.target.value)}
                placeholder="Specialty Pour-Over Box"
                className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-xs text-ink"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-terracotta px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void"
            >
              Commit
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl border border-rule bg-paper-elevated" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {campaigns.map((camp) => (
            <article
              key={camp.id}
              className="flex flex-col justify-between rounded-xl border border-rule-strong bg-paper-elevated p-5 shadow-editorial"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                      camp.status === "OPEN"
                        ? "bg-pine-soft text-pine"
                        : "bg-obsidian text-brass-light"
                    }`}
                  >
                    {camp.status}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {camp.totalEntries} verified entries
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-2xl text-ink">
                  {camp.title}
                </h2>
                {camp.prizeDescription && (
                  <p className="mt-1 text-xs text-ink-secondary">
                    Prize: {camp.prizeDescription}
                  </p>
                )}

                {/* Pre-committed SHA-256 Seed Hash */}
                <div className="mt-4 rounded-lg border border-rule bg-paper p-3 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted">
                    <Hash className="h-3 w-3 text-terracotta" />
                    <span>Pre-Committed SHA-256 Seed Hash</span>
                  </div>
                  <p className="mt-1 break-all text-ink">{camp.seedHash}</p>

                  {camp.seedRevealed ? (
                    <div className="mt-2.5 border-t border-rule pt-2">
                      <span className="block text-[10px] uppercase text-pine">
                        Revealed Secret Seed:
                      </span>
                      <p className="break-all text-pine">{camp.seedRevealed}</p>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-ink-muted">
                      <Lock className="h-3 w-3" />
                      <span>
                        Secret seed sealed on server until draw execution
                      </span>
                    </div>
                  )}
                </div>

                {camp.winnerName && (
                  <div className="mt-3 rounded-lg border border-pine/40 bg-pine-soft px-3.5 py-2.5 text-xs text-ink">
                    <span className="font-mono font-semibold uppercase text-pine">
                      Selected Winner (Masked):{" "}
                    </span>
                    <span className="font-semibold">
                      {camp.winnerName}
                      {camp.winnerDept ? ` · ${camp.winnerDept}` : ""}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5 border-t border-rule pt-4">
                {camp.status === "OPEN" && canEnter && (
                  <button
                    type="button"
                    disabled={busyCampaign === camp.id}
                    onClick={() => handleEnter(camp.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-terracotta px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-terracotta-hover disabled:opacity-50"
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>
                      {busyCampaign === camp.id
                        ? "Binding Session..."
                        : "Enter Lucky Draw"}
                    </span>
                  </button>
                )}

                {camp.status === "OPEN" && canRun && (
                  <button
                    type="button"
                    disabled={
                      busyCampaign === camp.id || camp.totalEntries === 0
                    }
                    onClick={() => handleExecuteDraw(camp.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-steel px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void disabled:opacity-45"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Reveal Seed &amp; Draw Winner</span>
                  </button>
                )}

                {camp.status !== "OPEN" && (
                  <button
                    type="button"
                    onClick={() => handleVerify(camp.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-pine bg-pine-soft px-4 py-2 text-xs font-semibold text-pine transition hover:bg-pine hover:text-void"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verify Cryptographic Proof</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Cryptographic Proof Modal */}
      {proof && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-xl border border-rule-strong bg-paper-elevated p-6 shadow-anchor">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-pine">
                  PUBLIC COMMIT-REVEAL AUDIT
                </p>
                <h2 className="mt-1 font-serif text-2xl text-ink">
                  Mathematical Fairness Proof
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProof(null)}
                aria-label="Close proof modal"
                className="rounded p-1 text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 rounded-lg border border-rule bg-paper p-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-pine">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  SHA-256 Hash Match:{" "}
                  {proof.isSeedValid ? "VERIFIED" : "MISMATCH"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-ink-muted">
                  Committed Hash
                </span>
                <span className="break-all text-[11px] text-ink">
                  {proof.seedHash}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-ink-muted">
                  Revealed Seed
                </span>
                <span className="break-all text-[11px] text-ink">
                  {proof.seedRevealed}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-rule pt-2">
                <div>
                  <span className="block text-[10px] uppercase text-ink-muted">
                    Total Entrants
                  </span>
                  <span>{proof.totalEntries}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-ink-muted">
                    Deterministic Index
                  </span>
                  <span>#{proof.winnerIndex}</span>
                </div>
              </div>
              <div className="border-t border-rule pt-2 text-[11px] text-ink-secondary">
                {proof.verificationFormula}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
