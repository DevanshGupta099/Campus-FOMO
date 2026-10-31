# Campus FOMO — Frontend

> Independent React 18 + TypeScript + Vite web client for Campus FOMO.

## Architecture

- **Stack**: React 18, TypeScript 5, Vite 5, TailwindCSS 3.
- **Design System**: Tailored tokens defined in `src/tokens.ts` (ink night, royal blue, gold accent, ember urgency, mint confirmation).
- **API Client**: Standalone typed client in `src/api/client.ts` implementing OpenAPI contracts without runtime coupling to backend code. Supports both `live` (via APISIX gateway) and `mock` (offline testing) modes.
- **Accessibility & Responsiveness**: Mobile-first responsive layouts from 360 px up; keyboard reachable; adheres to WCAG 2.2 AA.

## Commands

```bash
# Start development server on port 5173
pnpm dev

# Typecheck TypeScript code
pnpm typecheck

# Run unit and contract tests with Vitest
pnpm test:unit

# Build optimized production bundle
pnpm build
```
