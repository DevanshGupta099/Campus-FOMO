# Test Plan (Test Design Sheet) — "tests show bugs are present, never that they are absent"

Strategy: choose inputs most likely to break things. Every Must story has at least: normal, boundary, negative, concurrency (where state is shared), failure.

## 1. Test pyramid and tools

| Layer             | Tool                                                           | What                                                                       | Gate                        |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------- |
| Static            | ESLint (complexity ≤ 10), tsc strict, Prettier                 | style, types                                                               | PR                          |
| Unit              | Vitest                                                         | pure logic: ranking, clash detection, OTP policy, XP rules, state machines | PR                          |
| Property-based    | fast-check                                                     | seat invariants, waitlist order, pagination stability, date overlap        | PR                          |
| Integration       | Vitest + Testcontainers (real Postgres + Redis)                | repos, transactions, outbox, rate limits                                   | PR                          |
| Contract          | Zod parse of every response + Schemathesis against OpenAPI     | schema drift, fuzzing                                                      | PR                          |
| API security      | custom negative suite + OWASP ZAP baseline (nightly)           | authZ matrix, injection, IDOR                                              | PR / nightly                |
| E2E               | Playwright (multi-context for two users)                       | user journeys, live updates                                                | PR (smoke) / nightly (full) |
| Visual            | Playwright screenshots for `packages/ui` + non-WebGL fallbacks | regressions                                                                | PR                          |
| Accessibility     | @axe-core/playwright                                           | WCAG 2.2 AA                                                                | PR                          |
| Performance (web) | Lighthouse CI budgets                                          | LCP, JS size, CLS                                                          | PR                          |
| Load/stress       | k6                                                             | thresholds in REQUIREMENTS §4                                              | nightly + before release    |
| Chaos/failure     | Testcontainers stop Redis/PG mid-test, mock slow SMS           | degraded modes                                                             | nightly                     |
| Mutation          | Stryker on registration, auth, ranking                         | test quality                                                               | weekly                      |
| Secrets/deps/SAST | gitleaks, OSV-Scanner, CodeQL                                  | supply chain                                                               | PR                          |

## 2. The Last Seat (class × expected) — template for every stateful feature

| #   | Class               | Case                                  | Expected                                                            |
| --- | ------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| 1   | Normal              | 10 taken, Asha registers              | CONFIRMED                                                           |
| 2   | Boundary            | 99 taken, Ravi registers              | CONFIRMED, exactly 100                                              |
| 3   | Edge/negative       | 100 taken, Meera registers            | WAITLISTED position 1                                               |
| 4   | Concurrency         | 99 taken, 50 register together        | exactly 1 CONFIRMED, 49 WAITLISTED, count = 100                     |
| 5   | Failure             | DB down during register               | 503 problem+json, no partial rows, UI shows retry                   |
| 6   | Change (regression) | cancel by confirmed with 5 waitlisted | exactly 1 promoted, order preserved, one notification, one XP award |
| 7   | Idempotency         | same key sent 5× in parallel          | one registration                                                    |
| 8   | Capacity change     | raise 100→105 with 5 waitlisted       | all 5 promoted atomically in order                                  |

## 3. Case matrix by feature

Derived from REQUIREMENTS §5; each row becomes test files named `<module>.<feature>.test.ts` with `// covers: US-…` tags. A CI script (`scripts/verify/coverage-of-stories.ts`) fails if a Must story ID has no tagged test.

## 4. Auth/OTP test matrix (see skills/auth-otp-security for policy values)

expired OTP; reused OTP; wrong OTP ×5 lockout; resend before cooldown (429 + Retry-After); resend limit per hour; parallel verify attempts (only one succeeds); OTP request for unknown number (same response, no enumeration, same timing ±20%); DND number path; malformed/foreign numbers; bot burst from one IP and from many IPs; Turnstile failure; provider timeout → failover; provider slow → alert metric; OTP never in logs (log capture test greps for OTP digits and tokens); refresh reuse → family revoked; concurrent refresh with same token (one wins); password policy; argon2 params; JWT tamper/`alg:none`/expired/wrong audience; role escalation attempts; cookie flags (HttpOnly, Secure, SameSite).

## 5. Multi-tab / live checks (Playwright)

Two browser contexts (student + organizer/faculty) prove: approval appears live; seat meter updates; promotion toast; reconnect after offline replay; SSE fallback to polling when stream blocked; second tab of same user stays consistent (BroadcastChannel).

## 6. Exit criteria per gate

G2: smoke e2e green. G3: all Must tests green, no skipped tests, no flaky (3 consecutive CI passes). G4: k6 thresholds, Lighthouse budget, axe zero serious, zero high/critical vulns, mutation score ≥ 60% on registration and auth, release audit signed.
