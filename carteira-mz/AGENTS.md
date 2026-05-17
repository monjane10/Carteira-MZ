# Instruções para Agentes

## Stack

Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4.

- **Path alias** `@/*` → `./src/*`
- **State**: Zustand stores in `src/store/slices/`. Stores import services from `@/services`.
- **UI**: Radix UI primitives, Lucide icons, Recharts (lazy loaded with `next/dynamic` + `ssr: false`), Framer Motion. `cn()` utility (`clsx` + `tailwind-merge`) for class merging.
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

- **Apenas Supabase** — `src/services/supabase/` is the single data source.
- All services exported via namespace from `src/services/index.ts`:
  `accounts`, `categories`, `transactions`, `transfers`, `loans`, `goals`, `budgets`, `notifications`, `dashboard`, `admin`, `supabase`
- **Server-side API routes** bypass RLS using `SUPABASE_SERVICE_ROLE_KEY`:
  - `src/app/api/admin/stats/route.ts` — aggregated stats (all users)
  - `src/app/api/admin/users/route.ts` — all users with account counts
  - `src/app/api/delete-account/route.ts` — deletes `auth.users` row via `admin.deleteUser()`
  - Client code calls these via `fetch()` with auth token in `Authorization: Bearer` header
- Business logic (balance updates on transactions, status transitions on loans/goals)
- Error handling via custom `ServiceError` / `NotFoundError` / `handleError()`
- Structured logging via `logger` (levels INFO/WARN/ERROR/DEBUG)
- Auth via `supabase.auth` (signInWithPassword, signUp, signOut)

## Mobile Responsiveness

- Dashboard splits into `mobile-index.tsx` (mobile) vs `index.tsx` (desktop).
- **"Minhas Contas"** horizontal section must keep scroll. Fix with `min-w-0`, `shrink-0`, wrapper sizing. Never use blind `overflow-hidden`. No `w-screen`/`100vw` on elements that should scroll.
- Global CSS: `overflow-x: hidden` on `html, body`. `hide-scrollbar` utility class available.

## Locale

Portuguese (Mozambique) — `pt-MZ`, currency MZN. Labels in Portuguese (e.g. `ACCOUNT_TYPE_LABELS`, error messages).

## Auth

- Auth is handled by Supabase Auth (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`) — client-side only.

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
    supabase/     # Single data source — Supabase
    mock/         # (deprecated, kept for reference)
  types/          # All TypeScript interfaces
  lib/            # supabase client, cn(), formatCurrency(), etc.
  constants/      # Labels, colors, nav items
  hooks/          # use-media-query, use-toast
  validators/     # Zod schemas
```
