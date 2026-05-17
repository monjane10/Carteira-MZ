"use client"

import { useState, useEffect, useCallback } from "react"
import { MonthNavigator } from "./components/month-navigator"
import { LoadingState } from "@/components/shared/loading-state"
import { MobileGreeting } from "./components/mobile-greeting"
import { MobileBalanceCard } from "./components/mobile-balance-card"
import { MobileAccounts } from "./components/mobile-accounts"
import { MobileExpenseChart } from "./components/mobile-expense-chart"
import { MobileExpenseList } from "./components/mobile-expense-list"
import { dashboard as dashboardService, accounts as accountService, categories as categoryService } from "@/services"
import type { DashboardSummary, CategorySpending, Transaction, Account, Category } from "@/types"

export function MobileDashboard() {
  const [monthOffset, setMonthOffset] = useState(0)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [targetYear, setTargetYear] = useState(new Date().getFullYear())
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth())

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString()
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString()
      const targetDate = new Date(targetYear, targetMonth, 1)

      const [summaryData, accountsData, spendingData, transactionsData, categories] =
        await Promise.all([
          dashboardService.getDashboardSummary(targetDate),
          accountService.getAccounts(),
          dashboardService.getCategorySpending(startOfMonth, endOfMonth),
          dashboardService.getRecentTransactions(10, startOfMonth, endOfMonth),
          categoryService.getCategories(),
        ])

      setSummary(summaryData)
      setAccounts(accountsData)
      setCategorySpending(spendingData)
      setRecentTransactions(transactionsData)

      const map: Record<string, Category> = {}
      for (const cat of categories) {
        map[cat.id] = cat
      }
      setCategoryMap(map)
    } catch (error) {
      console.error("Failed to fetch mobile dashboard data:", error)
      setError("Não foi possível carregar o dashboard.")
    } finally {
      setLoading(false)
    }
  }, [targetYear, targetMonth])

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button onClick={fetchData} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-5">
      <MobileGreeting />

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

      {summary && <MobileBalanceCard summary={summary} />}

      <MobileAccounts accounts={accounts} />

      <MobileExpenseChart data={categorySpending} />

      <MobileExpenseList transactions={recentTransactions} categoryMap={categoryMap} />
    </div>
  )
}
