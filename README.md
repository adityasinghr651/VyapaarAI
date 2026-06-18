# VyapaarAI — SMB Operations Platform (Phase 1)

VyapaarAI is a modular, high-performance SaaS platform built specifically for small-to-medium businesses (SMBs). This repository is configured as an **NPM Workspaces** monorepo using **Turborepo** for ultra-fast builds, caching, and script orchestration.

> [!NOTE]
> **Repository Evolution:** The platform has transitioned from the previous single-application database design (originally named FlowGuard) to a fully modular, type-safe monorepo environment under the brand **VyapaarAI**, introducing decoupled backend services, dynamic client-side layouts, and automated code-quality pipelines.

---

## ✨ Recent Changes & Key Implementation Details

The repository has been updated with the following core architectural changes and feature implementations:

### 1. Monorepo Migration & Re-Branding
* **Turborepo Integration:** Converted the project structure into an NPM Workspaces monorepo governed by Turborepo, optimizing caching, linting, and build tasks across the entire stack.
* **Unified Brand Identity:** Updated all license policies, configuration scripts, and documentation files to align with the **VyapaarAI** branding.

### 2. Backend Service Layer (`apps/api`)
* **NestJS Modular Core:** Implemented modular controllers, services, and modules for:
  * **Authentication (`auth`):** Safe JWT-based signups, login verification, and cryptographically hashed passwords via `bcrypt`.
  * **Customer Management (`customers`):** API endpoints managing buyer profiles.
  * **Product Inventory (`products`):** API endpoints handling product catalog data, unit prices, and GST tax codes.
  * **Invoice Management (`invoices`):** Service layer orchestrating document cycles.
  * **Audit Logging (`audit`):** Global tracking module recording database mutations, user actions, IP addresses, and actors.
* **Transaction-Safe Sequential Invoicing:** Designed an atomic database transaction routine utilizing an `InvoiceSequence` schema to generate unique, sequential invoice numbers (`INV-YYYY-XXXX`) reliably under concurrent load.
* **Backend Financial Logic Verification:** Implemented strict backend validation for all subtotal, tax rate (static 18% GST), and grand total calculations. This guarantees calculations are never modified or bypassed by frontend clients.

### 3. Frontend Application Client (`apps/web`)
* **Next.js App Router Setup:** Built the frontend layout utilizing Next.js React App Router, dynamic layouts, and client-side page transitions.
* **Modern Premium Styling:** Applied a custom dark-themed UI system employing **Tailwind CSS** with glowing glassmorphism gradients and modern typography.
* **Dynamic Domain Pages:** Created pages for user sign-in/registration, dashboard metric highlights, real-time product list management, customer profiles, and a multi-step invoice creator.
* **Client State Synchronization:** Configured state synchronization using **Zustand** (global context) and **React Query** (caching and remote data synchronization).

### 4. Shared Types Module (`packages/shared-types`)
* **Type Safety Synchronization:** Created a shared library that compiles TypeScript enums (e.g., `Role`, `InvoiceStatus`), DTO interfaces, and standardized API response formats (`ApiResponse<T>`) used by both the backend API and frontend client.

### 5. Developer Tooling & Quality Gates
* **Git Pre-commit Hooks:** Configured **Husky** and **commitlint** to enforce the Conventional Commits specification on all developer commits.
* **Database Precision & Safety:** Configured Prisma schemas to use `Decimal` database mapping for exact monetary calculations, avoiding floating-point precision issues, and implemented soft-delete filters (`deletedAt`) to preserve historical records.

---

## 🛠️ Tech Stack

* **Backend:** NestJS, TypeScript, Prisma ORM, PostgreSQL (JWT + bcrypt authentication)
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS (glowing glassmorphism theme), Zustand, React Query
* **Infrastructure:** Docker Compose (local PostgreSQL database)
* **Engineering Standards:** Strict TypeScript (`strict: true`), ESLint, Prettier, Commitlint, Husky

---

## 📂 Project Structure

```text
/
├── apps/
│   ├── api/             # NestJS backend app (auth, customers, products, invoices, audit)
│   └── web/             # Next.js frontend web app (domain-specific pages and styling)
├── packages/
│   └── shared-types/    # Shared TypeScript DTOs, API contracts, and enums
├── docs/                # Setup and workflow documentation guides
├── .github/workflows/   # CI/CD verification workflows
├── package.json         # Workspace scripts and root devDependencies
├── turbo.json           # Turborepo task runner configuration
└── docker-compose.yml   # Local PostgreSQL service definition
```

---

## 💻 Local Development Setup

To bootstrap the project locally, ensure you have **Node.js (v22+)** and **Docker** installed, then execute:

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL Database
```bash
docker compose up -d
```

### 3. Generate Prisma client & Run migrations
```bash
npm --workspace=apps/api run db:migrate
```

### 4. Seed Development Database
This populates sample products, customers, and a development OWNER account.
```bash
npm --workspace=apps/api run db:seed
```

> [!WARNING]
> **Development Seeding Credentials (DEVELOPMENT ONLY):**
> - **Email:** `owner@vyapaarai.com`
> - **Password:** `DevOwner123!`
> 
> *These credentials are for local verification and test cases only. In production, registration and environment-supplied secrets must be used.*

### 5. Spin up Dev Servers
This starts both the NestJS API (on http://localhost:4000) and Next.js Frontend (on http://localhost:3000):
```bash
npm run dev
```

### 6. View database in Prisma Studio
To visually inspect local data records:
```bash
npm --workspace=apps/api run db:studio
```

---

## 🚦 Running Verification Tasks

Before committing or pushing code:

```bash
# Run ESLint validation across workspaces
npm run lint

# Run Jest unit test suites
npm run test

# Run build compiling checks
npm run build
```
