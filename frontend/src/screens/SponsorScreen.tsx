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
          tagline: "Fueling CHRIST University Innovators & Creatives",
          location: "Central Block Ground Floor (Near Audi 1)",
          hours: "08:00 AM – 08:30 PM",
          studentPerk:
            "Flat 20% off with verified Campus FOMO registration badge",
          menuHighlights: [
            { name: "Classic Cold Brew", price: 180, studentPrice: 144 },
            { name: "Sea Salt Mocha", price: 210, studentPrice: 168 },
            { name: "Sourdough Toast & Hummus", price: 160, studentPrice: 128 },
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
      <p className="text-xs text-paper-50/60 text-left">
        Loading sponsor hub...
      </p>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Brand Hero Showcase */}
      <section className="bg-gradient-to-br from-ink-900 via-royal-950 to-ink-900 border border-gold-400/30 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-gold-400/20 text-gold-400 border border-gold-400/40">
              Official Campus Fest Hospitality Partner
            </span>
            <h2 className="text-3xl font-extrabold text-paper-50 font-display">
              {showcase?.brand}
            </h2>
            <p className="text-royal-300 text-sm font-body">
              {showcase?.tagline}
            </p>
          </div>

          <div className="bg-ink-800/80 border border-royal-500/30 rounded-xl p-4 text-xs font-mono space-y-1 min-w-[200px]">
            <div>📍 {showcase?.location}</div>
            <div>⏰ {showcase?.hours}</div>
          </div>
        </div>

        {/* Student Special Offer Card */}
        <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h4 className="text-sm font-bold text-gold-400">
                Student Festival Perk
              </h4>
              <p className="text-xs text-paper-50/80">
                {showcase?.studentPerk}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("/lucky-draw")}
            className="px-4 py-2 bg-gold-400 hover:bg-gold-300 text-ink-950 rounded-lg text-xs font-extrabold whitespace-nowrap shadow-md"
          >
            Enter Free Cold Brew Draw 🎁
          </button>
        </div>
      </section>

      {/* Menu Highlights with Student Rates */}
      <section className="bg-ink-800/60 border border-royal-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-paper-50 text-base">
          Campus Fest Menu Highlights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showcase?.menuHighlights.map((item, i) => (
            <div
              key={i}
              className="bg-ink-950 p-4 rounded-xl border border-royal-500/20 space-y-2 flex flex-col justify-between"
            >
              <h4 className="text-sm font-semibold text-paper-50">
                {item.name}
              </h4>
              <div className="flex items-baseline justify-between pt-2 border-t border-royal-500/10 text-xs">
                <span className="text-paper-50/50 line-through">
                  ₹{item.price}
                </span>
                <span className="text-mint-400 font-bold text-sm">
                  ₹{item.studentPrice} with Pass
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsor Analytics & Privacy Isolation */}
      {analytics && (
        <section className="bg-ink-900 border border-royal-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-royal-500/20 pb-3">
            <h3 className="font-bold text-paper-50 text-sm">
              Sponsor Engagement Dashboard
            </h3>
            <span className="text-[10px] text-paper-50/50 font-mono">
              Role: SPONSOR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20">
              <span className="text-[10px] uppercase font-mono text-paper-50/60 block">
                Total Banner Impressions
              </span>
              <span className="text-3xl font-extrabold text-royal-300 font-display mt-1 block">
                {analytics.totalImpressions}
              </span>
            </div>

            <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20">
              <span className="text-[10px] uppercase font-mono text-paper-50/60 block">
                Banner Click-Throughs
              </span>
              <span className="text-3xl font-extrabold text-gold-400 font-display mt-1 block">
                {analytics.bannerClickThroughs}
              </span>
            </div>

            <div className="bg-ink-950 p-4 rounded-xl border border-royal-500/20">
              <span className="text-[10px] uppercase font-mono text-paper-50/60 block">
                Voucher Claims
              </span>
              <span className="text-3xl font-extrabold text-mint-400 font-display mt-1 block">
                {analytics.voucherClaims}
              </span>
            </div>
          </div>

          {/* Binding Handbook Privacy Guarantee */}
          <div className="p-3 bg-ink-950/80 rounded-xl border border-royal-500/20 flex items-start gap-2 text-xs text-paper-50/70">
            <span>🛡️</span>
            <div>
              <span className="font-semibold text-paper-50 block">
                Privacy & PII Isolation Guarantee (Handbook p. 4 NFR):
              </span>
              <span>{analytics.privacyNote}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
