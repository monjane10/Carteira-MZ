# Instruções para Agentes

## Stack

Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind 4 + Radix UI primitives.

- **Path alias** `@/*` → `./src/*`
- **State**: Zustand stores in `src/store/slices/`. Barrel export from `src/store/index.ts`.
- **UI**: `cn()` utility (`clsx` + `tailwind-merge`). Recharts lazy-loaded with `next/dynamic` + `ssr: false`. Framer Motion for animations.
- **Forms**: `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Route groups**: `(auth)` (sem sidebar) and `(dashboard)` (com sidebar). Páginas em `src/app/` delegam para módulos em `src/modules/`.
- **Tailwind config**: PostCSS with `@tailwindcss/postcss`. ESLint flat config `eslint.config.mjs` (v9).
- **Locale**: Português (Moçambique), moeda MZN. Rótulos em PT (`ACCOUNT_TYPE_LABELS`, etc. em `src/constants/`).
- **Package override**: `"resolve": "2.0.0-next.6"` em `package.json`.

## Commands

```
npm run dev             # next dev — http://localhost:3000
npm run build           # next build
npm run start           # next start (produção)
npm run lint            # eslint (flat config)
npm run test            # vitest run
npm run test:watch      # vitest (watch mode)
npm run vapid:generate  # npx web-push generate-vapid-keys --json
```

## Tests

- **Vitest** + jsdom + `@testing-library/jest-dom/vitest` setup. Alias `@/` resolvido.
- Test files alongside source in `__tests__/` dirs (7 files at time of writing).
- Services mock `@/services/supabase/client` and `@/services` using `vi.mock()`.
- Stores reset via `useXStore.setState()` in `beforeEach`.

## Data Layer

- **Apenas Supabase** via `src/services/supabase/`. Barrel export via `src/services/index.ts`.
- Services: `accounts`, `categories`, `transactions`, `transfers`, `loans`, `goals`, `budgets`, `notifications`, `dashboard`, `admin`, `recurringTransactions`. Plus `supabase` (client) and `logger`.
- **Server-side API routes** bypass RLS with `SUPABASE_SERVICE_ROLE_KEY`:
  - `src/app/api/admin/stats/route.ts`, `admin/users/route.ts`, `admin/accounts/route.ts`, `admin/broadcast/route.ts`
  - `src/app/api/notifications/route.ts`, `notifications/cleanup/route.ts`
  - `src/app/api/delete-account/route.ts`
  - Client chama com `Authorization: Bearer <token>`.
- Error handling: `ServiceError`, `NotFoundError`, `handleError()`, `logger`.
- Auth: `supabase.auth.signInWithPassword()` / `signUp()` / `signOut()` — client-side only.
- Schema completo em `supabase-schema.sql` (14 tabelas, RLS, trigger, seed data).
- Migrações adicionais: `supabase-migration.sql`, `supabase-push-subscriptions.sql`, `migration-notificacoes.sql`.

## Mobile

- Dashboard split: `src/modules/dashboard/index.tsx` (desktop) vs `mobile-index.tsx`.
- Secção "Minhas Contas" horizontal scroll: usar `min-w-0`, `shrink-0`. Evitar `overflow-hidden` cego. Sem `w-screen`/`100vw` em elementos scrolláveis.
- Global CSS: `overflow-x: hidden` em `html, body`. `hide-scrollbar` utility class.

## Store Pattern

- Zustand stores têm `fetch*` + CRUD actions. Fazem fetch do servidor após cada mutação.
- Stores disponíveis: `useAccountStore`, `useCategoryStore`, `useTransactionStore`, `useLoanStore`, `useGoalStore`, `useBudgetStore`, `useNotificationStore`, `useUIStore`, `useTransferStore`, `useRecurringTransactionStore`.

## Deployment

- **Netlify** — `netlify.toml`: build `npm run build`, publish `.next`.
- **Variáveis de ambiente**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (`.env.local`, ignorado por `.gitignore`).

## Project Structure

```
src/
  app/              # Next.js App Router
    (auth)/         # login, register, forgot/reset-password
    (dashboard)/    # contas, transacoes, transferencias, emprestimos, metas, orcamentos, relatorios, configuracoes, notificacoes
    admin/          # login, dashboard, contas, usuarios
    api/            # API routes (bypass RLS com service_role_key)
  modules/          # Feature modules (accounts, auth, budgets, categories, dashboard, goals, loans, recurring-transactions, reports, transactions, transfers)
  components/
    ui/             # Primitives Radix (Button, Card, Dialog, Input, Select, etc.)
    shared/         # PageHeader, StatCard, DataTable, EmptyState, FAB, etc.
    layout/         # DashboardLayout, Sidebar, Header, MobileNav
  store/slices/     # Zustand stores
  services/supabase/ # Single data source
  types/            # All interfaces
  validators/       # Zod schemas
  constants/        # Labels, cores, navegação
  hooks/            # use-media-query, use-toast
  lib/              # supabase client, cn(), formatCurrency(), account-logos, push-notifications
  providers/        # Toast + Tooltip provider wrapper
```
