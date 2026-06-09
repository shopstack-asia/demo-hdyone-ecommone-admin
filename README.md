# CommerceOne Integration Hub — Admin Portal

Enterprise-grade admin portal prototype for the CommerceOne Integration Platform. Built with production architecture patterns from day one, using mock repositories that can be swapped for PostgreSQL with minimal code changes.

## Architecture

```
Provider → Connection → Integration → Execution
```

The system stores **metadata only** — it is not an OMS, WMS, ERP, or CRM.

### Layered Architecture

```
src/
├── types/              # Domain types, enums, query interfaces
├── data/               # Mock database seed (temporary)
├── repositories/
│   ├── interfaces/     # Repository contracts
│   ├── implementations/
│   │   └── mock/       # Mock implementations (V1)
│   └── index.ts        # Dependency injection container
├── services/           # Business logic layer
├── components/         # UI components
├── stores/             # Zustand state
└── app/                # Next.js App Router pages
```

### Future PostgreSQL Migration

To migrate to PostgreSQL:

1. Implement `postgres/postgres-*.repository.ts` classes against the existing interfaces
2. Update `src/repositories/index.ts` to inject PostgreSQL implementations
3. UI and services require **zero changes**

```typescript
// Future: src/repositories/index.ts
import { PostgresTenantRepository } from "./implementations/postgres/postgres-tenant.repository";

export const repositories = {
  tenant: new PostgresTenantRepository(db),
  // ...
};
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | TailwindCSS, shadcn/ui |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table (via DataTable) |
| Charts | Recharts |
| State | Zustand |
| Icons | Lucide |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:4100](http://localhost:4100) — redirects to `/dashboard`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Unit tests (Vitest) |

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | System-wide metrics, charts, recent activity |
| `/tenants` | Tenant list with onboarding wizard |
| `/tenants/[id]/overview` | Tenant dashboard |
| `/tenants/[id]/connections` | Connection management + wizard |
| `/tenants/[id]/integrations` | Integration flows |
| `/tenants/[id]/integrations/[id]` | Integration designer |
| `/tenants/[id]/executions` | Execution log |
| `/tenants/[id]/dlq` | Dead letter queue |
| `/tenants/[id]/retry` | Retry management |
| `/tenants/[id]/circuit-breakers` | Circuit breaker status |
| `/tenants/[id]/audit-logs` | Audit trail |
| `/tenants/[id]/settings` | Tenant configuration |
| `/executions/[id]` | Execution detail with timeline |
| `/system-config` | Global platform configuration |

## Mock Data

Programmatically generated datasets:

- 10 Providers
- 20 Tenants
- 100 Connections
- 200 Integrations
- 3,000 Executions
- 500 DLQ Records
- 200 Retry Records
- 100 Audit Records
- 50 Circuit Breakers
- 20 Validation/Mapping/Transformation/Routing Profiles
- 10 Execution/Retry Policies

## Docker

```bash
docker build -t commerceone-admin .
docker run -p 4100:4100 commerceone-admin
```

## CI/CD

GitHub Actions workflows:

- **PR Pipeline** (`.github/workflows/pr.yml`) — lint, typecheck, test, build
- **Main Pipeline** (`.github/workflows/main.yml`) — lint, test, build, Docker build
- **Release Pipeline** (`.github/workflows/release.yml`) — build and push to AWS ECR

Configured for AWS ECS Fargate deployment.

## Future Ready

- PostgreSQL via repository pattern
- NestJS API backend
- JWT authentication
- AWS ECS Fargate deployment

## License

Proprietary — CommerceOne Integration Hub
