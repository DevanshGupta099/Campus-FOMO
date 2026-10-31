---
name: campus-fomo-dynamic-ui
description: Use for frontend UI screens, dynamic permission-based navigation (/me/navigation), responsive mobile-first layouts (360px+), Server-Sent Events (SSE) live updates, and design system tokens in Campus FOMO.
---

# Dynamic UI Skill

## When to Use

Use when implementing frontend screens, navigation menus, event cards, seat meters, QR ticket displays, or real-time SSE event consumption.

## Rules

1. **Dynamic Navigation:** The navigation drawer/bar is dynamically populated from `GET /api/v1/me/navigation`. The UI never hardcodes persona tabs.
2. **UX vs. Security:** Hiding a button or screen in the UI is purely user experience, never security. The backend always independently enforces permissions.
3. **Accessibility First:** WCAG 2.2 AA compliant. Every interactive element keyboard-reachable; `prefers-reduced-motion` strictly honored.
4. **Design Tokens:** Always import design tokens from `src/tokens.ts` (ink night, royal blue, gold accent, ember urgency, mint confirmation). No ad-hoc hex values.

## Checklist

- [ ] Screen registered in `backend/src/access/screens.ts` with required permissions and section.
- [ ] Responsive layout verified at 360 px mobile viewport width.
- [ ] Live data (seat availability, waitlist badge) updates via SSE stream or polling fallback.
- [ ] Unit test added in `frontend/src/` asserting correct rendering.

## Verification

Run `pnpm --filter campus-fomo-frontend test:unit` and `pnpm --filter campus-fomo-frontend build`.
