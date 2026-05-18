"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { SummaryCards } from "./components/summary-cards"
import { dashboard as dashboardService } from "@/services"
import type { DashboardSummary, MonthlyEvolution, CategorySpending } from "@/types"

const IncomeVsExpenseChart = dynamic(() => import("./components/income-vs-expense-chart").then((m) => ({ default: m.IncomeVsExpenseChart })), { ssr: false })
const CategoryReport = dynamic(() => import("./components/category-report").then((m) => ({ default: m.CategoryReport })), { ssr: false })

type DateRange = "3" | "6" | "12"

function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("6")
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load(range: DateRange) {
      setLoading(true)
      setError(null)
      try {
        const months = parseInt(range)
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        const [summaryData, evolutionData, spendingData] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getMonthlyEvolution(months),
          dashboardService.getCategorySpending(
            startDate.toISOString(),
            endDate.toISOString()
          ),
        ])
        if (!cancelled) {
          setSummary(summaryData)
          setEvolution(evolutionData)
          setCategorySpending(spendingData)
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
    load(dateRange)
    return () => { cancelled = true }
  }, [dateRange, refreshKey])

  const handleExport = () => {
    if (!evolution.length && !categorySpending.length) {
      toast({ title: "Exportar", description: "Sem dados para exportar.", variant: "info" })
      return
    }

    const rows: string[][] = [["Mês", "Receitas", "Despesas", "Saldo"]]
    for (const e of evolution) {
      rows.push([e.month, String(e.income), String(e.expense), String(e.balance)])
    }

    rows.push([])
    rows.push(["Categoria", "Total", "Percentagem", "Transacções"])
    for (const c of categorySpending) {
      rows.push([c.category_name, String(c.total), c.percentage.toFixed(1) + "%", String(c.transaction_count)])
    }

    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${dateRange}m-${new Date().toISOString().slice(0, 10)}.csv`
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
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
            {(["3", "6", "12"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  dateRange === range
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {range}m
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </PageHeader>

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeVsExpenseChart data={evolution} loading={loading} />
        <CategoryReport data={categorySpending} loading={loading} />
      </div>
    </motion.div>
  )
}
export default ReportsPage
export { ReportsPage as ReportsModule }
