# Design System — CONCOURSE // CHRIST Central Campus (v4 Swiss-Editorial Studio)

Goal: **Awwwards Site-of-the-Day editorial & spatial craft** engineered specifically for **CHRIST (Deemed to be University) — Central Campus, Hosur Road, Bengaluru** (`12.9345° N · 77.6060° E`). Zero AI-slop purple/indigo gradients, zero sci-fi gimmick fonts, zero emojis (100% bespoke vector SVGs & Lucide geometric icons), and full WCAG 2.2 AA contrast compliance.

---

## 1. Visual Concept: "Warm Obsidian, Champagne Editorial Serif & Double-Bezel Studio Glass"

Inspired by Swiss institutional typography, luxury exhibition catalogs, and modern studio interfaces (Linear, Stripe Press, Raycast), anchored to twilight photography and spatial 3D massing of CHRIST Central Campus Block IV and the Main Auditorium colonnade.

### Canonical Color Palette (`frontend/src/tokens.ts` & `frontend/tailwind.config.ts`)

| Semantic Token | Hex       | Role & Contrast Guarantee                                                         |
| :------------- | :-------- | :-------------------------------------------------------------------------------- |
| `void`         | `#06080C` | Primary deep obsidian canvas & dark text on ivory/champagne CTAs (`16.2:1`)       |
| `obsidian`     | `#05070B` | Floating navbar capsule, footer directory, and deep chapter backgrounds           |
| `carbon`       | `#0B0F17` | Double-bezel studio showcases, bento spreads, and workspace surfaces              |
| `gunmetal`     | `#111723` | Interactive active rows, input wells, and secondary containers                    |
| `bone`         | `#F5F2EB` | Primary warm ivory headline ink & primary sculpted pill CTA fill (`16.2:1`)       |
| `silver`       | `#9BA6B8` | Secondary editorial copy & metadata (`7.6:1` contrast against `#06080C`)          |
| `gold`         | `#E5BA6B` | Champagne editorial italic accents, chapter numerals, and CHRIST crest highlights |
| `vermilion`    | `#FF5224` | Critical seat scarcity indicators and high-urgency status accents                 |
| `phosphor`     | `#34D399` | Live gate admission, verified clash-free SLA, and seat availability               |
| `ochre`        | `#F59E0B` | Waitlist queue & Bengaluru monsoon indoor-backup advisories                       |

---

## 2. Typography Stack (100% Self-Hosted, Zero External Font Blocking)

| Role                    | Font Family                                     | Package / Asset                                                                  | Usage                                                                               |
| :---------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **WebGL 3D SDF Hero**   | **Bricolage 800** + **Instrument Serif Italic** | `/public/fonts/bricolage-800.woff`, `/public/fonts/instrument-serif-italic.woff` | GPU Signed Distance Field (`troika-three-text`) 3D studio hero typography           |
| **Display Headlines**   | **Bricolage Grotesque Variable**                | `@fontsource-variable/bricolage-grotesque`                                       | Tightly tracked (`-0.036em`) section headlines, event titles, KPI numerals          |
| **Editorial Contrast**  | **Instrument Serif** (Italic & Upright)         | `@fontsource/instrument-serif`                                                   | Luminous italic headline contrast words, chapter numbers (`01.`–`07.`), pull-quotes |
| **UI, Controls & Body** | **Plus Jakarta Sans Variable**                  | `@fontsource-variable/plus-jakarta-sans`                                         | Navigation, pill buttons, form labels, descriptions, and PBAC workspaces            |
| **Precision Telemetry** | **IBM Plex Mono** + **JetBrains Mono**          | `@fontsource/ibm-plex-mono`, `@fontsource-variable/jetbrains-mono`               | Tabular (`tabular-nums`) IST timestamps, INR fees, SHA-256 & JWT permissions        |

---

## 3. Seven-Chapter Editorial Landing Architecture & Studio Surfaces

1. **Floating Capsule Navbar (`PublicNavbar.tsx`)**:
   - Glassmorphic pill header (`rounded-full backdrop-blur-2xl`) with `Plus Jakarta Sans` navigation, `Quick Find (Ctrl K)` trigger, and sculpted warm-ivory `Claim Pass` CTA.
2. **Hero & Double-Bezel Visual Showcase (`WebGLKineticHeroText.tsx` + `HeroMediaAnchor.tsx`)**:
   - Pairs `Bricolage Grotesque 800` (`CONCOURSE`) with `Instrument Serif Italic` (_`Christ Central Campus — Bengaluru`_) in Three.js SDF 3D with champagne-gold PBR rim lighting and an identical-height zero-CLS HTML fallback.
   - Framed by `.studio-bezel` double-bezel window chrome (`Live Reel`, `3D Precinct`, `HMAC Pass`) and a 4-column Swiss hairline institutional scale bar.
3. **Chapter 01 — Curated Conclave Season (`LandingPage.tsx`)**:
   - Magazine feature spread for the spotlight flagship + 3-column curated event grid with warm-ivory pill category filters.
4. **Chapter 02 — Chronological Fest Time-Rail & Pass Wallet (`ConclaveItineraryPlanner.tsx`)**:
   - Vertical IST timeline rail paired with a sticky perforated Personal Pass Wallet computing real-time auditorium overlaps, XP, INR fees, and `.ICS` calendar downloads.
5. **Chapter 03 — 9-Block Spatial 3D Digital Twin (`CampusPrecinct3DMap.tsx`)**:
   - Swiss hairline spatial metrics ledger framing the interactive Three.js CAD precinct map.
6. **Chapter 04 — Zero-Trust Architecture & 8-Persona Studio (`GovernanceCommandConsole.tsx`)**:
   - Connected 4-stage horizontal lifecycle ledger (`I`–`IV`), 8-persona double-bezel workspace previewer, 50-way last-seat burst visualizer, and SHA-256 commit-reveal verifier.
7. **Chapters 05–07 — Deanery Standings, Cinema Chronicle & Magazine Pull-Quotes**:
   - Inter-Deanery XP standings, dual H.264 campus showreels + photo essay lightbox + perforated Third Wave Coffee boarding pass, and `Instrument Serif` pull-quotes + hairline protocol FAQ.
