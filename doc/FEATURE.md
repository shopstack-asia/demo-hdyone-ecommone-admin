# CommerceOne Integration Hub — Admin Portal Feature Reference

> **Document purpose:** Exhaustive, code-verified inventory of every feature, screen, workflow, data model, and behavioral detail implemented in this repository.  
> **Product:** CommerceOne Integration Hub Admin Portal — the control plane for a multi-tenant enterprise integration platform.  
> **Core data model:** `Provider → Connection → Integration → Execution`  
> **Important scope note:** This portal stores **metadata only**. It is not an OMS, WMS, ERP, or CRM. All data is currently served from mock repositories that can be swapped for PostgreSQL without UI changes.

---

## Table of Contents

1. [Product Overview & Personas](#1-product-overview--personas)
2. [Technology Stack & Architecture](#2-technology-stack--architecture)
3. [Navigation & Application Shell](#3-navigation--application-shell)
4. [Platform Dashboard](#4-platform-dashboard)
5. [Tenant Management](#5-tenant-management)
6. [Connection Management](#6-connection-management)
7. [Integration Management](#7-integration-management)
8. [Mapping & Data Transformation UI](#8-mapping--data-transformation-ui)
9. [Execution Monitoring & Detail](#9-execution-monitoring--detail)
10. [Observability: DLQ, Retry, Circuit Breakers, Audit](#10-observability-dlq-retry-circuit-breakers-audit)
11. [System Configuration](#11-system-configuration)
12. [Marketplace OAuth Flow](#12-marketplace-oauth-flow)
13. [Domain Model & Enumerations](#13-domain-model--enumerations)
14. [Provider Catalog & Data Flows](#14-provider-catalog--data-flows)
15. [Server Actions & Validation Rules](#15-server-actions--validation-rules)
16. [Services & Repository Layer](#16-services--repository-layer)
17. [Mock Data & Seed Volumes](#17-mock-data--seed-volumes)
18. [Shared UI Components & UX Patterns](#18-shared-ui-components--ux-patterns)
19. [Environment Variables & External Integrations](#19-environment-variables--external-integrations)
20. [Testing, Build & CI/CD](#20-testing-build--cicd)
21. [Feature Implementation Status](#21-feature-implementation-status)
22. [Route Reference](#22-route-reference)

---

## 1. Product Overview & Personas

### 1.1 Product Purpose

The Admin Portal is the operational control plane for CommerceOne Integration Hub. Operators use it to:

- Onboard and manage tenants (multi-tenant isolation)
- Connect external systems via provider-specific connections
- Design integration flows (source → data flow → destination)
- Monitor execution pipelines in real time and historically
- Triage dead-letter queue (DLQ) records and retry queues
- Inspect circuit breaker states and audit trails
- Configure platform-wide access and settings

### 1.2 Target Personas

| Persona | Primary Responsibilities in Portal |
|---------|----------------------------------|
| **Super Admin (Platform Admin)** | All tenants, system health, provider catalog, platform settings, user access |
| **Ops Manager** | Executions, DLQ, circuit breakers, failure trends across tenants |
| **Integration Engineer** | Connections, integration wizards, mapping, troubleshooting failed runs |
| **Tenant Operator** | Scoped to assigned tenants; configure and monitor tenant resources |
| **Tenant Viewer** | Read-only access to assigned tenant resources (role defined; enforcement is future-ready) |

### 1.3 Design Principles (from PRODUCT.md)

- **Operations first** — every screen answers "what is the state?" and "what do I do next?"
- **Density with hierarchy** — more data per screen than a marketing dashboard
- **Status is sacred** — consistent badges and color for execution, connection, circuit breaker, DLQ states
- **Progressive depth** — list → detail → timeline/logs without modal-only workflows
- **Production posture** — validated forms, meaningful empty states, wizard step progress, specific errors

---

## 2. Technology Stack & Architecture

### 2.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | TailwindCSS 4, shadcn/ui, Base UI React |
| Forms | React Hook Form + Zod 4 |
| Tables | TanStack Table (via shared `DataTable`) |
| Charts | Recharts |
| Client State | Zustand (`ui.store.ts` — sidebar collapsed flag; sidebar not implemented) |
| Icons | Lucide React, Simple Icons |
| Testing | Vitest |
| Dev Server Port | **4100** |

### 2.2 Layered Architecture

```
src/
├── app/                  # Next.js App Router pages (25 routes)
├── actions/              # Server Actions (mutations)
├── components/           # UI components (108 files)
├── data/                 # Mock database seed + provider data flows
├── lib/                  # Schemas, utilities, provider auth, mapping helpers
├── repositories/
│   ├── interfaces/       # Repository contracts
│   └── implementations/mock/  # Mock implementations (V1)
├── services/             # Business logic facades
├── stores/               # Zustand stores
└── types/                # Domain types, enums, query interfaces
```

**Data flow pattern:**

```
Page (Server Component)
  → Service
    → Repository (mock)
  → Client Component (forms, tables, wizards)
    → Server Action (mutations)
      → Service → Repository
      → revalidatePath / redirect
```

### 2.3 Future-Ready Migration Path

- Replace mock repositories with `postgres/postgres-*.repository.ts` implementations
- Update `src/repositories/index.ts` dependency injection container
- UI and services require **zero changes**
- Planned: NestJS API backend, JWT authentication, AWS ECS Fargate deployment

---

## 3. Navigation & Application Shell

### 3.1 Global Top Navigation (`TopNav`)

Sticky header with backdrop blur. Links:

| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Tenants | `/tenants` | Users |
| System Config | `/system-config` | Settings |

**Additional chrome:**

- **Branding:** CommerceOne Integration Hub logo (Zap icon) → links to `/dashboard`
- **Notifications bell:** Rendered; no handler wired (placeholder)
- **Account dropdown:** Profile, Settings, Sign out — UI only (no auth backend)
- **Mock session user:** Displayed as "Admin / Super Admin" with avatar initials "AD"
- **Responsive:** Nav labels hidden on small screens; icons remain with screen-reader text

### 3.2 Application Shell (`AppShell`)

- Wraps most authenticated-style pages
- Sticky `TopNav` + centered main content (`max-w-[1400px]`)
- OAuth pages (`/oauth/*`) use standalone full-page layout (no shell)

### 3.3 Tenant Tab Navigation (`TenantHeader`)

Rendered by `src/app/tenants/[id]/layout.tsx` for all tenant-scoped routes.

**Header displays:** Tenant name, status badge, code, country, timezone.

| Tab | Route |
|-----|-------|
| Overview | `/tenants/[id]/overview` |
| Connections | `/tenants/[id]/connections` |
| Integrations | `/tenants/[id]/integrations` |
| Executions | `/tenants/[id]/executions` |
| Retry | `/tenants/[id]/retry` |
| DLQ | `/tenants/[id]/dlq` |
| Audit Logs | `/tenants/[id]/audit-logs` |
| Settings | `/tenants/[id]/settings` |

**Orphan route (not in tabs):** `/tenants/[id]/circuit-breakers` — page exists but is unreachable from navigation.

### 3.4 Root Redirect

- `/` → redirects to `/dashboard`
- `/tenants/[id]` → redirects to `/tenants/[id]/overview`
- `/tenants/[id]/integrations/[integrationId]` → redirects to `.../edit`

---

## 4. Platform Dashboard

**Route:** `/dashboard`  
**Purpose:** System-wide operational overview across all tenants.

### 4.1 KPI Stat Cards (10 metrics)

Loaded via `dashboardService.getMetrics()`:

| Metric | Description |
|--------|-------------|
| Total Tenants | Count of all tenants |
| Active Tenants | Tenants with ACTIVE status |
| Total Providers | Provider catalog size |
| Total Connections | All tenant connections |
| Total Integrations | All tenant integrations |
| Running Executions | Currently RUNNING executions |
| Failed Executions | FAILED execution count |
| DLQ Records | Open/pending DLQ records |
| Open Circuit Breakers | Circuit breakers in OPEN state |
| Worker Count | Platform worker pool size |

Each rendered as `StatCard` with icon and optional trend indicator.

### 4.2 Trend Charts (Recharts)

| Chart Component | Type | Data Series |
|-----------------|------|-------------|
| `ExecutionTrendChart` | Stacked area | success, failed, retry, dlq over time |
| `FailureTrendChart` | Bar chart | Failed count by date |
| `DlqTrendChart` | Bar chart | DLQ records by date |
| `ProviderUsageChart` | Horizontal bar | Connection count per provider |
| `StatusDistributionChart` | Donut/pie | Execution counts by status |

Default trend window: **14 days** (`dashboardService.getExecutionTrend(14)`, etc.).

### 4.3 Recent Activity Tables

| Table | Source | Row Limit | Row Action |
|-------|--------|-----------|------------|
| Recent Executions | `executionService.getRecent(8)` | 8 | Navigate to `/executions/[id]` |
| Recent DLQ | `dlqService.listRecords` | paginated | Navigate to `/dlq/[id]` |
| Recent Audit | `auditLogService.list` | paginated | Read-only browse |

Integration names resolved via `integrationService.getIntegration` for display context.

---

## 5. Tenant Management

### 5.1 Tenant List

**Route:** `/tenants`

**Features:**

- Paginated tenant list (`pageSize: 100`)
- Per-tenant aggregated stats via `tenantService.getTenantStats`:
  - Connections count
  - Integrations count
  - Failed executions count
  - DLQ count
  - Success rate
- **Search filter:** Filter by tenant name or code (client-side)
- **Create tenant button:** Navigates to `/tenants/new`
- **Row click / View action:** Navigates to `/tenants/[id]`

**Table columns:** Tenant Code, Name, Country, Timezone, Status, Connections, Integrations, Failures, DLQ, Created, View

**Status values:** ACTIVE, SUSPENDED, PENDING, ARCHIVED (`TenantStatus` enum)

### 5.2 Create Tenant Wizard

**Route:** `/tenants/new`  
**Component:** `CreateTenantForm` + shared `WizardLayout`

#### Step 1 — Tenant Information

| Field | Validation | Notes |
|-------|------------|-------|
| Tenant Name | 2–120 chars, trimmed | Required |
| Tenant Code | 3–12 chars, regex `^[A-Z][A-Z0-9-]*$` | Auto-uppercase; must start with letter |
| Country | One of 6 ASEAN countries | Auto-sets timezone |
| Timezone | Derived from country selection | IANA timezone |
| Description | Optional, max 500 chars | Textarea |

**Supported countries:**

| Country | Timezone |
|---------|----------|
| Thailand | Asia/Bangkok |
| Singapore | Asia/Singapore |
| Malaysia | Asia/Kuala_Lumpur |
| Indonesia | Asia/Jakarta |
| Philippines | Asia/Manila |
| Vietnam | Asia/Ho_Chi_Minh |

#### Step 2 — Assign Users

- Loads platform users (`platformUserService.listUsers`)
- Checkbox list: name, email, role per user
- Search filter for users
- **Business rule:** Current session user (`USR-000001`) is locked in and cannot be deselected
- Minimum 1 assigned user required

#### Step 3 — Review

Read-only summary of all fields plus assigned users and initial status (PENDING).

#### Server Action: `createTenantAction`

- Validates via `createTenantSchema`
- Enforces creator in `assignedUserIds`
- Checks code uniqueness (case-insensitive, stored uppercase)
- Creates tenant with `status: PENDING`
- Updates assigned users' `tenantIds` (skips users with `allTenantsAccess` or already assigned)
- Revalidates `/tenants` and `/system-config`
- **Success:** Redirects to `/tenants/{id}/overview`

### 5.3 Tenant Overview Dashboard

**Route:** `/tenants/[id]/overview`

**KPI Stat Cards (6):**

- Connections count
- Integrations count
- Success rate (%)
- Failed executions
- DLQ records
- Open circuit breakers

**Recent activity tables:**

- Recent Executions (8 rows) → `/executions/[id]`
- Recent DLQ (5 rows) → `/dlq/[id]`

### 5.4 Tenant Settings

**Route:** `/tenants/[id]/settings`

**Editable fields (UI):**

- Tenant name
- Country
- Timezone
- Tenant code (read-only display)

**Danger zone actions (UI only — no server actions wired):**

- Save changes
- Suspend tenant
- Archive tenant

---

## 6. Connection Management

**Concept:** A Connection binds a Tenant to a Provider with authenticated configuration. Connections are the endpoints used by Integrations.

### 6.1 Connections List

**Route:** `/tenants/[id]/connections`

**Features:**

- Lists all tenant connections with provider metadata
- **Create connection** → `/tenants/[id]/connections/new`
- **Empty state:** CTA when no connections exist
- Row click / Edit → connection detail page

**Table columns:** Name, Provider, Category, Active, Health, Last Tested, Last Used, Created, Edit

**Connection statuses:**

| Field | Values |
|-------|--------|
| Health (`ConnectionStatus`) | HEALTHY, WARNING, ERROR, TESTING |
| Activation (`ConnectionActivationStatus`) | ACTIVE, INACTIVE |

### 6.2 Create Connection Wizard

**Route:** `/tenants/[id]/connections/new`  
**Component:** `CreateConnectionForm`

#### Step 0 — Provider Selection

- Searchable provider card grid
- Each card: Logo.dev provider logo (when API key configured), name, category, capabilities
- Selected provider detail panel with description and supported triggers

#### Step 1 — Authentication

- Connection name field (2–120 chars)
- Provider-specific auth form (see [Provider Auth Forms](#614-provider-authentication-forms))

#### Step 2 — Validation

- Auto-runs validation on step entry
- `ValidationResultPanel`: auth status, response time, provider version, summary
- **Re-run validation** button
- Simulated 1.2s delay via `testConnectionAction`

#### Step 3 — Metadata Discovery

- Auto-runs metadata discovery after validation
- `MetadataPanel`: hierarchical metadata tree/sections from provider

#### Step 4 — Review

- `ReviewStep`: health ring chart, masked secret config summary, metadata snapshot
- **Rotate credentials** (marketplace providers)
- **Re-test connection**
- **Save connection** → `createConnectionAction`

**Server Action: `createConnectionAction`**

- Validates `createConnectionSchema` + `validateProviderAuth`
- Enforces unique connection name per tenant (case-insensitive)
- Creates with `status: HEALTHY`, `activeStatus: ACTIVE`, `lastTestedAt: now`
- Redirects to connections list

### 6.3 Connection Detail & Edit

**Route:** `/tenants/[id]/connections/[connectionId]`

**Features:**

- Header: name, active + health badges, provider, category, connection ID
- Review panel with health chart (success rate %, response time ms)
- Last tested / last used / created / updated timestamps
- **Re-test connection** (simulated)
- Edit form: connection name + provider auth fields
- Sticky footer actions:
  - **Cancel** → connections list
  - **Enable / Disable** → `toggleConnectionActiveStatusAction` (toggles ACTIVE ↔ INACTIVE)
  - **Save connection** → `updateConnectionAction`

**Server Actions:**

| Action | Behavior |
|--------|----------|
| `updateConnectionAction` | Validates, checks tenant ownership, unique name, redirects to detail |
| `toggleConnectionActiveStatusAction` | Toggles activation; returns `{ success, activeStatus }` |
| `testConnectionAction` | Validates auth config; returns mock success after 1.2s delay (no persistence) |

### 6.4 Provider Authentication Forms

Registered in `provider-setup/registry.tsx`. Each provider has a dedicated setup component.

#### Marketplace Providers (OAuth required)

| Provider | Required Fields | OAuth |
|----------|----------------|-------|
| **Shopee** | partnerId, partnerKey, region, environment | Required (`oauthConnected: "true"`) |
| **Lazada** | region, appKey, appSecret, defaultCountry, defaultCurrency | Required |
| **TikTok Shop** | appId, appKey, appSecret | Required |

OAuth flow: popup → `/oauth/authorize/[provider]` → `/oauth/callback/[provider]` → `postMessage` tokens to parent.

#### ERP Providers

| Provider | Auth Methods | Required Fields |
|----------|-------------|-----------------|
| **SAP** | Basic, OAuth, Client Credentials | baseUrl, environment; method-specific credentials |
| **NetSuite** | Token-Based Auth (TBA) | accountId, consumerKey/Secret, tokenId/Secret |

#### Protocol Providers

| Provider | Auth Types | Required Fields |
|----------|-----------|-----------------|
| **REST API** | None, API Key, Bearer, Basic, OAuth2 | baseUrl; auth-specific fields; default headers/query JSON |
| **Webhook** | Signing | targetUrl, secret, signingAlgorithm (hmac-sha256), custom headers |

#### Storage Providers

| Provider | Auth Types | Required Fields |
|----------|-----------|-----------------|
| **SFTP** | Password, Private Key | host, port, username, rootPath; password or privateKeyRef |
| **FTP** | Password | host, port, username, password |
| **Amazon S3** | IAM Role, Access Key | bucket, region; accessRoleArn or accessKeyId/secretAccessKey |

**Shared auth UI components:**

- `SecretInput` — masked credential fields with reveal toggle
- `OAuthConnectPanel` — OAuth connect button with popup flow
- `ValidationResultPanel` — test result display
- `MetadataPanel` — discovered metadata tree
- `SetupSection` — grouped form sections

### 6.5 Connection Health Visualization

- `ConnectionHealthChart`: circular progress ring showing success rate % and average response time (ms)
- Used in connection review step and detail view

---

## 7. Integration Management

**Concept:** An Integration defines a data pipeline: Source Connection → Data Flow → Destination Connection, with trigger, mapping, and runtime policies.

### 7.1 Integrations List

**Route:** `/tenants/[id]/integrations`

**Features:**

- Lists tenant integrations with resolved source/destination connection names
- **Create integration** → `/tenants/[id]/integrations/new`
  - Disabled when tenant has zero connections
- Empty state with CTA (create integration or add connections first)
- Row click / Edit → edit page

**Table columns:** Code, Name, Source, Destination, Trigger, Status, Last Run, Success Rate, Edit

**Integration statuses:** ACTIVE, INACTIVE, DRAFT, ERROR, BREAK (circuit breaker open)

### 7.2 Create Integration Wizard

**Route:** `/tenants/[id]/integrations/new`  
**Component:** `IntegrationWizardForm`

**8 wizard steps:**

| Step | ID | Content |
|------|----|---------|
| 0 | General | Code, name, description, tags, owner |
| 1 | Trigger | Trigger type selection + type-specific config |
| 2 | Source | Source connection picker (SOURCE-capable providers only) |
| 3 | Data Flow | Data flow picker (filtered by source provider) |
| 4 | Destination | Destination connection picker (compatible with data flow) |
| 5 | Mapping | Full mapping step (see [Section 8](#8-mapping--data-transformation-ui)) |
| 6 | Policy | Execution, retry, notification, circuit breaker policies |
| 7 | Review | Narrative summary + applied profiles card |

**Footer actions:**

- Cancel, Back, Next
- **Save as Draft** → `saveIntegrationDraftAction` (stays on wizard)
- **Create Integration** → `createIntegrationAction` (redirects to edit page)

#### Step 0 — General Fields

| Field | Validation |
|-------|------------|
| Code | 3–32 chars, uppercase regex |
| Name | 2–120 chars |
| Description | Optional |
| Tags | Comma-separated; parsed to array |
| Owner | Optional string |

#### Step 1 — Trigger Configuration

**Trigger types:** SCHEDULE, WEBHOOK, API

**Schedule trigger fields:**

- Cron expression (default: `0 */15 * * * *`)
- Timezone (default: `Asia/Bangkok`)
- Enabled switch
- File source extras: polling mode, source path/directory, file pattern, processed folder, error folder

**Webhook trigger fields:**

- Generated webhook URL: `https://hooks.commerceone.io/{tenantId}/{code}`
- Signing secret (auto-generatable via `generateSigningSecret()`)
- Signature verification enabled
- Allowed IPs (comma-separated or array)

**API trigger fields:**

- Generated API endpoint: `https://api.commerceone.io/v1/integrations/{code}/run`
- API key required
- Allowed methods (default: POST)
- Manual run enabled

#### Step 2 & 4 — Connection Pickers

- Card grid with provider logo, health badges, capabilities
- Source: filtered to SOURCE-capable providers
- Destination: filtered by data flow's `supportedDestinationCategories`
- Empty destination state links to create connection wizard

#### Step 3 — Data Flow Picker

- Card grid per available data flow for source provider
- Shows: category, description, supported triggers, recommended trigger, default mapping template, destination categories

#### Step 6 — Policy Configuration (`IntegrationPolicySection`)

**Execution control:**

| Field | Default |
|-------|---------|
| Batch size | 1000 |
| Chunk size | 100 |
| Max parallel chunks | 10 |
| Requests per second | 20 |
| Unlimited request rate | false |
| Execution timeout (seconds) | 900 |

**Retry policy:**

| Field | Default |
|-------|---------|
| Enabled | true |
| Strategy | EXPONENTIAL |
| Max retry count | 5 |
| Initial retry interval (seconds) | 60 |
| Max retry interval (seconds) | 3600 |
| Max retry days | 7 |
| Unlimited retry window | false |

**Retry strategies:** FIXED, EXPONENTIAL, DECORRELATED_JITTER, LINEAR, CUSTOM

**Failure notification:**

| Field | Default |
|-------|---------|
| Notify on failure | true |
| Channels | EMAIL, SLACK |
| Emails | ops@example.com, integration-team@example.com |
| Webhook URL | Optional |

**Notification channels:** EMAIL, SLACK, TEAMS, WEBHOOK

**Circuit breaker:**

| Field | Default |
|-------|---------|
| Enabled | true |
| Failure threshold | 5 |
| Open duration (seconds) | 60 |
| Half-open probe count | 3 |
| Success threshold | 2 |
| Minimum request volume | 10 |

**Cross-field validation:**

- Source connection ≠ destination connection
- Connections must belong to tenant
- Data flow must exist and be supported by source provider
- Integration code unique within tenant

#### Profile Resolution

On save/create, `resolveProfileIdsFromDataFlow()` maps data flow defaults to system config profile IDs:

- Validation profile
- Mapping profile
- Transformation profile
- Routing profile
- Execution policy
- Retry policy

Optional override via `mappingProfileCode`.

### 7.3 Edit Integration

**Route:** `/tenants/[id]/integrations/[integrationId]/edit`  
**Component:** `EditIntegrationForm`

**Tabbed editor:**

| Tab | Content |
|-----|---------|
| General | Read-only code/name/description; editable status display, tags, owner; pipeline summary |
| Trigger | Full trigger config with copy URL and regenerate signing secret |
| Mapping | Full `MappingStep` component |
| Policy | Full `IntegrationPolicySection` |

**Sticky footer:**

- Cancel → integrations list
- **Inactive** → `setIntegrationInactiveAction` (sets status INACTIVE)
- **Save integration** → `createIntegrationAction` (update path)

### 7.4 Integration Designer (Read Hub)

**Component:** `IntegrationDesigner` (available in codebase; used as operational hub view)

**Pipeline visualization:** Source → Data Flow → Transform → Destination

**10 tabs:**

| Tab | Functionality |
|-----|---------------|
| Overview | Read-only integration fields, success rate, last run |
| Executions | External link to tenant executions |
| Mapping | Full interactive mapping step |
| Validation | Profile ID display; future release placeholder |
| Transformation | Profile ID display; future release placeholder |
| Routing | Profile ID display; future release placeholder |
| Policies | Execution policy summary |
| Retry | Retry policy summary |
| DLQ | External link to tenant DLQ |
| Audit Logs | External link to tenant audit logs |

**Action:** Edit integration → edit page

### 7.5 Integration Server Actions Summary

| Action | Purpose | Redirect |
|--------|---------|----------|
| `saveIntegrationDraftAction` | Partial save with relaxed validation | No — returns `{ success, integrationId }` |
| `createIntegrationAction` | Full validation create/update | Yes — edit page |
| `setIntegrationInactiveAction` | Deactivate integration | No — returns `{ success, status }` |

**Status lifecycle note:** Create/save always produces `DRAFT` status. Activation to `ACTIVE` is not handled in server actions. `BREAK` status is set by runtime when circuit breaker opens.

---

## 8. Mapping & Data Transformation UI

**Location:** Integration wizard Step 5, Edit Integration Mapping tab, Integration Designer Mapping tab  
**Data source:** `mapping-service.ts` (client-side mock utilities on `MOCK_MAPPING_TEMPLATES`)

### 8.1 Mapping Context Summary

Displays: source/destination providers, connections, data flow, suggested mapping template code, template confidence score.

### 8.2 Mapping Sub-Tabs

1. **Mapping Rules**
2. **Validation Rules**
3. **Transform Rules**
4. **Idempotency**

### 8.3 Mapping Rules Tab

**Summary KPI cards:**

- Mapped count
- Need Review count
- Unmapped count
- Auto Mapped count
- Average confidence %

**Toolbar actions & filters:**

| Control | Function |
|---------|----------|
| Add mapping | Opens 2-step drawer |
| Auto map | Promotes UNMAPPED → NEED_REVIEW; bumps confidence |
| Browse source fields | Opens source schema drawer |
| Browse destination fields | Opens destination schema drawer |
| Filter select | All / Need Review / Unmapped / Mapped |
| Search | Text search across mapping rules |
| Active field filter chip | Filter by selected schema field + Clear |

**Mapping table columns:**

Source Field → Destination Field, Validation, Transform, Confidence, Status, Actions (Edit / Duplicate / Delete)

- Pagination: 50 rules per page with Previous/Next

**Mapping detail panel (side panel):**

- Source/destination paths and types
- Validation rule chips
- Transform config: Date Format / Formula / Lookup
- Sample input/output preview
- Description notes
- Actions: Save Rule, Reset, Delete Mapping

**Add mapping drawer (2 steps):**

1. Select source field (searchable list from schema tree)
2. Select destination field → Save mapping

**Schema drawers:**

- Source/Destination schema tree browse (`SchemaTree`, `SchemaDrawer`)
- Actions: Add mapping from field, filter table by field

### 8.4 Validation Rules Tab

- Grouped table: Field, Rules, Severity, Source, Edit/Remove
- Detail panel with rule list
- Add validation rule select: Required, Valid Date, Email Format, etc.
- Actions: Add Rule, Save, Reset
- `groupValidationRulesByField()` helper for grouping

### 8.5 Transform Rules Tab

- Similar pattern to validation rules
- Transform types linked to mapping rules via `getTransformForRule()`

### 8.6 Idempotency Tab

**Configuration:**

- Enable idempotency switch
- Token chip groups:
  - **System tokens:** tenant_id, integration_id, execution_id, source_connection_id, destination_connection_id, data_flow_code, source_reference_id, file_name, record_id
  - **Source fields** (from schema)
  - **Destination fields** (from schema)
- Template preview showing selected token sequence
- Generated key preview via `buildIdempotencyPreviewFromTemplate()`

**Default key template:** `["tenant_id", "integration_id", "source_reference_id"]`

### 8.7 Mapping Service Functions (Client-Side)

| Function | Purpose |
|----------|---------|
| `getSuggestedMappingTemplate` | Find template by provider/flow codes |
| `getSourceSchema` / `getDestinationSchema` | Extract schema fields |
| `getMappingRules` / `getValidationRules` / `getTransformRules` | Extract rule arrays |
| `computeMappingSummary` | Count mapped/unmapped/review + avg confidence |
| `filterMappingRules` | Filter by status, fields, text search |
| `updateMappingRule` / `addMappingRule` / `deleteMappingRule` / `duplicateMappingRule` | Immutable rule mutations |
| `autoMapFields` | Auto-promote unmapped fields |
| `getTransformForRule` / `getValidationRulesForMapping` | Join helpers |

**Note:** Mapping rule changes are in-memory only; no server action persists mapping rules.

---

## 9. Execution Monitoring & Detail

### 9.1 Executions List

**Route:** `/tenants/[id]/executions`

**Table columns:** Execution ID, Integration, Trigger, Status, Started, Finished, Duration, Retry Count, View

- Row click / View → `/executions/[id]`
- Default page size: 50

### 9.2 Execution Detail (Global Route)

**Route:** `/executions/[id]`  
**Query param tabs:** `?tab=overview|chunks|errors|retry|dlq`

Uses `AppShell` (not tenant tab layout) but loads full tenant/integration context.

#### Header (`ExecutionHeader`)

- Execution ID, status badge, integration name, tenant link
- Trigger type, environment, started/finished timestamps, duration

#### Actions (`ExecutionActions`)

- **Cancel Execution** — shown when status is RUNNING (UI only; no handler)

#### Tab: Overview (`ExecutionOverviewDashboard`)

**7 KPI cards:**

Records Processed, Success, Failed, DLQ Records, Retry Count, Chunk Count, API Calls

**Health summary:**

- Success rate, avg response time, records/sec, chunk throughput, last error

**Pipeline flow chart (`ExecutionPipelineFlow`):**

Source → stage cards (VALIDATION, MAPPING, TRANSFORMATION, DELIVERY) with status, duration, records processed/failed, % of total time → Destination

**Processing breakdown (`ExecutionProcessingBreakdown`):**

- Batch status, batch size, total records/chunks, completed/failed chunks

**Operational insight panels (contextual by execution state):**

| Panel | When Shown | Content & Actions |
|-------|-----------|-------------------|
| Failure Analysis | Failed executions | Failure stage, error code/message, failed records, recommended action; View Errors, View DLQ, Retry Failed Records |
| Retry Summary | Retry in progress | Strategy, attempt count, next retry time; Retry Now, Cancel Retry, View Retry History |
| Live Status | RUNNING | Current stage, progress bar, ETA, worker ID; Cancel Execution |
| Performance Analysis | Successful | Slowest stage, throughput, bottleneck assessment |

**Integration policy footer:** Displays batch/chunk/parallelism from parent integration config

#### Tab: Chunks

Table: Chunk #, Records, Status

#### Tab: Errors

- Error summary: total count, top error, distribution by error code
- Error records table (`ExecutionErrorRecords`):
  - Columns: Record, Stage, Error Code, Message, Chunk, Occurred
  - Row click → dialog with full error detail + payload JSON

#### Tab: Retry

Table: Retry ID, Attempt, Strategy, Status, Next Retry

#### Tab: DLQ

- DLQ summary card (record count, reason, status)
- DLQ records table with View links → `/dlq/[id]?returnTo=...`

### 9.3 Execution Domain Model Details

**Execution stages (`ExecutionStage`):**

SOURCE, VALIDATION, MAPPING, TRANSFORMATION, DELIVERY

Each stage tracks: status (PENDING/RUNNING/SUCCESS/FAILED/SKIPPED), durationMs, recordsProcessed, recordsFailed, percentageOfTotalTime, errorCode, errorMessage, targetSystem

**Execution statuses (`ExecutionStatus`):**

CREATED → QUEUED → RUNNING → VALIDATING → MAPPING → TRANSFORMING → ROUTING → DELIVERING → COMPLETED | FAILED | CANCELLED

**Timeline events:** Array of stage transitions with timestamps, messages, and per-stage duration

**Operational insight fields:**

- `failureAnalysis`: failureStageId, errorCode, errorMessage, failedRecords, affectedChunks, recommendedAction
- `retrySummary`: strategy, currentAttempt, maxAttempts, nextRetryAt, retryScope
- `performanceAnalysis`: slowestStage, throughput metrics, bottleneckAssessment
- `liveStatus`: currentStage, progress counters, workerId, ETA

---

## 10. Observability: DLQ, Retry, Circuit Breakers, Audit

### 10.1 Dead Letter Queue (DLQ)

#### DLQ List

**Route:** `/tenants/[id]/dlq`

**Table columns:** DLQ ID, Execution, Integration, Stage, Error Code, Error Message, Created At, View

- Row click → `/dlq/[id]`

**DLQ statuses:** OPEN, IN_PROGRESS, RESOLVED, REPLAYED, DISCARDED

#### DLQ Detail (Global Route)

**Route:** `/dlq/[id]`  
**Query param:** `?returnTo=` for back navigation (via `dlqDetailPath()` helper)

**Summary cards:** Failed stage, created timestamp, execution link

**Tabs:**

| Tab | Features |
|-----|----------|
| Overview | Integration name, error code, execution status, error message banner |
| Payload | Editable JSON textarea; **Replay with payload**; **Reset payload** |
| Error | Error code, stage, stack trace |
| Retry History | Related retry records table |
| Audit | Related audit log entries |

**Replay behavior:** Client-side JSON validation + success toast only — **no backend replay action**

**Cross-links:** Execution detail, tenant overview

### 10.2 Retry Queue

**Route:** `/tenants/[id]/retry`

**Table columns:** Retry ID, Execution, Attempt, Strategy, Next Retry, Status

**Retry statuses:** PENDING, IN_PROGRESS, COMPLETED, EXHAUSTED, CANCELLED

**Actions:**

- **Cancel** button per row — UI only (no handler wired)

### 10.3 Circuit Breakers

**Route:** `/tenants/[id]/circuit-breakers` *(orphan — no nav link)*

**Table columns:** Provider, Connection, State, Failure Count, Last Failure, Next Probe

**Circuit breaker states:** CLOSED, OPEN, HALF_OPEN

**Actions:**

- **Reset** button — UI only (no handler wired)

Each circuit breaker tracks: tenantId, providerId, connectionId, failureCount, threshold, lastFailureAt, nextProbeAt

### 10.4 Audit Logs

**Route:** `/tenants/[id]/audit-logs`

**Table columns:** Timestamp, User, Action, Resource, Result, Details

**Audit actions:** CREATE, UPDATE, DELETE, EXECUTE, REPLAY, TEST, LOGIN, EXPORT

**Audit results:** SUCCESS, FAILURE, PARTIAL

Read-only browse — no row navigation or filtering UI.

Platform dashboard also shows recent global audit entries.

---

## 11. System Configuration

**Route:** `/system-config`  
**Component:** `SystemConfigTabs`

### 11.1 Access Tab

**Platform user management** with full CRUD via server actions.

**Users table columns:** Name, Email, Role, Tenant Access, Status, Last Login, Manage

**Roles (`PlatformUserRole`):**

| Role | Tenant Access Behavior |
|------|----------------------|
| PLATFORM_ADMIN | `allTenantsAccess: true`; tenantIds cleared |
| TENANT_OPERATOR | Scoped to selected tenantIds |
| TENANT_VIEWER | Scoped to selected tenantIds |

**User statuses:** ACTIVE, INACTIVE

**Add/Edit user dialog fields:**

- Name (required)
- Email (valid email, unique on create)
- Role (select)
- Status (select)
- Tenant access checkboxes with search (required for non-admin roles)

**Server actions:**

- `createPlatformUserAction` — validates, checks email uniqueness, revalidates `/system-config`
- `updatePlatformUserAction` — validates user exists, enforces tenant access rules

**Mock session user:** `USR-000001` (Admin User, admin@commerceone.io)

### 11.2 Providers Tab

**Read-only provider catalog table.**

**Columns:** Code, Name, Category, Version, Capabilities, Supported Triggers

No create/edit/delete — catalog is seeded in mock database.

### 11.3 Platform Settings Tab

**Read-only card** displaying:

| Setting | Description |
|---------|-------------|
| Platform Name | CommerceOne Integration Hub |
| Default Timezone | Platform-wide default |
| Max Concurrent Executions | Execution concurrency limit |
| Worker Count | Worker pool size |
| Maintenance Mode | Boolean flag |

Loaded via `systemConfigService.getPlatformSettings()`. No edit UI wired.

### 11.4 System Config Profiles (Backend Data)

Available via `systemConfigService` (used by integration wizard, not directly editable in UI):

- Validation profiles
- Mapping profiles
- Transformation profiles
- Routing profiles
- Execution policies
- Retry policies
- Retention policies (executionRetentionDays, dlqRetentionDays, auditRetentionDays)

---

## 12. Marketplace OAuth Flow

**Routes:** `/oauth/authorize/[provider]`, `/oauth/callback/[provider]`

**Supported providers:** shopee, lazada, tiktok (others return 404)

### 12.1 Authorize Page

**Component:** `MarketplaceAuthorizeClient`

- Branded marketplace header
- Permission scope list
- OAuth parameter display (client_id, redirect_uri, state, scope)
- **Authorize** → generates mock auth code, redirects to callback
- **Deny** → error redirect
- External OAuth URL reference link for real marketplace developer consoles

**Mock mode:** Controlled by `NEXT_PUBLIC_MOCK_MARKETPLACE_OAUTH=true` — uses local consent simulator instead of real Shopee/Lazada/TikTok URLs.

### 12.2 Callback Page

**Component:** `OAuthCallbackClient`

- Processing → success/error states
- Exchanges auth code for mock tokens
- `postMessage` to opener window with token payload or error
- Auto-closes popup

### 12.3 OAuth Utilities

- `openMarketplaceOAuthPopup()` — opens popup and awaits token response
- `generateOAuthState()` — CSRF state token
- `getOAuthCallbackUri()` — `{origin}/oauth/callback/{provider}`
- `generateMockAuthCode()` / `generateMockShopId()` — mock token generation
- Marketplace credential merge helpers in `marketplace-credentials.ts`

---

## 13. Domain Model & Enumerations

### 13.1 Core Entity Hierarchy

```
Provider (catalog)
  └── Connection (tenant-scoped, authenticated)
        └── Integration (source + destination + data flow + policies)
              └── Execution (runtime instance)
                    ├── ExecutionErrorRecord
                    ├── DlqRecord
                    └── RetryRecord

CircuitBreaker (per connection)
AuditLog (platform + tenant scoped)
PlatformUser (access control)
PlatformSettings (global config)
```

### 13.2 Key Entity Fields

**Tenant:** code, name, country, timezone, status, description

**Connection:** tenantId, providerId, name, status, activeStatus, configuration (key-value), lastTestedAt, lastUsedAt

**Integration:** tenantId, code, name, sourceConnectionId, destinationConnectionId, dataFlowId, triggerType, profile IDs, status, successRate, lastRunAt, triggerConfig, executionPolicy, retryPolicy, failureNotification, circuitBreaker, idempotency

**Execution:** tenantId, integrationId, triggerType, status, environment, timing metrics, chunk/record counters, timeline, executionStages, operationalInsight, retrySummary, errorSummary, dlqSummary

**DlqRecord:** tenantId, executionId, integrationId, stage, errorCode, errorMessage, retryCount, status, payload, stackTrace

### 13.3 Complete Enumeration Reference

| Enum | Values |
|------|--------|
| `TenantStatus` | ACTIVE, SUSPENDED, PENDING, ARCHIVED |
| `ProviderCapability` | SOURCE, DESTINATION |
| `ProviderCategory` | MARKETPLACE, ERP, CRM, WMS, PROTOCOL, STORAGE, CUSTOM |
| `ConnectionStatus` | HEALTHY, WARNING, ERROR, TESTING |
| `ConnectionActivationStatus` | ACTIVE, INACTIVE |
| `TriggerType` | SCHEDULE, WEBHOOK, API |
| `IntegrationStatus` | ACTIVE, INACTIVE, DRAFT, ERROR, BREAK |
| `ExecutionStatus` | CREATED, QUEUED, RUNNING, VALIDATING, MAPPING, TRANSFORMING, ROUTING, DELIVERING, COMPLETED, FAILED, DLQ (deprecated), CANCELLED |
| `DlqStatus` | OPEN, IN_PROGRESS, RESOLVED, REPLAYED, DISCARDED |
| `RetryStatus` | PENDING, IN_PROGRESS, COMPLETED, EXHAUSTED, CANCELLED |
| `RetryStrategy` | FIXED, EXPONENTIAL, DECORRELATED_JITTER, LINEAR, CUSTOM |
| `NotificationChannel` | EMAIL, SLACK, TEAMS, WEBHOOK |
| `CircuitBreakerState` | CLOSED, OPEN, HALF_OPEN |
| `AuditAction` | CREATE, UPDATE, DELETE, EXECUTE, REPLAY, TEST, LOGIN, EXPORT |
| `AuditResult` | SUCCESS, FAILURE, PARTIAL |
| `ProfileStatus` | ACTIVE, INACTIVE, DRAFT |
| `PlatformUserRole` | PLATFORM_ADMIN, TENANT_OPERATOR, TENANT_VIEWER |
| `PlatformUserStatus` | ACTIVE, INACTIVE |

---

## 14. Provider Catalog & Data Flows

### 14.1 Provider Catalog (10 Providers)

| Code | Name | Category | Capabilities |
|------|------|----------|-------------|
| shopee | Shopee | MARKETPLACE | SOURCE |
| lazada | Lazada | MARKETPLACE | SOURCE |
| tiktok | TikTok Shop | MARKETPLACE | SOURCE |
| sap | SAP | ERP | DESTINATION |
| netsuite | NetSuite | ERP | DESTINATION |
| rest | REST API | PROTOCOL | SOURCE, DESTINATION |
| webhook | Webhook | PROTOCOL | SOURCE, DESTINATION |
| sftp | SFTP | STORAGE | SOURCE, DESTINATION |
| ftp | FTP | STORAGE | SOURCE, DESTINATION |
| s3 | Amazon S3 | STORAGE | SOURCE, DESTINATION |

Each provider includes: configurationSchema, supportedTriggers, dataFlows[], version, description.

### 14.2 Data Flow Catalog

Defined in `src/data/provider-data-flows.ts`. Each flow specifies:

- code, name, description, category
- direction (SOURCE / DESTINATION / BOTH)
- supportedTriggers, recommendedTrigger
- Default batch/chunk sizes
- Default profile codes (mapping, validation, transformation, routing, execution, retry)
- requiredSourceCapabilities
- supportedDestinationCategories

#### Marketplace Data Flows (per Shopee, Lazada, TikTok)

| Flow Code | Name | Recommended Trigger |
|-----------|------|-------------------|
| ORDERS | Orders | SCHEDULE |
| ORDER_STATUS | Order Status | WEBHOOK |
| PRODUCTS | Products | SCHEDULE |
| INVENTORY | Inventory | SCHEDULE |
| PRICE | Price | SCHEDULE |
| SHIPMENT | Shipment | WEBHOOK |
| RETURNS | Returns | WEBHOOK |

#### Additional Provider Flows

- REST API: inbound/outbound API flows
- Webhook: receive/send webhook flows
- SFTP/FTP/S3: file-based import/export flows
- SAP/NetSuite: ERP destination flows (orders, products, inventory, etc.)

### 14.3 Provider Logos

When `NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY` is set, provider cards display real company logos via Logo.dev:

| Provider | Domain |
|----------|--------|
| shopee | shopee.com |
| lazada | lazada.com |
| tiktok | tiktok.com |
| sap | sap.com |
| netsuite | netsuite.com |
| s3 | aws.amazon.com |

Fallback: monogram when key absent or domain unmapped.

---

## 15. Server Actions & Validation Rules

### 15.1 Action Inventory

| File | Actions |
|------|---------|
| `tenant.actions.ts` | `createTenantAction` |
| `access.actions.ts` | `createPlatformUserAction`, `updatePlatformUserAction` |
| `connection.actions.ts` | `createConnectionAction`, `updateConnectionAction`, `toggleConnectionActiveStatusAction`, `testConnectionAction` |
| `integration.actions.ts` | `createIntegrationAction`, `saveIntegrationDraftAction`, `setIntegrationInactiveAction` |

**Total: 11 server actions**

### 15.2 Zod Schema Summary

#### Tenant (`createTenantSchema`)

- name: 2–120 trimmed chars
- code: 3–12, uppercase regex
- country: enum from TENANT_COUNTRIES
- timezone: enum from country timezones
- description: optional, max 500
- assignedUserIds: min 1 non-empty string

#### Connection (`createConnectionSchema` / `updateConnectionSchema`)

- providerId: non-empty (create only)
- name: 2–120 trimmed chars
- configuration: Record<string, string>
- Plus `validateProviderAuth()` per provider code

#### Integration (`createIntegrationSchema`)

- All connection/flow/trigger fields required
- Runtime sub-schemas: triggerConfig, executionPolicy, retryPolicy, failureNotification, circuitBreaker, idempotency
- Cross-field: source ≠ destination

#### Integration Draft (`saveIntegrationDraftSchema`)

- Same shapes but connections/flow/trigger optional
- Cross-field rule when both connections provided

#### Platform User (inline in access.actions.ts)

- name: min 1 char
- email: valid email
- role: PlatformUserRole enum
- status: PlatformUserStatus enum
- allTenantsAccess: boolean
- tenantIds: string array (min 1 for non-admin)

### 15.3 Cross-Cutting Action Behaviors

- **Cache revalidation:** `revalidatePath()` on affected routes after mutations
- **Redirects vs JSON:** Create/update flows redirect; toggles and draft saves return structured results
- **Tenant scoping:** Connection and integration actions verify resource belongs to route tenant
- **Code normalization:** Tenant and integration codes stored uppercase; uniqueness checks case-insensitive
- **Connection test:** Simulated only — 1.2s delay, mock metadata, no real HTTP/OAuth

---

## 16. Services & Repository Layer

### 16.1 Service Inventory

| Service | Key Methods |
|---------|------------|
| `tenantService` | listTenants, getTenant, findByCode, getTenantStats, createTenant, updateTenant, deleteTenant |
| `platformUserService` | listUsers, getUser, createUser, updateUser |
| `providerService` | listProviders, getProvider, getProviderByCode |
| `connectionService` | listConnections, getConnection, getConnectionsByTenant, createConnection, updateConnection |
| `integrationService` | listIntegrations, getIntegration, getIntegrationsByTenant, createIntegration, updateIntegration |
| `executionService` | listExecutions, getExecution, getRecentByTenant, getRecent |
| `dashboardService` | getMetrics, getExecutionTrend, getFailureTrend, getDlqTrend, getProviderUsage, getStatusDistribution |
| `systemConfigService` | Profile/policy getters, getPlatformSettings |
| `dlqService` | listRecords, getRecord, getByExecutionId |
| `executionErrorService` | getByExecutionId, getById |
| `retryService` | listRecords, getByExecutionId |
| `circuitBreakerService` | list |
| `auditLogService` | list, getRecentByTenant |

### 16.2 Repository Container

All repositories injected via `src/repositories/index.ts`:

```
tenant, provider, connection, integration, execution, executionError,
dlq, retry, circuitBreaker, auditLog, systemConfig, platformUser, dashboard
```

Each has interface in `repositories/interfaces/` and mock implementation in `repositories/implementations/mock/`.

### 16.3 Query & Pagination

- Shared pagination utilities in `repositories/utils/pagination.ts`
- Query filters defined in `src/types/query.ts`
- Standard filter params: page, pageSize, tenantId, status, search

---

## 17. Mock Data & Seed Volumes

Programmatically generated in `src/data/mock-database.ts`:

| Entity | Count |
|--------|-------|
| Providers | 10 |
| Tenants | 20 |
| Connections | 100 |
| Integrations | 200 |
| Executions | 3,000 |
| DLQ Records | 500 |
| Retry Records | 200 |
| Audit Records | 100 |
| Circuit Breakers | 50 |
| Validation/Mapping/Transformation/Routing Profiles | 20 each |
| Execution/Retry Policies | 10 each |
| Platform Users | Seeded including USR-000001 (Admin) |

Mock data includes realistic:
- Connection configurations per provider type
- Execution timelines with multi-stage progression
- Operational insight panels (failure, retry, live, performance)
- Error distributions and DLQ payloads
- Circuit breaker state transitions

---

## 18. Shared UI Components & UX Patterns

### 18.1 Shared Components

| Component | Purpose |
|-----------|---------|
| `DataTable` | Responsive table with mobile card layout, row links, empty states, captions |
| `StatCard` | KPI display with icon and optional trend |
| `PageHeader` | Page title, description, action slot |
| `DetailPageHeader` | Back button, title, subtitle, status badge, actions |
| `StatusBadge` | Universal enum/status rendering with consistent color coding |
| `SectionHeading` | Accessible section titles |
| `PipelineVisualization` | Horizontal stage flow with active/completed/error styling |
| `Timeline` | Chronological event display |
| `ProviderLogo` | Provider icon via Logo.dev or fallback |

### 18.2 Wizard Framework

| Component | Purpose |
|-----------|---------|
| `WizardLayout` | Title, description, stepper, content panel, sticky footer |
| `WizardStepper` | Numbered steps with complete/current/future visual states |
| `FieldError` | Inline validation message display |

**Used by:** Create Tenant (3 steps), Create Connection (5 steps), Create Integration (8 steps)

**Footer pattern:** Cancel (step 0) / Back, optional Save as Draft, Next or Submit

### 18.3 UI Primitives (shadcn/ui)

button, input, textarea, select, label, checkbox, switch, card, tabs, table, dialog, sheet, alert, alert-dialog, badge, dropdown-menu, popover, tooltip, progress, skeleton, scroll-area, avatar, separator, breadcrumb, command, input-group

### 18.4 UX Patterns

1. **Sticky footers** on wizards and edit pages with primary save actions
2. **Card-based pickers** for providers, connections, data flows, trigger types
3. **Status-driven insight panels** on execution overview (failure/retry/live/performance)
4. **Masked secrets** in connection review; editable secrets in auth forms
5. **Draft save** on integration wizard without leaving flow
6. **Mobile-responsive tables** via shared DataTable card layout on small screens
7. **Safe return paths** for cross-route navigation (`safeReturnPath`, `dlqDetailPath`)
8. **Chart color consistency** via `chart-colors.ts` and `STATUS_CHART_COLORS`

---

## 19. Environment Variables & External Integrations

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY` | Logo.dev publishable key for provider logos | Empty (logos disabled) |
| `NEXT_PUBLIC_MOCK_MARKETPLACE_OAUTH` | Use local OAuth consent simulator | `false` |

See `.env.example` for documentation.

---

## 20. Testing, Build & CI/CD

### 20.1 Unit Tests (Vitest)

| Test File | Coverage |
|-----------|----------|
| `tenant.schema.test.ts` | Tenant creation validation rules |
| `connection.schema.test.ts` | Connection schema + provider config validation |
| `integration.schema.test.ts` | Integration schemas + runtime policy cross-field rules |
| `pagination.test.ts` | Repository pagination utilities |

### 20.2 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 4100 |
| `npm run build` | Production build |
| `npm run start` | Production server on port 4100 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest run |
| `npm run test:watch` | Vitest watch mode |

### 20.3 CI/CD (GitHub Actions)

| Workflow | Triggers | Steps |
|----------|----------|-------|
| `.github/workflows/pr.yml` | Pull requests | lint, typecheck, test, build |
| `.github/workflows/main.yml` | Main branch | lint, test, build, Docker build |
| `.github/workflows/release.yml` | Release | build, push to AWS ECR |

**Deployment target:** AWS ECS Fargate

### 20.4 Docker

```bash
docker build -t commerceone-admin .
docker run -p 4100:4100 commerceone-admin
```

---

## 21. Feature Implementation Status

Features verified as **UI-only or not wired to backend** (important for operators and developers):

| Feature | Location | Status |
|---------|----------|--------|
| Notifications bell | TopNav | Placeholder — no handler |
| Account menu (Profile, Settings, Sign out) | TopNav | UI only — no auth |
| Tenant settings Save / Suspend / Archive | `/tenants/[id]/settings` | No server actions |
| Retry Cancel button | Retry table | No handler |
| Circuit Breaker Reset button | Circuit breakers table | No handler |
| Circuit breakers page navigation | Tenant tabs | Page exists but not linked |
| Execution Cancel button | Execution detail | No handler |
| DLQ Replay with payload | DLQ detail | Client-side validation only |
| Integration activation (DRAFT → ACTIVE) | Integration actions | Not implemented |
| Mapping rule persistence | Mapping UI | In-memory mock only |
| Platform settings edit | System Config | Read-only display |
| Provider catalog edit | System Config | Read-only display |
| Validation/Transformation/Routing profile editors | Integration Designer | Future release placeholders |
| JWT authentication | Entire app | Future-ready (mock session user) |
| Sidebar navigation | ui.store | Flag exists; sidebar not implemented |

---

## 22. Route Reference

```
/                                    → redirect /dashboard
/dashboard                           Platform dashboard
/tenants                             Tenant list
/tenants/new                         Create tenant wizard
/tenants/[id]                        → redirect /overview
/tenants/[id]/overview               Tenant dashboard
/tenants/[id]/connections            Connection list
/tenants/[id]/connections/new        Create connection wizard
/tenants/[id]/connections/[connectionId]  Connection detail/edit
/tenants/[id]/integrations           Integration list
/tenants/[id]/integrations/new       Create integration wizard
/tenants/[id]/integrations/[integrationId]      → redirect /edit
/tenants/[id]/integrations/[integrationId]/edit   Edit integration
/tenants/[id]/executions             Execution list
/tenants/[id]/retry                  Retry queue
/tenants/[id]/dlq                    DLQ list
/tenants/[id]/audit-logs             Audit logs
/tenants/[id]/settings               Tenant settings
/tenants/[id]/circuit-breakers       Circuit breakers (orphan route)
/executions/[id]                     Execution detail (global)
/dlq/[id]                            DLQ detail (global)
/integrations/[id]/edit              → redirect to tenant-scoped edit
/system-config                       Platform configuration
/oauth/authorize/[provider]          Marketplace OAuth consent
/oauth/callback/[provider]           OAuth callback handler
```

---

## Appendix A: Integration Runtime Defaults

| Policy | Key Defaults |
|--------|-------------|
| Execution | batch 1000, chunk 100, parallel 10, RPS 20, timeout 900s |
| Retry | exponential, 5 attempts, 60s–3600s intervals, 7-day window |
| Notification | email + slack to ops@example.com, integration-team@example.com |
| Circuit Breaker | threshold 5, open 60s, 3 half-open probes, 2 success threshold |
| Idempotency | enabled, template: tenant_id + integration_id + source_reference_id |
| Schedule trigger | cron `0 */15 * * * *`, timezone Asia/Bangkok |

---

## Appendix B: File Count Summary

| Area | Files |
|------|-------|
| App routes (page.tsx) | 25 |
| Components | 108 |
| Server actions | 4 modules / 11 actions |
| Services | 11 modules |
| Repository interfaces + mock implementations | 13 entity types |
| Zod schemas | 3 files + inline access schemas |
| Unit tests | 4 files |

---

*Generated from codebase analysis of CommerceOne Integration Hub Admin Portal. All features, routes, and behaviors documented here are verified against source files under `src/`.*
