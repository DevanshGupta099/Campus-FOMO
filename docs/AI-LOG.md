# AI-LOG (Campus FOMO — Append-Only Execution Log)

> **CRITICAL RULE**: This file is strictly append-only. Never edit or delete past entries. Every task must append exactly one entry before concluding. A task without a log entry is incomplete.

---

### [2026-10-16 11:30 IST] BOOTSTRAP-A — Requirements Discovery & Stress-Testing

- **Prompt**: prompts/00-bootstrap.md Step A (Requirements discovery)
- **Hat**: Product Thinker & Architect
- **What I did**: Analyzed initial Campus FOMO assumptions [A1]-[A5]; added persona user stories across Students, Organizers, Faculty, and Admin; introduced hidden real-world campus constraints (Wi-Fi dropouts, venue clashes, exam blackouts); produced MoSCoW prioritization table and authored 5 core Story Cards for high-risk flows.
- **Files changed**:
  - `docs/REQUIREMENTS.md` — Complete product requirements, MoSCoW matrix, and initial 5 story cards.
  - `docs/STATUS.md` — Recorded Phase 0 completion.
- **Commands run + results**:
  - `pnpm lint` → PASS
- **Decisions & assumptions**:
  - Assumed initial 4-role hierarchy (Student, Organizer, Faculty, Admin).
  - Assumed 5 critical risk scenarios: concurrency on registration, SMS delivery dropouts, venue collisions, unapproved posters, and high load on results day.
- **Tests**:
  - Documentation integrity check → PASS
- **[AI-WRONG] mistakes found**:
  - Initially relied on a 4-person team structure before project pivoted to solo developer (Devansh).
- **Follow-ups**: Proceed with monorepo skeleton and baseline CI pipeline.

---

### [2026-10-16 11:50 IST] BOOTSTRAP-B — Monorepo Skeleton & Gate G1 Setup

- **Prompt**: prompts/00-bootstrap.md Step B (Monorepo skeleton + CI)
- **Hat**: DevOps & Tooling Engineer
- **What I did**: Initialized Turborepo monorepo with pnpm workspaces; set up `apps/web` (Vite+React+TS), `apps/api` (Fastify+TS), `packages/contracts` (Zod), and `packages/ui` (design tokens); added Docker Compose for Postgres 16, Redis 7, and Mailpit; configured Husky, commitlint, lint-staged, and GitHub Actions CI workflow.
- **Files changed**:
  - `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `pnpm-lock.yaml` — Workspace configuration.
  - `apps/web/*`, `apps/api/*`, `packages/contracts/*`, `packages/ui/*` — Package skeletons.
  - `docker-compose.yml`, `.env.example`, `.editorconfig`, `.nvmrc`, `.gitignore` — Infrastructure and tool configs.
  - `.github/workflows/ci.yml`, `.github/workflows/nightly.yml`, `.github/workflows/pr-hygiene.yml` — CI workflows.
  - `scripts/verify/index.js` — Composite verify runner.
- **Commands run + results**:
  - `pnpm install` → PASS
  - `pnpm -r build` → PASS
  - `pnpm -r lint` → PASS
  - `pnpm -r test` → PASS
- **Decisions & assumptions**:
  - Pinned Node 20+ and pnpm 9+.
  - Enforced single gatekeeper job `ci-gate` for GitHub Actions.
- **Tests**:
  - `apps/api/src/modules/health/health.test.ts` → PASS (Health endpoint returns status ok)
  - `apps/web/src/App.test.tsx` → PASS (Web renders smoke headline)
  - `tests/pipeline.test.ts` → PASS (Monorepo pipeline integrity)
- **[AI-WRONG] mistakes found**:
  - None during bootstrap execution.
- **Follow-ups**: Implement full shared API contracts and client SDK.

---

### [2026-10-16 12:05 IST] BOOTSTRAP-C — Contracts, Zod Schemas & OpenAPI Generation

- **Prompt**: prompts/00-bootstrap.md Step C (Contracts — the shared language)
- **Hat**: Backend Core & Contract Engineer
- **What I did**: Defined Zod schemas for all domain entities (auth, events, registrations, approvals, discovery, me, realtime SSE, admin); generated `openapi.yaml`; created MSW mock handlers with realistic data generators for local frontend development; built typed fetch-based SDK with token refresh; authored contract schema validation tests.
- **Files changed**:
  - `packages/contracts/src/schemas/*` — Zod schemas for all domains.
  - `packages/contracts/src/openapi.ts`, `packages/contracts/openapi.yaml` — OpenAPI specification.
  - `packages/contracts/src/mocks/*` — MSW handlers and mock data generators.
  - `packages/contracts/src/client/sdk.ts` — Typed client SDK.
  - `packages/contracts/src/contracts.test.ts` — Schema and mock validation tests.
- **Commands run + results**:
  - `pnpm --filter @campus-fomo/contracts generate:openapi` → PASS
  - `pnpm --filter @campus-fomo/contracts test` → PASS
- **Decisions & assumptions**:
  - Zod is the single source of truth for contracts.
  - MSW enables offline frontend development with zero mock drift.
- **Tests**:
  - `packages/contracts/src/contracts.test.ts` → PASS (10 unit/contract tests passing)
- **[AI-WRONG] mistakes found**:
  - None.
- **Follow-ups**: Verify Gate G1 and prepare branch status.

---

### [2026-10-16 12:15 IST] BOOTSTRAP-D — Gate G1 Verification & Commit 1b0b0fc

- **Prompt**: prompts/00-bootstrap.md Step D (Branch setup & status update)
- **Hat**: Release Lead
- **What I did**: Performed comprehensive validation across all packages; verified all Gate G1 criteria; committed bootstrap monorepo skeleton, contracts, and pipelines under commit `1b0b0fc`; recorded status in `docs/STATUS.md`.
- **Files changed**:
  - `docs/STATUS.md` — Gate G1 completed status recorded.
- **Commands run + results**:
  - `git commit -m "chore: bootstrap monorepo skeleton, contracts, and Gate G1 pipeline"` → commit `1b0b0fc`
- **Decisions & assumptions**:
  - Master branch tagged as Gate G1 baseline.
- **Tests**:
  - End-to-end repository verify script → PASS
- **[AI-WRONG] mistakes found**:
  - None.
- **Follow-ups**: Migrate architecture to solo developer model with Keycloak, Apache APISIX, and PBAC.

---

### [2026-10-16 12:45 IST] RESTRUCTURE-01 — Solo Developer Restructure & Handbook Compliance

- **Prompt**: Restructure repository into independent frontend, backend, infra, and docs projects; enforce append-only AI-LOG; map handbook compliance.
- **Hat**: System Architect & DevOps Lead
- **What I did**: Created and switched to `dev` branch; installed AGENT-RULES.md into `.agents/rules/` and replaced `GEMINI.md`; removed obsolete 4-person files; created `docs/AI-LOG.md` with back-filled history and deleted `docs/AI-GOT-IT-WRONG.md`; added `scripts/check-ai-log.mjs` and wired into `.husky/pre-push` and verify runner; extracted PDF text from `docs/reference/CampusFest_Student_Handbook.pdf` using PyMuPDF (18 pages) and answered all 7 questions; authored `docs/HANDBOOK-COMPLIANCE.md` and `docs/ESTIMATION.md`; merged all 4 requirement sources into formal Story Card format in `docs/REQUIREMENTS.md` across 8 personas; restructured `apps/web` into `frontend/` and `apps/api` into `backend/`, eliminating shared packages while embedding Zod contracts in backend and typed client generator in frontend; removed stale `apps/` and `packages/`.
- **Files changed**:
  - `AGENT-RULES.md`, `.agents/rules/AGENT-RULES.md`, `.agent/rules/AGENT-RULES.md`, `GEMINI.md`, `AGENTS.md` — Rule installation.
  - `docs/AI-LOG.md`, `docs/HANDBOOK-COMPLIANCE.md`, `docs/ESTIMATION.md`, `docs/REQUIREMENTS.md` — Core compliance & requirements documentation.
  - `scripts/check-ai-log.mjs`, `.husky/pre-push`, `scripts/verify/index.js`, `package.json`, `pnpm-workspace.yaml` — Enforcement and orchestration scripts.
  - `frontend/*`, `backend/*` — Independent application packages.
  - Deleted obsolete files: `docs/AI-GOT-IT-WRONG.md`, `.github/CODEOWNERS`, `prompts/01-05`, `00-bootstrap.md`, `apps/`, `packages/`.
- **Commands run + results**:
  - `node scripts/check-ai-log.mjs` → PASS
  - `pnpm --filter campus-fomo-frontend test:unit` → PASS (1 test passed)
  - `pnpm --filter campus-fomo-backend test:unit` → PASS (12 tests passed)
  - `pnpm --filter campus-fomo-backend generate:openapi` → PASS (openapi.yaml generated)
- **Decisions & assumptions**:
  - Branch model simplified to `master` (releases) and `dev` (active development) for solo developer Devansh.
  - Keycloak 26 and Apache APISIX selected as zero-trust IAM and API Gateway layer.
  - Contracts live in `backend/src/contracts` and export `backend/openapi.yaml`; `frontend` uses standalone typed client.
- **Tests**:
  - `frontend/src/App.test.tsx` → PASS (UI headline and mock health check)
  - `backend/src/contracts/contracts.test.ts` → PASS (10 schema parse assertions)
  - `backend/src/modules/health/health.test.ts` → PASS (GET /healthz and /readyz)
- **[AI-WRONG] mistakes found**:
  - In `backend/scripts/generate-openapi.ts`, initially attempted to import `getOpenApiSpecYaml` instead of the exported `generateOpenApiYaml` function, caught immediately and corrected.
  - In `frontend/`, copied `node_modules` initially caused ESM resolve failure; resolved by clearing stale directories and reinstalling via root pnpm workspace.
- **Follow-ups**: Implement infra/docker-compose.yml (Keycloak 26, APISIX, Postgres, Redis) and PBAC catalog in backend/src/access/.

---

### [2026-10-16 12:58 IST] PBAC-01 — Infrastructure & Zero-Trust PBAC Engine

- **Prompt**: Implement infra/docker-compose.yml (Keycloak 26, APISIX, Postgres, Redis, Mailpit), Keycloak realm with PBAC client roles, APISIX declarative routes, and backend PBAC engine with screens catalog and route audits.
- **Hat**: Security Architect & Backend Core
- **What I did**: Created `infra/docker-compose.yml` with pinned container tags; generated `infra/keycloak/realm-campus-fomo.json` with 8 persona composite roles, 44 client permissions on `campus-api`, and pre-configured demo users; authored declarative `infra/apisix/config.yaml` and `infra/apisix/apisix.yaml` with OpenID Connect bearer-only validation, rate-limiting, CORS, and unbuffered SSE stream route; created `infra/smoke-test.mjs` and root `Makefile`; built `backend/src/access/` with permissions catalog, role bundles, and screens catalog; created `backend/scripts/access-sync.ts` for idempotent Keycloak synchronization; implemented `backend/src/auth/jwt.ts` and `backend/src/auth/middleware.ts` with route boot audit (halting boot if any route lacks auth config) and `requirePermission()`; added `/me`, `/me/permissions`, `/me/navigation` and `/admin/rbac/*` routes; created comprehensive PBAC test suite in `backend/src/access/pbac.test.ts`.
- **Files changed**:
  - `infra/docker-compose.yml`, `infra/keycloak/realm-campus-fomo.json`, `infra/apisix/config.yaml`, `infra/apisix/apisix.yaml`, `infra/smoke-test.mjs`, `Makefile` — Zero-trust infrastructure.
  - `backend/src/access/permissions.ts`, `backend/src/access/roles.ts`, `backend/src/access/screens.ts`, `backend/src/access/index.ts` — PBAC catalog.
  - `backend/scripts/access-sync.ts` — Idempotent sync script.
  - `backend/src/auth/jwt.ts`, `backend/src/auth/middleware.ts` — Token validation and zero-trust route guards.
  - `backend/src/modules/me/routes.ts`, `backend/src/modules/admin/rbac-routes.ts`, `backend/src/modules/health/routes.ts`, `backend/src/app.ts` — Fastify modules and app integration.
  - `backend/src/access/pbac.test.ts` — 17 unit and integration tests for permissions, scopes, and routes.
- **Commands run + results**:
  - `pnpm --filter campus-fomo-backend access:sync` → PASS (all 8 persona role bundles verified)
  - `pnpm --filter campus-fomo-backend test:unit` → PASS (29 tests passing across 3 test suites)
- **Decisions & assumptions**:
  - Permission format strictly adheres to `resource:action[:scope]`.
  - Routes must explicitly declare `config: { auth: 'public' | string[] }` or server fails fast at boot time.
  - Test token shortcut enables deterministic CI test execution without requiring a live Keycloak container.
- **Tests**:
  - `backend/src/access/pbac.test.ts` → PASS (17 tests proving exact scope checks, screen filters, 401 unauthenticated, 403 forbidden, and boot audit failure)
- **[AI-WRONG] mistakes found**:
  - Initially forgot to list `fastify-plugin` in `backend/package.json` dependencies; caught immediately on test execution and fixed by adding to dependencies.
- **Follow-ups**: Implement Step 5 domain models (events, atomic Last Seat registration, waitlist promotion, QR check-in, and commit-reveal lucky draw).

---

### [2026-10-31 09:35 IST] UI-FULL-01 — Dynamic PBAC Navigation & 8-Persona Screens Implementation

- **Prompt**: Read all skills and docs, fix GitHub workflow errors, build full frontend UI across all 8 personas with dynamic PBAC navigation.
- **Hat**: Full-Stack Engineer & Release Lead
- **What I did**: Fixed GitHub Actions CI and nightly workflows by adding missing npm scripts (`depcruise`, `test:contract`, `test:integration`, `test:e2e`), supporting both `master` and `dev` branches, and updating dependency cruiser paths. Built comprehensive dynamic UI in `frontend/src/` with `Navbar`, `DiscoverScreen`, `MyTicketsScreen`, `EventHeadScreen`, `ScannerScreen`, `ApprovalsScreen`, `LuckyDrawScreen`, `SponsorScreen`, `GalleryScreen`, and `AdminRbacScreen`. Added persona switcher supporting all 8 roles with simulated zero-trust tokens. Added endpoints in backend domain (`/registrations/me`, `/luckydraw/campaigns`, `/events/:id/volunteers`, `/events/:id/broadcast`, `/gallery`).
- **Files changed**:
  - `.github/workflows/ci.yml`, `package.json`, `.dependency-cruiser.cjs` — CI and GitHub fixes.
  - `backend/src/domain/events/events.routes.ts`, `backend/src/domain/events/events.service.ts` — Volunteer, broadcast, gallery endpoints and seed events.
  - `backend/src/domain/luckydraw/luckydraw.routes.ts`, `backend/src/domain/luckydraw/luckydraw.service.ts` — Lucky draw list and seed campaign.
  - `backend/src/domain/registration/registration.routes.ts`, `backend/src/domain/registration/registration.service.ts` — `/registrations/me` user ticket endpoint.
  - `backend/src/auth/jwt.ts` — Allowed test token shortcut in development mode.
  - `frontend/src/auth/persona.ts` — 8 demo persona profiles and tokens.
  - `frontend/src/components/Navbar.tsx` — Dynamic PBAC navigation and persona switcher.
  - `frontend/src/screens/*` — All 8 persona screens.
  - `frontend/src/api/client.ts`, `frontend/src/api/types.ts` — Typed client methods and models.
  - `frontend/src/App.tsx`, `frontend/src/App.test.tsx` — Full application shell and integration test.
- **Commands run + results**:
  - `pnpm --filter campus-fomo-backend test:unit` → PASS (35 tests)
  - `pnpm --filter campus-fomo-frontend test:unit` → PASS (1 test)
  - `pnpm --filter campus-fomo-frontend build` → PASS (0 errors)
  - `pnpm --filter campus-fomo-backend build` → PASS (0 errors)
  - `pnpm generate:openapi` → PASS
- **Decisions & assumptions**:
  - Persona switcher updates Bearer token and triggers reactive dynamic `/me/navigation` fetch.
  - QR scanner validates tokens in <500 ms with color-coded admission feedback.
  - Commit-reveal lucky draw exposes public verification proof drawer.
  - Sponsor showcase preserves strict student PII isolation.
- **Tests**:
  - `frontend/src/App.test.tsx` → PASS
  - `backend/src/domain/domain.test.ts` → PASS
  - `backend/src/access/pbac.test.ts` → PASS
- **[AI-WRONG] mistakes found**:
  - In `ScannerScreen.tsx`, unescaped `<500` in JSX was parsed as opening tag by esbuild; fixed to `(under 500 ms target)`.
  - In `MyTicketsScreen.tsx`, unused `err` in `.catch((err) =>` triggered TypeScript error TS6133 under strict compiler options; fixed to `.catch(() =>`.
  - In `App.test.tsx`, `getByText(/CAMPUS/i)` matched multiple elements; corrected to `getAllByText(/CAMPUS/i)`.
- **Follow-ups**: Run `pnpm verify` to validate the full pipeline across all gates.

---
