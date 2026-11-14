import React, { useEffect, useRef, useState } from "react";
import { Film, Pause, Play } from "lucide-react";

interface CinemaVideoFrameProps {
  src: string;
  poster: string;
  alt: string;
  badgeLabel?: string;
  caption?: string;
  className?: string;
  controlsOverlay?: boolean;
  eagerPoster?: boolean;
}

function prefersStaticMedia(): boolean {
  if (typeof window === "undefined") return true;
  if (import.meta.env.MODE === "test") return true;
  return Boolean(
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
}

/**
 * Accessible Looping H.264 Campus Cinema Frame.
 * Paints the high-resolution poster immediately for sub-second Core Web Vitals LCP,
 * then streams the seamless H.264 loop on interaction or post-paint idle,
 * with prefers-reduced-motion static fallback and WCAG Play/Pause control.
 */
export const CinemaVideoFrame: React.FC<CinemaVideoFrameProps> = ({
  src,
  poster,
  alt,
  badgeLabel,
  caption,
  className = "h-64 w-full sm:h-72",
  controlsOverlay = true,
  eagerPoster = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [staticOnly, setStaticOnly] = useState<boolean>(() =>
    prefersStaticMedia(),
  );
  const [streamReady, setStreamReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setStaticOnly(prefersStaticMedia());
    mql.addEventListener?.("change", handleChange);
    return () => mql.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    if (staticOnly || typeof window === "undefined") return;
    let mounted = false;
    const enableStream = () => {
      if (mounted) return;
      mounted = true;
      setStreamReady(true);
    };

    const triggers: Array<keyof WindowEventMap> = [
      "pointermove",
      "touchstart",
      "scroll",
      "keydown",
    ];
    triggers.forEach((ev) =>
      window.addEventListener(ev, enableStream, { once: true, passive: true }),
    );
    const id = window.setTimeout(enableStream, 6500);

    return () => {
      window.clearTimeout(id);
      triggers.forEach((ev) => window.removeEventListener(ev, enableStream));
    };
  }, [staticOnly]);

  const togglePlayback = () => {
    if (!streamReady) {
      setStreamReady(true);
      setIsPlaying(true);
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-void ${className}`}>
      {staticOnly || !streamReady ? (
        <img
          src={poster}
          alt={alt}
          width={1280}
          height={720}
          loading={eagerPoster ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          className="h-full w-full object-cover"
        />
      )}

      {controlsOverlay && !staticOnly && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            isPlaying && streamReady
              ? "Pause campus cinema reel"
              : "Play campus cinema reel"
          }
          className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-void/85 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-bone backdrop-blur-md transition hover:border-vermilion hover:text-vermilion"
        >
          {isPlaying && streamReady ? (
            <>
              <Pause className="h-3 w-3 text-vermilion" />
              <span>Pause Reel</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 text-phosphor" />
              <span>Play Reel</span>
            </>
          )}
        </button>
      )}

      {badgeLabel && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded border border-white/15 bg-void/85 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur-md">
          <Film className="h-3 w-3 text-vermilion" />
          <span>{badgeLabel}</span>
        </div>
      )}

      {caption && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-28 z-10">
          <p className="truncate font-mono text-[11px] font-medium text-bone drop-shadow">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};
