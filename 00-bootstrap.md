# 00 — Bootstrap (run ONCE, on `master`, by the AI Driver with the Product Thinker beside them)

Setup in AI Studio: System Instructions = contents of `GEMINI.md`. Attach `PLAYBOOK.md`, `docs/*`, and `skills/*`.
Gemini's answer to each step is committed to `master` before anyone branches. Do steps in order; each ends with the Output Contract.

## Step A — Requirements discovery (Gate: Phase 0)

```
You are the product + engineering team for "Campus FOMO" (see attached PLAYBOOK.md and docs/REQUIREMENTS.md).
Do NOT write code. Task: stress-test and complete the requirements.
1. List every assumption in docs/REQUIREMENTS.md ([A1]-[A5] and any you find).
2. Ask me up to 5 clarifying questions that would most change the design. Stop and wait.
After I answer:
3. Produce the final REQUIREMENTS.md: for each persona, add 3 more user stories I missed, with Given/When/Then acceptance criteria and a number wherever possible.
4. Add a "hidden requirements" section (things like ₹2000-note-must-fit-ATMs: constraints nobody said). Think about: exam weeks, event clashes with classes, rain/venue changes, duplicate events by two clubs, spam organizers, student safety, data privacy, low-end phones, college Wi-Fi blocking SSE/WebSockets.
5. Produce the MoSCoW table and flag any MUST that will not fit; propose cuts.
6. Write 5 Story Cards in the handbook template for the 5 riskiest stories.
End with the Output Contract.
```

## Step B — Monorepo skeleton + CI (Gate G1 part 1)

```
Read GEMINI.md, skills/architecture, skills/git-ci. Create the monorepo skeleton for Campus FOMO with NO feature code:
- pnpm workspaces + Turborepo; apps/web (Vite+React+TS+Tailwind), apps/api (Fastify+TS), packages/contracts (Zod + OpenAPI generation), packages/ui (tokens only), tests/, e2e/, load/, scripts/verify.
- docker-compose.yml (postgres 16, redis 7, mailpit), .env.example, .nvmrc, .editorconfig.
- Scripts: dev, build, lint, typecheck, depcruise, test:unit, test:integration, test:e2e, verify, seed, seed:reset.
- Husky + lint-staged + commitlint + gitleaks pre-commit.
- .github: ci.yml with the jobs described in skills/git-ci and a final `ci-gate` job, nightly.yml (stubs that run real placeholder commands, not echo), pull_request_template.md, CODEOWNERS (from PLAYBOOK §3), dependabot.yml, SECURITY.md.
- A health endpoint, one contract (GET /healthz) wired through contracts → api → web mock to prove the pipeline end to end, with one test at each layer.
Everything must pass `pnpm verify` and the CI jobs must actually run. List the exact commands to confirm.
```

## Step C — Contracts (the shared language)

```
Read docs/ARCHITECTURE.md §3-§4 and docs/REQUIREMENTS.md. Write packages/contracts completely: Zod schemas for every endpoint (request, response, errors), enums (roles, event status, registration status, categories), SSE event payloads (versioned), and generate openapi.yaml. Also generate MSW handlers with realistic mock data generators for the web app (VITE_API_MODE=mock) and a typed client SDK (fetch-based) with automatic access-token refresh. Add contract tests: every schema parses its own example; every endpoint in ARCHITECTURE has a contract. No backend logic yet.
```

## Step D — Branch setup message

```
Print the exact git commands to: commit this skeleton to master, push, create the four branches (feat/product-experience, feat/immersive-frontend, feat/backend-core, feat/quality-devops) from master, and push them. Then write docs/STATUS.md for the start of Phase 2 and list, per person, which prompt file to run next.
```

After Step D: **G1 reached.** Humans do the repo-settings tasks in PLAYBOOK §7.
