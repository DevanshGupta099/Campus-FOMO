import React, { useEffect, useState } from "react";
import { Building2, Maximize2, X } from "lucide-react";
import { apiClient } from "../../api/client";
import type { GalleryItem } from "../../api/types";
import { CinemaVideoFrame } from "../../components/CinemaVideoFrame";

const GALLERY_CATEGORIES = [
  "All",
  "Cultural",
  "Technical",
  "Theatre",
  "Sports",
  "Music",
];

function aspectClass(ratio: string): string {
  if (ratio === "1:1") return "aspect-square";
  if (ratio === "4:3") return "aspect-[4/3]";
  return "aspect-video";
}

export const GalleryView: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [category, setCategory] = useState("All");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .getGallery(category)
      .then((res) => {
        if (active) setItems(res);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-vermilion">
            CLS-Zero Media Archive (GU-02)
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
            CHRIST Central Fest Chronicle
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition ${
                category === cat
                  ? "bg-vermilion text-void"
                  : "border border-rule bg-paper-elevated text-ink-secondary hover:border-vermilion/60 hover:text-bone"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured H.264 Campus Cinema Showreels */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-rule-strong bg-paper-elevated shadow-editorial">
          <CinemaVideoFrame
            src="/media/christ-concourse-reel.mp4"
            poster="/media/hero-central-campus.jpg"
            alt="CHRIST Central Campus 4-Stage Flagship Showreel"
            badgeLabel="CINEMA REEL 01 · TECHNICAL & HACKATHON"
            caption="Labyrinth 24-Hr Arena · Magnovite Robotics · Block IV"
            className="aspect-video w-full"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-rule-strong bg-paper-elevated shadow-editorial">
          <CinemaVideoFrame
            src="/media/blossoms-stage-loop.mp4"
            poster="/media/fest-blossoms-stage.jpg"
            alt="Blossoms Stage & Central Block Campus Life Reel"
            badgeLabel="CINEMA REEL 02 · CULTURAL & ROASTERY"
            caption="Blossoms Quadrangle Stage · Birds Park Skyview · Third Wave"
            className="aspect-video w-full"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-xl border border-rule-strong bg-paper-elevated shadow-editorial"
          >
            {/* Reserved Aspect-Ratio Container prevents Layout Shift (CLS < 0.05) */}
            <div
              className={`relative w-full overflow-hidden bg-obsidian ${aspectClass(
                item.aspectRatio,
              )}`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <button
                type="button"
                onClick={() => setActiveItem(item)}
                aria-label={`Inspect ${item.title}`}
                className="absolute right-3 top-3 rounded-md border border-obsidian-rule bg-obsidian/85 p-2 text-bone opacity-95 transition hover:bg-vermilion hover:text-void"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                <span>{item.festName || item.category}</span>
                <span>
                  {item.aspectRatio} · {item.sizeKb} KB
                </span>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-bold text-bone">
                {item.title}
              </h2>
              {item.venueName && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-secondary">
                  <Building2 className="h-3.5 w-3.5 text-vermilion" />
                  <span>{item.venueName}</span>
                </p>
              )}
              {item.caption && (
                <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                  {item.caption}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-obsidian-rule bg-obsidian text-bone shadow-anchor">
            <div className="flex items-center justify-between border-b border-obsidian-rule px-5 py-3.5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                  {activeItem.festName || activeItem.category} ·{" "}
                  {activeItem.year || 2026}
                </span>
                <h3 className="font-display text-xl font-bold text-bone">
                  {activeItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                aria-label="Close gallery preview"
                className="rounded border border-obsidian-rule p-1.5 text-paper-deep hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-obsidian-surface p-4">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="max-h-[65vh] w-full rounded object-contain"
              />
            </div>
            {activeItem.caption && (
              <p className="px-5 py-3.5 text-xs text-paper-deep/85">
                {activeItem.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
