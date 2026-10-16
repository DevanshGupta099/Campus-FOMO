---
name: campus-fomo-seed-data
description: Use when creating or changing seed data, fixtures, demo accounts or the seed-verification test in Campus FOMO.
---

# Seed data skill

**Read first:** `docs/REQUIREMENTS.md` §6.

1. Seed lives in `apps/api/src/seed/` with `generators/` (clubs, venues, events, users, registrations, social) and `verify.ts`. Run via `pnpm seed`, `pnpm seed:reset` (truncate + seed), `pnpm seed:load` (10k events / 50k users for k6).
2. **Deterministic:** seeded PRNG (`SEED` env, default 42). Same seed → identical dataset.
3. **Relative dates:** all times computed from `now()` rounded to the hour in IST so "today / this week / weekend" always have events. Include past events with check-ins for history and XP.
4. **Realistic content, not lorem:** write real-sounding titles, descriptions (2–3 sentences), tags, speakers, venue notes and accessibility notes for each category (technical workshops, hackathons, cultural, sports, clubs, guest lectures, competitions, placement prep). Use fictional club/venue/speaker names. At least 6 distinct hand-written templates per category, varied by parameters.
5. **Every state covered:** DRAFT, PENDING, PUBLISHED, REJECTED (reason), CANCELLED, COMPLETED; empty, half-full, nearly full, exactly full + waitlist(5), over-subscribed; free and paid; online and on-campus; clashing pairs.
6. **Consistency invariants** (checked in `verify.ts` and a CI test): confirmed_count equals confirmed registrations; ≤ capacity; waitlist positions contiguous from 1; check-ins only for CONFIRMED and only after start; XP ledger sums equal user XP; badges match rules; no event ends before it starts; every FK valid; every poster param valid; every demo account can log in; emails/phones unique; no real personal data.
7. **Demo accounts** per REQUIREMENTS §6; passwords hashed with the real argon2 path. Dev-only OTP inbox enabled for them.
8. **Posters:** store generative parameters (palette, shape seed, pattern) rendered by shared SVG/shader code. No external URLs.
9. **Idempotent and safe:** `seed` refuses to run against a DB whose name/host matches production patterns unless `--force-i-am-sure`.
