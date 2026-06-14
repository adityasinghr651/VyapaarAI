# Architecture & System Design

FlowGuard is built as a **Modular Monolith** with a strictly enforced **Service-Layer Architecture**. This ensures strong boundaries, clear request lifecycles, and future-readiness for potential microservices or event-driven extraction.

## Core Stack

* **Frontend:** Next.js (React App Router), TailwindCSS (ultra-minimal futuristic glassmorphism UI)
* **Backend:** Node.js / TypeScript
* **Database:** Supabase (PostgreSQL)

## Repository Folder Structure

```text
/
├── app/                  # UI, Routes, Layouts (Next.js App Router)
├── components/           # Reusable UI components (pure, presentational)
├── services/             # ALL Core Business Logic
├── lib/                  # Shared infrastructure utilities (logging, clients)
├── db/                   # Database access layer (Supabase clients, schema)
├── docs/                 # Engineering documentation
└── .github/              # Governance and CI/CD pipelines
```

## System Boundaries

| Layer | Responsibility | Strict Rules |
|---|---|---|
| **`/app`** | UI + Routing | API routes/controllers MUST remain thin. No business logic here. |
| **`/services`** | Business Logic | The only place where domain rules are applied. |
| **`/lib`** | Infrastructure | Shared utilities. Should not import from `/services` or `/app`. |
| **`/db`** | Data Access | Pure DB interactions. No business validation. |

## Request Lifecycle

1. **Client Request:** Enters via `/app` (API Route or Server Action).
2. **Controller (Thin):** Parses the request, validates input schema (e.g., Zod), and calls the appropriate service.
3. **Service Layer:** Executes business logic, performs security checks, and calls the `/db` layer.
4. **Audit Logging:** The service layer emits an audit log for any state mutation.
5. **Database Interaction:** The `/db` layer safely interacts with Supabase.
6. **Response:** Data is formatted and returned to the client.

## Audit Logging Flow

Audit logging is **mandatory** for all state changes. 

* Every mutation request must carry a unique `requestId` and `actorId`.
* The `AuditService` must be invoked immediately following a successful database transaction.
* State mutations must be deterministic and traceable back to the exact API call and payload.

## Scalability Evolution & Future Roadmap

* **Current:** Modular Monolith (simplicity and velocity while maintaining boundaries).
* **Future Queue/Event Architecture:** As async workflow handling grows, heavy tasks will be extracted to an Event Queue (e.g., Temporal or an internal Redis queue). The `/services` layer is designed to allow functions to be easily wrapped in workers.
* **Database Boundaries:** We strictly use Supabase RLS (Row Level Security) and maintain clean relational schemas to ensure safe horizontal scaling in the future.
