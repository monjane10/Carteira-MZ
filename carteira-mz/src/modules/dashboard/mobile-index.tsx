"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { MonthNavigator } from "./components/month-navigator"
import { LoadingState } from "@/components/shared/loading-state"
import { MobileGreeting } from "./components/mobile-greeting"
import { MobileBalanceCard } from "./components/mobile-balance-card"
import { MobileMetrics } from "./components/mobile-metrics"
import { MobileAccounts } from "./components/mobile-accounts"
import { MobileExpenseList } from "./components/mobile-expense-list"
import { dashboard as dashboardService, accounts as accountService, categories as categoryService, budgets as budgetService } from "@/services"
import { checkOverdueLoans } from "@/services/supabase/loans"
import { checkLowBalances } from "@/services/supabase/accounts"
import { checkExpiringGoals } from "@/services/supabase/goals"
import { checkRecurringTransactions, executeRecurringTransactions } from "@/services/supabase/recurring-transactions"
import type { DashboardSummary, CategorySpending, Transaction, Account, Category } from "@/types"

const MobileExpenseChart = dynamic(() => import("./components/mobile-expense-chart").then((m) => ({ default: m.MobileExpenseChart })), { ssr: false })

export function MobileDashboard() {
  const [monthOffset, setMonthOffset] = useState(0)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [targetYear, setTargetYear] = useState(new Date().getFullYear())
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth())
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)
  const pulling = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
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

        if (cancelled) return
        setSummary(summaryData)
        setAccounts(accountsData)
        setCategorySpending(spendingData)
        setRecentTransactions(transactionsData)

        const map: Record<string, Category> = {}
        for (const cat of categories) {
          map[cat.id] = cat
        }
        setCategoryMap(map)
        budgetService.checkBudgetLimits()
        checkOverdueLoans()
        checkLowBalances()
        checkExpiringGoals()
        checkRecurringTransactions()
        executeRecurringTransactions()
      } catch (error) {
        if (cancelled) return
        console.error("Failed to fetch mobile dashboard data:", error)
        setError("Não foi possível carregar o dashboard.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [targetYear, targetMonth, refreshKey])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY
      pulling.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return
    const diff = e.touches[0].clientY - touchStartY.current
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 100))
    }
  }

  const handleTouchEnd = () => {
    if (!pulling.current) return
    pulling.current = false
    if (pullDistance > 60) {
      setRefreshing(true)
      setPullDistance(0)
      const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString()
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString()
      const targetDate = new Date(targetYear, targetMonth, 1)
      Promise.all([
        dashboardService.getDashboardSummary(targetDate),
        accountService.getAccounts(),
        dashboardService.getCategorySpending(startOfMonth, endOfMonth),
        dashboardService.getRecentTransactions(10, startOfMonth, endOfMonth),
        categoryService.getCategories(),
      ]).then(([summaryData, accountsData, spendingData, transactionsData, categories]) => {
        setSummary(summaryData)
        setAccounts(accountsData)
        setCategorySpending(spendingData)
        setRecentTransactions(transactionsData)
        const map: Record<string, Category> = {}
        for (const cat of categories) {
          map[cat.id] = cat
        }
        setCategoryMap(map)
      }).catch((error) => {
        console.error("Failed to refresh:", error)
      }).finally(() => {
        setRefreshing(false)
      })
    } else {
      setPullDistance(0)
    }
  }

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
        <button onClick={() => setRefreshKey((k) => k + 1)} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex w-full max-w-full min-w-0 flex-col gap-5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullDistance > 0 || refreshing) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: pullDistance > 0 ? pullDistance : 40 }}
          className="flex items-center justify-center overflow-hidden"
        >
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "A actualizar..." : "Solte para actualizar"}
          </div>
        </motion.div>
      )}

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

      {summary && <MobileMetrics summary={summary} categorySpending={categorySpending} />}

      <MobileAccounts accounts={accounts} />

      <MobileExpenseChart data={categorySpending} />

      <MobileExpenseList transactions={recentTransactions} categoryMap={categoryMap} />
    </div>
  )
}
