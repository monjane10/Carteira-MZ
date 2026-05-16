"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { SummaryCards } from "./components/summary-cards"
import { IncomeVsExpenseChart } from "./components/income-vs-expense-chart"
import { CategoryReport } from "./components/category-report"
import { dashboard as dashboardService } from "@/services"
import type { DashboardSummary, MonthlyEvolution, CategorySpending } from "@/types"

type DateRange = "3" | "6" | "12"

function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("6")
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([])
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const months = parseInt(dateRange)
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
      setSummary(summaryData)
      setEvolution(evolutionData)
      setCategorySpending(spendingData)
    } catch {
      setError("Não foi possível carregar os relatórios.")
      toast({ title: "Erro", description: "Não foi possível carregar os relatórios.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = () => {
    toast({ title: "Exportar", description: "Funcionalidade de exportação em desenvolvimento.", variant: "info" })
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
