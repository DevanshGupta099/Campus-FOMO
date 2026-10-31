---
name: campus-fomo-git-ci
description: Use for Git workflow, branch management, CI pipelines, pre-push hooks, and AI-LOG compliance in Campus FOMO.
---

# Git and CI Skill (v2 Solo Developer)

## When to Use

Use when managing branches, setting up pre-commit or pre-push hooks, modifying GitHub Actions workflows, or validating CI pipelines.

## Branches

- `master` (protected, release milestones only).
- `dev` (active daily development branch for solo developer Devansh).
- Feature branches `feat/*` are merged into `dev`. Obsolete 4-person role branches are deprecated.

## Hooks & Local Verification

- `pre-commit`: lint-staged (eslint, prettier).
- `commit-msg`: commitlint (Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- `pre-push`: `scripts/check-ai-log.mjs` verifying that `docs/AI-LOG.md` has an append-only entry whenever application code is modified.

## Verification Pipeline (`pnpm verify`)

Executes sequentially:

1. `check-ai-log.mjs` — AI log append-only compliance check.
2. `Backend Typecheck` (`tsc --noEmit`).
3. `Frontend Typecheck` (`tsc --noEmit`).
4. `Backend Unit & Contract Tests` (Vitest).
5. `Frontend Unit Tests` (Vitest).
6. `OpenAPI Specification Generation` (`tsx scripts/generate-openapi.ts`).
7. `Backend Build` (`tsc`).
8. `Frontend Build` (`vite build`).

## GitHub Actions (`.github/workflows/ci.yml`)

- Single required check: `ci-gate`.
- Path filtering triggers jobs only for touched projects (`frontend/**`, `backend/**`, `infra/**`).
- Secrets scan and license audit executed automatically.

## Verification

Run `pnpm verify` locally before pushing to `dev` or opening a pull request to `master`.
