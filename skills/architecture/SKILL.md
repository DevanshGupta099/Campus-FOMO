---
name: campus-fomo-architecture
description: Use when creating or changing modules, folders, contracts, events or cross-module calls in Campus FOMO. Enforces loose coupling, contract-first, outbox events and ports/adapters.
---

# Architecture skill

1. **Read first:** `docs/ARCHITECTURE.md`, `packages/contracts`.
2. **New backend module checklist:** folder `modules/<name>/` with `index.ts` (only exported surface), `routes.ts`, `service.ts`, `repo.ts`, `schema.ts` (Drizzle), `events.ts`, tests. Register in `app.ts` via `registerModule()`. Add a dependency-cruiser rule so other modules can import only `modules/<name>/index.ts`.
3. **Cross-module:** call the other module's public interface for queries; publish a domain event (via outbox) for reactions. Never join across another module's tables in your repo; use its interface or a read model.
4. **External things = ports.** Define `interface SmsProvider { send(msg): Promise<SendResult>; health(): Health }` in the module, adapters in `adapters/`. Choose adapter by config. A fake adapter must exist for tests.
5. **Contract change procedure:** edit `packages/contracts` → regenerate OpenAPI → update backend handler → update MSW mock → update web hooks → bump contract test. All in one PR labelled `contract-change`.
6. **Events:** name `domain.noun.verb` (`registration.confirmed`, `registration.waitlist_promoted`, `event.approved`). Payload versioned (`v: 1`). Consumers idempotent (use event id).
7. **Config:** one `config.ts` with Zod-validated env; no `process.env` elsewhere.
8. **Smells to refuse:** shared mutable singletons, god services, "utils" dumping ground, business logic in routes or React components, importing `apps/api` types into `apps/web` (use contracts).
9. **Done when:** `pnpm depcruise` passes, no circular deps, every module has a README of 5 lines (purpose, public API, events in/out).
