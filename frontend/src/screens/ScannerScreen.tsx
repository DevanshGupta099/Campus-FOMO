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

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);

    try {
      const res = await client.scanQrToken(tokenInput.trim());
      setResult(res);

      if (res.status === "VERIFIED") {
        setAttendanceCount((prev) => prev + 1);
      }

      setScanHistory((prev) => [
        {
          token: tokenInput.trim().slice(0, 16) + "...",
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          Venue Door Scanner (Story Cards EH-04, VL-01)
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Rapid ticket check-in interface (under 500 ms target). No participant
          PII cached locally.
        </p>
      </div>

      {/* Live Door Attendance Counter */}
      <div className="bg-ink-800/80 border border-royal-500/30 rounded-2xl p-6 text-center shadow-xl space-y-2">
        <span className="text-xs text-paper-50/70 font-mono uppercase tracking-wider">
          Auditorium Door 1 Live Check-in Attendance
        </span>
        <div className="text-5xl font-extrabold text-mint-400 font-display">
          {attendanceCount}
        </div>
        <p className="text-[11px] text-paper-50/50">
          Scanned with permission:{" "}
          <code className="text-gold-400">checkin:scan:own-event</code>
        </p>
      </div>

      {/* Scan Input Box */}
      <section className="bg-ink-900 border border-royal-500/30 rounded-2xl p-6 space-y-4">
        <form onSubmit={handleScanSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-paper-50">
            Scan / Enter Ticket QR Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. TICKET-HMAC-... or paste ticket token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full bg-ink-950 border border-royal-500/40 rounded-xl px-3 py-2.5 text-paper-50 text-xs font-mono focus:border-royal-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-xl text-xs font-bold whitespace-nowrap shadow-md"
            >
              {loading ? "Validating..." : "Verify Pass"}
            </button>
          </div>
        </form>

        {/* Instant Validation Result Banner */}
        {result && (
          <div
            className={`p-4 rounded-xl border text-center space-y-1 ${
              result.status === "VERIFIED"
                ? "bg-mint-400/20 border-mint-400/50 text-mint-300"
                : result.status === "ALREADY_CHECKED_IN"
                  ? "bg-gold-400/20 border-gold-400/50 text-gold-300"
                  : "bg-ember-500/20 border-ember-500/50 text-ember-300"
            }`}
          >
            <div className="text-2xl">
              {result.status === "VERIFIED"
                ? "✅"
                : result.status === "ALREADY_CHECKED_IN"
                  ? "⚠️"
                  : "❌"}
            </div>
            <div className="text-base font-bold uppercase tracking-wide">
              {result.status.replace(/_/g, " ")}
            </div>
            <div className="text-xs font-mono">{result.message}</div>
            {result.attendeeName && (
              <div className="text-xs font-semibold mt-1">
                Attendee: {result.attendeeName} ({result.department || "CHRIST"}
                )
              </div>
            )}
          </div>
        )}
      </section>

      {/* Recent Scan History */}
      {scanHistory.length > 0 && (
        <section className="bg-ink-800/40 border border-royal-500/20 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-paper-50/70">
            Recent Scans
          </h3>
          <div className="divide-y divide-royal-500/10 text-xs font-mono">
            {scanHistory.map((h, i) => (
              <div key={i} className="py-2 flex items-center justify-between">
                <span className="text-paper-50/70">{h.token}</span>
                <span
                  className={
                    h.status === "VERIFIED"
                      ? "text-mint-400"
                      : h.status === "ALREADY_CHECKED_IN"
                        ? "text-gold-400"
                        : "text-ember-400"
                  }
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
