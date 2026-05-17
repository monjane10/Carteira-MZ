# Carteira MZ

Aplicação de finanças pessoais para Moçambique — gestão de contas, transacções, orçamentos, metas, empréstimos e relatórios.

**Locale:** Português (Moçambique) | **Moeda:** MZN

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Linguagem | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Componentes | Radix UI primitives |
| Ícones | Lucide React 0.468 |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Formulários | react-hook-form + Zod |
| Estado | Zustand |
| API | Supabase (PostgreSQL + Auth) |

---

## Primeiros Passos

### Pré-requisitos

- Node.js 20+
- Conta Supabase (gratuita em [supabase.com](https://supabase.com))
- Git

### Setup

```bash
git clone <repo>
cd carteira-mz
npm install
```

### Variáveis de Ambiente

Crie um ficheiro `.env.local` na raiz do projecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # apenas para API admin
```

### Base de Dados

1. Crie um projecto em [supabase.com](https://supabase.com)
2. Abra o SQL Editor
3. Cole e execute o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql)
4. O schema cria automaticamente:
   - 14 tabelas com índices
   - RLS policies em todas as tabelas
   - Trigger para perfil após registo
   - Seed data: 8 instituições financeiras + 14 categorias padrão

### Desenvolvimento

```bash
npm run dev        # http://localhost:3000
npm run build      # produção
npm run lint       # ESLint
npm run start      # servidor de produção
```

### Deploy (Netlify)

```bash
npm run build
```

O ficheiro `netlify.toml` já está configurado. O comando de build e o directório de publicação (`next.config.ts` → output) estão definidos.

---

## Estrutura do Projecto

```
carteira-mz/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login e Registo
│   │   ├── (dashboard)/        # Páginas principais com sidebar
│   │   ├── admin/              # Painel administrativo
│   │   └── api/                # API routes (admin, delete-account)
│   ├── components/
│   │   ├── layout/             # DashboardLayout, Sidebar, Header, MobileNav
│   │   ├── shared/             # PageHeader, StatCard, DataTable, EmptyState, etc.
│   │   └── ui/                 # Primitives: Button, Card, Dialog, Input, etc.
│   ├── modules/                # Feature modules
│   │   ├── accounts/           # Contas bancárias
│   │   ├── auth/               # Login/Registo
│   │   ├── budgets/            # Orçamentos
│   │   ├── categories/         # Categorias
│   │   ├── dashboard/          # Dashboard principal (desktop + mobile)
│   │   ├── goals/              # Metas financeiras
│   │   ├── loans/              # Empréstimos
│   │   ├── reports/            # Relatórios
│   │   ├── transactions/       # Transacções
│   │   └── transfers/          # Transferências entre contas
│   ├── services/
│   │   ├── supabase/           # Camada de dados Supabase
│   │   └── index.ts            # Barrel exports
│   ├── store/
│   │   └── slices/             # Zustand stores (uma por entidade)
│   ├── types/                  # Interfaces TypeScript
│   ├── constants/              # Labels, cores, navegação
│   ├── validators/             # Schemas Zod
│   ├── hooks/                  # use-media-query, use-toast
│   ├── lib/                    # Cliente Supabase, cn(), formatCurrency()
│   └── providers/              # Provider de tema (Toast, Tooltip)
├── public/                     # Ícones, manifest, logos
├── supabase-schema.sql         # Schema SQL completo
├── netlify.toml               # Configuração Netlify
└── AGENTS.md                  # Instruções para agentes AI
```

---

## Rotas (App Router)

### Grupo `(auth)` — sem sidebar

| Rota | Página |
|------|--------|
| `/login` | Login |
| `/register` | Registo |

### Grupo `(dashboard)` — com sidebar e navegação móvel

| Rota | Página |
|------|--------|
| `/dashboard` | Dashboard principal |
| `/contas` | Lista de contas |
| `/contas/nova` | Criar conta |
| `/contas/[id]` | Detalhe da conta |
| `/transacoes` | Lista de transacções |
| `/transacoes/nova` | Criar transacção |
| `/transacoes/[id]` | Detalhe da transacção (ver/editar/remover) |
| `/transferencias` | Lista de transferências |
| `/transferencias/nova` | Criar transferência |
| `/transferencias/[id]` | Detalhe da transferência (ver/editar/remover) |
| `/emprestimos` | Lista de empréstimos |
| `/emprestimos/novo` | Novo empréstimo |
| `/emprestimos/[id]` | Detalhe do empréstimo |
| `/metas` | Lista de metas |
| `/metas/nova` | Criar meta |
| `/metas/[id]` | Detalhe da meta |
| `/orcamentos` | Lista de orçamentos |
| `/orcamentos/novo` | Novo orçamento |
| `/relatorios` | Relatórios financeiros |
| `/configuracoes` | Definições do utilizador |

### Admin

| Rota | Página |
|------|--------|
| `/admin/login` | Login admin |
| `/admin/dashboard` | Dashboard admin |
| `/admin/contas` | Contas (admin) |
| `/admin/usuarios` | Utilizadores registados |

### API Routes

| Rota | Função |
|------|--------|
| `POST /api/admin/stats` | Estatísticas agregadas (todos os users) |
| `POST /api/admin/users` | Lista de users com contagem de contas |
| `POST /api/admin/accounts` | Lista todas as contas (admin) |
| `POST /api/delete-account` | Elimina `auth.users` via `admin.deleteUser()` |

---

## Autenticação

### Fluxo

1. **Registo:** `supabase.auth.signUp()` — cria auth.user + trigger `handle_new_user()` cria `profiles`
2. **Login:** `supabase.auth.signInWithPassword()` — sessão gerida pelo Supabase Auth
3. **Logout:** `supabase.auth.signOut()`
4. **Sessão:** `supabase.auth.getSession()` / `supabase.auth.onAuthStateChange()`

### Segurança

- RLS (Row Level Security) activo em todas as tabelas
- Cada utilizador vê apenas os seus próprios dados
- API routes usam `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS (apenas operações admin)
- Chamadas ao cliente enviam token `Authorization: Bearer`

---

## Base de Dados (14 Tabelas)

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do utilizador (estende `auth.users`) |
| `financial_institutions` | Instituições financeiras de referência (BCI, BIM, M-Pesa, etc.) |
| `accounts` | Contas do utilizador (bancárias, carteira móvel, dinheiro, etc.) |
| `categories` | Categorias de transacções (padrão + personalizadas) |
| `transactions` | Transacções financeiras |
| `transfers` | Transferências entre contas |
| `loans` | Empréstimos (concedidos ou obtidos) |
| `loan_payments` | Pagamentos de empréstimos |
| `goals` | Metas de poupança |
| `goal_contributions` | Contribuições para metas |
| `budgets` | Orçamentos mensais/semanais/anuais |
| `recurring_transactions` | Transacções recorrentes |
| `notifications` | Notificações do sistema |
| `attachments` | Anexos de transacções |

### Tipos Enum

| Enum | Valores |
|------|---------|
| `account_type` | `BANK`, `MOBILE_MONEY`, `CASH`, `SAVINGS`, `INVESTMENT`, `OTHER` |
| `transaction_type` | `INCOME`, `EXPENSE`, `TRANSFER`, `ADJUSTMENT`, `LOAN_GIVEN`, `LOAN_TAKEN`, `LOAN_PAYMENT` |
| `loan_type` | `GIVEN`, `TAKEN` |
| `loan_status` | `PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE` |
| `goal_status` | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `budget_period` | `WEEKLY`, `MONTHLY`, `YEARLY` |
| `recurring_frequency` | `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |
| `notification_type` | `BUDGET_LIMIT`, `GOAL_COMPLETED`, `LOW_BALANCE`, `LOAN_DUE`, `SYSTEM` |

---

## Módulos

### Dashboard

Dois pontos de entrada:

- **Desktop:** `src/modules/dashboard/index.tsx`
- **Mobile:** `src/modules/dashboard/mobile-index.tsx`

Ambos partilham componentes comuns:

| Componente | Descrição |
|-----------|-----------|
| `MonthNavigator` | Navegação entre meses (setas + nome do mês + badge "Actual" / botão "Hoje") |
| `SummaryCards` | Cartões de resumo financeiro (saldo, receitas, despesas) |
| `BalanceCard` | Cartão premium com gradiente, botão de olho para mostrar/ocultar saldo |
| `MonthlyChart` | Gráfico de evolução mensal (Recharts) |
| `CategoryPieChart` | Gráfico de gastos por categoria |
| `RecentTransactions` | Últimas transacções do mês |
| `GoalsOverview` | Resumo de metas activas |

### Contas (Accounts)

- Criação com formulário: nome, tipo, instituição, cor, saldo inicial
- Edição de tipo e instituição no modal de detalhe
- Lista com cartões coloridos e saldo actual
- Botão de acção rápida (FAB) para criar nova conta

### Transacções (Transactions)

- Registo de receitas e despesas
- Atribuição a conta + categoria
- Suporte a transacções recorrentes
- Lista com filtros e pesquisa

### Transferências (Transfers)

- Transferência entre contas com suporte a taxa (fee)
- Actualização automática de saldos: origem (débito) → destino (crédito)

### Empréstimos (Loans)

- Tipo: Concedido (emprestou) / Obtido (pediu)
- Status: Pendente, Parcialmente Pago, Pago, Vencido
- Juros e parcelas
- Pagamentos registados actualizam saldo automaticamente

### Metas (Goals)

- Definição de objectivos financeiros
- Contribuições descontadas da conta associada
- Progresso visual (barra de progresso)
- Estados: Activo, Concluído, Cancelado

### Orçamentos (Budgets)

- Orçamento mensal/semanal/anual por categoria
- Progresso automático baseado em transacções do período
- Alerta ao atingir o limite

### Categorias (Categories)

- 14 categorias padrão (pré-carregadas no seed)
- Categorias personalizadas com ícone e cor

### Relatórios (Reports)

- Gráficos de receitas vs despesas por período
- Análise por categoria
- Filtros por conta, categoria e intervalo de datas

---

## Data Layer

### Serviços Supabase

Todos os serviços estão em `src/services/supabase/`:

| Ficheiro | Funções principais |
|----------|-------------------|
| `auth.ts` | `signIn()`, `signUp()`, `signOut()`, `getCurrentUser()` |
| `accounts.ts` | CRUD + `getAccounts()` com join institution |
| `categories.ts` | CRUD + categorias padrão |
| `transactions.ts` | CRUD com filtros por data, conta, categoria |
| `transfers.ts` | CRUD com actualização de saldos (origem/destino) |
| `loans.ts` | CRUD + `getLoanPayments()` + status update |
| `goals.ts` | CRUD + `getGoalContributions()` + progresso |
| `budgets.ts` | CRUD + cálculo de `spent` automático |
| `dashboard.ts` | `getDashboardSummary(targetDate?)`, `getMonthlyEvolution()`, `getCategorySpending()` |
| `notifications.ts` | CRUD + marcação como lida |
| `admin.ts` | Funções administrativas (stats, users) |
| `balance.ts` | Cálculo de saldo histórico |

### Zustand Stores

- `useAccountStore` — contas + fetch + CRUD
- `useCategoryStore` — categorias + fetch + CRUD
- `useTransactionStore` — transacções + fetch + CRUD
- `useLoanStore` — empréstimos + fetch + CRUD
- `useGoalStore` — metas + fetch + CRUD
- `useBudgetStore` — orçamentos + fetch + CRUD
- `useNotificationStore` — notificações + fetch
- `useUIStore` — estado de UI (sidebar, modais, tema)

Todas as stores refazem fetch do servidor após cada mutação CRUD.

### Tratamento de Erros

- `ServiceError` — erro genérico do serviço
- `NotFoundError` — recurso não encontrado
- `handleError()` — função centralizada que loga e lança `ServiceError`
- `logger` — logging estruturado (INFO, WARN, ERROR, DEBUG)

---

## Componentes de UI

### Primitives (Radix + Tailwind)

| Componente | Descrição |
|-----------|-----------|
| `Button` | Botão com variantes (primary, secondary, ghost, danger) |
| `Card` | Cartão com header, content, footer |
| `Dialog` | Modal com overlay |
| `Input` | Campo de texto |
| `Select` | Dropdown |
| `Tabs` | Abas de navegação |
| `Badge` | Etiqueta de estado |
| `Avatar` | Avatar do utilizador |
| `Progress` | Barra de progresso |
| `Switch` | Toggle |
| `Separator` | Linha separadora |
| `Textarea` | Área de texto |
| `Tooltip` | Tooltip |
| `DropdownMenu` | Menu dropdown |
| `Sheet` | Painel lateral |
| `Table` | Tabela de dados |
| `ScrollArea` | Área com scroll customizado |
| `Label` | Etiqueta de formulário |
| `Skeleton` | Placeholder de carregamento |

### Shared

| Componente | Descrição |
|-----------|-----------|
| `PageHeader` | Cabeçalho de página com título e acção |
| `StatCard` | Cartão de estatística (usado no dashboard) |
| `DataTable` | Tabela com ordenação |
| `EmptyState` | Estado vazio com ícone e mensagem |
| `LoadingState` | Indicador de carregamento |
| `ConfirmDialog` | Diálogo de confirmação |
| `BackButton` | Botão de voltar atrás |
| `Logo` | Logótipo Carteira MZ |
| `FAB` | Botão de acção rápida flutuante |
| `UserGuide` | Manual do utilizador (modal) |

---

## Responsividade Mobile

- Layout adaptável: `(dashboard)` com `Sidebar` em desktop, `MobileNav` em mobile
- Dashboard com dois entry points: `index.tsx` (desktop) e `mobile-index.tsx`
- Secção "Minhas Contas" com scroll horizontal `shrink-0`
- `overflow-x: hidden` em `html, body` (CSS global)
- Utility class `hide-scrollbar` disponível

---

## Convenções de Código

- **Import alias:** `@/*` → `./src/*`
- **CSS:** Tailwind CSS 4 com `cn()` utility (`clsx` + `tailwind-merge`)
- **Estado:** Zustand stores em `src/store/slices/`
- **Serviços:** importados via `@/services` (barrel export)
- **Validação:** Zod schemas em `src/validators/` com `react-hook-form`
- **Interface:** sempre em Português (rótulos, mensagens de erro, placeholders)
- **Moeda:** MZN com `formatCurrency()` em `src/lib/utils.ts`

---

## Funcionalidades Chave

1. **Dashboard mensal com navegação histórica** — navegue entre meses para ver saldos e movimentos passados
2. **Saldo histórico calculado** — o saldo de meses anteriores é recalculado revertendo receitas/despesas após a data alvo
3. **Modo escuro** — suporte a tema escuro via `Profile.dark_mode`
4. **Upload de anexos** — anexar ficheiros a transacções
5. **Transacções recorrentes** — agendamento automático
6. **Orçamentos inteligentes** — progresso calculado a partir de transacções reais
7. **Gestão de empréstimos** — com cálculo automático de juros e status
8. **Metas com contribuições** — contribuições descontam da conta automaticamente
9. **Painel administrativo** — visão geral de todos os utilizadores (protegido)
10. **Manual do utilizador integrado** — botão `?` flutuante nas páginas de auth
11. **PWA com suporte offline parcial** — Service Worker com network-first para HTML e cache de assets estáticos; app instalável no telemóvel
12. **Telas de detalhe** — todas as entidades (contas, transacções, transferências, empréstimos, metas) com páginas dedicadas de visualização, edição e remoção
13. **Optimistic updates** — CRUD nas stores actualiza o estado local instantaneamente sem esperar pelo servidor
14. **Lazy loading de gráficos** — Recharts carregado sob demanda com `next/dynamic` + `ssr: false`
15. **Meta tags Open Graph** — preview ao partilhar no WhatsApp, Facebook e Twitter

---

## Licença

Uso privado — desenvolvido por [Lourenço Monjane](https://lourencomonjane.vercel.app).
