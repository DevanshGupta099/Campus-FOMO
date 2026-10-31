import { useState } from "react";
import type { PersonaConfig } from "../auth/persona.js";
import { sound } from "../utils/audio.js";

interface SocialFeedScreenProps {
  activePersona: PersonaConfig;
  onNavigate: (path: string) => void;
}

interface BuzzPost {
  id: string;
  authorName: string;
  authorDept: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  tag: string;
  reactions: {
    fire: number;
    zap: number;
    party: number;
    heart: number;
  };
  userReacted?: string;
}

const INITIAL_POSTS: BuzzPost[] = [
  {
    id: "buzz-1",
    authorName: "Ananya Sharma",
    authorDept: "Computer Science",
    authorAvatar: "👩‍💻",
    timestamp: "2 mins ago",
    content:
      "Hackathon round 1 problem statements just dropped! WebGL and distributed zero-trust pipelines look wild. Team forming at Block 2 Lab 3rd floor right now 🔥",
    tag: "#HackathonWarRoom",
    reactions: { fire: 42, zap: 18, party: 25, heart: 12 },
  },
  {
    id: "buzz-2",
    authorName: "Rohan Varma",
    authorDept: "Cultural Committee",
    authorAvatar: "🎸",
    timestamp: "8 mins ago",
    content:
      "Soundcheck complete at Open-Air Amphitheatre! Dhwani battle of bands begins at 6 PM sharp. Make sure your gate passes are downloaded offline in case cellular dips! ⚡",
    tag: "#DhwaniVibes",
    reactions: { fire: 89, zap: 54, party: 110, heart: 65 },
  },
  {
    id: "buzz-3",
    authorName: "Kavya Nair",
    authorDept: "Media Studies",
    authorAvatar: "☕",
    timestamp: "15 mins ago",
    content:
      "Third Wave Coffee iced vanilla lattes with the flat 20% FOMO badge discount hit different during sprint prep. Show your pass at the central lounge counter! ☕✨",
    tag: "#ThirdWaveCoffee",
    reactions: { fire: 31, zap: 12, party: 40, heart: 55 },
  },
  {
    id: "buzz-4",
    authorName: "Vikram Sengupta",
    authorDept: "Robotics Club",
    authorAvatar: "🤖",
    timestamp: "28 mins ago",
    content:
      "Autonomous maze solvers are clocking sub-12s times at Block 2! Last 4 seats remaining for the AI Workshop tonight. Snag them before the lock engages! 🏃‍♂️",
    tag: "#FestFOMO",
    reactions: { fire: 67, zap: 33, party: 19, heart: 28 },
  },
];

export function SocialFeedScreen({
  activePersona,
  onNavigate,
}: SocialFeedScreenProps) {
  const [posts, setPosts] = useState<BuzzPost[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState("");
  const [selectedTag, setSelectedTag] = useState("#FestFOMO");
  const [filterTag, setFilterTag] = useState<string>("All");

  const tags = [
    "All",
    "#HackathonWarRoom",
    "#DhwaniVibes",
    "#ThirdWaveCoffee",
    "#FestFOMO",
  ];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: BuzzPost = {
      id: `buzz-${Date.now()}`,
      authorName: activePersona.name,
      authorDept: activePersona.department || "CHRIST University",
      authorAvatar: activePersona.avatar,
      timestamp: "Just now",
      content: newPostText.trim(),
      tag: selectedTag,
      reactions: { fire: 1, zap: 0, party: 0, heart: 0 },
    };

    sound.playSuccess();
    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  const handleReaction = (
    postId: string,
    reactionType: "fire" | "zap" | "party" | "heart",
  ) => {
    sound.playSuccess();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: p.reactions[reactionType] + 1,
          },
        };
      }),
    );
  };

  const filteredPosts = posts.filter((p) =>
    filterTag === "All" ? true : p.tag === filterTag,
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-mono font-semibold border border-violet-500/30">
            <span>⚡ LIVE CAMPUS CHATTER</span>
            <span>•</span>
            <span>COMMUNITY BUZZ & UPDATES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
            Festival Social Buzz & Shoutouts
          </h2>
          <p className="text-xs text-white/60 max-w-xl mt-1">
            Real-time attendee updates, venue buzz, team recruitments, and live
            festival reactions across campus.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/")}
          className="px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-white/10 text-white rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors whitespace-nowrap"
        >
          View Discover Lineup →
        </button>
      </div>

      {/* New Post Creator Box */}
      <section className="bg-surface border border-white/10 rounded-3xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-xl">
            {activePersona.avatar}
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {activePersona.name}
            </div>
            <div className="text-[10px] text-violet-400 font-mono">
              Posting as {activePersona.role} • {activePersona.department}
            </div>
          </div>
        </div>

        <form onSubmit={handlePostSubmit} className="space-y-3">
          <textarea
            required
            rows={2}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share live festival hype, workshop takeaways, or food recommendations..."
            className="w-full bg-surface-2 border border-white/10 focus:border-violet-500 rounded-2xl p-3.5 text-xs text-white placeholder-white/40 outline-none transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-white/40">Topic Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-surface-2 border border-white/10 rounded-xl px-2.5 py-1 text-violet-300 text-xs outline-none"
              >
                <option value="#FestFOMO">#FestFOMO</option>
                <option value="#HackathonWarRoom">#HackathonWarRoom</option>
                <option value="#DhwaniVibes">#DhwaniVibes</option>
                <option value="#ThirdWaveCoffee">#ThirdWaveCoffee</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/30 transition-all"
            >
              Post to Campus Buzz 🚀
            </button>
          </div>
        </form>
      </section>

      {/* Filter Tag Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setFilterTag(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              filterTag === t
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                : "bg-surface-2 hover:bg-surface-3 text-white/70 hover:text-white border border-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-surface border border-white/10 rounded-3xl p-6 shadow-card hover:border-violet-500/40 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-xl">
                  {post.authorAvatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {post.authorName}
                  </h4>
                  <p className="text-[10px] text-white/50 font-mono">
                    {post.authorDept} • {post.timestamp}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-600/15 text-violet-300 border border-violet-600/30">
                {post.tag}
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-sans">
              {post.content}
            </p>

            {/* Reaction Buttons */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleReaction(post.id, "fire")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/5 text-xs font-mono text-white/70 hover:text-white transition-all active:scale-95"
              >
                <span>🔥</span>
                <span>{post.reactions.fire}</span>
              </button>

              <button
                onClick={() => handleReaction(post.id, "zap")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/5 text-xs font-mono text-white/70 hover:text-white transition-all active:scale-95"
              >
                <span>⚡</span>
                <span>{post.reactions.zap}</span>
              </button>

              <button
                onClick={() => handleReaction(post.id, "party")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/5 text-xs font-mono text-white/70 hover:text-white transition-all active:scale-95"
              >
                <span>🎉</span>
                <span>{post.reactions.party}</span>
              </button>

              <button
                onClick={() => handleReaction(post.id, "heart")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/5 text-xs font-mono text-white/70 hover:text-white transition-all active:scale-95"
              >
                <span>❤️</span>
                <span>{post.reactions.heart}</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
