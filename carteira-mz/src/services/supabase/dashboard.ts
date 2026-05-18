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

    const { data: balanceData } = await supabase
      .from("accounts")
      .select("amount_sum:balance.sum()")
      .eq("is_active", true)
      .single()
    const totalBalance = (balanceData as unknown as { amount_sum: number | null })?.amount_sum ?? 0

    const { data: totalsData } = await supabase
      .from("transactions")
      .select("type, amount_sum:amount.sum()")
      .in("type", ["INCOME", "EXPENSE"])
    const totals = (totalsData ?? []) as { type: string; amount_sum: number | null }[]
    const totalIncome = totals.find((t) => t.type === "INCOME")?.amount_sum ?? 0
    const totalExpenses = totals.find((t) => t.type === "EXPENSE")?.amount_sum ?? 0

    const [monthlyData, prevData] = await Promise.all([
      supabase
        .from("transactions")
        .select("type, amount_sum:amount.sum()")
        .in("type", ["INCOME", "EXPENSE"])
        .gte("transaction_date", startOfMonth)
        .lte("transaction_date", endOfMonth),
      supabase
        .from("transactions")
        .select("type, amount_sum:amount.sum()")
        .in("type", ["INCOME", "EXPENSE"])
        .gte("transaction_date", startOfPrevMonth)
        .lt("transaction_date", startOfMonth),
    ])

    const monthlyTotals = (monthlyData.data ?? []) as { type: string; amount_sum: number | null }[]
    const prevTotals = (prevData.data ?? []) as { type: string; amount_sum: number | null }[]

    const monthlyIncome = monthlyTotals.find((t) => t.type === "INCOME")?.amount_sum ?? 0
    const monthlyExpenses = monthlyTotals.find((t) => t.type === "EXPENSE")?.amount_sum ?? 0
    const prevIncome = prevTotals.find((t) => t.type === "INCOME")?.amount_sum ?? 0
    const prevExpenses = prevTotals.find((t) => t.type === "EXPENSE")?.amount_sum ?? 0

    const incomeChange = prevIncome > 0 ? Math.round(((monthlyIncome - prevIncome) / prevIncome) * 10000) / 100 : 0
    const expenseChange = prevExpenses > 0 ? Math.round(((monthlyExpenses - prevExpenses) / prevExpenses) * 10000) / 100 : 0

    const { data: loansGivenData } = await supabase
      .from("loans")
      .select("amount_sum:total_amount.sum()")
      .eq("type", "GIVEN")
      .single()
    const totalLoansGiven = (loansGivenData as unknown as { amount_sum: number | null })?.amount_sum ?? 0

    const { data: loansTakenData } = await supabase
      .from("loans")
      .select("amount_sum:total_amount.sum()")
      .eq("type", "TAKEN")
      .single()
    const totalLoansTaken = (loansTakenData as unknown as { amount_sum: number | null })?.amount_sum ?? 0

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
    const result: MonthlyEvolution[] = []

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth()
      const year = d.getFullYear()
      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

      const { data: monthData } = await supabase
        .from("transactions")
        .select("type, amount_sum:amount.sum()")
        .in("type", ["INCOME", "EXPENSE"])
        .gte("transaction_date", start)
        .lte("transaction_date", end)

      const totals = (monthData ?? []) as { type: string; amount_sum: number | null }[]
      const income = totals.find((t) => t.type === "INCOME")?.amount_sum ?? 0
      const expense = totals.find((t) => t.type === "EXPENSE")?.amount_sum ?? 0

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
