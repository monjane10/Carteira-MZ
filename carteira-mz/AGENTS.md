# Instruções para Agentes

## Stack

Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4.

- **Path alias** `@/*` → `./src/*`
- **State**: Zustand stores in `src/store/slices/`. Stores call mock services directly (see Data Layer).
- **UI**: Radix UI primitives, Lucide icons, Recharts, Framer Motion. `cn()` utility (`clsx` + `tailwind-merge`) for class merging.
- **Forms**: `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Layout**: Route groups `(auth)` (login/register) and `(dashboard)` (main app with sidebar). Each page in `src/app/` delegates to a module in `src/modules/`.

## Commands

```
npm run dev       # dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint (v9, flat config: eslint.config.mjs)
```

No test framework, no typecheck script.

## Data Layer

- Two implementations: **mock** (`src/services/mock/`) and **Supabase** (`src/services/supabase/`).
- Controlled by `NEXT_PUBLIC_USE_SUPABASE=false` in `.env` (committed, currently false).
- **All stores currently import from `@/services/mock/...`**. To switch, update store imports to `@/services/supabase/`.
- **Supabase services** (`src/services/supabase/`) are fully implemented with:
  - Business logic (balance updates on transactions, status transitions on loans/goals)
  - Error handling via custom `ServiceError` / `NotFoundError` / `handleError()`
  - Structured logging via `logger` (levels INFO/WARN/ERROR/DEBUG)
  - One file per entity (accounts, categories, transactions, transfers, loans, goals, budgets, notifications, dashboard, admin, auth)
- Mock services use in-memory arrays with simulated async delay.

## Mobile Responsiveness

- Dashboard splits into `mobile-index.tsx` (mobile) vs `index.tsx` (desktop).
- **"Minhas Contas"** horizontal section must keep scroll. Fix with `min-w-0`, `shrink-0`, wrapper sizing. Never use blind `overflow-hidden`. No `w-screen`/`100vw` on elements that should scroll.
- Global CSS: `overflow-x: hidden` on `html, body`. `hide-scrollbar` utility class available.

## Locale

Portuguese (Mozambique) — `pt-MZ`, currency MZN. Labels in Portuguese (e.g. `ACCOUNT_TYPE_LABELS`, error messages).

## Auth

- Cookie-based session guard: `carteira_session` = `"authenticated"`.
- The file `src/proxy.ts` defines auth middleware logic and a `config.matcher` but is **not wired up** (no `middleware.ts` exists). If you add middleware, copy the matcher routes and cookie check from `proxy.ts`.

## Supabase Schema

Full schema in `supabase-schema.sql` — 14 tables, RLS policies, auto-insert profile trigger, seed data for institutions and default categories.

## Project Structure

```
src/
  app/            # Next.js App Router pages
  modules/        # Feature modules (accounts, dashboard, etc.)
  components/
    ui/           # Primitive UI components (button, card, dialog, etc.)
    shared/       # Shared components (page-header, stat-card, data-table, etc.)
    layout/       # dashboard-layout, sidebar, header, mobile-nav
  store/slices/   # Zustand stores (one per entity)
  services/
    mock/         # Current data source
    supabase/     # Supabase implementation (not yet connected)
  types/          # All TypeScript interfaces
  lib/            # supabase client, cn(), formatCurrency(), etc.
  constants/      # Labels, colors, nav items
  hooks/          # use-media-query, use-toast
  validators/     # Zod schemas
```
