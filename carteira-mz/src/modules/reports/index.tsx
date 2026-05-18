"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Download, TrendingUp, TrendingDown, ChevronDown, Filter, Calendar } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { SummaryCards } from "./components/summary-cards"
import { dashboard as dashboardService, accounts as accountService } from "@/services"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import type { DashboardSummary, MonthlyEvolution, CategorySpending, Transaction, Account } from "@/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const IncomeVsExpenseChart = dynamic(() => import("./components/income-vs-expense-chart").then((m) => ({ default: m.IncomeVsExpenseChart })), { ssr: false })
const CategoryReport = dynamic(() => import("./components/category-report").then((m) => ({ default: m.CategoryReport })), { ssr: false })

type DateRange = "3" | "6" | "12" | "custom"

function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("6")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([])
  const [expenseSpending, setExpenseSpending] = useState<CategorySpending[]>([])
  const [incomeSpending, setIncomeSpending] = useState<CategorySpending[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    accountService.getAccounts().then(setAccounts)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const now = new Date()
        const months = dateRange === "custom" ? 12 : parseInt(dateRange)
        const startRangeDate = dateRange === "custom"
          ? new Date(customFrom || now.toISOString().slice(0, 10))
          : new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
        const endDate = dateRange === "custom"
          ? new Date(customTo || now.toISOString().slice(0, 10) + "T23:59:59")
          : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        const startDate = new Date(startRangeDate.getFullYear(), startRangeDate.getMonth(), 1)

        const accountIds = accountFilter !== "all" ? [accountFilter] : undefined

        const [summaryData, evolutionData, expenseData, incomeData, txData] = await Promise.all([
          dashboardService.getDashboardSummary(startDate, accountIds),
          dashboardService.getMonthlyEvolution(months, accountIds),
          dashboardService.getCategorySpending(startDate.toISOString(), endDate.toISOString(), accountIds),
          dashboardService.getCategoryIncome(startDate.toISOString(), endDate.toISOString(), accountIds),
          dashboardService.getRecentTransactions(20, startDate.toISOString(), endDate.toISOString(), accountIds),
        ])
        if (!cancelled) {
          setSummary(summaryData)
          setEvolution(evolutionData)
          setExpenseSpending(expenseData)
          setIncomeSpending(incomeData)
          setRecentTransactions(txData)
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e)
          toast({ title: "Erro", description: msg, variant: "error" })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (dateRange !== "custom" || (customFrom && customTo)) {
      load()
    } else {
      setLoading(false)
    }
    return () => { cancelled = true }
  }, [dateRange, customFrom, customTo, accountFilter, refreshKey])

  const handleExport = () => {
    if (!evolution.length && !expenseSpending.length) {
      toast({ title: "Exportar", description: "Sem dados para exportar.", variant: "info" })
      return
    }

    const rows: string[][] = [["Mês", "Receitas", "Despesas", "Saldo"]]
    for (const e of evolution) {
      rows.push([e.month, String(e.income), String(e.expense), String(e.balance)])
    }

    rows.push([])
    rows.push(["Categoria (Despesas)", "Total", "Percentagem", "Transacções"])
    for (const c of expenseSpending) {
      rows.push([c.category_name, String(c.total), c.percentage.toFixed(1) + "%", String(c.transaction_count)])
    }

    rows.push([])
    rows.push(["Categoria (Receitas)", "Total", "Percentagem", "Transacções"])
    for (const c of incomeSpending) {
      rows.push([c.category_name, String(c.total), c.percentage.toFixed(1) + "%", String(c.transaction_count)])
    }

    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exportado", description: "Relatório exportado com sucesso.", variant: "success" })
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader title="Relatórios" description="Análise detalhada das suas finanças">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
            {(["3", "6", "12", "custom"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  dateRange === range
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {range === "custom" ? "Personalizado" : `${range}m`}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </PageHeader>

      {dateRange === "custom" && (
        <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">De</label>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Até</label>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-40" />
          </div>
        </div>
      )}

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeVsExpenseChart data={evolution} loading={loading} />
        <CategoryReport data={expenseSpending} loading={loading} title="Despesas por Categoria" />
      </div>

      {incomeSpending.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryReport data={incomeSpending} loading={loading} title="Receitas por Categoria" />
        </div>
      )}

      {recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Transacções Recentes</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  tx.type === "INCOME" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                }`}>
                  {tx.type === "INCOME" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{tx.description || tx.category?.name || "Sem descrição"}</p>
                  <p className="text-xs text-slate-400">{formatDate(tx.transaction_date)}</p>
                </div>
                <span className={`text-sm font-bold ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
export default ReportsPage
export { ReportsPage as ReportsModule }
