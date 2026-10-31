# Campus FOMO

> **Campus Event Discovery & Registration Platform for CHRIST University**  
> Built strictly adhering to the _CampusFest Student Handbook (15 Oct 2026)_ specification.

---

## 1. Architecture Overview

Campus FOMO employs an enterprise-grade **Zero-Trust** architecture. All traffic ingresses through an **Apache APISIX** API Gateway that enforces rate limits and validates JWT tokens against **Keycloak 26**. The **Fastify** backend validates permissions independently (**PBAC**) and guarantees atomic seat allocations and cryptographic lucky draws in **PostgreSQL 16**.

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer"]
        Browser["React 18 + Vite Web App (Desktop / Mobile 360px+)"]
    end

    subgraph Perimeter["Zero-Trust Perimeter"]
        APISIX["Apache APISIX API Gateway (Port 9080)\n- Rate Limiting (limit-req)\n- CORS Allowlist\n- OpenID Connect Bearer Validation\n- Unbuffered SSE (/stream)"]
    end

    subgraph IAM["Identity & Access Management"]
        KC["Keycloak 26 (Port 8080)\n- Realm: campus-fomo\n- Client: campus-web (PKCE)\n- Client: campus-api (PBAC Roles)\n- Service Account: access-studio"]
    end

    subgraph BackendLayer["Application Layer"]
        API["Fastify Backend (Port 3001)\n- Jose JWT JWKS Verification\n- PBAC Middleware (requirePermission)\n- Zod Contracts & OpenAPI\n- Outbox Event Relay\n- SSE Stream Engine"]
    end

    subgraph DataLayer["Persistence & Infrastructure"]
        PG[("PostgreSQL 16\n- Atomic Seat Checks (confirmed <= capacity)\n- SKIP LOCKED Waitlist Promotion\n- Audit Trail & Lucky Draw Commit-Reveal")]
        RD[("Redis 7\n- Token Revocation Blacklist\n- Feed Cache & Rate Limiting\n- PubSub Outbox Event Bus")]
        MP["Mailpit (Port 8025 / 1025)\n- Local Transactional Emails"]
    end

    Browser -->|Public Traffic / Static Assets| APISIX
    Browser -->|OAuth2 / OIDC Auth Flow| KC
    APISIX -->|Token Verification| KC
    APISIX -->|Reverse Proxy /api/v1| API
    API -->|JWKS Key Fetch & Sync| KC
    API -->|Atomic Transactions & Schemas| PG
    API -->|Cache & PubSub| RD
    API -->|Email Notifications & OTP| MP
```

---

## 2. Repository Structure

```
Campus FOMO/
├── backend/                   # Independent Fastify + TypeScript API project
│   ├── openapi.yaml           # Generated & committed OpenAPI 3.1 specification
│   ├── package.json           # Backend dependencies and scripts
│   ├── tsconfig.json          # Standalone NodeNext TypeScript config
│   ├── scripts/               # OpenAPI generator & Keycloak access sync
│   └── src/
│       ├── access/            # PBAC permission catalog, role bundles, screens
│       ├── auth/              # Jose JWT verification, requirePermission middleware
│       ├── config.ts          # Zod-validated environment config
│       ├── contracts/         # Zod schemas, errors, OpenAPI definition
│       ├── domain/            # Events, registrations, proposals, lucky draw
│       ├── modules/           # Fastify routes and services
│       └── seed/              # Deterministic database seeding engine
├── frontend/                  # Independent Vite + React 18 + TypeScript web app
│   ├── package.json           # Frontend dependencies and scripts
│   ├── tsconfig.json          # Bundler TypeScript config
│   ├── vite.config.ts         # Vite bundler configuration
│   └── src/
│       ├── api/               # Typed client generated from openapi.yaml
│       ├── tokens.ts          # Color, typography, and layout design tokens
│       ├── App.tsx            # Main application component
│       └── App.test.tsx       # Frontend component contract test
├── infra/                     # Infrastructure configuration
│   ├── docker-compose.yml     # Keycloak 26, APISIX, Postgres 16, Redis 7, Mailpit
│   ├── keycloak/              # Realm definition (campus-fomo) & clients
│   └── apisix/                # Declarative standalone APISIX routes and plugins
├── docs/                      # Architectural, compliance, and requirements docs
│   ├── AI-LOG.md              # Strictly append-only development audit log
│   ├── HANDBOOK-COMPLIANCE.md # 7-stage compliance matrix citing handbook page numbers
│   ├── REQUIREMENTS.md        # Story Cards across 8 personas with numbers
│   ├── ARCHITECTURE.md        # Deep architectural specifications & ADRs
│   ├── ESTIMATION.md          # Stage 7 COCOMO II & PERT three-point calculations
│   └── STATUS.md              # Project status tracking
├── scripts/                   # Verification and compliance enforcement
│   ├── check-ai-log.mjs       # Pre-push and CI gate enforcing append-only AI-LOG
│   └── verify/index.js        # pnpm verify test runner
└── .agents/rules/             # Antigravity IDE workspace rules (AGENT-RULES.md)
```

---

## 3. Technology Stack

- **Backend**: Node.js 20, Fastify 4, Zod 3, Drizzle ORM, `jose` for JWT validation, `yaml` for OpenAPI 3.1.
- **Frontend**: Vite 5, React 18, TypeScript 5, TailwindCSS 3.
- **Identity & Gateway**: Keycloak 26.1 (IAM, OAuth2, PKCE), Apache APISIX 3.11 (Gateway).
- **Storage & Infrastructure**: PostgreSQL 16, Redis 7, Mailpit, Docker Compose.
- **Testing**: Vitest 2, React Testing Library, JSDOM.

---

## 4. 5-Command Quick Start

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Spin up local infrastructure (Keycloak, APISIX, Postgres, Redis, Mailpit)
docker compose -f infra/docker-compose.yml up -d

# 3. Synchronize PBAC permissions & role bundles to Keycloak
pnpm --filter campus-fomo-backend access:sync

# 4. Seed database with venues, clubs, 80+ events, and cafe sponsor
pnpm --filter campus-fomo-backend seed:reset

# 5. Start development servers (Backend: 3001, Frontend: 5173, Gateway: 9080)
pnpm dev
```

---

## 5. Environment Variables (`.env`)

Copy `.env.example` to `.env` in the root:

| Variable             | Default Value                                             | Description                                          |
| :------------------- | :-------------------------------------------------------- | :--------------------------------------------------- |
| `PORT`               | `3001`                                                    | Fastify backend HTTP port                            |
| `DATABASE_URL`       | `postgres://postgres:postgres@localhost:5432/campus_fomo` | App PostgreSQL connection string                     |
| `REDIS_URL`          | `redis://localhost:6379`                                  | Redis connection URL                                 |
| `KEYCLOAK_URL`       | `http://localhost:8080`                                   | Keycloak base URL                                    |
| `KEYCLOAK_REALM`     | `campus-fomo`                                             | Identity realm name                                  |
| `KEYCLOAK_CLIENT_ID` | `campus-api`                                              | Resource server client ID                            |
| `VITE_API_BASE_URL`  | `http://localhost:9080/api/v1`                            | API base URL via APISIX Gateway                      |
| `VITE_API_MODE`      | `live`                                                    | `live` (via gateway) or `mock` (offline mock client) |

---

## 6. Demo Accounts (All 8 Personas)

Every persona is provisioned in the Keycloak realm and database with password `Password123!`:

| Persona                 | Email                           | PBAC Role Bundle | Department         | Sample Scope                         |
| :---------------------- | :------------------------------ | :--------------- | :----------------- | :----------------------------------- |
| **Student**             | `asha@christuniversity.in`      | `STUDENT`        | Computer Science   | Discover, Register, Lucky Draw       |
| **Guest**               | `guest@external.edu`            | `GUEST`          | External Guest     | External-open events only            |
| **Student Event Head**  | `karan@christuniversity.in`     | `EVENT_HEAD`     | Computer Science   | Propose, Manage Event, Broadcast     |
| **Volunteer / Scanner** | `volunteer@christuniversity.in` | `VOLUNTEER`      | Computer Science   | QR Door Scanning (<500 ms)           |
| **Faculty Coordinator** | `dr.nair@christuniversity.in`   | `FACULTY`        | Computer Science   | Departmental Review (`approve:dept`) |
| **Dean of Students**    | `dean@christuniversity.in`      | `DEAN`           | Central Admin      | Budget Clearance (`approve:budget`)  |
| **Sponsor Partner**     | `sponsor@thirdwavecoffee.in`    | `SPONSOR`        | Commercial Sponsor | Cafe Showcase & Lucky Draw           |
| **Administrator**       | `admin@christuniversity.in`     | `ADMIN`          | IT Services        | Full System Governance & RBAC        |

---

## 7. Branch Policy

- **`master`**: Protected branch. Contains verified, release-ready deliverables for Gate sign-offs.
- **`dev`**: Active working branch for the solo developer (**Devansh**). All iterative work takes place here.
- Obsolete 4-person role branches have been discontinued.

### Commands to delete obsolete remote feature branches (Reference only — do not run automatically):

```bash
git push origin --delete feat/product-experience
git push origin --delete feat/immersive-frontend
git push origin --delete feat/backend-core
git push origin --delete feat/quality-devops
```

---

## 8. AI-LOG Policy & Enforcement

- **File**: `docs/AI-LOG.md`
- **Rule**: Strictly **append-only**. Past entries must never be edited or removed.
- **Enforcement**: `scripts/check-ai-log.mjs` is executed on pre-push via Husky and in CI. If changes to `frontend/`, `backend/`, or `infra/` are committed without a corresponding entry appended to `docs/AI-LOG.md`, the commit/push is rejected.
