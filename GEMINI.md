# Campus FOMO — Agent Rules (v2, solo developer)

Install as an Antigravity workspace rule (Prompt R1 does this and replaces GEMINI.md). Applies to EVERY task.

## Context

Solo developer: Devansh. Branches: `master` (protected, releases only) and `dev` (daily work). Repo layout: `frontend/`, `backend/`, `infra/`, `docs/`, `.github/`, `.agent/`. Identity = Keycloak. Gateway = Apache APISIX. Authorization = permission-based (PBAC) on top of roles (RBAC). Handbook (`docs/reference/CampusFest_Student_Handbook.pdf`) is binding.

## Rules

1. **Think first.** Begin with "Assumptions" (bullets). If an assumption could change the design, ask up to 3 questions and stop.
2. **Log everything.** Before ending any task, append ONE entry to `docs/AI-LOG.md` (format in that file). Never edit or delete old entries. Include failures and AI mistakes (tag `[AI-WRONG]`). A task without a log entry is not finished.
3. **Handbook first.** Requirements follow Story Card format with numbers. Every Must story → acceptance criteria → test with `// covers: <ID>`. Update `docs/HANDBOOK-COMPLIANCE.md` when a stage deliverable changes.
4. **Permissions, not roles, in code.** Backend routes and frontend screens check permissions (`event:approve:dept`), never role names. Roles exist only as bundles of permissions inside Keycloak.
5. **Zero trust.** The gateway validates tokens, the backend validates them again and enforces permissions plus ownership/scope. The UI hiding a button is UX, never security.
6. **Backend is the contract source.** Zod schemas → generated `backend/openapi.yaml` → frontend generates its typed client from it. Frontend never imports backend code. No invented fields.
7. **Atomicity in the database** for seats, waitlist, draws, XP. Never check-then-act in app code.
8. **No secrets or personal data in logs, errors, tests, or AI-LOG.** Phones masked, no tokens, no passwords, no real personal data in seed.
9. **Small diffs, no placeholders.** Change as little as possible; list files and functions changed; no TODO/lorem/hotlinked assets.
10. **Tests with every change**; run the full verify before saying done. Report real command output, never "should pass".
11. **Dangerous actions need my approval:** deleting branches/data/volumes, force-push, dropping DB, changing Keycloak realm in a running environment, installing a package you haven't verified exists on npm/PyPI (check exact name, maintainer, repo).
12. **Prove it.** At the end of each phase, quiz me with 3 questions about code you wrote (handbook house rule 2).
13. **Honesty.** If unsure an API/field exists in the pinned version (Keycloak, APISIX, libraries), look at its docs first and say what you verified.

## Output Contract (end every answer with this)

```
## Output Contract
Files changed: <path — reason>
Commands run + result: <exact command → pass/fail summary>
Acceptance criteria: <ID — MET / NOT MET (why)>
Tests added: <path — what it proves>
Known gaps: <honest list>
AI-WRONG candidates: <things I should double-check>
AI-LOG entry: <path#entry-id written>
```

## Conventions

TypeScript strict. Conventional Commits. UTC in storage, Asia/Kolkata in UI. RFC 7807 errors with stable `code`. Config validated at boot. WCAG 2.2 AA, `prefers-reduced-motion`, every 3D piece has a non-WebGL fallback. Mobile-first responsive (360 px up).
