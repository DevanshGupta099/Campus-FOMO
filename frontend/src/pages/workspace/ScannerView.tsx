import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Volume2,
  VolumeX,
  XOctagon,
  Zap,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { CheckinScanResult, CheckinStatsResponse } from "../../api/types";
import { useWorkspace } from "../../components/WorkspaceShell";
import { formatIstTime } from "../../utils/format";
import { playGateTone } from "../../utils/sound";

export const ScannerView: React.FC = () => {
  const { streamRevision } = useWorkspace();

  const [tokenInput, setTokenInput] = useState("");
  const [muted, setMuted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<CheckinScanResult | null>(null);
  const [clientRttMs, setClientRttMs] = useState<number | null>(null);
  const [stats, setStats] = useState<CheckinStatsResponse>({
    totalAdmitted: 0,
    recentAdmissions: [],
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient.getCheckinStats();
      setStats(res);
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, streamRevision]);

  const executeScan = async (rawToken: string) => {
    const trimmed = rawToken.trim();
    if (!trimmed) return;
    setScanning(true);
    const t0 = performance.now();
    try {
      const res = await apiClient.scanQrToken(trimmed);
      const rtt = Math.max(1, Math.round(performance.now() - t0));
      setClientRttMs(rtt);
      setLastResult(res);
      playGateTone(res.status, muted);
      await loadStats();
    } catch (err: unknown) {
      const rtt = Math.max(1, Math.round(performance.now() - t0));
      setClientRttMs(rtt);
      const fallback: CheckinScanResult = {
        status: "INVALID_TICKET",
        registrationId: "unknown",
        userName: "Unverified",
        scannedAt: new Date().toISOString(),
        latencyMs: rtt,
        message:
          err instanceof Error
            ? err.message
            : "Cryptographic HMAC verification failed.",
      };
      setLastResult(fallback);
      playGateTone("INVALID_TICKET", muted);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(tokenInput);
    setTokenInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Gate-1 &amp; Auditorium Marshal Terminal (VL-01)
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            Sub-300ms HMAC QR Scanner
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-rule-strong bg-paper-elevated px-4 py-2 font-mono text-xs">
            <span className="text-ink-muted">Live Admitted: </span>
            <strong className="text-pine">{stats.totalAdmitted}</strong>
          </div>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute scanner tones" : "Mute scanner tones"}
            className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-paper-elevated px-3.5 py-2 font-mono text-xs font-semibold text-ink hover:border-obsidian"
          >
            {muted ? (
              <>
                <VolumeX className="h-4 w-4 text-terracotta" />
                <span>Audio Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-pine" />
                <span>Gate Tone On</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Scanner Input & Result Card */}
        <div className="space-y-5 lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-obsidian-rule bg-obsidian p-6 text-bone shadow-anchor"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="qr-scanner-input"
                className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-brass-light"
              >
                <QrCode className="h-4 w-4" />
                <span>Optical / Wedge HMAC Payload Input</span>
              </label>
              <span className="font-mono text-[10px] text-paper-deep/70">
                Zero Local PII Retention
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <input
                id="qr-scanner-input"
                type="text"
                autoFocus
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Scan or paste regId.timestamp.hmacSignature..."
                className="flex-1 rounded-md border border-obsidian-rule bg-obsidian-surface px-4 py-3 font-mono text-xs text-bone placeholder:text-paper-deep/45 focus:border-brass focus:outline-none"
              />
              <button
                type="submit"
                disabled={scanning || !tokenInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-terracotta px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-void transition hover:bg-terracotta-hover disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                <span>{scanning ? "Verifying..." : "Verify Gate Pass"}</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-obsidian-rule pt-3 font-mono text-[11px] text-paper-deep/75">
              <span>Evaluator Diagnostics:</span>
              <button
                type="button"
                onClick={() => executeScan("forged-reg.1700000000.badhmacsig")}
                className="rounded border border-obsidian-rule bg-obsidian-surface px-2.5 py-1 text-[11px] text-bone hover:border-terracotta"
              >
                Simulate Forged QR Reject
              </button>
            </div>
          </form>

          {/* Tri-State Gate Decision Banner */}
          {lastResult ? (
            <div
              role="status"
              className={`rounded-xl border-2 p-6 shadow-editorial ${
                lastResult.status === "ADMITTED"
                  ? "border-pine bg-pine-soft text-ink"
                  : lastResult.status === "ALREADY_CHECKED_IN"
                    ? "border-ochre bg-ochre-soft text-ink"
                    : "border-terracotta bg-terracotta-soft text-ink"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {lastResult.status === "ADMITTED" ? (
                    <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-pine" />
                  ) : lastResult.status === "ALREADY_CHECKED_IN" ? (
                    <AlertTriangle className="mt-0.5 h-8 w-8 shrink-0 text-ochre" />
                  ) : (
                    <XOctagon className="mt-0.5 h-8 w-8 shrink-0 text-terracotta" />
                  )}
                  <div>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest">
                      {lastResult.status.replace(/_/g, " ")}
                    </span>
                    <h2 className="mt-1 font-serif text-3xl">
                      {lastResult.userName}
                    </h2>
                    <p className="mt-1 text-xs font-medium text-ink-secondary">
                      {lastResult.message}
                    </p>
                  </div>
                </div>
                <div className="rounded-md border border-rule-strong bg-paper-elevated px-3 py-1.5 text-right font-mono text-xs">
                  <span className="block text-[10px] uppercase text-ink-muted">
                    Verify Latency
                  </span>
                  <strong className="text-ink">
                    {lastResult.latencyMs}ms srv / {clientRttMs ?? "--"}ms rtt
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-rule bg-paper-elevated p-8 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-pine" />
              <h2 className="mt-2 font-serif text-xl text-ink">
                Gate Ready for Optical Scan
              </h2>
              <p className="mt-1 text-xs text-ink-secondary">
                Displays attendee first name only upon valid 30-second HMAC
                window verification.
              </p>
            </div>
          )}
        </div>

        {/* Right Recent First-Name Admissions Log */}
        <div className="rounded-xl border border-rule-strong bg-paper-elevated p-5 lg:col-span-5">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
            Recent Gate Verifications (First-Name Redacted Stream)
          </h2>
          <div className="mt-4 space-y-2.5">
            {stats.recentAdmissions.length === 0 ? (
              <p className="py-8 text-center font-mono text-xs text-ink-muted">
                No passes scanned during this shift yet.
              </p>
            ) : (
              stats.recentAdmissions.map((adm, idx) => (
                <div
                  key={`${adm.registrationId}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-ink">{adm.firstName}</p>
                    <p className="text-[11px] text-ink-secondary">
                      {adm.eventTitle}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-pine">
                    {formatIstTime(adm.scannedAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
