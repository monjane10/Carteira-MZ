export { supabase } from "./client"
export { logger } from "./logger"
export { ServiceError, NotFoundError, ValidationError } from "./errors"
export { balanceDelta } from "./balance"

export {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsSummary,
} from "./accounts"

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories"

export {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByAccount,
  getTransactionsByDateRange,
  getRecentTransactions,
} from "./transactions"

export {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
} from "./transfers"

export {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  getLoanPayments,
  createLoanPayment,
} from "./loans"

export {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalContributions,
  createGoalContribution,
} from "./goals"

export {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} from "./budgets"

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "./notifications"

export {
  getDashboardSummary,
  getMonthlyEvolution,
  getCategorySpending,
} from "./dashboard"

export {
  getAdminStats,
  getAdminUsers,
  getAdminUserById,
} from "./admin"
export type { AdminStats, AdminUser } from "./admin"

export {
  signUp,
  signIn,
  signOut,
  getSession,
} from "./auth"
