"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Download, TrendingUp, TrendingDown } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { SummaryCards } from "./components/summary-cards"
import { dashboard as dashboardService, accounts as accountService } from "@/services"
import { formatCurrency, formatDate } from "@/lib/utils"
import { downloadCsv, type CsvValue } from "@/lib/csv"
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

  const waitingForCustomRange = dateRange === "custom" && !(customFrom && customTo)

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
    if (!waitingForCustomRange) load()
    return () => { cancelled = true }
  }, [dateRange, customFrom, customTo, accountFilter, refreshKey, waitingForCustomRange])

  // Com intervalo personalizado incompleto não há nada a carregar
  const showLoading = loading && !waitingForCustomRange

  const handleExport = () => {
    if (!evolution.length && !expenseSpending.length) {
      toast({ title: "Exportar", description: "Sem dados para exportar.", variant: "info" })
      return
    }

    const pct = (value: number) => `${value.toFixed(1).replace(".", ",")}%`
    const rows: CsvValue[][] = [["Mês", "Receitas", "Despesas", "Saldo"]]
    for (const e of evolution) {
      rows.push([e.month, e.income, e.expense, e.balance])
    }

    rows.push([])
    rows.push(["Categoria (Despesas)", "Total", "Percentagem", "Transacções"])
    for (const c of expenseSpending) {
      rows.push([c.category_name, c.total, pct(c.percentage), String(c.transaction_count)])
    }

    rows.push([])
    rows.push(["Categoria (Receitas)", "Total", "Percentagem", "Transacções"])
    for (const c of incomeSpending) {
      rows.push([c.category_name, c.total, pct(c.percentage), String(c.transaction_count)])
    }

    downloadCsv(`relatorio-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`, rows)
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
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-1 rounded-lg border border-slate-200 p-0.5 sm:flex-none">
            {(["3", "6", "12", "custom"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:flex-none sm:px-3 ${
                  dateRange === range
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
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
        <div className="grid grid-cols-2 gap-3 items-end p-4 rounded-xl border border-slate-200 bg-slate-50 sm:flex sm:flex-wrap">
          <div className="min-w-0">
            <label className="block text-xs font-medium text-slate-500 mb-1">De</label>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-full sm:w-40" />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-slate-500 mb-1">Até</label>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-full sm:w-40" />
          </div>
        </div>
      )}

      <SummaryCards summary={summary} loading={showLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeVsExpenseChart data={evolution} loading={showLoading} />
        <CategoryReport data={expenseSpending} loading={showLoading} title="Despesas por Categoria" />
      </div>

      {incomeSpending.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryReport data={incomeSpending} loading={showLoading} title="Receitas por Categoria" />
        </div>
      )}

      {recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Transacções Recentes</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  tx.type === "INCOME" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                }`}>
                  {tx.type === "INCOME" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tx.description || tx.category?.name || "Sem descrição"}</p>
                  <p className="text-xs text-slate-500">{formatDate(tx.transaction_date)}</p>
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
