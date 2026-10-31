interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  userName: string;
}

export function GamificationModal({
  isOpen,
  onClose,
  xp,
  userName,
}: GamificationModalProps) {
  if (!isOpen) return null;

  const currentLevel = Math.floor(xp / 250) + 1;
  const currentLevelXp = xp % 250;
  const nextLevelProgress = Math.min(
    100,
    Math.round((currentLevelXp / 250) * 100),
  );

  const levelTitles: Record<number, string> = {
    1: "Campus Rookie",
    2: "Night Crawler",
    3: "Fest Prodigy",
    4: "VIP Campus Legend",
  };

  const levelName = levelTitles[currentLevel] || "Fest Prodigy";

  const badges = [
    {
      id: "pioneer",
      icon: "🎓",
      title: "Fest Pioneer",
      desc: "Joined CHRIST University Fest '26",
      unlocked: true,
      color: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    },
    {
      id: "last-seat",
      icon: "⚡",
      title: "Last Seat Legend",
      desc: "Snapped a ticket with <5 seats left",
      unlocked: xp >= 300,
      color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    {
      id: "pass-holder",
      icon: "🎟️",
      title: "Badge Holder",
      desc: "Active HMAC verified admission pass",
      unlocked: true,
      color: "border-mint-500/40 bg-mint-500/10 text-mint-300",
    },
    {
      id: "gate-verified",
      icon: "🛡️",
      title: "Gate Verified",
      desc: "Admitted by volunteer QR door scanner",
      unlocked: xp >= 400,
      color: "border-violet-400/40 bg-violet-400/10 text-violet-300",
    },
    {
      id: "fair-player",
      icon: "🎲",
      title: "Provably Fair",
      desc: "Entered cryptographic commit-reveal draw",
      unlocked: xp >= 250,
      color: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    },
    {
      id: "cafe-regular",
      icon: "☕",
      title: "Third Wave Regular",
      desc: "Unlocked 20% campus cafe discount",
      unlocked: true,
      color: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold mb-1">
              <span>⭐</span>
              <span>
                LEVEL {currentLevel} • {levelName.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {userName}&apos;s Fest XP & Badges
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Gamification Modal"
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-2 bg-surface-2 p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white/70">Current XP</span>
            <span className="text-amber-300 font-bold">{xp} XP</span>
          </div>
          <div className="w-full h-3 rounded-full bg-surface-3 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-rose-500 to-amber-400 rounded-full transition-all duration-700 shadow-md shadow-amber-400/20"
              style={{ width: `${nextLevelProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/50 font-mono">
            <span>
              Level {currentLevel} ({currentLevel * 250 - 250} XP)
            </span>
            <span>
              Level {currentLevel + 1} ({currentLevel * 250} XP)
            </span>
          </div>
        </div>

        {/* Badge Showcase Grid */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-violet-300 font-mono tracking-wider uppercase">
            Festival Achievement Badges
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  b.unlocked
                    ? `${b.color} shadow-sm`
                    : "border-white/5 bg-surface-2/40 opacity-40 grayscale"
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-xs font-bold truncate">{b.title}</div>
                <div className="text-[10px] text-white/60 leading-tight mt-0.5 line-clamp-2">
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to earn XP tips */}
        <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 space-y-1">
          <span className="font-bold text-white block">
            Ways to earn more XP:
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              • Register for events:{" "}
              <strong className="text-mint-400">+50 XP</strong>
            </span>
            <span>
              • Attend venue door scan:{" "}
              <strong className="text-mint-400">+100 XP</strong>
            </span>
            <span>
              • Enter lucky draw:{" "}
              <strong className="text-mint-400">+25 XP</strong>
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 transition-all"
        >
          Back to Campus Festival
        </button>
      </div>
    </div>
  );
}
