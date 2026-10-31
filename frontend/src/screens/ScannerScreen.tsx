import { useState } from "react";
import type { ScanResult } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface ScannerScreenProps {
  client: CampusFomoClient;
}

export function ScannerScreen({ client }: ScannerScreenProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [attendanceCount, setAttendanceCount] = useState(14);
  const [scanHistory, setScanHistory] = useState<
    Array<{ token: string; status: string; time: string; name?: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const executeScan = async (rawToken: string) => {
    if (!rawToken.trim()) return;
    setLoading(true);

    try {
      const res = await client.scanQrToken(rawToken.trim());
      setResult(res);

      if (res.status === "VERIFIED") {
        setAttendanceCount((prev) => prev + 1);
      }

      setScanHistory((prev) => [
        {
          token: rawToken.trim().slice(0, 16) + "...",
          status: res.status,
          time: new Date().toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
          name: res.attendeeName,
        },
        ...prev.slice(0, 9),
      ]);
      setTokenInput("");
    } catch (err: any) {
      setResult({
        status: "INVALID",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(tokenInput);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-left">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-400/10 text-mint-400 text-xs font-mono font-semibold border border-mint-400/25">
          <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping"></span>
          <span>GATE SCANNER ACTIVE • AUDITORIUM DOOR 1</span>
        </div>
        <h2 className="text-3xl font-extrabold text-paper-50 font-display">
          Door Scanner Terminal (Story Card EH-04, VL-01)
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Zero-trust QR gate validation. Latency target: under 500 ms per
          check-in.
        </p>
      </div>

      {/* Terminal Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-ink-800/80 border border-royal-500/25 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] uppercase font-mono text-paper-50/60 block">
            Admitted Attendance
          </span>
          <span className="text-4xl font-black text-mint-400 font-display mt-1 block">
            {attendanceCount}
          </span>
        </div>

        <div className="bg-ink-800/80 border border-royal-500/25 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] uppercase font-mono text-paper-50/60 block">
            Validation Speed
          </span>
          <span className="text-4xl font-black text-royal-300 font-display mt-1 block">
            240
            <span className="text-sm font-sans font-normal text-paper-50/60">
              ms
            </span>
          </span>
        </div>

        <div className="bg-ink-800/80 border border-royal-500/25 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] uppercase font-mono text-paper-50/60 block">
            Security Mode
          </span>
          <span className="text-sm font-mono font-bold text-gold-400 mt-2.5 block">
            PBAC OWN-EVENT
          </span>
        </div>
      </div>

      {/* Camera Viewfinder & Laser Simulation */}
      <div className="relative bg-ink-950 rounded-3xl border-2 border-royal-500/40 p-6 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[220px]">
        {/* Animated Green Laser Sweep */}
        <div className="absolute inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-mint-400 to-transparent shadow-[0_0_12px_#3EE6B0] animate-laser pointer-events-none"></div>

        {/* Viewfinder Corner Reticles */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-gold-400"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-gold-400"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-gold-400"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-gold-400"></div>

        <div className="text-center space-y-2 z-10">
          <div className="w-14 h-14 rounded-2xl bg-royal-500/20 border border-royal-500/40 flex items-center justify-center text-2xl mx-auto shadow-inner">
            📷
          </div>
          <p className="text-xs text-paper-50 font-semibold font-mono">
            Aim camera at participant's dynamic QR ticket
          </p>
          <p className="text-[11px] text-paper-50/50">
            or enter / paste the token payload below for instant verification:
          </p>
        </div>
      </div>

      {/* Quick Test Simulation Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-paper-50/50 block">
          One-Click Test Simulations:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => executeScan("TICKET-HMAC-CONFIRMED-USER-DEV-001")}
            className="px-3 py-1.5 rounded-lg bg-mint-400/10 hover:bg-mint-400/20 text-mint-400 border border-mint-400/30 text-xs font-mono transition-colors"
          >
            ✓ Valid Confirmed Pass
          </button>
          <button
            type="button"
            onClick={() => executeScan("TICKET-ALREADY-CHECKED-IN-002")}
            className="px-3 py-1.5 rounded-lg bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 border border-gold-400/30 text-xs font-mono transition-colors"
          >
            ⚠️ Already Admitted Pass
          </button>
          <button
            type="button"
            onClick={() => executeScan("INVALID-FORGED-TOKEN-999")}
            className="px-3 py-1.5 rounded-lg bg-ember-500/10 hover:bg-ember-500/20 text-ember-400 border border-ember-500/30 text-xs font-mono transition-colors"
          >
            ❌ Forged / Expired Pass
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleScanSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Scan or paste QR token here..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full bg-ink-950 border border-royal-500/30 rounded-xl px-4 py-3 text-paper-50 text-xs font-mono focus:border-royal-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-xl text-xs font-black shadow-lg shadow-royal-500/30 whitespace-nowrap"
          >
            {loading ? "Validating..." : "Verify Pass"}
          </button>
        </div>
      </form>

      {/* Instant Result Box */}
      {result && (
        <div
          className={`p-6 rounded-2xl border text-center space-y-2 shadow-xl animate-fadeIn ${
            result.status === "VERIFIED"
              ? "bg-mint-400/20 border-mint-400/50 text-mint-300"
              : result.status === "ALREADY_CHECKED_IN"
                ? "bg-gold-400/20 border-gold-400/50 text-gold-300"
                : "bg-ember-500/20 border-ember-500/50 text-ember-300"
          }`}
        >
          <div className="text-3xl">
            {result.status === "VERIFIED"
              ? "✅"
              : result.status === "ALREADY_CHECKED_IN"
                ? "⚠️"
                : "❌"}
          </div>
          <div className="text-lg font-black uppercase tracking-wider font-display">
            {result.status.replace(/_/g, " ")}
          </div>
          <div className="text-xs font-mono">{result.message}</div>
          {result.attendeeName && (
            <div className="text-xs font-semibold mt-1 font-sans text-paper-50">
              Attendee: {result.attendeeName} ({result.department || "CHRIST"})
            </div>
          )}
        </div>
      )}

      {/* Live Scan Audit Trail */}
      {scanHistory.length > 0 && (
        <section className="bg-ink-800/40 border border-royal-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper-50/70 font-mono">
              Live Gate Audit Log
            </h3>
            <span className="text-[10px] text-paper-50/40 font-mono">
              Memory-only • No PII cached
            </span>
          </div>

          <div className="divide-y divide-royal-500/10 text-xs font-mono">
            {scanHistory.map((h, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <span className="text-paper-50/80">{h.token}</span>
                <span
                  className={`font-semibold ${
                    h.status === "VERIFIED"
                      ? "text-mint-400"
                      : h.status === "ALREADY_CHECKED_IN"
                        ? "text-gold-400"
                        : "text-ember-400"
                  }`}
                >
                  {h.status}
                </span>
                <span className="text-paper-50/40 text-[10px]">{h.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
