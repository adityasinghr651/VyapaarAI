# Architecture & System Design — VyapaarAI

VyapaarAI is structured as a **Monorepo** consisting of decoupled frontend and backend applications, connected by a shared types package. We enforce a strict service-oriented boundary to maintain reliability, database integrity, and future-readiness for distributed architectures.

## Core Stack

* **Frontend Client (`apps/web`):** Next.js (App Router), TypeScript, Tailwind CSS (glowing glassmorphism theme), Zustand (global context state), React Query (caching and data fetching)
* **Backend API (`apps/api`):** NestJS, TypeScript, Prisma ORM
* **Database (`PostgreSQL`):** Hosted locally via Docker Compose or on dedicated servers, using Prisma schema and migrations.
* **Shared Types (`packages/shared-types`):** Direct type synchronization across backend and frontend boundaries.

## Repository Folder Structure

```text
/
├── apps/
│   ├── api/                  # NestJS API application
│   │   ├── prisma/           # Prisma DB schema & migrations
│   │   └── src/              # NestJS modules (auth, customers, products, invoices, audit, common)
│   └── web/                  # Next.js web client app
│       └── src/              # Next.js routes, components, state stores, and layout styles
├── packages/
│   └── shared-types/         # Shared TypeScript interfaces, contracts, and enums
├── docs/                     # Development and workflow guidelines
└── .github/                  # CI/CD workflows and PR templates
```

## System Boundaries

| Layer / Workspace | Tech / Responsibility | Strict Rules |
|---|---|---|
| **`apps/web`** | Next.js (Client UI) | Standard presentational pages and styling. All calculations and access controls must be delegated to the backend. No raw DB calls. |
| **`apps/api`** | NestJS (API & Business Logic) | Exposes endpoints, applies domain rules, processes business logic, and interacts with PostgreSQL. |
| **`packages/shared-types`** | TypeScript Definitions | Shared types/enums only. No executable business logic. |
| **`PostgreSQL` (DB)** | Database Layer | Relational database. Handled strictly through Prisma client actions in the NestJS application services. |

## Request Lifecycle

1. **Client Request:** Enters the Next.js client (`apps/web`) via page interaction, triggering a React Query mutation or query.
2. **API Router / HTTP Request:** The client makes an HTTP request to the NestJS API (`apps/api`), passing authorization headers (JWT token).
3. **Controller Guard & Schema Validation:** NestJS controller receives the request, runs JWT validation guards, and validates request bodies using `class-validator` DTOs.
4. **Service Layer (Core Domain Logic):** The controller delegates to a domain service (e.g., `InvoicesService`). The service enforces business logic (e.g., recalculating item prices, checking soft-deleted status, calculating 18% GST).
5. **Database Transaction / Prisma:** The service communicates with PostgreSQL via Prisma Client. For sensitive operations (like invoice sequential numbering), an atomic database transaction (`$transaction`) is executed.
6. **Audit Log Emission:** Immediately following a state-mutating database transaction, the `AuditService` creates an audit record capturing the action, actor metadata, and payload details.
7. **Response Output:** The service formats the returned data, ensuring it conforms to the shared interfaces defined in `shared-types`, and returns it back to the client.

## Core Design Decisions

### 1. Database Precision
* All monetary values are declared in Prisma as `Decimal(10, 2)` to avoid JavaScript binary floating-point errors.
* We perform all math operations using high-precision decimal operations (via Prisma's decimal representation or native decimal packages).

### 2. Transaction-Safe Sequential Invoicing
* Invoice numbers follow the format `INV-YYYY-XXXX`.
* To avoid collisions and gaps under high concurrency, generation is wrapped in a database-level transaction (`$transaction`). The sequence is maintained in an `InvoiceSequence` table, incremented atomically during creation.

### 3. Soft Delete Pattern
* Deleting customers, products, or invoices uses soft deletion (`deletedAt` timestamp).
* Data queries filter out soft-deleted items unless explicitly specified.

### 4. Audit Trail Integrity
* The `AuditLog` table maintains an immutable ledger of all critical events (`USER_LOGIN`, `CUSTOMER_CREATION`, `INVOICE_CREATION`, etc.).
