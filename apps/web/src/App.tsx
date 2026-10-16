import { useEffect, useState } from "react";
import { CampusFomoClient, type HealthResponse } from "@campus-fomo/contracts";

const client = new CampusFomoClient({
  baseUrl:
    (import.meta as any).env?.VITE_API_BASE_URL ||
    "http://localhost:3001/api/v1",
  mode: ((import.meta as any).env?.VITE_API_MODE as "live" | "mock") || "mock",
});

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .getHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-ink-950 text-paper-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full border border-royal-500/30 bg-ink-800/60 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-6 border border-royal-500/40">
          <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
          Gate G1 Foundation Verified
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-paper-50 font-display">
          CAMPUS <span className="text-gold-400">FOMO</span>
        </h1>
        <p className="text-royal-300 text-base md:text-lg mb-8 max-w-lg mx-auto font-body">
          Never miss out on CHRIST University workshops, hackathons, and
          cultural fests.
        </p>

        <section
          aria-label="System Health Status"
          className="bg-ink-950/80 rounded-xl p-6 border border-royal-500/20 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-royal-300">
              Pipeline Health Verification
            </h2>
            <span className="text-xs text-paper-50/60 font-mono">
              contracts → api → web
            </span>
          </div>

          {loading && (
            <p className="text-sm text-paper-50/70 animate-pulse">
              Connecting to contract endpoint...
            </p>
          )}

          {error && (
            <p className="text-sm text-ember-500 font-mono">Error: {error}</p>
          )}

          {health && (
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between py-1 border-b border-royal-500/10">
                <span className="text-paper-50/70">Endpoint:</span>
                <span className="text-mint-400">GET /healthz</span>
              </div>
              <div className="flex justify-between py-1 border-b border-royal-500/10">
                <span className="text-paper-50/70">Status:</span>
                <span className="text-mint-400 font-bold uppercase">
                  {health.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-royal-500/10">
                <span className="text-paper-50/70">API Version:</span>
                <span className="text-paper-50">{health.version}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-paper-50/70">Uptime:</span>
                <span className="text-paper-50">{health.uptime}s</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
