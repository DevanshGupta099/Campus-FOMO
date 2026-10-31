import { useState, useEffect } from "react";
import type { LuckyDrawCampaign, DrawVerification } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface LuckyDrawScreenProps {
  client: CampusFomoClient;
}

export function LuckyDrawScreen({ client }: LuckyDrawScreenProps) {
  const [campaigns, setCampaigns] = useState<LuckyDrawCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<DrawVerification | null>(
    null,
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchCampaigns = () => {
    setLoading(true);
    client
      .listLuckyCampaigns()
      .then((data) => {
        setCampaigns(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo data
        setCampaigns([
          {
            id: "draw-twc-hackathon",
            eventId: "evt-hackathon-100",
            title:
              "Fest Hackathon Free Cold Brew Lucky Draw (Third Wave Coffee)",
            status: "OPEN",
            seedHash:
              "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            totalEntries: 42,
          },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleEnterDraw = async (campId: string) => {
    setStatusMsg(null);
    try {
      const session = await client.startLuckySession(campId);
      const res = await client.enterLuckyDraw(campId, session.sessionId);
      setStatusMsg(`🎉 ${res.message}! Total entries: ${res.totalEntries}.`);
      fetchCampaigns();
    } catch (err: any) {
      setStatusMsg(`Entry rejected: ${err.message}`);
    }
  };

  const handleExecuteDraw = async (campId: string) => {
    if (
      !window.confirm(
        "Trigger commit-reveal winner selection? This will reveal the secret seed and deterministically select the winner.",
      )
    ) {
      return;
    }
    setStatusMsg(null);
    try {
      const drawn = await client.executeLuckyDraw(campId);
      setStatusMsg(
        `🏆 Draw completed! Winner selected: ${drawn.winnerName?.split(" ")[0]} (${drawn.winnerDept}).`,
      );
      fetchCampaigns();
    } catch (err: any) {
      setStatusMsg(`Draw execution failed: ${err.message}`);
    }
  };

  const handleVerify = async (campId: string) => {
    try {
      const ver = await client.verifyLuckyDraw(campId);
      setVerification(ver);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          Fest Lucky Draws (Commit-Reveal Fair Protocol)
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Powered by SHA-256 cryptographic commit-reveal. Secret seed is
          committed before entries open; winners are mathematically derived.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-mint-400/20 text-mint-300 border border-mint-400/40 rounded-xl text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-paper-50/60">Loading campaigns...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-ink-800/70 border border-royal-500/30 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      camp.status === "OPEN"
                        ? "bg-mint-400/20 text-mint-400 border border-mint-400/30"
                        : "bg-gold-400/20 text-gold-400 border border-gold-400/30"
                    }`}
                  >
                    STATUS: {camp.status}
                  </span>

                  <span className="text-[10px] text-paper-50/50 font-mono">
                    Entries: {camp.totalEntries || 0}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-paper-50">
                  {camp.title}
                </h3>

                <div className="bg-ink-950 p-3 rounded-xl border border-royal-500/20 space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-paper-50/50 block">
                      COMMITTED SEED HASH (SHA-256)
                    </span>
                    <span className="text-royal-300 break-all text-[11px]">
                      {camp.seedHash}
                    </span>
                  </div>

                  {camp.seedRevealed && (
                    <div className="pt-2 border-t border-royal-500/10">
                      <span className="text-[10px] text-mint-400 block">
                        REVEALED SEED AT DRAW
                      </span>
                      <span className="text-gold-400 break-all text-[11px]">
                        {camp.seedRevealed}
                      </span>
                    </div>
                  )}

                  {camp.winnerName && (
                    <div className="pt-2 border-t border-royal-500/10 flex items-center justify-between">
                      <span className="text-paper-50/70">Winner Derived:</span>
                      <span className="text-gold-400 font-bold">
                        {camp.winnerName.split(" ")[0]} ({camp.winnerDept})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-royal-500/10 flex flex-wrap items-center gap-2">
                {camp.status === "OPEN" ? (
                  <>
                    <button
                      onClick={() => handleEnterDraw(camp.id)}
                      className="px-4 py-2 bg-royal-500 hover:bg-royal-400 text-paper-50 rounded-lg text-xs font-bold shadow-md"
                    >
                      🎁 Enter Draw (Anti-Replay)
                    </button>
                    <button
                      onClick={() => handleExecuteDraw(camp.id)}
                      className="px-3 py-2 bg-ink-950 border border-royal-500/40 text-royal-300 hover:text-paper-50 rounded-lg text-xs font-medium"
                    >
                      ⚡ Trigger Commit-Reveal Draw
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleVerify(camp.id)}
                    className="px-4 py-2 bg-gold-400 hover:bg-gold-300 text-ink-950 rounded-lg text-xs font-extrabold shadow-md"
                  >
                    🔍 Inspect Cryptographic Proof
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Cryptographic Verification Modal */}
      {verification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <div className="bg-ink-900 border border-gold-400/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-royal-500/20 pb-3">
              <h3 className="font-bold text-gold-400 text-base">
                Public Cryptographic Verification Proof
              </h3>
              <button
                onClick={() => setVerification(null)}
                className="text-paper-50/50 hover:text-paper-50 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono bg-ink-950 p-4 rounded-xl border border-royal-500/20">
              <div>
                <span className="text-paper-50/50 block text-[10px]">
                  1. PUBLISHED PRE-COMMIT HASH:
                </span>
                <span className="text-royal-300 break-all">
                  {verification.seedHash}
                </span>
              </div>

              <div>
                <span className="text-paper-50/50 block text-[10px]">
                  2. REVEALED SECRET SEED:
                </span>
                <span className="text-gold-400 break-all">
                  {verification.seedRevealed}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-royal-500/10">
                <span className="text-paper-50/70">
                  SHA-256 Hash Match Check:
                </span>
                <span className="text-mint-400 font-bold">
                  {verification.isSeedValid
                    ? "✓ VALID MATCH (100% UNTAMPERED)"
                    : "✗ MISMATCH"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-royal-500/10">
                <span className="text-paper-50/70">Total Entrants Sorted:</span>
                <span className="text-paper-50 font-bold">
                  {verification.totalEntries}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-royal-500/10">
                <span className="text-paper-50/70">
                  Deterministic Winner Index:
                </span>
                <span className="text-gold-400 font-bold">
                  #{verification.winnerIndex}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-royal-500/10">
                <span className="text-paper-50/70">Selected Winner:</span>
                <span className="text-mint-400 font-bold">
                  {verification.winnerFirstname} (
                  {verification.winnerDepartment})
                </span>
              </div>

              <div className="pt-2 border-t border-royal-500/10 text-[10px] text-paper-50/60">
                Formula: <code>{verification.verificationFormula}</code>
              </div>
            </div>

            <button
              onClick={() => setVerification(null)}
              className="w-full py-2 bg-royal-500 text-paper-50 rounded-lg text-xs font-semibold"
            >
              Close Verification Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
