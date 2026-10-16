# GEMINI.md — Standing instructions for every Campus FOMO session

Paste this whole file into AI Studio **System Instructions**. Skills live in `skills/*/SKILL.md`; the prompt tells you which to read.

## Project

Campus FOMO: campus event discovery + registration platform for CHRIST University students. Monorepo: `apps/web`, `apps/api`, `packages/contracts`, `packages/ui`, `tests`, `e2e`, `load`. Read `PLAYBOOK.md`, `docs/ARCHITECTURE.md`, `docs/STATUS.md` when asked.

## The 10 rules (violating one = redo the answer)

1. **Think first.** Start every answer with "Assumptions" (bullets). If any assumption could change the design, ask up to 3 questions and stop. Otherwise proceed.
2. **Contracts first.** API shapes come from `packages/contracts` (Zod). Never invent fields. Change the contract first, then both sides.
3. **Loose coupling.** Backend = modules with a public `index.ts` interface; modules talk through interfaces/events, never reach into each other's tables or internals. Frontend = feature folders; 3D never imports from data layer.
4. **Atomicity in the database.** Seat counting, waitlist promotion, XP awards and OTP counters are atomic (SQL transaction/constraint or Redis Lua). Never check-then-act in application code.
5. **No secrets or personal data in logs.** OTPs, tokens, passwords, phone numbers (mask to last 2 digits) never appear in logs, errors, analytics or test snapshots.
6. **Small diffs.** Change as little as possible. Do not rewrite files you were not asked to touch. List every file changed.
7. **No placeholders.** No `TODO`, `lorem ipsum`, fake data in components, stubbed functions, hotlinked images, or "implement later". If something is out of scope, say so under Known Gaps.
8. **Every change ships with tests** (unit at minimum; integration/e2e where the prompt says) and passes `pnpm verify`.
9. **Performance budgets are requirements**: API p95 < 200 ms (reads) / < 400 ms (writes) at 500 rps on the target stack; web LCP < 2.5 s on mid-tier mobile; 3D holds 60 fps on tier-2 hardware, degrades gracefully, never blocks first paint.
10. **Honesty.** If you are unsure a library API exists or a free-tier limit is current, say so and check the docs in your answer instead of guessing. Do not claim "all criteria met" without listing each.

## Output Contract (end EVERY answer with this exact block)

```
## Output Contract
Files changed: <path — one-line reason>
Commands to run: <exact commands, in order>
Acceptance criteria: <ID — MET / NOT MET (why)>
Tests added: <path — what it proves>
Known gaps: <honest list, or "none">
AI-got-it-wrong candidates: <things a reviewer should double-check>
STATUS.md update: <3 lines to append>
```

## Conventions

- TypeScript strict. ESLint + Prettier. Conventional Commits. Branch names fixed in PLAYBOOK.
- Errors use RFC 7807 problem+json with stable `code`. IDs are UUIDv7. Times are UTC ISO-8601; display in Asia/Kolkata.
- Env via a validated config module; never read `process.env` elsewhere. `.env.example` always updated.
- Accessibility: every interactive element keyboard-reachable; `prefers-reduced-motion` honoured; every 3D hero has a non-WebGL fallback.
