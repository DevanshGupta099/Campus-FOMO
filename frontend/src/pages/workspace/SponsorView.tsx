import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Clock,
  Coffee,
  Gift,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { SponsorAnalytics, SponsorShowcase } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";

export const SponsorView: React.FC = () => {
  const { hasPerm } = useAuth();
  const canViewAnalytics = hasPerm("sponsor:analytics:view:own");

  const [showcase, setShowcase] = useState<SponsorShowcase | null>(null);
  const [analytics, setAnalytics] = useState<SponsorAnalytics | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getSponsorShowcase()
      .then((res) => {
        if (active) setShowcase(res);
      })
      .catch(() => null);

    if (canViewAnalytics) {
      apiClient
        .getSponsorAnalytics()
        .then((res) => {
          if (active) setAnalytics(res);
        })
        .catch(() => null);
    }
    return () => {
      active = false;
    };
  }, [canViewAnalytics]);

  const ctr =
    analytics && analytics.totalImpressions > 0
      ? (
          (analytics.bannerClickThroughs / analytics.totalImpressions) *
          100
        ).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Campus Partner Showcase &amp; Privacy-Preserving Telemetry (SP-01)
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            {showcase?.brand || "Third Wave Coffee"} · Brand Hub
          </h1>
        </div>
        <Link
          to="/app/lucky-draw"
          className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong bg-steel px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-bone transition hover:border-vermilion hover:bg-vermilion hover:text-void"
        >
          <Gift className="h-3.5 w-3.5" />
          <span>Manage / Inspect Lucky Draws</span>
        </Link>
      </div>

      {/* Aggregated Zero-PII Analytics (Sponsor & Admin PBAC Gated) */}
      {canViewAnalytics && analytics && (
        <section className="space-y-4 rounded-xl border border-obsidian-rule bg-obsidian p-6 text-bone shadow-anchor">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-brass-light">
              <BarChart3 className="h-4 w-4" />
              <span>Aggregated Partner Campaign Metrics</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded border border-pine/50 bg-pine/20 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero Student PII Exposed</span>
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-obsidian-rule bg-obsidian-surface p-4">
              <span className="font-mono text-[10px] uppercase text-paper-deep/65">
                Feed Impressions
              </span>
              <p className="mt-1 font-serif text-3xl">
                {analytics.totalImpressions.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-lg border border-obsidian-rule bg-obsidian-surface p-4">
              <span className="font-mono text-[10px] uppercase text-paper-deep/65">
                Banner Click-Throughs
              </span>
              <p className="mt-1 font-serif text-3xl">
                {analytics.bannerClickThroughs.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-lg border border-obsidian-rule bg-obsidian-surface p-4">
              <span className="font-mono text-[10px] uppercase text-paper-deep/65">
                Engagement CTR
              </span>
              <p className="mt-1 font-serif text-3xl text-brass-light">
                {ctr}%
              </p>
            </div>
            <div className="rounded-lg border border-obsidian-rule bg-obsidian-surface p-4">
              <span className="font-mono text-[10px] uppercase text-paper-deep/65">
                Perks Redeemed
              </span>
              <p className="mt-1 font-serif text-3xl text-emerald-300">
                {analytics.voucherClaims.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <p className="font-mono text-xs text-paper-deep/75">
            {analytics.privacyNote}
          </p>
        </section>
      )}

      {/* Public Campus Roastery Showcase */}
      {showcase && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-rule-strong bg-paper-elevated p-6 lg:col-span-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-obsidian text-brass-light">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-ink">
                  {showcase.tagline}
                </h2>
                <p className="text-xs text-ink-secondary">
                  {showcase.studentPerk}
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-rule bg-paper p-4 text-xs sm:grid-cols-2">
              <div className="flex items-center gap-2 text-ink">
                <MapPin className="h-4 w-4 text-terracotta" />
                <span>{showcase.location}</span>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>{showcase.hours}</span>
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                Concourse Student Menu Pricing
              </h3>
              <div className="mt-3 space-y-2">
                {showcase.menuHighlights.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between rounded-lg border border-rule bg-paper px-4 py-2.5 text-xs"
                  >
                    <span className="font-medium text-ink">{m.name}</span>
                    <div className="font-mono">
                      <span className="mr-2 text-ink-muted line-through">
                        INR {m.price}
                      </span>
                      <span className="font-bold text-pine">
                        INR {m.studentPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-rule-strong bg-paper-elevated p-6 lg:col-span-5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              Active Fest Voucher Drops
            </h3>
            <div className="space-y-3">
              {showcase.activeCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-rule bg-paper p-4"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-terracotta">
                    Commit-Reveal Verified
                  </span>
                  <h4 className="mt-1 font-serif text-xl text-ink">
                    {c.title}
                  </h4>
                  <p className="mt-1 text-xs text-ink-secondary">{c.prize}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
