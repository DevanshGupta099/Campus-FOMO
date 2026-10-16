---
name: campus-fomo-git-ci
description: Use for Git workflow, GitHub Actions, branch protection config, hooks, PR templates, CODEOWNERS and release tagging in Campus FOMO.
---

# Git and CI skill

## Branches

`master` (protected) ← PRs from `feat/product-experience`, `feat/immersive-frontend`, `feat/backend-core`, `feat/quality-devops`. Hotfix: `fix/<short>` from master, PR back.

## Hooks (Husky, fast only)

pre-commit: lint-staged (eslint --fix, prettier), gitleaks protect on staged; commit-msg: commitlint (Conventional Commits); pre-push: `pnpm typecheck && pnpm test:unit:changed`.

## `pnpm verify` (same as CI minus services)

`lint → typecheck → depcruise → unit → contract → build → size-limit`.

## GitHub Actions (`.github/workflows/`)

- `ci.yml` on PR and push: jobs run in parallel with Turborepo cache: `static` (lint, tsc, depcruise, commitlint PR title) · `unit` (Vitest + coverage thresholds) · `integration` (services: postgres, redis; Testcontainers or service containers) · `contract` (OpenAPI regenerate-and-diff, Schemathesis) · `e2e-smoke` (Playwright, 3 shards) · `a11y` · `lighthouse` (budgets) · `security` (gitleaks, OSV-Scanner, CodeQL) · `build` (web + api Docker build). Final job `ci-gate` needs all, is the **single required check**.
- `nightly.yml`: full e2e, k6 load, chaos, ZAP baseline, mutation (weekly), dependency review.
- `release.yml` on tag `v*`: build, test, publish artifacts/Docker image, create GitHub Release notes from Conventional Commits.
- `pr-hygiene.yml`: labels by path, size warning (> 800 lines), "contract-change" and "migration" detectors requiring extra reviewers, forbids committed `.env`, `.only`, `console.log`, `TODO`.
- Concurrency groups cancel superseded runs; pin actions by SHA; least-privilege `permissions:`; no secrets on forks.

## Repo files

`CODEOWNERS` (paths from PLAYBOOK §3), `.github/pull_request_template.md` (checklist: tests, contract, migration, screenshots, docs/STATUS), `dependabot.yml` (weekly, grouped), `SECURITY.md`, `.editorconfig`, `.nvmrc`, `.env.example`, `docker-compose.yml` (postgres, redis, mailpit for dev email), `Makefile`/pnpm scripts: `dev`, `seed`, `seed:reset`, `verify`, `test:*`, `load:*`.

## Branch protection (applied by a human; print exact settings)

Require PR; 1 approving review; dismiss stale approvals; require `ci-gate`; require branches up to date; require conversation resolution; no force-push; no deletion; include admins.

## Migrations in CI

Spin up empty DB → apply all migrations → run `drizzle-kit check` (no drift) → apply seed → run seed-verification test.
