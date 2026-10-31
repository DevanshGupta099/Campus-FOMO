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
    <div className="space-y-8 text-left animate-fadeIn">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-mono font-semibold border border-violet-500/30">
          <span>📸 ARCHIVE</span>
          <span>•</span>
          <span>CAMPUS FESTIVAL MEMORIES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
          Campus Fest Gallery (Story Card GU-02)
        </h2>
        <p className="text-xs text-white/60 max-w-xl mt-1">
          Relive grand concert stages, 24-hour hackathon war-rooms, and floodlit
          sports finals with zero layout shift masonry.
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
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25 scale-[1.02]"
                : "bg-surface-2 hover:bg-surface-3 text-white/70 hover:text-white border border-white/5"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-white/60">Loading festival gallery...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="cursor-pointer group relative overflow-hidden rounded-2xl bg-surface border border-white/10 hover:border-violet-500/50 transition-all shadow-card hover:shadow-card-hover flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                <span className="absolute top-3 left-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-void/80 text-violet-300 border border-white/10 backdrop-blur-md">
                  {item.category}
                </span>

                <button
                  onClick={(e) => handleLike(item.id, e)}
                  aria-label="Like photo"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-void/80 text-rose-300 border border-white/10 backdrop-blur-md text-xs font-mono transition-transform hover:scale-110 active:scale-95"
                >
                  <span>❤️</span>
                  <span>{item.likes}</span>
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-surface border border-white/15 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-violet-400 uppercase">
                  {activePhoto.category}
                </span>
                <h3 className="font-bold text-white text-lg">
                  {activePhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-void">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-white/60 pt-2">
              <span>Festival Photographic Archive • CHRIST University</span>
              <span className="text-rose-400 font-bold">
                ❤️ {activePhoto.likes} student appreciations
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
