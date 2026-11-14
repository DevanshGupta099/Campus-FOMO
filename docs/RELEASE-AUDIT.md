# Stage 6 — Signed Release Audit & Security Verification

> **Handbook Reference**: _CampusFest Student Handbook (15 Oct 2026)_, Stage 6: "Release Audit & Sign-off" (pp. 13–14, 18) — **Law 7**: _"You ship everything you import."_ & **Law 8**: _"You can delegate the work, never the responsibility."_

- **Release Candidate**: `v3.1.0-concourse` (`dev` branch)
- **Target Institution**: CHRIST (Deemed to be University) — Central Campus, Hosur Road, Bengaluru (`560029`)
- **Audit Date**: `2026-11-14`
- **Lead Engineer & Sign-off Owner**: Devansh Gupta (Solo Developer — Product, Architecture, Engineering & QA)

---

## 1. Zero-Trust & Application Security Checklist

|  #  | Control Domain                        | Verification Method                                                                                                   |  Result  |
| :-: | :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------- | :------: |
|  1  | **Boot-Time Auth Route Enforcement**  | `authPlugin` `onRoute` hook in `backend/src/auth/middleware.ts` halts boot if any route omits `config.auth`.          | **PASS** |
|  2  | **Pure PBAC (Zero Role-Name Checks)** | Codebase scan across `backend/src` and `frontend/src` confirms `0` `.role ===` authorization branches.                | **PASS** |
|  3  | **Organizer Ownership Isolation**     | `:own-event` & `:own` resolvers enforce `evt?.organizerSub ?? "__missing_event__"`; verified in `auth.test.ts`.       | **PASS** |
|  4  | **Gateway Edge OIDC Protection**      | `infra/apisix/apisix.yaml` enforces `priority: 25` OIDC Bearer check on `/clash-check`, `/attendees`, `/export`.      | **PASS** |
|  5  | **Strict Zod Input Validation**       | All mutation endpoints (`auth`, `me`, `events`, `registration`, `checkin`, `luckydraw`, `rbac`) validate via Zod.     | **PASS** |
|  6  | **Rate Limiting & Payload Cap**       | `@fastify/rate-limit` (`240 req/min` per IP, RFC 7807 `429`) + `bodyLimit: 1_048_576` (1 MiB) active in `app.ts`.     | **PASS** |
|  7  | **HTTP Header & Error Hardening**     | `@fastify/helmet` active; `Content-Disposition` sanitized (`[^a-zA-Z0-9_-]`); `5xx` details redacted in `production`. | **PASS** |
|  8  | **Anti-Screenshot Gate QR Security**  | Per-ticket cryptographic secret + 30-second rotating HMAC-SHA256 signature + anti-IDOR owner check on `/token/:id`.   | **PASS** |
|  9  | **Commit-Reveal Lucky Draw Proof**    | `seedSecret` stripped prior to draw; SHA-256 commitment publicly verifiable via `/luckydraw/campaigns/:id/verify`.    | **PASS** |
| 10  | **Immediate JWT `jti` Revocation**    | `POST /api/v1/auth/logout` & `/logout-all` revoke `jti` / subject tokens immediately (`401` on replay).               | **PASS** |

---

## 2. PII Minimization & Secret Hygiene Audit (`Rule 8`)

| Check                                                       | Target Files Scanned                                                   | Finding / Status                                                                                    |
| :---------------------------------------------------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Phone Number Masking (`+91******XX`)**                    | `auth/service.ts`, `me/routes.ts`, `registration.routes.ts`            | **PASS** — E.164 phones masked in `/me`, `/auth/login`, `/register`, `/export`.                     |
| **Gate Scanner Zero-PII Exposure**                          | `checkin.service.ts`, `ScannerView.tsx`                                | **PASS** — Displays attendee first name & admission status only.                                    |
| **Sponsor Zero-PII Isolation**                              | `sponsors.routes.ts`, `SponsorView.tsx`                                | **PASS** — Aggregated impressions, CTR, and voucher counts only; zero student PII.                  |
| **Public Leaderboard Identity Redaction**                   | `events.service.ts` (`getCampusLeaderboard`)                           | **PASS** — Abbreviated initials (`Asha K.`) and department aggregates only.                         |
| **Plaintext Passwords / API Keys / Real PII in Repository** | `README.md`, `docs/*.md`, `backend/src/**`, `frontend/src/**`, `.env*` | **PASS** — `.env` gitignored; demo password scrubbed from `README.md`; zero secrets in `AI-LOG.md`. |
| **Logger Header Redaction**                                 | `backend/src/app.ts`                                                   | **PASS** — Pino logger redacts `req.headers.authorization` & `req.headers.cookie`.                  |

---

## 3. Dependency Supply-Chain & Licence Audit (`Law 7`)

### 3.1 Supply-Chain & Override Status (`pnpm v12.6.0`)

- **Lockfile Verification**: `pnpm install --frozen-lockfile` verifies **631 lockfile entries** against pnpm v12 supply-chain integrity policies (`✓ Lockfile passes supply-chain policies`).
- **Patched Transitive Advisories**: Applied `pnpm-workspace.yaml` overrides upgrading `fast-uri` (`>=2.4.8` / `>=3.1.9`) to remediate URI parsing advisories without breaking Fastify 4's AJV validator chain.
- **Documented Major-Epoch Advisory Mitigations**: Remaining `pnpm audit` notices pertain to major-version boundaries (`fastify@4 -> 5`, `zod@3 -> 4`, `vite@5 -> 6`, `vitest@2 -> 4`, `react-router@6 -> 7`, `drizzle-orm@0.33 -> 0.45`):
  - `vite`, `esbuild`, `vitest`, and `tinypool` are strictly **build/test-time devDependencies** and are never deployed in the production runtime container.
  - `fastify@4.29.1` sits behind **Apache APISIX 3.11** reverse-proxy normalization, `1 MiB` `bodyLimit`, `@fastify/helmet`, and Zod schema parsing prior to business logic execution.

### 3.2 Direct Production Dependency Licence Matrix

All direct runtime dependencies across `backend/package.json` and `frontend/package.json` use permissive OSI-approved licences (**MIT**, **Apache-2.0**, **ISC**) compatible with academic and commercial deployment:

| Workspace  | Package(s)                                                                                                              | Licence       |  Status  |
| :--------- | :---------------------------------------------------------------------------------------------------------------------- | :------------ | :------: |
| `backend`  | `fastify`, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `jose`, `zod`, `yaml`, `dotenv`, `fastify-plugin` | MIT / ISC     | **PASS** |
| `backend`  | `drizzle-orm`                                                                                                           | Apache-2.0    | **PASS** |
| `backend`  | `pg`, `ioredis`                                                                                                         | MIT           | **PASS** |
| `frontend` | `react`, `react-dom`, `react-router-dom`, `lucide-react`, `three`, `troika-three-text`, `framer-motion`, `lenis`        | MIT           | **PASS** |
| `frontend` | `@fontsource-variable/{syne,space-grotesk,outfit,jetbrains-mono}`, `@fontsource/chakra-petch`                           | OFL-1.1 / MIT | **PASS** |

---

## 4. Automated Gate Verification Summary

| Gate Script / Suite                | Result                                                                                |
| :--------------------------------- | :------------------------------------------------------------------------------------ |
| `node scripts/check-ai-log.mjs`    | **PASS** — Append-only `docs/AI-LOG.md` integrity verified against git history.       |
| `pnpm generate:openapi`            | **PASS** — `backend/openapi.yaml` synchronized with Zod contract registry.            |
| `pnpm typecheck`                   | **PASS** — `tsc --noEmit` strict mode passes across `backend` and `frontend`.         |
| `pnpm test:unit` / `test:contract` | **PASS** — **46/46** backend tests + **6/6** frontend tests + **1/1** pipeline test.  |
| `pnpm build`                       | **PASS** — Backend ESM dist + Vite code-split frontend bundle (`96.6 kB` gzip entry). |

---

## 5. Release Sign-off Declaration

> _"I have reviewed the architecture, PBAC permission boundaries, concurrency invariants, dependency supply chain, PII redaction controls, and automated verification outputs. Every route enforces explicit authentication and permission scopes, and every Must story is backed by passing automated tests."_

- **Signed**: **Devansh Gupta** — Solo Engineer (`master` / `dev` maintainer)
- **Status**: **APPROVED FOR RELEASE GATE SIGN-OFF**
