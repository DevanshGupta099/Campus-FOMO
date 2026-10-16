---
name: campus-fomo-api-backend
description: Use for Fastify API work in Campus FOMO: routes, validation, Drizzle/Postgres, transactions, caching, SSE, queues, pagination, error format, performance.
---

# API backend skill

**Read first:** `docs/ARCHITECTURE.md`, `packages/contracts`.

1. **Route shape:** `fastify.withTypeProvider<ZodTypeProvider>()`; every route declares `schema: {params, querystring, body, response}` from contracts. Response schemas are enforced (serialisation strips extra fields — prevents leaking columns).
2. **AuthZ:** a `requireRole(...)` and `requireOwnership(resolver)` preHandler. Default-deny: routes must declare `config: { auth: 'public' | roles[] }`; a startup check fails boot if any route lacks it.
3. **Errors:** domain errors extend `AppError(code, status)`; global handler maps to RFC 7807 with `code`, `requestId`; never leak stack or SQL.
4. **DB:** Drizzle + `postgres` driver, pool size by config; all multi-step writes in `db.transaction`. Use `SELECT … FOR UPDATE`, conditional updates, unique constraints for correctness. No N+1: use joins/`inArray`; add EXPLAIN notes in PR for any new list query.
5. **Pagination:** keyset (`(starts_at,id)` cursor, opaque base64). Never offset for feeds.
6. **Search:** `tsvector` column + `pg_trgm` similarity for typos; rank = `ts_rank + similarity`; sanitise query input.
7. **Cache:** Redis, key = `feed:<hash(filters,role)>`, TTL 10 s, single-flight lock to avoid stampede, invalidated by outbox events. ETag/304 on events list and detail.
8. **Idempotency:** `Idempotency-Key` header → `idempotency_keys(key,user_id,request_hash,response)`; same key + different body = 422.
9. **Outbox relay:** worker polls `outbox_events` with `FOR UPDATE SKIP LOCKED`, publishes to Redis channel `events`, marks sent. At-least-once; consumers dedupe by id.
10. **SSE (`/stream`):** authenticated, heartbeat every 15 s, `id:` per event, replay from Redis stream (last 5 min) on `Last-Event-ID`, per-user connection cap (5), backpressure-safe, closes with `retry:` on token expiry. Disable proxy buffering header `X-Accel-Buffering: no`.
11. **Queues:** BullMQ for SMS/email/notifications/reminders; retries with exponential backoff, DLQ, per-queue concurrency, metrics. Request path only enqueues.
12. **Performance rules:** no sync crypto on hot path (argon2 only on auth endpoints, concurrency-limited); JSON via fast-json-stringify (Fastify default); compress; DB statement timeout 5 s; request timeout 10 s; load shedding on event-loop lag > 100 ms.
13. **Observability:** pino with redaction paths (`req.headers.authorization`, `*.otp`, `*.password`, `*.phone`, `*.token`); metrics histogram per route; `/healthz` (process), `/readyz` (db+redis).
14. **Graceful shutdown:** stop accepting, drain SSE, finish jobs, close pools (SIGTERM, 10 s).
15. **Tests with each endpoint:** happy path, validation failure, 401, 403, 404, conflict, idempotency (if mutating), and a contract check.
