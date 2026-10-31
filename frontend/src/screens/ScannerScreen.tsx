import { useState } from "react";
import type { ScanResult } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";
import { sound } from "../utils/audio.js";

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
        sound.playSuccess();
        setAttendanceCount((prev) => prev + 1);
      } else {
        sound.playAlert();
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
      sound.playAlert();
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
    <div className="max-w-3xl mx-auto space-y-8 text-left animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-500/15 text-mint-300 text-xs font-mono font-semibold border border-mint-500/30">
          <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping"></span>
          <span>GATE SCANNER TERMINAL ACTIVE • AUDITORIUM DOOR 1</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Door Scanner Terminal (Story Card EH-04, VL-01)
        </h2>
        <p className="text-xs text-white/60 max-w-lg mx-auto">
          Zero-trust QR gate validation. Latency target: under 500 ms per
          check-in with atomic attendance decrement.
        </p>
      </div>

      {/* Terminal Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Admitted Attendance
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-mint-400 font-mono mt-1 block">
            {attendanceCount}
          </span>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Validation Speed
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-violet-300 font-mono mt-1 block">
            240
            <span className="text-sm font-sans font-normal text-white/50">
              ms
            </span>
          </span>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] uppercase font-mono text-white/50 block">
            Security Mode
          </span>
          <span className="text-sm font-mono font-bold text-amber-300 mt-2.5 block">
            PBAC OWN-EVENT
          </span>
        </div>
      </div>

      {/* Camera Viewfinder & Laser Simulation */}
      <div className="relative bg-surface border border-white/10 rounded-3xl p-8 overflow-hidden shadow-card flex flex-col items-center justify-center min-h-[220px]">
        {/* Animated Green Laser Sweep */}
        <div className="absolute inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-mint-400 to-transparent shadow-[0_0_12px_#34d399] animate-laser pointer-events-none"></div>

        {/* Viewfinder Corner Reticles */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-violet-400"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-violet-400"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-violet-400"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-violet-400"></div>

        <div className="text-center space-y-2 z-10">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center text-2xl mx-auto shadow-inner">
            📷
          </div>
          <p className="text-xs text-white font-semibold font-mono">
            Aim camera at participant's dynamic QR pass
          </p>
          <p className="text-[11px] text-white/50">
            or enter/paste the HMAC token payload below for instant
            verification:
          </p>
        </div>
      </div>

      {/* Quick Test Simulation Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-white/40 block">
          One-Click Test Simulations:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => executeScan("TICKET-HMAC-CONFIRMED-USER-DEV-001")}
            className="px-3 py-1.5 rounded-lg bg-mint-500/10 hover:bg-mint-500/20 text-mint-300 border border-mint-500/30 text-xs font-mono transition-colors"
          >
            ✓ Valid Confirmed Pass
          </button>
          <button
            type="button"
            onClick={() => executeScan("TICKET-ALREADY-CHECKED-IN-002")}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
          >
            ⚠️ Already Admitted Pass
          </button>
          <button
            type="button"
            onClick={() => executeScan("INVALID-FORGED-TOKEN-999")}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors"
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
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 whitespace-nowrap transition-colors"
          >
            {loading ? "Validating..." : "Verify Pass"}
          </button>
        </div>
      </form>

      {/* Instant Result Box */}
      {result && (
        <div
          className={`p-6 rounded-2xl border text-center space-y-2 shadow-card animate-fadeIn ${
            result.status === "VERIFIED"
              ? "bg-mint-500/15 border-mint-500/40 text-mint-300"
              : result.status === "ALREADY_CHECKED_IN"
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-rose-500/15 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="text-3xl">
            {result.status === "VERIFIED"
              ? "✅"
              : result.status === "ALREADY_CHECKED_IN"
                ? "⚠️"
                : "❌"}
          </div>
          <div className="text-lg font-bold uppercase tracking-wider font-mono">
            {result.status.replace(/_/g, " ")}
          </div>
          <div className="text-xs font-mono">{result.message}</div>
          {result.attendeeName && (
            <div className="text-xs font-semibold mt-1 font-sans text-white">
              Attendee: {result.attendeeName} ({result.department || "CHRIST"})
            </div>
          )}
        </div>
      )}

      {/* Live Scan Audit Trail */}
      {scanHistory.length > 0 && (
        <section className="bg-surface border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 font-mono">
              Live Gate Audit Log
            </h3>
            <span className="text-[10px] text-white/40 font-mono">
              Memory-only • No PII cached
            </span>
          </div>

          <div className="divide-y divide-white/5 text-xs font-mono">
            {scanHistory.map((h, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <span className="text-white/80">{h.token}</span>
                <span
                  className={`font-semibold ${
                    h.status === "VERIFIED"
                      ? "text-mint-400"
                      : h.status === "ALREADY_CHECKED_IN"
                        ? "text-amber-400"
                        : "text-rose-400"
                  }`}
                >
                  {h.status}
                </span>
                <span className="text-white/40 text-[10px]">{h.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
