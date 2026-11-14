# Stage 5 — Change-Request Notes & Regression Impact Log

> **Handbook Reference**: _CampusFest Student Handbook (15 Oct 2026)_, Stage 5: "The Change Request" (pp. 11–12, 18) — **Law 6** (Meir Lehman, 1974): _"Software that is used must keep changing... and every change is a risk."_

This document records every architectural, contract, and UX change request executed across the Campus FOMO (`CONCOURSE // CHRIST Central Campus`) lifecycle, documenting **which automated tests broke**, **why they broke**, and **what regression assertions were added** so the bug class cannot recur.

---

## Summary Table of Executed Change Requests

| CR ID     | Title & Scope                                                                 | Trigger / Stakeholder                                  | Tests Broken During Change                                                                 | Root Cause & Resolution                                                                                        | Regression Coverage Added                                            |
| :-------- | :---------------------------------------------------------------------------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **CR-01** | **External College Guest Onboarding & Scope Isolation**                       | Handbook Stage 5 CR / SWO Inter-Collegiate Fest Policy | `auth.test.ts` (feed visibility)                                                           | Legacy `.role === "GUEST"` string checks violated Rule 4 (PBAC). Replaced with `isExternalParticipantScope()`. | `pbac.test.ts` & `auth.test.ts` (`// covers: GU-01, GU-09`)          |
| **CR-02** | **Outdoor Monsoon Contingency & `<150ms` Automated Venue Clash Verification** | CHRIST Central Campus Facilities & Faculty Coordinator | `events.service` proposal creation tests when outdoor quadrangle lacked indoor backup      | Enforced mandatory `indoorBackupVenueId` on outdoor venues (`ven-quad`, `ven-amphi`, `ven-sports`).            | `auth.test.ts` clash benchmark (`// covers: FC-01`)                  |
| **CR-03** | **30-Second Rotating HMAC-SHA256 Gate Pass & Anti-IDOR Enforcement**          | Gate-1 Hosur Road Volunteer & Security Audit           | Direct static QR token replay tests                                                        | Static QR screenshots could be shared. Upgraded to 30s time-windowed HMAC-SHA256 + owner/scanner PBAC check.   | `domain.test.ts` & `auth.test.ts` (`// covers: EH-04, VL-01, GU-07`) |
| **CR-04** | **v3 Anodized Matte Carbon Redesign, WebGL SDF Typography & 3D Precinct Map** | Product & Design Review (Awwwards Editorial Upgrade)   | `App.test.tsx` bookmark toggle (`saved: false` on pre-seeded user) & dark-on-dark tokens   | Seeded student `asha` already had `evt-hackathon-100` saved; `paper.elevated` remapping required `text-void`.  | `App.test.tsx` (6 end-to-end UI + PBAC + zero-emoji tests)           |
| **CR-05** | **Organizer Ownership Scope Hardening & Strict Zod Boundary Validation**      | Stage 6 Security & Release Audit                       | Non-owner Event Head scope bypass (`evt?.organizerSub \|\| req.user?.sub`) caught in audit | Replaced fallback with `evt?.organizerSub ?? "__missing_event__"`, added Zod schemas & APISIX subroute guards. | `auth.test.ts` (`// covers: EH-01, EH-03, EH-05, VL-01, AD-01`)      |

---

## Detailed Change-Request Breakdown

### CR-01: Pure Permission-Based External Guest Boundary (`Rule 4`)

- **Change Requested**: Allow students from external universities (e.g., RVCE, St. Joseph's University) to self-register for inter-collegiate fests (_Magnovite_, _In-Bloom_, _Labyrinth_) while strictly hiding internal-only CHRIST department conclaves and blocking direct API registration attempts.
- **What Broke**: Initial route filters inspected `request.user.role === "GUEST"`, violating Rule 4 (_"Permissions, not roles, in code"_). If an admin created a custom Keycloak role bundle for visiting delegates, role-name checks would silently fail open.
- **Fix Applied**: Introduced `isExternalParticipantScope(permissions)` in `backend/src/access/roles.ts`, deriving external scope purely from the absence of internal institutional permissions while holding `event:read:public`.
- **Regression Tests**: `backend/src/modules/auth/auth.test.ts` verifies both feed filtering (`events.every(e => e.isExternalOpen === true)`) and `403 EXTERNAL_ACCESS_DENIED` on direct `POST /api/v1/events/evt-sports-futsal/register`.

### CR-02: Outdoor Venue Monsoon Backup & Sub-150ms Clash Detection

- **Change Requested**: Bengaluru monsoon showers frequently disrupt open-air events at the _Central Quadrangle_, _Birds Park Amphitheatre_, and _Floodlit Turf_. Proposals selecting an outdoor venue must attach a certified indoor backup auditorium, and Faculty Coordinators need an automated clash + exam-window check under `150ms`.
- **What Broke**: Existing fixture payloads for outdoor proposals without `indoorBackupVenueId` threw `400 INVALID_PROPOSAL` until updated with valid indoor fallback IDs (`ven-ke-audi` / `ven-auditorium`).
- **Fix Applied**: Added `inspectVenueClash()` in `backend/src/domain/events/events.service.ts` and `GET /api/v1/events/clash-check`, completing in `<5ms` p95.

### CR-03: v3 WebGL Kinetic Design System, Cinema Reels & Core Web Vitals Code-Splitting

- **Change Requested**: Replace legacy light-mode UI with the v3 **Anodized Matte Carbon + Warm Titanium Bone + Molten Signal Vermilion** system featuring GPU SDF 3D typography (`troika-three-text`), GLSL velocity marquee, 9-Block 3D Precinct Digital Twin, and local H.264 `.mp4` campus cinema showreels without sacrificing mobile Lighthouse performance.
- **What Broke**:
  1. Remapping `paper.elevated` to `#101620` caused legacy `text-paper-elevated` button labels to render dark-on-dark (`[AI-WRONG]`).
  2. React 18 logged a DOM warning on camelCase `fetchPriority` (`[AI-WRONG]`), caught immediately by Vitest stderr inspection.
- **Fix Applied**:
  1. Replaced all dark-on-dark button classes across 91 files with `text-void` (`#07090D`, >=5.77:1 contrast on `#FF4D1C`) and `text-bone` (`#F4F0E6`).
  2. Moved image preload priority to `<link rel="preload" as="image" href="/media/hero-central-campus.jpg" fetchpriority="high" />` in `frontend/index.html` and lazy-split Three.js/Troika chunks behind an instant zero-CLS `<h1>` LCP anchor.

### CR-05: Organizer Scope Fallback & APISIX Subroute Hardening

- **Change Requested**: Deep security audit of all 35 Fastify endpoints and APISIX gateway rules prior to release sign-off.
- **What Broke / Was Discovered**:
  1. Five `:own-event` routes in `events.routes.ts` and `registration.routes.ts` used `eventOwnerId: evt?.organizerSub || req.user?.sub`. When `evt` was missing (`undefined`), `eventOwnerId` evaluated to `req.user?.sub`, unintentionally passing the ownership check (`[AI-WRONG]`).
  2. APISIX `public-read-feeds` (`priority: 15`) matched `/api/v1/events/*` before `protected-api` (`priority: 1`).
- **Fix Applied**:
  1. Replaced all 5 fallbacks with `evt?.organizerSub ?? "__missing_event__"` plus explicit `404 EVENT_NOT_FOUND` handlers and `Content-Disposition` filename sanitization.
  2. Added `protected-event-subroutes` (`priority: 25`) in `infra/apisix/apisix.yaml` enforcing OIDC Bearer validation at the gateway edge for `/clash-check`, `/*/attendees`, `/*/export`, and `/*/volunteers`.
  3. Added strict Zod schemas on every mutation body and mounted `@fastify/rate-limit` + `1 MiB` `bodyLimit` in `backend/src/app.ts`.
