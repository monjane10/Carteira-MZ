import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"
import type { DashboardSummary, MonthlyEvolution, CategorySpending } from "@/types"

export { getRecentTransactions } from "./transactions"

const ENTITY = "dashboard"

export async function getDashboardSummary(targetDate?: Date, accountIds?: string[]): Promise<DashboardSummary> {
  try {
    logger.info("Fetching dashboard summary")
    const now = targetDate ?? new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const startOfMonth = new Date(y, m, 1).toISOString()
    const startOfPrevMonth = new Date(y, m - 1, 1).toISOString()
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59).toISOString()

    let accountsQuery = supabase.from("accounts").select("balance").eq("is_active", true)
    let txQuery = supabase.from("transactions").select("type, amount")
    let monthlyQuery = supabase.from("transactions").select("type, amount")
      .gte("transaction_date", startOfMonth).lte("transaction_date", endOfMonth)
    let prevQuery = supabase.from("transactions").select("type, amount")
      .gte("transaction_date", startOfPrevMonth).lt("transaction_date", startOfMonth)
    let biggestQuery = supabase.from("transactions")
      .select("amount, description, transaction_date")
      .eq("type", "EXPENSE")
      .gte("transaction_date", startOfMonth)
      .lte("transaction_date", endOfMonth)
      .order("amount", { ascending: false })
      .limit(1)

    if (accountIds && accountIds.length > 0) {
      accountsQuery = accountsQuery.in("id", accountIds)
      txQuery = txQuery.in("account_id", accountIds)
      monthlyQuery = monthlyQuery.in("account_id", accountIds)
      prevQuery = prevQuery.in("account_id", accountIds)
      biggestQuery = biggestQuery.in("account_id", accountIds)
    }

    const [accountsRes, txRes, monthlyRes, prevRes, loansRes, biggestRes] = await Promise.all([
      accountsQuery,
      txQuery,
      monthlyQuery,
      prevQuery,
      supabase.from("loans").select("type, total_amount"),
      biggestQuery.maybeSingle(),
    ])

    const accountRows = (accountsRes.data ?? []) as { balance: number }[]
    const totalBalance = accountRows.reduce((s, a) => s + a.balance, 0)

    const txRows = (txRes.data ?? []) as { type: string; amount: number }[]
    const totalIncome = txRows.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const totalExpenses = txRows.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const monthlyTx = (monthlyRes.data ?? []) as { type: string; amount: number }[]
    const prevTx = (prevRes.data ?? []) as { type: string; amount: number }[]
    const monthlyIncome = monthlyTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const monthlyExpenses = monthlyTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const prevIncome = prevTx.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const prevExpenses = prevTx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)

    const incomeChange = prevIncome > 0 ? Math.round(((monthlyIncome - prevIncome) / prevIncome) * 10000) / 100 : 0
    const expenseChange = prevExpenses > 0 ? Math.round(((monthlyExpenses - prevExpenses) / prevExpenses) * 10000) / 100 : 0

    const loanRows = (loansRes.data ?? []) as { type: string; total_amount: number }[]
    const totalLoansGiven = loanRows.filter((l) => l.type === "GIVEN").reduce((s, l) => s + l.total_amount, 0)
    const totalLoansTaken = loanRows.filter((l) => l.type === "TAKEN").reduce((s, l) => s + l.total_amount, 0)

    const biggestExpenseRow = biggestRes.data as { amount: number; description: string | null; transaction_date: string } | null
    const biggestExpense = biggestExpenseRow
      ? { amount: biggestExpenseRow.amount, description: biggestExpenseRow.description, date: biggestExpenseRow.transaction_date }
      : null

    const economy = monthlyIncome - monthlyExpenses
    const savingsRate = monthlyIncome > 0 ? Math.round((economy / monthlyIncome) * 10000) / 100 : 0
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const avgDailySpend = daysInMonth > 0 ? Math.round((monthlyExpenses / daysInMonth) * 100) / 100 : 0
    const netWorth = Math.round((totalBalance - totalLoansTaken + totalLoansGiven) * 100) / 100

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
      biggest_expense: biggestExpense,
      savings_rate: savingsRate,
      avg_daily_spend: avgDailySpend,
      net_worth: netWorth,
    }
  } catch (e) {
    return handleError(ENTITY, "sumario", e)
  }
}

export async function getCategoryIncome(
  startDate: string,
  endDate: string,
  accountIds?: string[],
): Promise<CategorySpending[]> {
  try {
    let query = supabase
      .from("transactions")
      .select("amount, category_id, category:categories(name, color, icon)")
      .eq("type", "INCOME")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .not("category_id", "is", null)

    if (accountIds && accountIds.length > 0) {
      query = query.in("account_id", accountIds)
    }
    const { data: txData } = await query

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

    const totalIncome = Object.values(grouped).reduce((s, g) => s + g.total, 0)

    return Object.entries(grouped)
      .map(([catId, g]) => ({
        category_id: catId,
        category_name: g.name,
        category_color: g.color,
        category_icon: g.icon,
        total: g.total,
        percentage: totalIncome > 0 ? Math.round((g.total / totalIncome) * 10000) / 100 : 0,
        transaction_count: g.count,
      }))
      .sort((a, b) => b.total - a.total)
  } catch (e) {
    return handleError(ENTITY, "receitas por categoria", e)
  }
}

export async function getMonthlyEvolution(months = 6, accountIds?: string[]): Promise<MonthlyEvolution[]> {
  try {
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ]

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

    let evolutionQuery = supabase
      .from("transactions")
      .select("type, amount, transaction_date")
      .gte("transaction_date", startDate.toISOString())

    if (accountIds && accountIds.length > 0) {
      evolutionQuery = evolutionQuery.in("account_id", accountIds)
    }

    const { data: txData } = await evolutionQuery

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
  accountIds?: string[],
): Promise<CategorySpending[]> {
  try {
    let query = supabase
      .from("transactions")
      .select("amount, category_id, category:categories(name, color, icon)")
      .eq("type", "EXPENSE")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .not("category_id", "is", null)

    if (accountIds && accountIds.length > 0) {
      query = query.in("account_id", accountIds)
    }
    const { data: txData } = await query

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
