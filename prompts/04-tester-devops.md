# 04 — Tester (branch `feat/quality-devops`)

Attach skills: `testing`, `git-ci`, `auth-otp-security`, plus `docs/TEST-PLAN.md`. You own `.github`, `tests/`, `e2e/`, `load/`, `scripts/verify`, security and a11y gates. Your job is to try to break everything.
You also hold the pen on `docs/TEST-PLAN.md`, `docs/AI-GOT-IT-WRONG.md` and `docs/RELEASE-AUDIT.md`.

## Prompt A — CI/CD that blocks broken merges (Phase 2)

```
Read GEMINI.md and skills/git-ci. List assumptions; ask up to 3 questions; wait.
Then make .github/workflows real and complete: ci.yml (static, unit+coverage thresholds, integration with services, contract incl. OpenAPI diff + Schemathesis, e2e-smoke sharded, a11y, lighthouse budgets, security: gitleaks + OSV-Scanner + CodeQL, build, `ci-gate`), nightly.yml (full e2e, k6, chaos, ZAP baseline, mutation weekly), release.yml (tag -> build -> GitHub Release with notes), pr-hygiene.yml (labels, size warning, forbids .env/.only/console.log/TODO, requires extra reviewers for contract/migration changes). Pin actions by SHA, least-privilege permissions, concurrency cancel, Turborepo cache. Provide the exact branch-protection settings to apply and a script `scripts/verify/check-branch-protection.ts` that uses the GitHub API (token from env) to assert they are applied. Prove the pipeline works by adding a deliberately failing test on a throwaway branch and showing which job fails (give me the commands).
```

## Prompt B — Story coverage guard + test harness (Phase 2)

```
Build scripts/verify/coverage-of-stories.ts: parse docs/REQUIREMENTS.md story IDs marked (Must), scan tests for `// covers: US-...` tags, fail CI listing uncovered Must stories. Build shared test utilities in tests/support: Testcontainers bootstrap, factories (from seed generators), injected fake clock, fake SmsProvider (slow/fail/duplicate), log-capture helper, Playwright fixtures for multi-actor contexts (student, organizer, faculty, admin) with API-based login to avoid slow UI logins. Document usage in tests/README.md (10 lines).
```

## Prompt C — The Last Seat and invariants (Phase 3)

```
Write the cross-module test suites that no single owner would write: tests/concurrency/last-seat.test.ts (50 parallel registrants for 1 seat, repeated 100x; plus capacity-increase and cancellation races; plus double-promotion attempts), tests/properties/registration.model.test.ts (fast-check state machine), tests/chaos/*.test.ts (stop Redis, stop Postgres, slow SMS, kill SSE), tests/security/authz-matrix.test.ts (every route x every role, IDOR on every :id route, injection strings, oversized bodies, JWT tamper), tests/security/no-secrets-in-logs.test.ts. File bugs as docs/BUGS.md entries (id, repro, owner, severity) rather than fixing other people's code; for each bug give the failing test name.
```

## Prompt D — E2E journeys and live updates (Phase 3)

```
Write Playwright suites in e2e/: signup+OTP (dev inbox), login/logout/refresh, discover+filter+search, register/waitlist/cancel/promotion, organizer create -> submit -> faculty approve -> student sees it LIVE (two contexts), check-in with QR, admin role change revokes sessions, offline/reconnect (context.setOffline) replay, SSE blocked -> polling fallback, normal + incognito simulated by separate contexts with separate storage. Rules: role-based locators, no sleeps, trace on failure, 3 shards, smoke tag for PRs and full for nightly. Add tier-0 (no WebGL) and reduced-motion runs.
```

## Prompt E — Load, performance budgets, security scan (Phase 4)

```
Create load/ with k6 scenarios feed_read, login_burst (ramp to 170 logins/s for 10 min, with argon2 considered), last_seat_storm, sse_fanout (2000 connections), mixed_realistic; thresholds from REQUIREMENTS §4; a script to seed the load DB; a results summary template with p50/p95/p99, error rate, saturation notes. Add Lighthouse CI config with budgets and axe config. Add OWASP ZAP baseline config and triage rules. Output a one-page "how to read the results" and an honest list of what our load environment does NOT prove (it is not production).
```

## Prompt F — Release audit (Phase 4, with P1-P3 present)

```
Run the handbook Stage 6 audit on the integrated master: find at least one of each: functional defect, security issue, missing requirement, performance concern, bad AI assumption, privacy leak (DPDP). For each finding write the test that would have caught it and its status. Fill docs/RELEASE-AUDIT.md with: checklist results, vulnerability scan summary, dependency list review (every dependency: exists on registry, exact name, maintainer, needed?), performance numbers, accessibility results, known limitations, rollback plan, and the sign-off lines "We, the undersigned, WOULD / WOULD NOT release this software." with four signature slots. Be strict; "would not release" is a valid result.
```
