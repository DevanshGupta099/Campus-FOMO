# 01 — Product Thinker (branch `feat/product-experience`)

Attach skills: `seed-data`, `api-backend`, `architecture`, plus `docs/REQUIREMENTS.md`. You own: docs, organizer + admin panels, discovery/gamification modules, seed.
Consume UI components from `packages/ui` (P2) and endpoints from `packages/contracts` (P3). Until live, use `VITE_API_MODE=mock`.

## Prompt A — Seed data + verification (Phase 2; unblocks everyone)

```
Read GEMINI.md and skills/seed-data. First list assumptions and ask up to 3 questions, then wait.
Then implement apps/api/src/seed fully per docs/REQUIREMENTS.md §6: deterministic generators, relative dates, all event states, realistic hand-written content for all 8 categories (>= 6 templates each), clubs, venues, users per persona, demo accounts, registrations, waitlists, check-ins, bookmarks, notifications, XP ledger, badges. Add verify.ts with every invariant in the skill and a Vitest test that runs seed on a Testcontainers Postgres and verifies. Add `pnpm seed:load` for 10k events / 50k users. Seed must run in under 30 s (normal) and reuse bulk inserts.
Use only the Drizzle schema in packages/contracts-agreed migrations; if a column is missing, STOP and tell me which migration P3 must add.
```

## Prompt B — Organizer panel (Phase 3)

```
Read GEMINI.md, docs/REQUIREMENTS.md E3, docs/DESIGN-SYSTEM.md (light "control room" variant). Build apps/web/src/features/organizer using packages/ui components:
- Dashboard (my events by status, upcoming, fill rate), Create/Edit event wizard (stepper: basics → schedule & venue with live clash check → capacity & price → poster generator → accessibility → review), Submit for approval, Cancel with confirmation + reason, Attendee table (search, sort, CSV export), QR check-in screen (camera scan + manual fallback + offline queue), simple analytics charts (lightweight, no heavy libs).
All forms use Zod from contracts, show server errors by `code`, handle 409 version conflicts with a merge dialog, and have loading/empty/error states. Add component tests + Playwright journey "create → submit → see PENDING". Output Contract at the end.
```

## Prompt C — Admin/Faculty panel + approval (Phase 3)

```
Build apps/web/src/features/admin: approval queue (venue-clash badges, filters, bulk-safe single actions, reject-with-reason dialog), user and role management (search, role change, deactivate with confirmation), audit log viewer (filter by actor/action/date), ops dashboard (SMS provider health, queue depth, p95 latency, SSE connections from /admin/ops with live refresh). Role-gate routes and hide nav items per role. Tests per Output Contract rules, including a UI test that a non-admin never sees admin routes and a Playwright test of two approvers acting at once.
```

## Prompt D — Discovery + gamification modules (Phase 3-5)

```
Read skills/api-backend and docs/ARCHITECTURE.md §5. Implement apps/api/src/modules/discovery: GET /feed returning the server-driven layout spec (this_week, for_you, closing_soon, trending, because_you_joined) with SQL-side scoring (tag match, time decay, popularity, urgency, clash penalty), reason strings, cursor pagination, Redis cache with single-flight and outbox-based invalidation, and a deterministic fallback for new users. Implement modules/gamification: consumes domain events, awards XP/badges idempotently (UNIQUE ledger), streaks at IST midnight boundaries, reversal rules, config-driven rules file (rules.ts) so the Product Thinker can tune without code. Unit + property tests (award exactly once under duplicate and out-of-order events) and an integration test with real Postgres.
```

## Prompt E — Intelligent search (Stretch, after G4)

```
Add POST /search/nl: parse a natural-language query into the existing validated filter schema using the Gemini API (key from config, server-side only) with a strict JSON schema, 2 s timeout, per-user rate limit, 24 h cache, and a deterministic regex/keyword fallback when the API fails or quota is hit. Never trust model output: validate with Zod and clamp ranges. Include a table of 30 test phrases with expected filters and tests for prompt-injection strings in the query.
```
