# CAMPUS FOMO — MASTER PLAYBOOK

> If Claude's tokens run out, this file is enough to finish the project with Gemini alone.
> Read top to bottom once, then use sections 4 and 5 daily.

## 1. The product in one paragraph

**Campus FOMO** helps CHRIST students discover, filter and register for campus events (workshops, hackathons, cultural, sports, clubs, guest lectures, competitions, placement prep) before they miss them. Organizers create events, faculty approve them, students register (with a safe last-seat/waitlist flow), check in by QR, and earn XP/badges. The UI is a cinematic WebGL experience; the backend is a modular, tested, observable API.

## 2. MVP vs Stretch (decide cuts with this, never mid-panic)

**MVP (must ship, must be bug-free):**

1. Landing page with 3D hero + 3D text
2. Sign up / login (password + OTP), JWT access + rotating refresh, roles
3. Student panel: feed, "this week", filters (category/date/venue/free), search, event detail, register / cancel / waitlist, "my events", bookmarks
4. Organizer panel: create/edit/cancel event, submit for approval, attendee list, QR check-in
5. Faculty/Admin panel: approval queue, user/role management, basic analytics
6. Live updates (seat counts, approvals, notifications) visible across two browsers
7. Seed data complete and deterministic
8. CI pipeline blocks broken merges

**Stretch (only after MVP gate G4):** personalised "Because you liked…" rows, natural-language search (Gemini), 3D campus map, quests/leaderboards, calendar (.ics) export, PWA install, pgvector recommendations.

## 3. Team, branches, ownership

| Person (role)      | Branch                    | Owns (directories)                                                                                                       | Prompt file                        |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| P1 Product Thinker | `feat/product-experience` | `docs/`, `apps/web/src/features/{organizer,admin}`, `apps/api/src/modules/{discovery,gamification}`, `apps/api/src/seed` | `prompts/01-product-thinker.md`    |
| P2 AI Driver       | `feat/immersive-frontend` | `packages/ui`, `apps/web/src/{features/landing,features/auth,features/student,three,styles}`                             | `prompts/02-ai-driver-frontend.md` |
| P3 Engineer        | `feat/backend-core`       | `apps/api` (except P1 modules), `packages/contracts`, `docker-compose.yml`, DB migrations                                | `prompts/03-engineer-backend.md`   |
| P4 Tester          | `feat/quality-devops`     | `.github/`, `tests/`, `e2e/`, `load/`, `scripts/verify`, security + a11y + perf budgets                                  | `prompts/04-tester-devops.md`      |

`master` is protected: nobody pushes to it directly, everything arrives by Pull Request that passes CI and has one review from a _different_ person. Directory ownership is enforced by `CODEOWNERS`. Touching someone else's directory = ask them in the PR.

**Contract-first rule:** `packages/contracts` (Zod schemas + generated OpenAPI) is the single source of truth between frontend and backend. P3 publishes it first. P2/P1 build against mocks (`VITE_API_MODE=mock`) until live endpoints land, so nobody waits.

## 4. Phases and gates (a gate = a merge to master that all four agree is green)

| Phase            | Goal                                                     | Who runs what                                                                 | Gate (done when)                                                                            |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0 Discover       | Requirements, personas, assumptions surfaced             | P1 + AI Driver run `00-bootstrap.md` step A                                   | `docs/REQUIREMENTS.md` signed by all 4 (Story Cards done)                                   |
| 1 Foundation     | Monorepo, contracts, CI skeleton, design tokens          | `00-bootstrap.md` steps B-D (one person, on `master`), then everyone branches | **G1:** `pnpm verify` green on empty skeleton, CI green, 4 branches exist                   |
| 2 Vertical slice | Auth + events list + register, end-to-end ugly-but-real  | each person's Prompt A                                                        | **G2:** two browsers: organizer creates, faculty approves, student sees it live             |
| 3 Depth          | Full CRUD, waitlist, check-in, OTP, 3D scenes, seed data | each person's Prompts B-C                                                     | **G3:** all MVP items work on seeded DB; test plan 100% of MUST cases pass                  |
| 4 Harden         | Perf, security, a11y, load, chaos, polish                | each person's Prompt D + `05-integration-and-release.md`                      | **G4 (MVP gate):** CI green, k6 thresholds met, Lighthouse budget met, signed release audit |
| 5 Stretch        | Stretch list in order                                    | `05-...`                                                                      | Only if G4 is passed                                                                        |
| 6 Release        | Freeze, tag, demo script rehearsal                       | all                                                                           | Tag `v1.0.0`, demo rehearsed in normal + incognito                                          |

## 5. The daily loop (each person, same every day)

1. Open AI Studio. Put `GEMINI.md` in System Instructions. Attach the skill(s) named in your prompt.
2. Sync: merge `master` into your branch. Run the verify script. Fix before new work.
3. Run your next prompt. Paste Gemini's answer to Claude if you want a second review, otherwise just apply it.
4. Gemini must end every answer with the **Output Contract** (files changed, commands, criteria met/not met, known gaps, AI-got-it-wrong entries). If it doesn't, reply: "Give me the Output Contract."
5. Before pushing: `pnpm verify` must pass locally. Then push your branch and open a PR to `master`.
6. Update `docs/STATUS.md` (Gemini does it: "Update STATUS.md with what is done, what's next, open bugs"). This file is what lets anyone resume.
7. Add any AI mistake to `docs/AI-GOT-IT-WRONG.md` (required by the handbook).

Git commands Gemini should print for you (never improvise):

```
git fetch origin && git merge origin/master      # sync
pnpm verify                                       # lint + typecheck + unit + contract
git push -u origin <your-branch>                  # then open PR -> master
```

## 6. Merge protocol and conflicts

- Merge `master` into your branch at least once a day and before every PR. Do **not** rebase shared branches.
- PR title uses Conventional Commits (`feat(api): add waitlist promotion`). PR description auto-fills a checklist (tests added, contract changed?, migration added?, screenshots for UI).
- A PR that changes `packages/contracts` or a DB migration needs review from P3 _and_ P4.
- Migrations are append-only and numbered; never edit a merged migration. Two people needing a migration at once: P3 sequences them.
- Merge conflict in a generated file (lockfile, OpenAPI): regenerate it, do not hand-edit.
- Broken master: whoever merged last reverts within 15 minutes (`git revert -m 1 <merge-sha>`), then fixes on their branch.
- Squash vs merge: use **merge commit** from person branches (keeps history), CI enforces linear Conventional titles.

## 7. Things only a human can do (everything else is Gemini)

1. Create accounts and copy free-tier keys into `.env` / hosting secrets: Neon (Postgres), Upstash or Render Key Value (Redis), SMS provider, Google AI Studio API key, Cloudflare Turnstile keys, Sentry (optional).
2. GitHub repo settings: enable branch protection on `master` (require PR, 1 review, required checks from the CI workflow, no force push); enable Dependabot and secret scanning. _Note: branch-protection enforcement on private repos may need a paid plan; making the repo public avoids it._
3. Add repo secrets for deploy (Gemini will list the exact names).
4. Press "Save to GitHub"/export from AI Studio, or paste files into the repo.
   That is the whole list. If Gemini asks you to do anything else manually, ask it to automate it with a script.

## 8. Tech stack (decided; change only via an ADR in `docs/ARCHITECTURE.md`)

| Concern                                     | Choice                                                                                                          | Why / where not TypeScript                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Monorepo                                    | pnpm workspaces + Turborepo                                                                                     | Fast cached tasks, one `verify`                                            |
| Web                                         | Vite + React 18 + TypeScript                                                                                    | SPA is right for a WebGL-heavy app                                         |
| 3D / motion                                 | three, @react-three/fiber, drei, postprocessing, @theatre/r3f (cutscenes), GSAP + Lenis, **GLSL shaders**       | Shaders are GLSL, not TS                                                   |
| 3D text                                     | drei `Text` (troika SDF) with custom shader material; `Text3D` using bundled three typeface JSONs for hero only | No manual font conversion needed                                           |
| State/data                                  | Zustand, TanStack Query, native EventSource (SSE)                                                               | Small, predictable                                                         |
| Styling                                     | Tailwind + CSS variables design tokens                                                                          | Theme swap in one file                                                     |
| API                                         | Node 20 + Fastify + Zod type provider                                                                           | Fast, schema-first                                                         |
| DB                                          | PostgreSQL (+ pg_trgm full-text/fuzzy, optional pgvector) via Drizzle ORM                                       | **Ranking, search, seat counting are SQL**, not app loops                  |
| Cache / limits / pub-sub                    | Redis (ioredis), **Lua scripts** for atomic rate limits and OTP counters                                        | Atomicity belongs in Redis                                                 |
| Jobs                                        | BullMQ (SMS/email send with retry, reminders, XP awards)                                                        | Keeps request path fast                                                    |
| Realtime                                    | SSE fed by Redis pub/sub + transactional outbox                                                                 | Works through proxies, simple to test                                      |
| Auth                                        | argon2id, `jose` JWT (access 15 min), rotating refresh cookie, RBAC                                             | See auth skill                                                             |
| Testing                                     | Vitest, Testcontainers, Playwright, fast-check, k6, Schemathesis (Python), axe, Lighthouse CI, Stryker          | Right tool per layer                                                       |
| Security CI                                 | gitleaks, CodeQL, OSV-Scanner / `pnpm audit`, Dependabot                                                        | Free                                                                       |
| Hosting (free tiers; verify current limits) | Web: Vercel/Netlify/Cloudflare Pages. API: Render/Railway/Fly. DB: Neon. Redis: Upstash/Render                  | Free tiers change; Gemini must read current docs before relying on a limit |

## 9. When things go wrong

| Symptom                         | First action                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Gemini ignores architecture     | Re-attach `GEMINI.md` + the skill, say "Re-read GEMINI.md rules 1-10 and redo; list which rule you broke." |
| Gemini rewrites whole files     | Add: "Change as little as possible. List every file and function you changed."                             |
| Race/duplicate seat bug returns | Run `tests/concurrency/last-seat.test.ts`; fix in `registration.service.ts` transaction; never in UI       |
| 3D janky on laptop/phone        | Lower DPR cap, check `PerformanceMonitor` tiers, disable postprocessing on tier 0 (see webgl skill)        |
| OTP not arriving                | Check provider adapter health dashboard route `/admin/ops`; failover to email is automatic after threshold |
| CI red on master                | Revert merge (section 6), fix on branch                                                                    |
| Out of context in AI Studio     | Start new chat: paste `GEMINI.md`, `docs/STATUS.md`, the one skill, then your next prompt                  |

## 10. Handbook (CIA 1) deliverables map

| Handbook item                                  | Where it lives                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Story Cards (Stage 1)                          | `docs/REQUIREMENTS.md`                                                                               |
| AI score sheet + AI-got-it-wrong log (Stage 2) | `docs/AI-GOT-IT-WRONG.md` (+ score each prompt: criteria met/not met)                                |
| Architecture sketch + ADR (Stage 3)            | `docs/ARCHITECTURE.md` (Mermaid + ADR-001..)                                                         |
| Test Design Sheet (Stage 4)                    | `docs/TEST-PLAN.md`                                                                                  |
| Change-request notes (Stage 5)                 | Run the **waitlist drill** in `prompts/05-integration-and-release.md`; log which tests broke         |
| Signed release audit (Stage 6)                 | `docs/RELEASE-AUDIT.md` (template in prompt 05)                                                      |
| Three-estimate table (Stage 7)                 | `docs/ESTIMATE.md`: gut / Gemini decomposition / COCOMO II (KSLOC x 2.94 x size^~1.10 x multipliers) |

## 11. Demo script (rehearse in normal + incognito window)

1. Normal window: student `asha.student@demo.test` opens feed. 2. Incognito: organizer creates "Demo Hack Night" capacity 1, submits. 3. Third window or same incognito: faculty approves. 4. Student feed shows event appear live with animation. 5. Student registers; seat counter hits 0 in all windows. 6. Second student tries: gets waitlist position 1. 7. First student cancels: waitlisted student promoted live + notification + XP. 8. Check-in via QR. All credentials come from the seed (see REQUIREMENTS section 6).
