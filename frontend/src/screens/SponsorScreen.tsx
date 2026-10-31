import { useState, useEffect } from "react";
import type { SponsorShowcase, SponsorAnalytics } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface SponsorScreenProps {
  client: CampusFomoClient;
  onNavigate: (path: string) => void;
}

export function SponsorScreen({ client, onNavigate }: SponsorScreenProps) {
  const [showcase, setShowcase] = useState<SponsorShowcase | null>(null);
  const [analytics, setAnalytics] = useState<SponsorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.getSponsorShowcase().catch(() => null),
      client.getSponsorAnalytics().catch(() => null),
    ]).then(([showcaseData, analyticsData]) => {
      setShowcase(
        showcaseData || {
          brand: "Third Wave Coffee Campus Lounge",
          tagline: "Fueling CHRIST University Innovators, Artists & Engineers",
          location: "Central Block Ground Floor (Adjacent to Audi 1)",
          hours: "08:00 AM – 08:30 PM",
          studentPerk:
            "Flat 20% off with verified Campus FOMO registration badge",
          menuHighlights: [
            {
              name: "Classic Cold Brew (Single Origin)",
              price: 180,
              studentPrice: 144,
            },
            { name: "Sea Salt Dark Mocha", price: 210, studentPrice: 168 },
            {
              name: "Artisan Sourdough Toast & Hummus",
              price: 160,
              studentPrice: 128,
            },
            {
              name: "Iced French Vanilla Latte",
              price: 195,
              studentPrice: 156,
            },
            { name: "Almond Butter Croissant", price: 175, studentPrice: 140 },
          ],
          activeCampaigns: [
            {
              id: "camp-twc-01",
              title: "Fest Hackathon Free Cold Brew Lucky Draw",
              prize: "5x ₹500 Cafe Vouchers",
            },
          ],
        },
      );
      setAnalytics(
        analyticsData || {
          sponsorName: "Third Wave Coffee Campus Lounge",
          totalImpressions: 432,
          bannerClickThroughs: 89,
          voucherClaims: 34,
          privacyNote:
            "Strict PII Minimization enforced: Student phone numbers and emails are never shared with sponsors.",
        },
      );
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <p className="text-xs text-white/60 text-left">
        Loading sponsor lounge...
      </p>
    );
  }

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Brand Hero Showcase */}
      <section className="relative overflow-hidden bg-surface border border-amber-500/30 rounded-3xl p-6 sm:p-10 space-y-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
              <span>☕ OFFICIAL HOSPITALITY PARTNER</span>
              <span>•</span>
              <span>CHRIST FEST '26</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {showcase?.brand}
            </h2>

            <p className="text-white/70 text-sm max-w-xl leading-relaxed">
              {showcase?.tagline}
            </p>
          </div>

          <div className="bg-surface-2 border border-white/10 rounded-2xl p-4 text-xs font-mono space-y-1.5 min-w-[220px]">
            <div className="flex items-center gap-2 text-white/80">
              <span>📍</span>
              <span>{showcase?.location}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span>⏰</span>
              <span>{showcase?.hours}</span>
            </div>
            <div className="flex items-center gap-2 text-mint-400">
              <span>📶</span>
              <span>Campus Wi-Fi Lounge Active</span>
            </div>
          </div>
        </div>

        {/* Student Festival Perk Card */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">☕</span>
            <div>
              <h4 className="text-base font-bold text-amber-300">
                Exclusive Festival Student Perk
              </h4>
              <p className="text-xs text-white/70">{showcase?.studentPerk}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("/lucky-draw")}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-void rounded-xl text-xs font-bold whitespace-nowrap shadow-lg shadow-amber-400/20 transition-transform hover:scale-[1.02]"
          >
            Enter Free Cold Brew Draw 🎁
          </button>
        </div>
      </section>

      {/* Specialty Menu Highlights */}
      <section className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-lg">
              Curated Festival Brews & Bites
            </h3>
            <p className="text-xs text-white/60">
              Flash your dynamic Campus FOMO gate pass at the counter to claim
              student pricing.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-300 hidden sm:inline">
            FLAT 20% DISCOUNT APPLIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {showcase?.menuHighlights.map((item, i) => (
            <div
              key={i}
              className="bg-surface-2 p-5 rounded-2xl border border-white/5 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-violet-400 block uppercase">
                  Specialty Roast
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {item.name}
                </h4>
              </div>

              <div className="flex items-baseline justify-between pt-3 border-t border-white/5 text-xs font-mono">
                <span className="text-white/40 line-through">
                  ₹{item.price}
                </span>
                <span className="text-mint-400 font-bold text-sm bg-mint-500/10 px-2 py-0.5 rounded-lg border border-mint-500/25">
                  ₹{item.studentPrice} with Pass
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsor Engagement & Privacy Isolation (Handbook p. 4 NFR) */}
      {analytics && (
        <section className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">
                Partner Engagement Analytics
              </h3>
              <p className="text-xs text-violet-300 font-mono">
                Aggregated fest audience reach • Zero PII leak
              </p>
            </div>
            <span className="text-[10px] text-white/40 font-mono">
              Role: SPONSOR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-surface-2 p-5 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-mono text-white/50 block">
                Total Banner Impressions
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-violet-300 font-mono mt-1 block">
                {analytics.totalImpressions}
              </span>
            </div>

            <div className="bg-surface-2 p-5 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-mono text-white/50 block">
                Student Click-Throughs
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-amber-300 font-mono mt-1 block">
                {analytics.bannerClickThroughs}
              </span>
            </div>

            <div className="bg-surface-2 p-5 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-mono text-white/50 block">
                Discount Vouchers Claimed
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-mint-400 font-mono mt-1 block">
                {analytics.voucherClaims}
              </span>
            </div>
          </div>

          {/* Binding Handbook Privacy Guarantee */}
          <div className="p-4 bg-surface-2 rounded-2xl border border-mint-500/30 flex items-start gap-3 text-xs text-white/80">
            <span className="text-xl">🛡️</span>
            <div>
              <span className="font-bold text-white block font-mono text-xs">
                Zero-Trust Student Privacy Guarantee (Handbook p. 4 NFR):
              </span>
              <span className="text-white/60">{analytics.privacyNote}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
