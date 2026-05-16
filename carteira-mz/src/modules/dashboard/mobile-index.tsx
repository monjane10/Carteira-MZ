"use client"

import { useState, useEffect, useCallback } from "react"
import { LoadingState } from "@/components/shared/loading-state"
import { MobileGreeting } from "./components/mobile-greeting"
import { MobileBalanceCard } from "./components/mobile-balance-card"
import { MobileAccounts } from "./components/mobile-accounts"
import { MobileExpenseChart } from "./components/mobile-expense-chart"
import { MobileExpenseList } from "./components/mobile-expense-list"
import * as dashboardService from "@/services/mock/dashboard"
import * as accountService from "@/services/mock/accounts"
import * as categoryService from "@/services/mock/categories"
import type { DashboardSummary, CategorySpending, Transaction, Account, Category } from "@/types"

export function MobileDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const [summaryData, accountsData, spendingData, transactionsData, categories] =
        await Promise.all([
          dashboardService.getDashboardSummary(),
          accountService.getAccounts(),
          dashboardService.getCategorySpending(startOfMonth, endOfMonth),
          dashboardService.getRecentTransactions(10),
          categoryService.getCategories(),
        ])

      setSummary(summaryData)
      setAccounts(accountsData)
      setCategorySpending(spendingData)
      setExpenses(transactionsData)

      const map: Record<string, Category> = {}
      for (const cat of categories) {
        map[cat.id] = cat
      }
      setCategoryMap(map)
    } catch (error) {
      console.error("Failed to fetch mobile dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState type="card" />
        <LoadingState type="card" />
        <LoadingState type="card" />
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-5">
      <MobileGreeting />

      {summary && <MobileBalanceCard summary={summary} />}

      <MobileAccounts accounts={accounts} />

      <MobileExpenseChart data={categorySpending} />

      <MobileExpenseList transactions={expenses} categoryMap={categoryMap} />
    </div>
  )
}
