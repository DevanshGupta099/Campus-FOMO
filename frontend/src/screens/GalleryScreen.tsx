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
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const tags = ["All", "Hackathon", "Cultural", "Stage", "Sports"];

  useEffect(() => {
    client
      .getGallery(selectedTag === "All" ? undefined : selectedTag)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setItems([
          {
            id: "gal-01",
            title: "Hackathon 2025 Grand Finale",
            imageUrl:
              "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=70",
            category: "Hackathon",
            likes: 342,
          },
          {
            id: "gal-02",
            title: "Dhwani Battle of the Bands",
            imageUrl:
              "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=70",
            category: "Cultural",
            likes: 512,
          },
          {
            id: "gal-03",
            title: "Open-Air Amphitheatre Concert",
            imageUrl:
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=70",
            category: "Stage",
            likes: 678,
          },
          {
            id: "gal-04",
            title: "Campus Night Futsal Super League",
            imageUrl:
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=70",
            category: "Sports",
            likes: 289,
          },
          {
            id: "gal-05",
            title: "Robotics & AI Automation Showcase",
            imageUrl:
              "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=70",
            category: "Hackathon",
            likes: 421,
          },
          {
            id: "gal-06",
            title: "Classical Dance & Fusion Night",
            imageUrl:
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=70",
            category: "Cultural",
            likes: 395,
          },
        ]);
        setLoading(false);
      });
  }, [selectedTag]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item,
      ),
    );
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/15 text-royal-300 text-xs font-mono font-semibold border border-royal-500/30">
          <span>📸 ARCHIVE</span>
          <span>•</span>
          <span>CAMPUS FESTIVAL MEMORIES</span>
        </div>
        <h2 className="text-3xl font-extrabold text-paper-50 font-display mt-2">
          Campus Fest Gallery (Story Card GU-02)
        </h2>
        <p className="text-xs text-royal-300 font-body max-w-xl">
          Relive grand concert stages, 24-hour hackathon war-rooms, and floodlit
          sports finals. Zero layout shift masonry.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedTag === tag
                ? "bg-royal-500 text-paper-50 border border-royal-400 shadow-md shadow-royal-500/25 scale-[1.02]"
                : "bg-ink-800/70 hover:bg-ink-800 text-paper-50/70 hover:text-paper-50 border border-royal-500/20"
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
              onClick={() => setActivePhoto(item)}
              className="cursor-pointer group relative bg-ink-800/70 border border-royal-500/25 hover:border-royal-400/60 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden bg-ink-950">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-ink-950/80 text-gold-400 backdrop-blur-md border border-gold-400/30">
                  {item.category}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between bg-ink-900/90 border-t border-royal-500/15">
                <h4 className="text-xs font-bold text-paper-50 group-hover:text-gold-400 transition-colors truncate max-w-[200px]">
                  {item.title}
                </h4>

                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-950 hover:bg-royal-500/20 border border-royal-500/20 text-xs font-mono text-paper-50 transition-colors"
                >
                  <span className="text-ember-500">❤️</span>
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-ink-900 border border-royal-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-royal-500/20 pb-3 px-2">
              <div>
                <h3 className="font-bold text-paper-50 text-base">
                  {activePhoto.title}
                </h3>
                <span className="text-xs text-gold-400 font-mono">
                  {activePhoto.category} Festival Archive
                </span>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="text-paper-50/60 hover:text-paper-50 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-ink-950 aspect-video max-h-[500px]">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
