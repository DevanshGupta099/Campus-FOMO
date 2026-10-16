---
name: campus-fomo-testing
description: Use when writing or reviewing any test in Campus FOMO: unit, property, integration, contract, e2e, load, chaos, security, accessibility. Defines what a good test is here.
---

# Testing skill

**Read first:** `docs/TEST-PLAN.md`.

1. **Test from requirements, then from code.** Black-box from acceptance criteria (tag `// covers: US-…`), white-box for branches and the gap between check and act.
2. **Five classes per stateful feature:** Normal, Boundary, Edge/negative, Concurrency, Failure. A feature without Concurrency and Failure tests is not done.
3. **Real dependencies in integration tests** (Testcontainers Postgres + Redis). Mock only the network edge (SMS/email providers) with fakes that can be made slow, failing, or duplicate-delivering.
4. **Concurrency tests:** fire N parallel requests with `Promise.all` against a real DB, assert invariants (count ≤ capacity, one promoted, one XP). Run 100 iterations in CI nightly, 20 on PR. Add fast-check model tests: random sequences of register/cancel/capacity-change must keep invariants.
5. **No flaky tests:** no sleeps; poll with timeout helpers; freeze time with an injected clock; seed randomness; each test owns its data (transaction rollback or unique ids).
6. **Assertions on behaviour, not implementation.** Snapshot tests only for generated OpenAPI and for non-WebGL visual fallbacks.
7. **Negative security tests:** authZ matrix, IDOR, injection strings, oversized bodies, malformed JSON, JWT tampering.
8. **E2E (Playwright):** use role-based locators, one browser context per actor, trace on failure, video on CI failure. Journeys: signup+OTP, login, discover+filter, register/waitlist, organizer create→approve→live appears, check-in, cancel+promotion, admin role change.
9. **Load (k6):** scenarios `feed_read`, `login_burst`, `last_seat_storm`, `sse_fanout`; thresholds from REQUIREMENTS §4; seed a load DB with 10k events / 50k users via script.
10. **Chaos:** stop Redis, stop Postgres, add 3 s latency to SMS adapter, kill SSE connection; assert degraded-mode behaviour documented in ARCHITECTURE.
11. **Mutation testing** (Stryker) for registration, auth, ranking: surviving mutants become new tests.
12. **Report:** every PR comment shows coverage delta, bundle size delta, Lighthouse scores, k6 smoke summary.
13. **Definition of a bad test:** passes with the code deleted; tests the mock; depends on order; asserts only status 200.
