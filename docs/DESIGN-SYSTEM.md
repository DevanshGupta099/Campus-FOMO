# Design System — "Campus FOMO x CHRIST"

Goal: Awwwards-grade, not template-grade. One bold concept, executed with discipline.

## Concept: "The Campus After Dark"

A night-blue campus seen from above. Events are glowing lanterns/constellations; categories are districts. Scroll flies the camera over the campus like a game intro cutscene; dates become orbits; FOMO is a visible pulse (events about to fill pulse faster).

## Colour tokens (CSS variables; swap in one file)

> Verify against CHRIST's official brand guidelines before final; the system is token-based so only `tokens.css` changes.
> | Token | Value | Use |
> |---|---|---|
> | `--ink-950` | `#050B1F` | Deep night background |
> | `--ink-800` | `#0B1F4D` | Panels, cards |
> | `--royal-500` | `#1E4FD8` | Primary (university blue) |
> | `--royal-300` | `#6E93FF` | Links, glows |
> | `--gold-400` | `#F2B705` | Accent, XP, CTAs, "last seats" |
> | `--ember-500` | `#FF5A3C` | Urgency/FOMO (sparingly) |
> | `--mint-400` | `#3EE6B0` | Success, confirmed |
> | `--paper-50` | `#F6F8FF` | Text on dark, light-panel background |
> Organizer/Admin panels use a **light, calm "control room"** variant (paper background, ink text, same royal/gold) so the two panels feel like two products of one brand.
> Contrast: all text pairs ≥ 4.5:1 (checked by test).

## Typography

Display: a distinctive variable font from Google Fonts (e.g. **Unbounded**, **Bricolage Grotesque** or **Syne**; pick one, self-host via `@fontsource`). Body: **Inter** or **Instrument Sans**. 3D text uses the same display font (troika SDF loads TTF/WOFF directly) so HTML and WebGL typography match. Tabular numerals for seat counters.

## Motion principles

1. Motion explains state (seat taken, approval arrived), not decoration. 2. One easing family (`power3.out`, `expo.inOut`). 3. Durations 150–250 ms UI, 600–1400 ms scene. 4. Everything respects `prefers-reduced-motion`. 5. Scroll is smooth (Lenis) but never hijacked on touch/low-power.

## Signature moments (build in this order)

1. **Hero cutscene:** camera glides over a procedural night campus (instanced buildings, volumetric-ish light cones, bloom); huge **3D title "CAMPUS FOMO"** (Text3D, bevel, glowing edge shader) assembles from particles; tagline in SDF text with chromatic aberration reveal.
2. **Scroll story:** 4 chapters (Discover → Filter → Register → Level up) driven by Theatre.js sequence mapped to scroll.
3. **Category districts:** hover a district to see its events as lanterns; click flies camera and filters the feed.
4. **FOMO pulse:** event lantern glow speed ∝ (1 − seats_left/capacity); last-seat events shimmer gold.
5. **Level-up cutscene:** badge unlock plays a 3-second 3D reveal (skippable).
6. **Student panel:** 3D is accent (hero strip, trophy room), content stays fast and readable. **Organizer/Admin:** almost no WebGL; clarity first.

## Performance tiers (detected at runtime, user-overridable)

Tier 0 (no WebGL / save-data / reduced motion): static poster + CSS animation. Tier 1: low DPR (1), no postprocessing, ≤ 150 instances. Tier 2: DPR ≤ 1.5, bloom only. Tier 3: DPR ≤ 2, bloom + DOF + chromatic aberration. `PerformanceMonitor` downgrades live.

## Components (in `packages/ui`, each with Storybook-free visual test via Playwright screenshots)

Button, IconButton, Card, EventCard (with live seat meter), SeatMeter, Chip, FilterBar, Modal/Drawer, Toast, Tabs, Table, Form fields (OTP input with paste + auto-advance), Skeleton, EmptyState, CommandPalette, XPBar, BadgeToken, Avatar, Stepper, ThemeProvider.
