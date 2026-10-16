---
name: campus-fomo-webgl-frontend
description: Use for any Three.js / R3F / GSAP / shader / 3D text / landing / student-panel UI work in Campus FOMO. Covers art direction, performance tiers, fallbacks and 3D text.
---

# WebGL frontend skill

**Read first:** `docs/DESIGN-SYSTEM.md`.

## Stack

three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, @theatre/r3f (+ @theatre/studio dev-only) for cutscene sequencing, GSAP + ScrollTrigger + Lenis, maath, zustand, Tailwind + tokens.

## Structure

`apps/web/src/three/{Scene.tsx (capability gate), tiers.ts, scenes/, shaders/*.glsl, text/, hooks/}`. HTML UI never imports from scenes internals; scenes receive plain props.

## Rules

1. **One Canvas per page**, lazy-loaded with `React.lazy`; page is usable before it loads (poster image, then fade in).
2. **Capability gate:** detect WebGL2, `navigator.deviceMemory`, `hardwareConcurrency`, `saveData`, `prefers-reduced-motion`, mobile. Output tier 0–3. Tier 0 renders a static SVG/CSS hero. Allow user override toggle ("Lite mode") stored in localStorage.
3. **Budgets:** draw calls < 150 (hero), triangles < 300k, textures ≤ 2k and compressed (KTX2/basis if available else WebP), no per-frame allocations, use `InstancedMesh` for buildings/lanterns, `frameloop="demand"` outside the hero, pause when tab hidden or canvas off-screen (IntersectionObserver).
4. **Handle context loss:** listen to `webglcontextlost/restored`; show fallback, rebuild.
5. **3D text (no ordinary fonts in hero):**
   - Headline: drei `Text3D` with a bundled typeface JSON (e.g. `three/examples/fonts/helvetiker_bold.typeface.json`), `bevelEnabled`, low `curveSegments` (≤ 8), custom `ShaderMaterial`/`MeshPhysicalMaterial` with emissive edge + noise displacement for the assemble-from-particles intro.
   - Body/labels in 3D: drei `Text` (troika SDF) using the same TTF/WOFF as the site font, with outline, `fillOpacity` animation, and a small fragment-shader distortion.
   - Always render the same text in an accessible hidden DOM element (`aria-label`, visually hidden) and as the tier-0 fallback.
6. **Postprocessing** (Tier 2–3 only): Bloom (selective via emissive threshold), Vignette, subtle ChromaticAberration; Tier 3 adds DepthOfField. Never stack more than 3 passes.
7. **Cutscenes:** Theatre.js sequences exported to JSON and loaded at runtime (no studio in prod). Provide a Skip button and keyboard `Esc`. Keep each under 4 s except the landing intro.
8. **Scroll:** Lenis for smoothness; a single scroll progress store feeds both GSAP and the Theatre playhead; disable on touch if jank detected.
9. **Gamified bits:** XP bar and badge unlocks animate from server events only (never optimistic), seat meter from live SSE.
10. **Shaders:** keep in `.glsl` files imported with `vite-plugin-glsl`; no loops with dynamic bounds; precision `mediump` on mobile; expose uniforms via typed helpers.
11. **Responsive:** test 360×640, 768, 1440, 2560; touch input equals pointer input; no hover-only information.
12. **Accessibility:** keyboard focus ring over canvas; "Pause animations" control; reduced-motion = static scene + opacity transitions only.
13. **Don't:** hotlink models/textures; use giant GLBs (> 1.5 MB); put data fetching in `useFrame`; recreate geometries on re-render (memoise); use Math.random in render (seed noise).

## Verification

Playwright screenshots at tiers 0 and 2 (forced via query `?tier=0|2`); Lighthouse budget; an FPS probe test logging average frame time over 5 s in CI-headless (SwiftShader) with a loose threshold, plus manual on-device check noted in STATUS.
