"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { MonthNavigator } from "./components/month-navigator"
import { SummaryCards } from "./components/summary-cards"
import { RecentTransactions } from "./components/recent-transactions"
import { GoalsOverview } from "./components/goals-overview"
import { dashboard as dashboardService, categories as categoryService, goals as goalService, budgets as budgetService } from "@/services"
import { checkOverdueLoans } from "@/services/supabase/loans"
import { checkLowBalances } from "@/services/supabase/accounts"
import { checkExpiringGoals } from "@/services/supabase/goals"
import { checkRecurringTransactions, executeRecurringTransactions } from "@/services/supabase/recurring-transactions"
import type { DashboardSummary, MonthlyEvolution, CategorySpending, Transaction, Category, Goal } from "@/types"

const MonthlyChart = dynamic(() => import("./components/monthly-chart").then((m) => ({ default: m.MonthlyChart })), { ssr: false })
const CategoryPieChart = dynamic(() => import("./components/category-pie-chart").then((m) => ({ default: m.CategoryPieChart })), { ssr: false })

function DashboardPage() {
  const [monthOffset, setMonthOffset] = useState(0)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolution[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [targetYear, setTargetYear] = useState(new Date().getFullYear())
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth())

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString()
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString()
        const targetDate = new Date(targetYear, targetMonth, 1)

        const [summaryData, evolutionData, spendingData, transactionsData, goalsData, categories] =
          await Promise.all([
            dashboardService.getDashboardSummary(targetDate),
            dashboardService.getMonthlyEvolution(6),
            dashboardService.getCategorySpending(startOfMonth, endOfMonth),
            dashboardService.getRecentTransactions(5, startOfMonth, endOfMonth),
            goalService.getGoals(),
            categoryService.getCategories(),
          ])

        if (cancelled) return
        setSummary(summaryData)
        setMonthlyEvolution(evolutionData)
        setCategorySpending(spendingData)
        setRecentTransactions(transactionsData)
        setGoals(goalsData)
        setCategoryMap(
          categories.reduce<Record<string, Category>>((acc, cat) => {
            acc[cat.id] = cat
            return acc
          }, {})
        )
        setError(null)
        budgetService.checkBudgetLimits()
        checkOverdueLoans()
        checkLowBalances()
        checkExpiringGoals()
        checkRecurringTransactions()
        executeRecurringTransactions()
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [targetYear, targetMonth, refreshKey])

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Visão geral das suas finanças" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingState key={i} type="card" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <LoadingState type="chart" />
          <LoadingState type="chart" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Visão geral das suas finanças" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={() => setRefreshKey((k) => k + 1)} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral das suas finanças" />

      <div className="mb-4 mt-2">
        <MonthNavigator
          year={targetYear}
          month={targetMonth}
          isCurrent={monthOffset === 0}
          onPrev={() => {
            if (targetMonth === 0) {
              setTargetYear(targetYear - 1)
              setTargetMonth(11)
            } else {
              setTargetMonth(targetMonth - 1)
            }
            setMonthOffset(monthOffset - 1)
          }}
          onNext={() => {
            if (targetMonth === 11) {
              setTargetYear(targetYear + 1)
              setTargetMonth(0)
            } else {
              setTargetMonth(targetMonth + 1)
            }
            setMonthOffset(monthOffset + 1)
          }}
        />
      </div>

      {summary && <SummaryCards summary={summary} categorySpending={categorySpending} />}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <MonthlyChart data={monthlyEvolution} />
        <CategoryPieChart data={categorySpending} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={recentTransactions}
            categoryMap={categoryMap}
          />
        </div>
        <GoalsOverview goals={goals} />
      </div>
    </div>
  )
}
export default DashboardPage
export { DashboardPage as DashboardModule }
