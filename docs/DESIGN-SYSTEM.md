# Design System — CONCOURSE // CHRIST Central Campus (v3)

Goal: **Awwwards-grade architectural craft** engineered specifically for **CHRIST (Deemed to be University) — Central Campus, Hosur Road, Bengaluru** (`12.9345 N · 77.6060 E`). Zero AI-slop purple/indigo gradients, zero emojis (100% bespoke vector SVGs & Lucide geometric icons), and full WCAG 2.2 AA contrast compliance.

---

## 1. Visual Concept: "Anodized Matte Carbon & Kinetic Precinct Telemetry"

Inspired by Swiss Brutalist event posters, industrial obsidian hardware consoles, and twilight floodlights across Central Campus Block IV and the Main Auditorium colonnade.

### Canonical Color Palette (`frontend/src/tokens.ts` & `frontend/tailwind.config.js`)

| Semantic Token | Hex       | Role & Contrast Guarantee                                                                  |
| :------------- | :-------- | :----------------------------------------------------------------------------------------- |
| `void`         | `#07090D` | Primary deep anodized carbon background & dark text on vermilion/phosphor CTAs (`5.77:1+`) |
| `obsidian`     | `#0C1017` | Navigation chrome, HUD frames, footer, and modal shells                                    |
| `carbon`       | `#101620` | Elevated cards, bento panels, and workspace surfaces                                       |
| `gunmetal`     | `#161E2C` | Interactive inputs, metric wells, and secondary containers                                 |
| `bone`         | `#F4F0E6` | Primary warm titanium headline & body ink (`15.6:1` contrast against `#07090D`)            |
| `silver`       | `#9DA8B8` | Secondary editorial copy & metadata (`7.4:1` contrast against `#07090D`)                   |
| `vermilion`    | `#FF4D1C` | Primary Molten Signal CTA, scarcity pulse, and active PBAC tab indicator                   |
| `gold`         | `#E2B45A` | Institutional CHRIST crest accent, XP laurels, and spatial coordinate tags                 |
| `phosphor`     | `#2EE59D` | Live gate admission, verified clash-free SLA, and seat availability                        |
| `ochre`        | `#F59E0B` | Waitlist queue & Bengaluru monsoon indoor-backup advisories                                |

> **Stark Editorial Contrast Chapter**: Section 03 (_Governance & 8-Role PBAC_) intentionally shifts to a warm architectural stone surface (`#F2EDE2` background with `#07090D` ink and `#D9380C` vermilion accents) to create dramatic visual pacing on scroll.

---

## 2. Typography Stack (100% Self-Hosted, Zero External Font Blocking)

| Role                   | Font Family                           | Package / Asset                                                       | Usage                                                                 |
| :--------------------- | :------------------------------------ | :-------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **WebGL 3D SDF Hero**  | **Syne 800** + **Space Grotesk**      | `/public/fonts/syne-800.woff`, `/public/fonts/space-grotesk-700.woff` | GPU Signed Distance Field (`troika-three-text`) 3D kinetic typography |
| **Display Headlines**  | **Syne Variable**                     | `@fontsource-variable/syne`                                           | Monumental section titles, numerical KPIs, editorial hero fallback    |
| **Card & Subheads**    | **Space Grotesk Variable**            | `@fontsource-variable/space-grotesk`                                  | Event titles, modal headers, architectural venue cards                |
| **UI & Body Copy**     | **Outfit Variable**                   | `@fontsource-variable/outfit`                                         | High-legibility forms, descriptions, governance workflows             |
| **Tactical Telemetry** | **Chakra Petch** + **JetBrains Mono** | `@fontsource/chakra-petch`, `@fontsource-variable/jetbrains-mono`     | Tabular seat counters, IST timestamps, SHA-256 & HMAC token badges    |

---

## 3. Signature Interactive, WebGL & Cinema Media Architecture

1. **AAA GPU SDF 3D Kinetic Hero Typography (`WebGLKineticHeroText.tsx`)**:
   - Renders `CONCOURSE` using `troika-three-text` Signed Distance Fields with custom GLSL `onBeforeCompile` vertex wave displacement, cursor velocity parallax, wireframe `-Z` echo layer, and anodized telemetry torus rings.
   - **Core Web Vitals Progressive Hydration**: Frame 0 renders an identical-height `Syne` HTML `<h1>` (`InstantHeroHeadingFallback`) for sub-second LCP and `0.000` CLS, seamlessly upgrading to the Three.js WebGL canvas on first interaction or idle.
2. **3-Mode Hero Visual Anchor (`HeroMediaAnchor.tsx`)**:
   - **Tab 1 (`Live Reel`)**: Seamless H.264 `.mp4` campus cinema loop (`/media/christ-concourse-reel.mp4`) with procedural 60fps canvas telemetry bars, live atomic seat meter, and accessible Play/Pause toggle.
   - **Tab 2 (`3D Precinct`)**: On-demand Three.js architectural massing preview (with 2D SVG blueprint fallback).
   - **Tab 3 (`HMAC Pass`)**: Live 30-second countdown & deterministic QR matrix preview demonstrating anti-screenshot gate verification.
3. **GLSL Velocity-Shear Marquee (`WebGLShaderMarquee.tsx`)**:
   - Custom fragment shader applying scroll-velocity liquid shear and subtle RGB chromatic split across a high-DPI offscreen typography texture.
4. **9-Block 3D CHRIST Precinct Digital Twin (`CampusPrecinct3DMap.tsx`)**:
   - Interactive Three.js raycasted map of _Central Block_, _Main Auditorium_, _K.E. Auditorium (Block IV)_, _Central Quadrangle_, _Birds Park Amphitheatre_, _Block II Computing Lab_, _Floodlit Turf_, _Devadan Block_, and _Third Wave Roastery_, surfacing live event counts and monsoon indoor backups.
5. **Bespoke Campus Photography & Seamless H.264 Cinema Showreels (`frontend/public/media/`)**:
   - **2 Local Faststart H.264 `.mp4` Loops**: `christ-concourse-reel.mp4` (8s 4-stage flagship reel) and `blossoms-stage-loop.mp4` (6s cultural & roastery reel), embedded via `<CinemaVideoFrame>` on the Landing Hero, Fest Chronicle section, Auth split panels, and `/app/gallery`.
   - **8 High-Resolution Campus Photographs (`1280x720`)**: `hero-central-campus.jpg`, `fest-labyrinth-hackathon.jpg`, `fest-blossoms-stage.jpg`, `fest-magnovite-robotics.jpg`, `campus-skyview-atrium.jpg`, `thirdwave-roastery-lounge.jpg`, `auditorium-keynote-conclave.jpg`, and `southgate-floodlit-futsal.jpg`.
6. **Interactive Governance Command Console (`GovernanceCommandConsole.tsx`) & 50/50 Dual-Panel Auth Studios (`LoginPage.tsx`, `SignupPage.tsx`)**:
   - **Landing Section 03**: Interactive 4-stage pipeline inspector, 8-persona PBAC split-console, live 50-way last-seat concurrency burst visualizer, and SHA-256 commit-reveal proof verifier.
   - **Dual-Panel `/login` & `/signup`**: Viewport-locked `lg:col-span-6` sticky cinema HUD panel on the left (featuring a live-updating PBAC Session Blueprint on `/login` and a real-time keystroke-reactive Holographic Campus Boarding Pass with QR matrix on `/signup`) paired with an anodized glass form studio on the right.

---

## 4. Accessibility, Responsiveness & Performance Tiers

- **Reduced Motion & Non-WebGL Fallbacks**: Every WebGL canvas (`WebGLKineticHeroText`, `WebGLShaderMarquee`, `CampusPrecinct3DMap`, `MiniThreePrecinct`) and every `<video>` (`CinemaVideoFrame`, `LoginPage`, `SignupPage`) detects `prefers-reduced-motion: reduce` and headless/non-WebGL environments, rendering accessible HTML/SVG blueprints or high-resolution still posters automatically.
- **Mobile-First Ergonomics (`360px` to `2560px`)**: Responsive CSS grids, sticky mobile bottom PBAC quick-dock + slide-over navigation drawer in `WorkspaceShell.tsx`, and global `Ctrl+K` / `Cmd+K` `CommandPalette.tsx`.
