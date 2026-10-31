import { useState, useEffect } from "react";
import type { LuckyDrawCampaign, DrawVerification } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";
import { sound } from "../utils/audio.js";

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
      sound.playSuccess();
      setStatusMsg(`🎉 ${res.message}! Total entries: ${res.totalEntries}.`);
      fetchCampaigns();
    } catch (err: any) {
      sound.playAlert();
      setStatusMsg(`Entry rejected: ${err.message}`);
    }
  };

  const handleExecuteDraw = async (campId: string) => {
    if (
      !window.confirm(
        "Execute commit-reveal draw? The secret seed will be publicly revealed and the winner deterministically calculated.",
      )
    ) {
      return;
    }
    setStatusMsg(null);
    try {
      const drawn = await client.executeLuckyDraw(campId);
      sound.playSuccess();
      setStatusMsg(
        `🏆 Draw completed! Winner selected: ${drawn.winnerName?.split(" ")[0]} (${drawn.winnerDept}).`,
      );
      fetchCampaigns();
    } catch (err: any) {
      sound.playAlert();
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
    <div className="space-y-8 text-left animate-fadeIn">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
          <span>🎲 PROVABLY FAIR</span>
          <span>•</span>
          <span>SHA-256 COMMIT-REVEAL PROTOCOL</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
          Campus Fest Lucky Draws (Story Card SP-02, A10)
        </h2>
        <p className="text-xs text-white/60 max-w-xl mt-1">
          Winners are mathematically determined from pre-committed cryptographic
          seeds. Zero pay-to-win, zero administrative tampering.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 bg-mint-500/15 text-mint-300 border border-mint-500/30 rounded-2xl text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {/* Commit-Reveal Protocol Stepper */}
      <section className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-card">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
          How the Cryptographic Commit-Reveal Protocol Works:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-surface-2 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              1. Seed Hash
            </span>
            <span className="text-white/60">
              A 256-bit seed is generated and its SHA-256 hash published before
              entries open.
            </span>
          </div>

          <div className="bg-surface-2 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              2. Anti-Replay
            </span>
            <span className="text-white/60">
              Students enter once per campaign; unique session tokens reject
              replay attacks.
            </span>
          </div>

          <div className="bg-surface-2 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              3. Seed Reveal
            </span>
            <span className="text-white/60">
              At event close, the raw seed is published and verified against the
              pre-commit hash.
            </span>
          </div>

          <div className="bg-surface-2 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-violet-300 font-bold block">
              4. Derived Winner
            </span>
            <span className="text-white/60">
              Winner index is calculated via{" "}
              <code className="text-mint-400">BigInt(sha256) % total</code>.
            </span>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      {loading ? (
        <p className="text-xs text-white/60">Loading campaigns...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-surface border border-white/10 hover:border-violet-500/40 rounded-3xl p-6 sm:p-7 shadow-card space-y-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full ${
                      camp.status === "OPEN"
                        ? "bg-mint-500/20 text-mint-300 border border-mint-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    STATUS: {camp.status}
                  </span>

                  <span className="text-xs text-white/60 font-mono font-semibold">
                    🎟️ {camp.totalEntries || 0} Entrants
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{camp.title}</h3>

                <div className="bg-surface-2 p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-white/40 block font-bold">
                      PUBLISHED PRE-COMMIT HASH (SHA-256)
                    </span>
                    <span className="text-violet-300 break-all text-[11px] font-mono">
                      {camp.seedHash}
                    </span>
                  </div>

                  {camp.seedRevealed && (
                    <div className="pt-2.5 border-t border-white/5">
                      <span className="text-[10px] text-mint-400 block font-bold">
                        REVEALED SEED
                      </span>
                      <span className="text-amber-300 break-all text-[11px] font-mono">
                        {camp.seedRevealed}
                      </span>
                    </div>
                  )}

                  {camp.winnerName && (
                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-white/60">Selected Winner:</span>
                      <span className="text-amber-300 font-bold text-sm">
                        {camp.winnerName.split(" ")[0]} ({camp.winnerDept})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                {camp.status === "OPEN" ? (
                  <>
                    <button
                      onClick={() => handleEnterDraw(camp.id)}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/25 transition-transform hover:scale-[1.02]"
                    >
                      🎁 Enter Draw (Anti-Replay)
                    </button>
                    <button
                      onClick={() => handleExecuteDraw(camp.id)}
                      className="px-4 py-2.5 bg-surface-2 border border-white/10 text-white/80 hover:text-white rounded-xl text-xs font-semibold"
                    >
                      ⚡ Trigger Commit-Reveal Draw
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleVerify(camp.id)}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-void rounded-xl text-xs font-bold shadow-lg shadow-amber-400/20"
                  >
                    🔍 Inspect Public Cryptographic Proof
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Cryptographic Verification Modal */}
      {verification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md">
          <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-amber-300 text-base">
                Public Cryptographic Verification Proof
              </h3>
              <button
                onClick={() => setVerification(null)}
                className="text-white/50 hover:text-white text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono bg-surface-2 p-5 rounded-2xl border border-white/5">
              <div>
                <span className="text-white/40 block text-[10px]">
                  1. PRE-COMMIT HASH:
                </span>
                <span className="text-violet-300 break-all">
                  {verification.seedHash}
                </span>
              </div>

              <div>
                <span className="text-white/40 block text-[10px]">
                  2. REVEALED SECRET SEED:
                </span>
                <span className="text-amber-300 break-all">
                  {verification.seedRevealed}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-white/60">
                  SHA-256 Hash Verification:
                </span>
                <span className="text-mint-400 font-bold">
                  {verification.isSeedValid
                    ? "✓ VALID MATCH (Untampered)"
                    : "✗ MISMATCH"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-white/60">Total Entrants Sorted:</span>
                <span className="text-white font-bold">
                  {verification.totalEntries}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-white/60">Calculated Winner Index:</span>
                <span className="text-amber-300 font-bold">
                  #{verification.winnerIndex}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-white/60">Winner Derived Profile:</span>
                <span className="text-mint-400 font-bold">
                  {verification.winnerFirstname} (
                  {verification.winnerDepartment})
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 text-[10px] text-white/40">
                Formula: <code>{verification.verificationFormula}</code>
              </div>
            </div>

            <button
              onClick={() => setVerification(null)}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold"
            >
              Close Verification Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
