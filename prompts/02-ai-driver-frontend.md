# 02 — AI Driver (branch `feat/immersive-frontend`)

Attach skills: `webgl-frontend`, `architecture`, `testing`, plus `docs/DESIGN-SYSTEM.md`. You own `packages/ui`, landing, auth pages, student panel, `three/`.
Keep Gemini honest about library APIs: say "if unsure an API exists in the pinned version, check the package docs in your answer".

## Prompt A — Design system + tier engine (Phase 2; unblocks P1)

```
Read GEMINI.md, docs/DESIGN-SYSTEM.md, skills/webgl-frontend. List assumptions, ask up to 3 questions, wait.
Then build packages/ui: tokens.css (all tokens in the doc, dark "night" theme + light "control room" theme), Tailwind preset reading the tokens, self-hosted fonts via @fontsource (choose one display + one body font and justify in 3 lines), and the components listed in DESIGN-SYSTEM (Button, Card, EventCard with live SeatMeter, Chip, FilterBar, Modal/Drawer, Toast, Tabs, Table, form fields incl. OTP input with paste + auto-advance + a11y, Skeleton, EmptyState, CommandPalette, XPBar, BadgeToken, Stepper). Add the capability/tier engine in apps/web/src/three/tiers.ts with unit tests (mock navigator values) and a `?tier=` override. Playwright screenshot tests for every component in both themes. axe must pass.
```

## Prompt B — Landing page with the hero cutscene (Phase 3)

```
Build apps/web/src/features/landing and apps/web/src/three/scenes/HeroCampus per DESIGN-SYSTEM "Signature moments" 1-2:
- Procedural night campus (instanced buildings from a seeded generator, ground grid, lantern lights, fog, bloom), camera path authored with Theatre.js and loaded from JSON in prod.
- 3D headline "CAMPUS FOMO" with Text3D (bundled typeface JSON), emissive edge shader, particle-assemble intro; tagline and CTA labels in SDF `Text` using the site font with a distortion reveal. Same text exists in the DOM for screen readers and as the tier-0 fallback.
- Scroll story with 4 chapters (Discover, Filter, Register, Level up) using Lenis + GSAP ScrollTrigger + Theatre playhead from one scroll store.
- Sections below the hero are plain, fast HTML with subtle motion: live "events this week" strip fed by public GET /events, how-it-works, persona cards, CTA to sign up.
Budgets from the skill must be met; report measured draw calls, triangles and bundle size of the lazy 3D chunk. Provide tier 0 static fallback and reduced-motion behaviour. Tests: tier selection, fallback renders without WebGL (Playwright with WebGL disabled), screenshot at tier 0 and 2.
```

## Prompt C — Auth pages (Phase 3; requires P3 auth endpoints or mocks)

```
Read skills/auth-otp-security (client-relevant parts). Build apps/web/src/features/auth: sign up (email or phone, password strength meter, consent text for DPDP), login (password / OTP tabs), OTP screen (6-digit input, countdown for expiry, resend with progressive cooldown shown from server Retry-After, attempt counter, "wrong number? change it", "send to email instead" when delivery failed or number is DND), Turnstile widget integration when the server asks for it, forgot/change phone flow. Auth state: access token in memory only, silent refresh with single-flight, logout-all, cross-tab logout via BroadcastChannel. Route guards + role redirects into the correct panel. Every error is mapped from problem+json `code` to human text. Tests: unit for refresh single-flight race, Playwright for each flow, a11y.
```

## Prompt D — Student panel (Phase 3)

```
Build apps/web/src/features/student: Home feed rendering server-driven sections through a component registry (unknown section types are skipped safely), This Week view, Explore with filters synced to URL, typo-tolerant search with suggestions, Event detail (live seat meter, register / waitlist position / cancel, clash warning dialog, add to calendar .ics, share), My Events, Bookmarks, Notifications, Profile & interests, XP/levels page with a 3D trophy room (lazy, tier-gated). Live updates: one SSE client with reconnect/backoff, Last-Event-ID, polling fallback, patching TanStack Query cache; BroadcastChannel keeps tabs consistent. Optimistic UI only for bookmarks, never for seats or XP. Include a "Lite mode" toggle. Tests: unit for SSE client (reconnect, replay, fallback), Playwright two-context test (organizer approves, student sees it live).
```

## Prompt E — Gamified 3D layer (Phase 4-5)

```
Add: category-district 3D campus map (click a district to filter and fly the camera), FOMO pulse on event lanterns (glow speed from seats_left/capacity from live data), level-up/badge cutscene (skippable, Esc), command palette (Ctrl/Cmd+K) with navigation + search actions. All data via props from the data layer; scenes never fetch. Verify frame time on tier 1/2/3 with the FPS probe and report numbers.
```

## Prompt F — Polish and performance pass (Phase 4)

```
Audit the web app: Lighthouse on landing, feed, event detail; bundle analysis (visualizer) and fix anything beyond budget (code-split routes, lazy 3D, preload fonts, image/texture compression, remove unused deps). Fix every axe issue. Check 360px, 768px, 1440px, 2560px. List before/after numbers. Do not change visual design unless a budget cannot otherwise be met.
```
