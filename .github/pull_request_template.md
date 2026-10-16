## PR Title Convention

<!-- Ensure PR title follows Conventional Commits: feat(scope): message, fix(scope): message, etc. -->

## Changes Description

<!-- Concise summary of what was changed and why -->

## PR Checklist

- [ ] Contract changed? (If yes, updated `packages/contracts`, ran OpenAPI generation, updated mocks and client SDK)
- [ ] Database migration added? (If yes, append-only, verified against empty DB)
- [ ] Automated tests added/updated (`// covers: US-...` tagged)
- [ ] Passes `pnpm verify` locally (lint, typecheck, depcruise, unit, contract)
- [ ] No secrets, tokens, OTPs, or PII in logs/test fixtures
- [ ] `docs/STATUS.md` updated with recent progress
- [ ] UI changes include responsive and dark/light screenshots or videos (if applicable)

## Directory Ownership

<!-- Verify you touched files within your role's directory or tagged the owner from CODEOWNERS -->

- [ ] Touched only owned files OR requested review from respective CODEOWNERS
