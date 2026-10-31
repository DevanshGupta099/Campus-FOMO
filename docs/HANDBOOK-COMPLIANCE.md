# CampusFest Student Handbook Compliance Matrix

This document tracks adherence to the binding course specification: **CampusFest Student Handbook (15 Oct 2026)** (`docs/reference/CampusFest_Student_Handbook.pdf`, 18 pages). Every stage, law, deliverable, and house rule is catalogued with exact page references, current repository artifacts, compliance status, and explicit deviations.

---

## 1. Stage-by-Stage Compliance Matrix

| Stage                                    | Law & Foundation                                                                                                                      | Prescribed Deliverable                                                                            | Repository File / Artifact                                                                                                                                             | Status      | Gap / Next Action                                                                                                            |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Stage 1: Requirements**                | **Law 1**: _"Nobody knows what they want until they see it."_ (Watts Humphrey / p. 2, 4)                                              | Story Cards with numbers, Given/When/Then, 2 NFRs (p. 4, 18)                                      | [docs/REQUIREMENTS.md](file:///c:/Users/Devansh/Downloads/Campus%20Fomo/docs/REQUIREMENTS.md)                                                                          | **DONE**    | All 8 personas integrated in formal Story Card template with quantified criteria.                                            |
| **Stage 2: Let the AI build it**         | **Law 1**: _"An AI answers every question you forgot to ask, silently."_ (p. 5)                                                       | AI score sheet & AI-got-it-wrong log (p. 6, 18)                                                   | [docs/AI-LOG.md](file:///c:/Users/Devansh/Downloads/Campus%20Fomo/docs/AI-LOG.md)                                                                                      | **DONE**    | Unified append-only log with `[AI-WRONG]` tags enforced by `scripts/check-ai-log.mjs`.                                       |
| **Stage 3: Design for 100,000 students** | **Law 2**: _"Split the system by what will change."_ (David Parnas 1972 / Melvin Conway 1968 / p. 7)                                  | Architecture sketch & ADR (Architecture Decision Record) (p. 8, 18)                               | [docs/ARCHITECTURE.md](file:///c:/Users/Devansh/Downloads/Campus%20Fomo/docs/ARCHITECTURE.md), [README.md](file:///c:/Users/Devansh/Downloads/Campus%20Fomo/README.md) | **DONE**    | Mermaid flowchart, zero-trust APISIX + Keycloak + Fastify + Redis + Postgres design, and ADR records.                        |
| **Stage 4: The Last Seat & Testing**     | **Law 5**: _"Works for one user, breaks for a million."_ & **Law 4**: _"Testing shows bugs are present, never their absence."_ (p. 9) | Test Design Sheet with 5 classes: Normal, Boundary, Edge, Concurrency, Failure (p. 10, 18)        | [docs/TEST-PLAN.md](file:///c:/Users/Devansh/Downloads/Campus%20Fomo/docs/TEST-PLAN.md), `backend/src/domain/registration/last_seat.test.ts`                           | **DONE**    | 5 classes formalized; atomic SQL transaction test proves 50 concurrent requests for 1 seat yield exactly 1 confirmed ticket. |
| **Stage 5: The Change Request**          | **Law 6**: _"Software that is used must keep changing... and every change is a risk."_ (Meir Lehman 1974 / p. 11)                     | Change-request notes: which tests broke and why; regression suite (p. 12, 18)                     | `docs/CHANGE-REQUESTS.md`, automated regression suite in CI                                                                                                            | **PARTIAL** | Regression test suite established; formal change-request notes template wired for future iterations.                         |
| **Stage 6: Release Audit & Sign-off**    | **Law 7**: _"You ship everything you import."_ & **Law 8**: _"You can delegate the work, never the responsibility."_ (p. 13)          | Signed release audit: dependency scan, PII leak check, licence audit (p. 14, 18)                  | `docs/RELEASE-AUDIT.md`, `.github/workflows/ci.yml`                                                                                                                    | **PARTIAL** | Secret scanning, gitleaks, and dependency scanning automated; sign-off sheet ready for v1 release.                           |
| **Stage 7: Estimation**                  | **Law 3**: _"Adding people to a late project makes it later."_ (Fred Brooks / p. 15)                                                  | Three-estimate table (optimistic, realistic, pessimistic) & COCOMO II calculation (p. 15, 16, 18) | [docs/ESTIMATION.md](file:///c:/Users/Devansh/Downloads/Campus%20Fomo/docs/ESTIMATION.md)                                                                              | **DONE**    | COCOMO II model calibrated for Campus FOMO KSLOC and schedule months.                                                        |

---

## 2. CIA 1 Submission Deliverables (Handbook p. 18)

|   #   | Prescribed Deliverable                             | Handbook Ref | Satisfying Repo Location  | Compliance Status | Notes                                                                                                             |
| :---: | :------------------------------------------------- | :----------- | :------------------------ | :---------------: | :---------------------------------------------------------------------------------------------------------------- |
| **1** | **Story Cards (Stage 1)**                          | p. 4, 18     | `docs/REQUIREMENTS.md`    |     **DONE**      | 20+ Story Cards covering Student, Guest, Event Head, Volunteer, Faculty, Dean, Sponsor, Admin.                    |
| **2** | **AI Score Sheet & AI-Got-It-Wrong Log (Stage 2)** | p. 6, 18     | `docs/AI-LOG.md`          |     **DONE**      | Merged into single append-only log with CI pre-push gate `scripts/check-ai-log.mjs`.                              |
| **3** | **Architecture Sketch and ADR (Stage 3)**          | p. 8, 18     | `docs/ARCHITECTURE.md`    |     **DONE**      | Mermaid architecture diagram, component contracts, and ADR-001 through ADR-004.                                   |
| **4** | **Test Design Sheet (Stage 4)**                    | p. 10, 18    | `docs/TEST-PLAN.md`       |     **DONE**      | 5 test classes (Normal, Boundary, Edge, Concurrency, Failure) including Last Seat and Row 5 failure requirements. |
| **5** | **Change-Request Notes (Stage 5)**                 | p. 12, 18    | `docs/CHANGE-REQUESTS.md` |    **PARTIAL**    | Structure and regression impact analysis documented.                                                              |
| **6** | **Signed Release Audit (Stage 6)**                 | p. 14, 18    | `docs/RELEASE-AUDIT.md`   |    **PARTIAL**    | Automated security checklists, license scan, and PII audit.                                                       |
| **7** | **Three-Estimate Table (Stage 7)**                 | p. 16, 18    | `docs/ESTIMATION.md`      |     **DONE**      | Three-point estimate (PERT) + COCOMO II formulas matching handbook p. 15.                                         |

---

## 3. Handbook House Rules & Enforcement

The handbook defines five essential habits and three safety rules. Below is how each is strictly enforced in this repository:

### The Five Habits (Handbook p. 17)

1. **Think First: Paper before prompt**
   - _Handbook_: "Before writing code, list every assumption you are making. Paper first, phone second." (p. 2, 17)
   - _Enforcement_: Rule 1 in `AGENT-RULES.md` mandates that every prompt response must begin with a dedicated "Assumptions" bulleted list before executing work.
2. **Specify: Write it so a machine can't guess wrong**
   - _Handbook_: "Write requirements as Story Cards with measurable numbers and Given/When/Then." (p. 4, 17)
   - _Enforcement_: Strict Story Card format with explicit numerical thresholds (e.g. 50 seats, 10 waitlist, 500 ms latency) across all requirements.
3. **Verify: Test what can fail, not what works**
   - _Handbook_: "Test at and beyond the expected peak... Chandrayaan-3 failure-based design." (p. 9, 10, 17)
   - _Enforcement_: Rule 10 in `AGENT-RULES.md` and `skills/testing/SKILL.md` require tests for all 5 classes, specifically Concurrency and Failure.
4. **Measure: Trust numbers over feelings**
   - _Handbook_: "Measure p95 response time, draw counts, COCOMO schedule." (p. 4, 9, 15, 17)
   - _Enforcement_: Automated k6 load tests, p95 benchmarks (<200 ms reads, <400 ms writes), and memory budgets.
5. **Own It: If you can't explain it, don't ship it**
   - _Handbook_: "Read code aloud as a team... If you can't explain it, don't ship it." (p. 14, 17)
   - _Enforcement_: Rule 12 in `AGENT-RULES.md` (Prove it) requires answering 3 deep code comprehension questions at milestone reviews.

### Safety Rules for AI Help (Handbook p. 18)

1. **Never paste passwords, API keys or personal data into an AI tool**
   - _Enforcement_: Rule 8 in `AGENT-RULES.md` strictly forbids PII and secrets in logs, prompts, or test fixtures. Phone numbers are masked (`+91******21`), OTPs are HMAC-hashed, and emails are redacted.
2. **Check every package an AI suggests before installing it**
   - _Enforcement_: Rule 11 in `AGENT-RULES.md` requires explicit human approval before adding any unverified package; versions are pinned and audited.
3. **Never give an AI agent access to delete real data without human approval**
   - _Enforcement_: Rule 11 mandates human confirmation for destructive operations (dropping tables, deleting volumes, force-pushing, removing branches).

---

## 4. Architectural & Operational Deviations

This repository intentionally diverges from the handbook's introductory classroom defaults to meet production and enterprise standards while fulfilling every underlying learning objective:

1. **Solo Developer vs. Four-Person Team (Handbook p. 1, 2, 14)**
   - _Handbook_: Assumes 4 human roles (Product Owner, Architect, Developer, Tester) who sign the release audit on page 14.
   - _Campus FOMO_: Engineered autonomously by a solo developer (**Devansh**). The AI wears the different hats during task execution, adhering to the same separation of concerns.
2. **Language & Runtime: TypeScript Stack vs. Python (Handbook p. 6, 9, 10, 15)**
   - _Handbook_: Uses Python 3 with `unittest`, `race_demo/last_seat.py`, and `cocomo2_quick.py`.
   - _Campus FOMO_: Implements a modern TypeScript stack: Node.js 20 + Fastify for the high-performance backend (`backend/`), Vite + React 18 + Three.js for the responsive web frontend (`frontend/`), and Drizzle ORM + PostgreSQL 16 + Redis 7 for the data layer. Contract tests utilize Zod and Vitest.
3. **Enterprise PBAC + Gateway vs. Monolithic Checks (Handbook p. 5, 7)**
   - _Handbook_: Implements basic in-memory or monolithic role checks.
   - _Campus FOMO_: Deploys an enterprise zero-trust perimeter using **Apache APISIX** (API Gateway with rate limiting, CORS, and OpenID Connect token introspection) and **Keycloak 26** for Identity and Permission-Based Access Control (PBAC). Code strictly checks permission strings (e.g., `event:approve:dept`) rather than role names.
4. **Real-time Event Streaming: Server-Sent Events (SSE)**
   - _Handbook_: Basic synchronous request-response flow.
   - _Campus FOMO_: Implements persistent SSE connections (`/api/v1/stream`) with 15-second heartbeats, `Last-Event-ID` resume capability, and outbox event streaming.
5. **Scale & Performance Budgets (Handbook p. 7, 9)**
   - _Handbook_: Tested against 50 concurrent clicks in classroom demo.
   - _Campus FOMO_: Architected for 100,000 students on results day with k6 load scenarios, Redis caching, keyset pagination, and atomic PostgreSQL row locks (`FOR UPDATE SKIP LOCKED`).
