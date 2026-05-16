import {
  type AccountType,
  type TransactionType,
  type LoanType,
  type LoanStatus,
  type BudgetPeriod,
  type RecurringFrequency,
  type GoalStatus,
  type NotificationType,
} from "@/types"

export const COLORS = {
  white: "#FFFFFF",
  dark: "#0F172A",
  green: "#10B981",
  greenLight: "#D1FAE5",
  greenDark: "#059669",
  darkLight: "#1E293B",
  darkMuted: "#334155",
  gray: "#64748B",
  grayLight: "#94A3B8",
  grayLighter: "#CBD5E1",
  border: "#E2E8F0",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: "Banco",
  MOBILE_MONEY: "Carteira Móvel",
  CASH: "Dinheiro",
  SAVINGS: "Poupança",
  INVESTMENT: "Investimento",
  OTHER: "Outro",
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  TRANSFER: "Transferência",
  ADJUSTMENT: "Ajuste",
  LOAN_GIVEN: "Empréstimo Concedido",
  LOAN_TAKEN: "Empréstimo Obtido",
  LOAN_PAYMENT: "Pagamento de Empréstimo",
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  PENDING: "Pendente",
  PARTIALLY_PAID: "Parcialmente Pago",
  PAID: "Pago",
  OVERDUE: "Vencido",
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  GIVEN: "Concedido",
  TAKEN: "Obtido",
}

export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
}

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  DAILY: "Diário",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  ACTIVE: "Activo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  BUDGET_LIMIT: "Limite de Orçamento",
  GOAL_COMPLETED: "Meta Concluída",
  LOW_BALANCE: "Saldo Baixo",
  LOAN_DUE: "Vencimento de Empréstimo",
  SYSTEM: "Sistema",
}

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  BANK: "#0F172A",
  MOBILE_MONEY: "#10B981",
  CASH: "#059669",
  SAVINGS: "#1E293B",
  INVESTMENT: "#334155",
  OTHER: "#64748B",
}

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Contas", href: "/contas", icon: "Wallet" },
  { label: "Transacções", href: "/transacoes", icon: "ArrowUpDown" },
  { label: "Transferências", href: "/transferencias", icon: "ArrowLeftRight" },
  { label: "Categorias", href: "/categorias", icon: "Tags" },
  { label: "Empréstimos", href: "/emprestimos", icon: "HandCoins" },
  { label: "Metas", href: "/metas", icon: "Target" },
  { label: "Orçamentos", href: "/orcamentos", icon: "PieChart" },
  { label: "Relatórios", href: "/relatorios", icon: "BarChart3" },
  { label: "Configurações", href: "/configuracoes", icon: "Settings" },
]
