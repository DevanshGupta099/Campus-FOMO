# 03 — Engineer (branch `feat/backend-core`)

Attach skills: `api-backend`, `auth-otp-security`, `architecture`, `testing`, plus `docs/ARCHITECTURE.md`. You own `apps/api` core, DB migrations, contracts changes, docker-compose.

## Prompt A — Foundation: config, DB, migrations, auth skeleton (Phase 2)

```
Read GEMINI.md and the attached skills. List assumptions; ask up to 3 questions; wait.
Then implement: validated config; Drizzle schema + migration 0001 for ALL tables in ARCHITECTURE §3 (with constraints, CHECK confirmed_count <= capacity, UNIQUE keys, indexes incl. GIN tsvector + pg_trgm); db module with transaction helper and statement timeouts; Fastify app factory (helmet, CORS allow-list, compression, request IDs, problem+json handler, default-deny auth config check, pino redaction); health/ready/metrics; Redis client; outbox table + relay worker; module registration pattern with dependency-cruiser rules. Integration tests with Testcontainers. Seed hook so P1's seed can run.
```

## Prompt B — Auth with JWT, refresh rotation, RBAC (Phase 2)

```
Implement modules/auth + modules/users per skills/auth-otp-security: signup, login, refresh rotation with family reuse detection, logout, logout-all, argon2id, JWT access, cookie flags, RBAC matrix file with a test that iterates every route x every role. Include password policy and breached-password check with timeout fallback. Add the authZ negative test suite (IDOR, role escalation, JWT tamper, alg none, expired, wrong audience, concurrent refresh). Contract tests green. Nothing logs tokens or passwords (add the log-capture test).
```

## Prompt C — OTP with providers, limits, monitoring (Phase 3)

```
Implement OTP per the policy table in skills/auth-otp-security: challenge lifecycle, HMAC storage, expiry, attempts, progressive resend cooldown, hourly/daily caps, per-IP and per-device limits with Redis Lua scripts (atomic), Turnstile verification, no-enumeration responses with timing padding, SmsProvider/EmailProvider ports with adapters (Twilio Verify, one Indian gateway adapter, Dev inbox, email via SMTP/Resend), delivery-receipt webhook with signature + replay protection, DND handling and email fallback, provider circuit breaker + automatic failover, latency/success histograms, /admin/ops health data, wrong-number recovery flow, spend guard. Write docs/SMS-COSTS.md as a short table of assumptions (clearly marked "verify current pricing") and the budget guard config. Tests: every row of the OTP matrix in docs/TEST-PLAN.md §4, using a controllable fake provider (slow, failing, duplicate DLR). Do not log codes; prove it.
```

## Prompt D — Events, approval, registration (the Last Seat) (Phase 3)

```
Implement modules/events (CRUD with optimistic `version`, status machine, venue-clash detection with exclusive end boundary, edit rules that re-trigger approval, search with tsvector + trigram, keyset pagination, ETag), modules/approvals (queue, approve/reject with reason, audit), modules/registrations per ARCHITECTURE §3: conditional UPDATE inside a transaction, WAITLIST with contiguous positions, cancel promotes first waitlisted with FOR UPDATE SKIP LOCKED, capacity increase promotes in order, capacity decrease below confirmed is rejected, Idempotency-Key support, clash warning data, deadline rules. Every state change writes an outbox event in the same transaction. Tests: the 8-row Last Seat table in TEST-PLAN §2, fast-check model test (random register/cancel/capacity sequences keep invariants), 1000-run concurrency stress script, DB-down failure test.
```

## Prompt E — Realtime, notifications, check-in (Phase 3)

```
Implement modules/realtime (/stream SSE: auth, heartbeat, per-user cap, Redis-backed replay with Last-Event-ID, expiry handling, X-Accel-Buffering off), modules/notifications (in-app + email via queue, dedupe by event id, preferences, batching), QR check-in (rotating 30 s signed token, per-event, replay-safe, idempotent), attendee CSV export without phone numbers. Tests: reconnect replay, 200 concurrent SSE connections, duplicate event delivery ignored, expired and cross-event QR rejected.
```

## Prompt F — Performance and hardening (Phase 4)

```
Profile the API under the k6 scenarios in /load (coordinate with P4). Find the top 5 bottlenecks with evidence (EXPLAIN ANALYZE, clinic/0x flamegraph summary, pg_stat_statements). Fix: indexes, query shapes, cache hit rates, pool sizes, event-loop blocking, argon2 concurrency limit. Add load shedding and graceful shutdown. Report before/after p50/p95/p99 and error rates against REQUIREMENTS §4. Never trade correctness for speed: re-run the Last Seat stress after every change.
```
