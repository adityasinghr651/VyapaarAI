# Setup Guide

Welcome to the FlowGuard development environment. Follow these steps to bootstrap the repository locally.

## Prerequisites

* Node.js (v20+ recommended)
* npm, pnpm, or yarn
* Docker Desktop (for local queue/database simulation if needed)
* Git

## 1. Local Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/flowguard/flowguard.git
cd flowguard
npm install
```

## 2. Environment Variables

Copy the example environment file and fill in your local details:

```bash
cp .env.example .env.local
```
*Ensure you NEVER commit `.env.local` to version control.*

## 3. Supabase Setup

FlowGuard uses Supabase for PostgreSQL and authentication.

1. Install the Supabase CLI: `npm install -g supabase`
2. Start local Supabase instance:
   ```bash
   supabase start
   ```
3. Run database migrations:
   ```bash
   supabase db reset
   ```
   *(This will apply all migrations in `supabase/migrations` to your local DB).*

## 4. Next.js Startup

Start the local development server:

```bash
npm run dev
```
Access the application at `http://localhost:3000`.

## 5. Testing & Linting

We maintain strict quality gates. Run these commands locally before pushing:

* **Linting:** `npm run lint`
* **Formatting:** `npm run format`
* **Type Checking:** `npm run type-check`
* **Unit Tests:** `npm run test`

## 6. Docker Setup (Optional)

If you need to spin up the entire stack including future queue workers (Redis/Temporal):

```bash
docker-compose up -d
```

## 7. Troubleshooting

* **Database Connection Issues:** Ensure Docker is running before executing `supabase start`.
* **Port Conflicts:** If port 3000 or 5432 is in use, modify your `.env.local` and `supabase/config.toml` accordingly.
* **Type Errors:** Run `npm run build` to verify Next.js route typings.
