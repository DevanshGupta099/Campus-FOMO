# Campus FOMO — Backend

> High-performance Fastify 4 + TypeScript REST and Real-Time Event API for Campus FOMO.

## Architecture

- **Stack**: Node.js 20, Fastify 4, Zod 3, Drizzle ORM, `jose`, PostgreSQL 16, Redis 7.
- **Contract Source of Truth**: Zod schemas in `src/contracts/schemas/` generate the committed `openapi.yaml` via `pnpm generate:openapi`.
- **Zero-Trust & PBAC**:
  - Permissions format: `resource:action[:scope]` (e.g. `event:approve:dept`, `registration:create`).
  - Roles exist only as bundles of permissions inside Keycloak.
  - JWT tokens validated via `jose` remote JWKS from Keycloak.
  - Backend `requirePermission()` validates tokens and checks resource ownership.
- **Database Atomicity**:
  - Seat booking enforced via SQL row-level locks and constraint `confirmed_count <= capacity`.
  - Waitlist promotion handled with `SELECT ... FOR UPDATE SKIP LOCKED`.
  - Cryptographic commit-reveal lucky draws.
- **SSE Stream**:
  - Unbuffered Server-Sent Events on `/api/v1/stream` with 15-second heartbeat and `Last-Event-ID` resume.

## Commands

```bash
# Start backend in watch mode on port 3001
pnpm dev

# Generate committed openapi.yaml specification
pnpm generate:openapi

# Synchronize PBAC permission catalog to Keycloak realm
pnpm access:sync

# Seed database with venues, clubs, 80+ events, and cafe sponsor
pnpm seed:reset

# Run unit, contract, and integration tests
pnpm test
```
