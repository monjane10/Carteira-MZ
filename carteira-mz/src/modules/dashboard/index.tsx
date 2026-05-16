"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { SummaryCards } from "./components/summary-cards"
import { MonthlyChart } from "./components/monthly-chart"
import { CategoryPieChart } from "./components/category-pie-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { GoalsOverview } from "./components/goals-overview"
import * as dashboardService from "@/services/mock/dashboard"
import * as categoryService from "@/services/mock/categories"
import * as goalService from "@/services/mock/goals"
import type { DashboardSummary, MonthlyEvolution, CategorySpending, Transaction, Category, Goal } from "@/types"

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolution[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const [summaryData, evolutionData, spendingData, transactionsData, goalsData, categories] =
        await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getMonthlyEvolution(6),
          dashboardService.getCategorySpending(startOfMonth, endOfMonth),
          dashboardService.getRecentTransactions(5),
          goalService.getGoals(),
          categoryService.getCategories(),
        ])

      setSummary(summaryData)
      setMonthlyEvolution(evolutionData)
      setCategorySpending(spendingData)
      setRecentTransactions(transactionsData)
      setGoals(goalsData)

      const map: Record<string, Category> = {}
      for (const cat of categories) {
        map[cat.id] = cat
      }
      setCategoryMap(map)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral das suas finanças" />

      {summary && <SummaryCards summary={summary} />}

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
