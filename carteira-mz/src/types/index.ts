export type AccountType = "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT" | "LOAN_GIVEN" | "LOAN_TAKEN" | "LOAN_PAYMENT"
export type LoanType = "GIVEN" | "TAKEN"
export type LoanStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "YEARLY"
export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
export type GoalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED"
export type NotificationType = "BUDGET_LIMIT" | "GOAL_COMPLETED" | "LOW_BALANCE" | "LOAN_DUE" | "SYSTEM"

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  currency: string
  timezone: string
  avatar_url: string | null
  dark_mode: boolean
  created_at: string
  updated_at: string
}

export interface FinancialInstitution {
  id: string
  name: string
  type: AccountType
  icon: string | null
  color: string | null
  is_active: boolean
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  institution_id: string | null
  name: string
  type: AccountType
  currency: string
  balance: number
  initial_balance: number
  color: string | null
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  institution?: FinancialInstitution
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: TransactionType
  icon: string | null
  color: string | null
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  description: string | null
  reference_code: string | null
  transaction_date: string
  is_recurring: boolean
  attachment_url: string | null
  created_at: string
  updated_at: string
  account?: Account
  category?: Category
}

export interface Transfer {
  id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  fee: number
  description: string | null
  transfer_date: string
  created_at: string
  from_account?: Account
  to_account?: Account
}

export interface Loan {
  id: string
  user_id: string
  account_id: string | null
  person_name: string
  phone: string | null
  type: LoanType
  total_amount: number
  paid_amount: number
  remaining_amount: number
  interest_amount: number
  description: string | null
  due_date: string | null
  status: LoanStatus
  created_at: string
  updated_at: string
  account?: Account
}

export interface LoanPayment {
  id: string
  loan_id: string
  amount: number
  payment_date: string
  notes: string | null
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  account_id: string | null
  title: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  color: string | null
  icon: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
  account?: Account
}

export interface GoalContribution {
  id: string
  goal_id: string
  account_id: string | null
  amount: number
  contribution_date: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount_limit: number
  period: BudgetPeriod
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  category?: Category
  spent?: number
}

export interface RecurringTransaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  description: string | null
  frequency: RecurringFrequency
  start_date: string
  next_execution: string
  last_execution: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  account?: Account
  category?: Category
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Attachment {
  id: string
  user_id: string
  transaction_id: string | null
  file_url: string
  file_name: string | null
  created_at: string
}

export interface DashboardSummary {
  total_balance: number
  total_income: number
  total_expenses: number
  total_loans_given: number
  total_loans_taken: number
  monthly_income: number
  monthly_expenses: number
  balance_change: number
  income_change: number
  expense_change: number
}

export interface MonthlyEvolution {
  month: string
  income: number
  expense: number
  balance: number
}

export interface CategorySpending {
  category_id: string
  category_name: string
  category_color: string | null
  category_icon: string | null
  total: number
  percentage: number
  transaction_count: number
}

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}
