# CampusFest Student Handbook Compliance Matrix

This document tracks adherence to the binding course specification: **CampusFest Student Handbook (15 Oct 2026)** ([docs/reference/CampusFest_Student_Handbook.pdf](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/reference/CampusFest_Student_Handbook.pdf), 18 pages). Every stage, law, deliverable, and house rule is catalogued with exact page references, current repository artifacts, compliance status, and explicit architectural enhancements.

---

## 1. Stage-by-Stage Compliance Matrix (All 7 Stages Complete)

| Stage                                    | Law & Foundation                                                                                                                      | Prescribed Deliverable                                                                            | Repository File / Artifact                                                                                                                                                                                     |  Status  | Verification Summary                                                                                                       |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------- |
| **Stage 1: Requirements**                | **Law 1**: _"Nobody knows what they want until they see it."_ (Watts Humphrey / p. 2, 4)                                              | Story Cards with numbers, Given/When/Then, 2 NFRs (p. 4, 18)                                      | [docs/REQUIREMENTS.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/REQUIREMENTS.md)                                                                                                              | **DONE** | All 8 personas specified in formal Story Card format with quantified latency, capacity, and security criteria.             |
| **Stage 2: Let the AI build it**         | **Law 1**: _"An AI answers every question you forgot to ask, silently."_ (p. 5)                                                       | AI score sheet & AI-got-it-wrong log (p. 6, 18)                                                   | [docs/AI-LOG.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/AI-LOG.md)                                                                                                                          | **DONE** | Strictly append-only log with `[AI-WRONG]` entries enforced in CI and pre-push by `scripts/check-ai-log.mjs`.              |
| **Stage 3: Design for 100,000 students** | **Law 2**: _"Split the system by what will change."_ (David Parnas 1972 / Melvin Conway 1968 / p. 7)                                  | Architecture sketch & ADR (Architecture Decision Record) (p. 8, 18)                               | [docs/ARCHITECTURE.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/ARCHITECTURE.md), [README.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/README.md)                                 | **DONE** | Mermaid architecture diagram, zero-trust APISIX + Keycloak 26 + Fastify + Redis + PostgreSQL 16 design, and ADRs.          |
| **Stage 4: The Last Seat & Testing**     | **Law 5**: _"Works for one user, breaks for a million."_ & **Law 4**: _"Testing shows bugs are present, never their absence."_ (p. 9) | Test Design Sheet with 5 classes: Normal, Boundary, Edge, Concurrency, Failure (p. 10, 18)        | [docs/TEST-PLAN.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/TEST-PLAN.md), `backend/src/domain/domain.test.ts`, `backend/src/modules/auth/auth.test.ts`, `frontend/src/App.test.tsx`         | **DONE** | 53 automated tests across Normal, Boundary, Edge, Concurrency (50-way last seat & draw races), and Failure/AuthZ classes.  |
| **Stage 5: The Change Request**          | **Law 6**: _"Software that is used must keep changing... and every change is a risk."_ (Meir Lehman 1974 / p. 11)                     | Change-request notes: which tests broke and why; regression suite (p. 12, 18)                     | [docs/CHANGE-REQUESTS.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/CHANGE-REQUESTS.md)                                                                                                        | **DONE** | 5 formal CRs documented (`CR-01`..`CR-05`) with broken-test root-cause analysis and permanent regression coverage.         |
| **Stage 6: Release Audit & Sign-off**    | **Law 7**: _"You ship everything you import."_ & **Law 8**: _"You can delegate the work, never the responsibility."_ (p. 13)          | Signed release audit: dependency scan, PII leak check, licence audit (p. 14, 18)                  | [docs/RELEASE-AUDIT.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/RELEASE-AUDIT.md), [docs/LIGHTHOUSE-AUDIT.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/LIGHTHOUSE-AUDIT.md) | **DONE** | Zero-trust route audit, Zod boundary hardening, PII masking check, OSI licence matrix, Lighthouse & supply-chain sign-off. |
| **Stage 7: Estimation**                  | **Law 3**: _"Adding people to a late project makes it later."_ (Fred Brooks / p. 15)                                                  | Three-estimate table (optimistic, realistic, pessimistic) & COCOMO II calculation (p. 15, 16, 18) | [docs/ESTIMATION.md](file:///c:/Users/christ.CU0500/Downloads/Campus-Fomo/docs/ESTIMATION.md)                                                                                                                  | **DONE** | PERT three-point estimate + COCOMO II person-month & schedule model calibrated for Campus FOMO KSLOC.                      |

---

## 2. CIA Submission Deliverables Checklist (Handbook p. 18)

|   #   | Prescribed Deliverable                             | Handbook Ref | Satisfying Repo Location  | Compliance Status | Notes                                                                                                      |
| :---: | :------------------------------------------------- | :----------- | :------------------------ | :---------------: | :--------------------------------------------------------------------------------------------------------- |
| **1** | **Story Cards (Stage 1)**                          | p. 4, 18     | `docs/REQUIREMENTS.md`    |     **DONE**      | 27+ Story Cards covering Student, Guest, Event Head, Volunteer, Faculty, Dean, Sponsor, and Admin.         |
| **2** | **AI Score Sheet & AI-Got-It-Wrong Log (Stage 2)** | p. 6, 18     | `docs/AI-LOG.md`          |     **DONE**      | Append-only log with `[AI-WRONG]` entries and CI pre-push gate `scripts/check-ai-log.mjs`.                 |
| **3** | **Architecture Sketch and ADR (Stage 3)**          | p. 8, 18     | `docs/ARCHITECTURE.md`    |     **DONE**      | Mermaid architecture diagram, OpenAPI 3.1 contract pipeline, and ADR-001 through ADR-004.                  |
| **4** | **Test Design Sheet (Stage 4)**                    | p. 10, 18    | `docs/TEST-PLAN.md`       |     **DONE**      | 5 test classes (Normal, Boundary, Edge, Concurrency, Failure) backed by 53 automated Vitest assertions.    |
| **5** | **Change-Request Notes (Stage 5)**                 | p. 12, 18    | `docs/CHANGE-REQUESTS.md` |     **DONE**      | Complete CR impact analysis (`CR-01`..`CR-05`), broken test diagnostics, and regression test mappings.     |
| **6** | **Signed Release Audit (Stage 6)**                 | p. 14, 18    | `docs/RELEASE-AUDIT.md`   |     **DONE**      | Security checklist, PII minimization proof, OSI licence audit, supply-chain overrides, and owner sign-off. |
| **7** | **Three-Estimate Table (Stage 7)**                 | p. 16, 18    | `docs/ESTIMATION.md`      |     **DONE**      | Three-point estimate (PERT) + COCOMO II formulas matching handbook p. 15.                                  |

---

## 3. Handbook House Rules & Enforcement

### The Five Habits (Handbook p. 17)

1. **Think First: Paper before prompt** — Every session begins with explicit **Assumptions** before writing code (`AGENTS.md` Rule 1).
2. **Specify: Write it so a machine can't guess wrong** — Measurable Story Cards (`50` seats, `10` waitlist, `<500ms` scan, `<150ms` clash check) mapped via `// covers: <ID>` comments in test files (`AGENTS.md` Rule 3).
3. **Verify: Test what can fail, not what works** — 50-way parallel registration race, 50-way commit-reveal entry race, non-owner Event Head scope rejection, IDOR QR token rejection, and malformed Zod payload boundary tests (`AGENTS.md` Rule 10).
4. **Measure: Trust numbers over feelings** — Real Vitest execution timings, real Chrome Headless Lighthouse Desktop & Mobile audits (`docs/LIGHTHOUSE-AUDIT.md`), and sub-150ms clash telemetry.
5. **Own It: If you can't explain it, don't ship it** — Every milestone concludes with a 3-question code comprehension quiz for Devansh (`AGENTS.md` Rule 12).

### Safety Rules for AI Help (Handbook p. 18)

1. **Never paste passwords, API keys, or personal data** — Phones masked (`+91******11`), logger headers redacted, zero plaintext credentials in `README.md` or `AI-LOG.md` (`AGENTS.md` Rule 8).
2. **Check every package before installing** — Every package verified against npm metadata and pnpm v12 supply-chain lockfile checks (`AGENTS.md` Rule 11).
3. **Never delete data or force-push without human approval** — `master` remains protected; iterative commits push cleanly to `origin/dev` without `--force` (`AGENTS.md` Rule 11).

---

## 4. Intentional Production Upgrades Over Classroom Defaults

1. **Solo Developer Workflow (`Devansh`)**: Replaces 4-person role branches with `master` (protected releases) + `dev` (active engineering) while preserving full architectural separation of concerns.
2. **TypeScript Strict Monorepo**: Node.js 20 + Fastify 4 + Zod + OpenAPI 3.1 (`backend/`) and React 18 + Vite 5 + TailwindCSS + Three.js + Troika SDF WebGL (`frontend/`).
3. **Enterprise Zero-Trust Perimeter**: Apache APISIX 3.11 + Keycloak 26 OIDC + Fastify `requirePermission` PBAC (`44` atomic permissions across `8` role bundles; zero role-string checks in code).
4. **Real-Time SSE & Short-Polling Fallback**: `/api/v1/stream` + `/api/v1/stream/poll` (`Last-Event-ID` deduplication) keep seat meters, broadcasts, and permission changes live across tabs.
