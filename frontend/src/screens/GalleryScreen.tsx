import { useState, useEffect } from "react";
import type { GalleryItem } from "../api/types.js";
import type { CampusFomoClient } from "../api/client.js";

interface GalleryScreenProps {
  client: CampusFomoClient;
}

export function GalleryScreen({ client }: GalleryScreenProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  const tags = ["All", "Hackathon", "Cultural", "Stage", "Sports"];

  useEffect(() => {
    client
      .getGallery(selectedTag === "All" ? undefined : selectedTag)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo data
        setItems([
          {
            id: "gal-01",
            title: "Hackathon 2025 Grand Finale",
            imageUrl:
              "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=60",
            category: "Hackathon",
            likes: 342,
          },
          {
            id: "gal-02",
            title: "Dhwani Battle of the Bands",
            imageUrl:
              "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=60",
            category: "Cultural",
            likes: 512,
          },
          {
            id: "gal-03",
            title: "Open-Air Amphitheatre Concert",
            imageUrl:
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=60",
            category: "Stage",
            likes: 678,
          },
          {
            id: "gal-04",
            title: "Campus Night Futsal League",
            imageUrl:
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=60",
            category: "Sports",
            likes: 289,
          },
          {
            id: "gal-05",
            title: "Robotics & AI Automation Showcase",
            imageUrl:
              "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=60",
            category: "Hackathon",
            likes: 421,
          },
          {
            id: "gal-06",
            title: "Classical Dance & Fusion Night",
            imageUrl:
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=60",
            category: "Cultural",
            likes: 395,
          },
        ]);
        setLoading(false);
      });
  }, [selectedTag]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-paper-50 font-display">
          Campus Fest Gallery (Story Card GU-02)
        </h2>
        <p className="text-xs text-royal-300 font-body">
          Moments from previous university hackathons, amphitheatre music
          nights, and cultural fests.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTag === tag
                ? "bg-royal-500 text-paper-50 border border-royal-400"
                : "bg-ink-800 text-paper-50/70 hover:text-paper-50 border border-royal-500/20"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-paper-50/60">Loading festival gallery...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-ink-800/60 border border-royal-500/30 rounded-2xl overflow-hidden shadow-xl transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden bg-ink-950">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded bg-ink-950/80 text-gold-400 backdrop-blur-sm border border-gold-400/30">
                  {item.category}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <h4 className="text-xs font-bold text-paper-50 group-hover:text-gold-400 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-paper-50/60 font-mono">
                  <span>❤️</span>
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
