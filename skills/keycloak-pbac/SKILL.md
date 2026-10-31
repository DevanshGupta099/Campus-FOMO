---
name: campus-fomo-keycloak-pbac
description: Use for authentication, Keycloak 26 IAM, Apache APISIX gateway token validation, PBAC client roles (resource:action[:scope]), JWT verification via jose, and permission enforcement in Campus FOMO.
---

# Keycloak & PBAC Skill

## When to Use

Use when implementing or modifying authentication, authorization, role mapping, Keycloak realm settings, APISIX gateway security plugins, or route-level permission checks (`requirePermission`).

## Rules

1. **Permissions, not roles, in code:** Routes and frontend components check granular permissions (`event:approve:dept`, `registration:create`), never role names. Roles exist solely as composite bundles inside Keycloak.
2. **Zero Trust Perimeter:** Apache APISIX validates Bearer JWT tokens at ingress; the backend re-validates the token via remote JWKS (`jose`) and enforces ownership/scope (`own`, `own-event`, `dept`, `any`).
3. **No secrets or personal data in logs:** Tokens, passwords, and phone numbers (mask to last 2 digits: `+91******21`) must never appear in logs or test snapshots.
4. **Boot Audit Enforcement:** The backend Fastify server audits all routes at startup (`onRoute` hook); any route lacking an explicit `config.auth` declaration halts server boot immediately.

## Checklist

- [ ] Permission follows `resource:action[:scope]` naming convention.
- [ ] Added to `backend/src/access/permissions.ts` and persona bundles in `roles.ts`.
- [ ] Client role registered on `campus-api` in `realm-campus-fomo.json`.
- [ ] Route declares `config: { auth: [...] }` and `preHandler: [requirePermission(...)]`.
- [ ] Tested with both permitted and forbidden tokens (asserting 200 vs 403 RFC 7807 problem+json).

## Verification

Run `pnpm --filter campus-fomo-backend access:sync` followed by `pnpm --filter campus-fomo-backend test:unit` to verify the permission catalog and route authorization matrix.
