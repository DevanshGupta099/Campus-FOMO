---
name: campus-fomo-lucky-draw
description: Use for implementing or reviewing commit-reveal lucky draw campaigns, entry anti-replay protections, deterministic winner derivation, public verification proofs, and sponsor PII isolation in Campus FOMO.
---

# Lucky Draw Skill

## When to Use

Use when implementing promotional draw campaigns, mini-game entry workflows, cryptographic winner selection, or public verification endpoints.

## Rules

1. **Commit-Reveal Fair Protocol:** At campaign creation, a 256-bit secret seed is generated and its SHA-256 hash (`seedHash`) is published immediately. The seed is revealed only upon draw execution.
2. **Deterministic Derivation:** Entrant user IDs are sorted lexicographically. Winner index is strictly computed as `BigInt(sha256(seed + count)) % count`.
3. **No Pay-to-Win:** Game scores or participation frequency never alter winning probabilities. Exactly one entry per user per campaign.
4. **Sponsor Privacy Isolation:** Sponsors see only the winner's first name and department (`Asha (Computer Science)`). Student phone numbers and emails are never exposed.

## Checklist

- [ ] Unique constraint enforced on `(campaign_id, user_id)` and `(campaign_id, session_id)`.
- [ ] Session replay rejected.
- [ ] Public verify endpoint returns `{ seed, seedHash, totalEntries, winnerIndex, formula }`.
- [ ] Tested with parallel entry requests asserting exactly 1 succeeds.

## Verification

Run `pnpm --filter campus-fomo-backend test:unit` to verify the commit-reveal algorithm and concurrency invariants.
