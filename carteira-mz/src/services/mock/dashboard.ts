import { type DashboardSummary, type MonthlyEvolution, type CategorySpending, type Transaction } from "@/types"
import { getTransactions, getRecentTransactions as getRecentTx } from "./transactions"

const MOCK_USER_ID = "user_1"

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 201) + 200
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay()

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  const startOfMonth = new Date(y, m, 1)
  const startOfPrevMonth = new Date(y, m - 1, 1)

  const allTx = await getTransactions()

  const monthlyTx = allTx.filter((t) => new Date(t.transaction_date) >= startOfMonth)
  const prevMonthlyTx = allTx.filter(
    (t) =>
      new Date(t.transaction_date) >= startOfPrevMonth &&
      new Date(t.transaction_date) < startOfMonth
  )

  const monthlyIncome = monthlyTx
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthlyTx
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0)

  const prevIncome = prevMonthlyTx
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0)
  const prevExpenses = prevMonthlyTx
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0)

  const incomeChange = prevIncome > 0 ? ((monthlyIncome - prevIncome) / prevIncome) * 100 : 0
  const expenseChange = prevExpenses > 0 ? ((monthlyExpenses - prevExpenses) / prevExpenses) * 100 : 0

  const totalIncome = allTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
  const totalExpenses = allTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

  const totalLoansGiven = allTx
    .filter((t) => t.type === "LOAN_GIVEN")
    .reduce((s, t) => s + t.amount, 0)
  const totalLoansTaken = allTx
    .filter((t) => t.type === "LOAN_TAKEN")
    .reduce((s, t) => s + t.amount, 0)

  return {
    total_balance: 192790,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    total_loans_given: totalLoansGiven,
    total_loans_taken: totalLoansTaken,
    monthly_income: monthlyIncome,
    monthly_expenses: monthlyExpenses,
    balance_change: monthlyIncome - monthlyExpenses,
    income_change: Math.round(incomeChange * 100) / 100,
    expense_change: Math.round(expenseChange * 100) / 100,
  }
}

export async function getMonthlyEvolution(months = 6): Promise<MonthlyEvolution[]> {
  await delay()

  const result: MonthlyEvolution[] = []
  const now = new Date()

  const monthNames = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ]

  const allTx = await getTransactions()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.getMonth()
    const year = d.getFullYear()

    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

    const monthTx = allTx.filter((t) => {
      const txDate = new Date(t.transaction_date)
      return txDate >= startOfMonth && txDate <= endOfMonth
    })

    const income = monthTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const expense = monthTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    result.push({
      month: `${monthNames[month]}/${year.toString().slice(2)}`,
      income,
      expense,
      balance: income - expense,
    })
  }

  return result
}

export async function getCategorySpending(
  startDate: string,
  endDate: string
): Promise<CategorySpending[]> {
  await delay()

  const allTx = await getTransactions()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  const filtered = allTx.filter(
    (t) =>
      t.type === "EXPENSE" &&
      new Date(t.transaction_date).getTime() >= start &&
      new Date(t.transaction_date).getTime() <= end &&
      t.category_id
  )

  const grouped: Record<string, { total: number; count: number }> = {}
  for (const tx of filtered) {
    const catId = tx.category_id!
    if (!grouped[catId]) {
      grouped[catId] = { total: 0, count: 0 }
    }
    grouped[catId].total += tx.amount
    grouped[catId].count++
  }

  const totalExpenses = Object.values(grouped).reduce((s, g) => s + g.total, 0)

  const categoryColors: Record<string, { name: string; color: string | null; icon: string | null }> = {
    cat_alimentacao: { name: "Alimentação", color: "#F59E0B", icon: "utensils" },
    cat_transporte: { name: "Transporte", color: "#EF4444", icon: "car" },
    cat_saude: { name: "Saúde", color: "#EC4899", icon: "heart-pulse" },
    cat_educacao: { name: "Educação", color: "#6366F1", icon: "book-open" },
    cat_lazer: { name: "Lazer", color: "#F97316", icon: "gamepad-2" },
    cat_moradia: { name: "Moradia", color: "#14B8A6", icon: "home" },
    cat_utilidades: { name: "Utilidades", color: "#EAB308", icon: "zap" },
    cat_compras: { name: "Compras", color: "#A855F7", icon: "shopping-bag" },
    cat_assinaturas: { name: "Assinaturas", color: "#64748B", icon: "credit-card" },
  }

  return Object.entries(grouped)
    .map(([catId, data]) => ({
      category_id: catId,
      category_name: categoryColors[catId]?.name ?? catId,
      category_color: categoryColors[catId]?.color ?? null,
      category_icon: categoryColors[catId]?.icon ?? null,
      total: data.total,
      percentage: totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 10000) / 100 : 0,
      transaction_count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
}

export { getRecentTransactions } from "./transactions"
