import { lazy, Suspense } from "react";

function useReducedMotion() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    typeof navigator === "undefined" ||
    navigator.userAgent?.includes("jsdom")
  ) {
    return true;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return true;
  }
}

function StaticFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="w-72 h-72 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, #7c3aed 0%, #f43f5e 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </div>
  );
}

const LazyHero3D = lazy(() => import("./HeroCanvas3D.js"));

interface HeroCanvasProps {
  className?: string;
}

export function HeroCanvas({ className = "" }: HeroCanvasProps) {
  const prefersReduced = useReducedMotion();

  // If in headless test environment (jsdom) or user prefers reduced motion, render static fallback
  if (prefersReduced) {
    return <StaticFallback />;
  }

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      <Suspense fallback={<StaticFallback />}>
        <LazyHero3D />
      </Suspense>
    </div>
  );
}
