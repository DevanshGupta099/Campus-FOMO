---
name: campus-fomo-architecture
description: Use when creating or modifying modules, services, database schemas, contracts, or cross-system boundaries in Campus FOMO. Enforces zero-trust PBAC, APISIX gateway, Keycloak IAM, and contract generation.
---

# Architecture Skill (v2 Solo Developer)

## When to Use

Use when adding or modifying backend domain modules, routes, contracts, database models, or external infrastructure adapters.

## Rules

1. **Contract Source of Truth:** Backend Zod schemas in `backend/src/contracts/schemas/` generate `backend/openapi.yaml`. The frontend generates its typed client directly from this specification. No shared code or cross-package imports.
2. **Zero-Trust Perimeter:** Ingress traffic passes through Apache APISIX (port 9080) for rate limiting, CORS, and OpenID Connect validation. The Fastify backend (port 3001) re-validates tokens via Keycloak JWKS and enforces granular PBAC permissions.
3. **Database-Level Atomicity:** Seat counting, waitlist promotion, and lucky draw selections must be atomic at the database level (`confirmed_count <= capacity`, `FOR UPDATE SKIP LOCKED`). Never check-then-act in application memory.
4. **Isolated Modules:** Backend modules expose a clean service interface. Direct joins into another module's internal tables are forbidden.
5. **Config Validation:** Environment variables are strictly validated via Zod at startup in `config.ts`; `process.env` is never accessed directly in application code.

## Checklist

- [ ] Zod schema defined in `backend/src/contracts/schemas/`.
- [ ] Run `pnpm generate:openapi` to regenerate `backend/openapi.yaml`.
- [ ] Frontend typed client updated in `frontend/src/api/`.
- [ ] Database schema registered in `backend/src/domain/db/schema.ts`.
- [ ] Route declares explicit `config: { auth: [...] }`.

## Verification

Run `pnpm verify` to execute typechecks, contract validations, and unit tests across frontend and backend.
