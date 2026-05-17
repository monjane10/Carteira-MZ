import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"
import type { DashboardSummary, MonthlyEvolution, CategorySpending } from "@/types"

export { getRecentTransactions } from "./transactions"

const ENTITY = "dashboard"

export async function getDashboardSummary(targetDate?: Date): Promise<DashboardSummary> {
  try {
    logger.info("Fetching dashboard summary")
    const now = targetDate ?? new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const startOfMonth = new Date(y, m, 1).toISOString()
    const startOfPrevMonth = new Date(y, m - 1, 1).toISOString()
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString()

    const { data: accounts } = await supabase
      .from("accounts")
      .select("balance")
      .eq("is_active", true)
    const currentBalance = (accounts ?? []).reduce((s: number, a: { balance: number }) => s + a.balance, 0)

    const { data: allTx } = await supabase
      .from("transactions")
      .select("type, amount, transaction_date")

    const txList = (allTx ?? []) as { type: string; amount: number; transaction_date: string }[]
    const totalIncome = txList.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const totalExpenses = txList.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const [monthlyData, prevData] = await Promise.all([
      supabase
        .from("transactions")
        .select("type, amount")
        .gte("transaction_date", startOfMonth)
        .lte("transaction_date", endOfMonth),
      supabase
        .from("transactions")
        .select("type, amount")
        .gte("transaction_date", startOfPrevMonth)
        .lt("transaction_date", startOfMonth),
    ])

    const monthlyTx = (monthlyData.data ?? []) as { type: string; amount: number }[]
    const prevTx = (prevData.data ?? []) as { type: string; amount: number }[]

    const monthlyIncome = monthlyTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const monthlyExpenses = monthlyTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const prevIncome = prevTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const prevExpenses = prevTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const incomeChange = prevIncome > 0 ? Math.round(((monthlyIncome - prevIncome) / prevIncome) * 10000) / 100 : 0
    const expenseChange = prevExpenses > 0 ? Math.round(((monthlyExpenses - prevExpenses) / prevExpenses) * 10000) / 100 : 0

    const totalBalance = currentBalance

    const { data: loansGiven } = await supabase
      .from("loans")
      .select("total_amount")
      .eq("type", "GIVEN")
    const totalLoansGiven = (loansGiven ?? []).reduce((s: number, l: { total_amount: number }) => s + l.total_amount, 0)

    const { data: loansTaken } = await supabase
      .from("loans")
      .select("total_amount")
      .eq("type", "TAKEN")
    const totalLoansTaken = (loansTaken ?? []).reduce((s: number, l: { total_amount: number }) => s + l.total_amount, 0)

    return {
      total_balance: totalBalance,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      total_loans_given: totalLoansGiven,
      total_loans_taken: totalLoansTaken,
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      balance_change: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
      income_change: incomeChange,
      expense_change: expenseChange,
    }
  } catch (e) {
    return handleError(ENTITY, "sumario", e)
  }
}

export async function getMonthlyEvolution(months = 6): Promise<MonthlyEvolution[]> {
  try {
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ]

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

    const { data: txData } = await supabase
      .from("transactions")
      .select("type, amount, transaction_date")
      .gte("transaction_date", sixMonthsAgo.toISOString())

    const txList = (txData ?? []) as { type: string; amount: number; transaction_date: string }[]
    const result: MonthlyEvolution[] = []

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth()
      const year = d.getFullYear()

      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0, 23, 59, 59)

      const monthTx = txList.filter((t) => {
        const txDate = new Date(t.transaction_date)
        return txDate >= start && txDate <= end
      })

      const income = monthTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
      const expense = monthTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

      result.push({
        month: monthNames[month] + "/" + year.toString().slice(2),
        income,
        expense,
        balance: income - expense,
      })
    }

    return result
  } catch (e) {
    return handleError(ENTITY, "evolucao mensal", e)
  }
}

export async function getCategorySpending(
  startDate: string,
  endDate: string,
): Promise<CategorySpending[]> {
  try {
    const { data: txData } = await supabase
      .from("transactions")
      .select("amount, category_id, category:categories(name, color, icon)")
      .eq("type", "EXPENSE")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .not("category_id", "is", null)

    const rows = (txData ?? []) as unknown as {
      amount: number
      category_id: string
      category: { name: string; color: string | null; icon: string | null } | null
    }[]

    const grouped: Record<string, { total: number; count: number; name: string; color: string | null; icon: string | null }> = {}

    for (const r of rows) {
      if (!grouped[r.category_id]) {
        grouped[r.category_id] = {
          total: 0,
          count: 0,
          name: r.category?.name ?? r.category_id,
          color: r.category?.color ?? null,
          icon: r.category?.icon ?? null,
        }
      }
      grouped[r.category_id].total += r.amount
      grouped[r.category_id].count++
    }

    const totalExpenses = Object.values(grouped).reduce((s, g) => s + g.total, 0)

    return Object.entries(grouped)
      .map(([catId, g]) => ({
        category_id: catId,
        category_name: g.name,
        category_color: g.color,
        category_icon: g.icon,
        total: g.total,
        percentage: totalExpenses > 0 ? Math.round((g.total / totalExpenses) * 10000) / 100 : 0,
        transaction_count: g.count,
      }))
      .sort((a, b) => b.total - a.total)
  } catch (e) {
    return handleError(ENTITY, "gastos por categoria", e)
  }
}
