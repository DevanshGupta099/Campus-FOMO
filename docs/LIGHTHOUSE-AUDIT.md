# Lighthouse Performance, Accessibility, Best Practices & SEO Audit

- **Tooling**: Google Chrome Headless + `lighthouse@13.6.0` CLI (`--only-categories=performance,accessibility,best-practices,seo`)
- **Target Build**: Production Vite 5 bundle (`pnpm --filter campus-fomo-frontend build` + `vite preview --port 4173`) paired with live Fastify API (`http://localhost:3001`)
- **Audit Date**: `2026-11-14`

---

## 1. Final Measured Scores (`http://localhost:4173/`)

| Category           | Desktop Preset (`1350x940`) | Mobile (`360x800`, 4x CPU, Slow 4G) | Baseline Mobile (Before Tuning) |
| :----------------- | :-------------------------: | :---------------------------------: | :-----------------------------: |
| **Performance**    |        **99 / 100**         |            **87 / 100**             |            68 / 100             |
| **Accessibility**  |        **100 / 100**        |            **100 / 100**            |            94 / 100             |
| **Best Practices** |        **100 / 100**        |            **100 / 100**            |            100 / 100            |
| **SEO**            |        **100 / 100**        |            **100 / 100**            |            100 / 100            |

---

## 2. Core Web Vitals Breakdown

| Metric                             | Desktop Measured | Mobile (`360px` Slow 4G) | Mobile Baseline (Pre-Optimization) |
| :--------------------------------- | :--------------: | :----------------------: | :--------------------------------: |
| **First Contentful Paint (FCP)**   |    **0.3 s**     |        **0.9 s**         |               0.9 s                |
| **Largest Contentful Paint (LCP)** |    **1.0 s**     |        **4.0 s**         |               10.6 s               |
| **Total Blocking Time (TBT)**      |     **0 ms**     |         **0 ms**         |                0 ms                |
| **Cumulative Layout Shift (CLS)**  |    **0.039**     |        **0.028**         |               0.170                |
| **Speed Index (SI)**               |    **0.4 s**     |        **1.2 s**         |               1.1 s                |

---

## 3. Key Optimizations Executed

1. **Route & WebGL Vendor Code-Splitting (`frontend/src/App.tsx`, `LandingPage.tsx`, `HeroMediaAnchor.tsx`)**:
   - Split all 11 workspace views, `LoginPage`, `SignupPage`, `WebGLKineticHeroText`, `WebGLShaderMarquee`, and `CampusPrecinct3DMap` via `React.lazy` + dynamic `import("three")`.
   - Reduced initial entry JS payload to **`96.87 kB` gzipped** (`TBT: 0 ms` on both Desktop and 4x-throttled Mobile CPU), deferring `three-vendor` (`191.81 kB` gzip) and `troika-vendor` (`44.34 kB` gzip) until first user interaction or post-load idle.
2. **Media Compression & Progressive H.264 Video Streaming (`frontend/public/media/*`, `CinemaVideoFrame.tsx`)**:
   - Compressed all 6 high-resolution campus `.jpg` assets from **`5.47 MB` -> `569 KB`** (`~90%` reduction) and encoded above-the-fold `960x540` WebP hero assets (`hero-central-campus.webp` `65 KB`, `fest-blossoms-stage.webp` `61 KB`).
   - Encoded two fast-start (`-movflags +faststart`) H.264 `yuv420p` seamless `.mp4` campus showreels (`christ-concourse-reel.mp4` `759 KB`, `blossoms-stage-loop.mp4` `466 KB`) with instant poster paint, WCAG Play/Pause button, and `prefers-reduced-motion` static fallback.
3. **Zero-CLS Hero Telemetry & Explicit Media Dimensions**:
   - Replaced conditional `{pulse.length > 0 && ...}` insertion above `<h1>` with a constant-height (`min-h-[38px]`) Live Precinct Pulse strip and explicit `width`/`height` attributes across all `<img>` tags, cutting mobile CLS from `0.170` down to **`0.028`** (`< 0.05` target).
4. **100/100 Accessibility & WCAG 2.2 AA Contrast**:
   - Added semantic `<main id="main-content">` landmark (`landmark-one-main`) and upgraded light-stone chapter (`#F2EDE2`) vermilion accents from `#D9380C` (`3.97:1`) to `#A82400` (**`6.24:1`** contrast ratio).
5. **100/100 Technical SEO & Structured Data**:
   - Shipped `frontend/public/robots.txt`, `frontend/public/sitemap.xml`, `frontend/public/site.webmanifest`, `frontend/public/favicon.svg`, canonical link, OpenGraph & Twitter Cards, per-route `document.title` synchronization (`RouteTitleSync`), and Schema.org `WebApplication` + `CollegeOrUniversity` JSON-LD.
