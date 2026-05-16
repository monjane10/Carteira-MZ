"use client"

import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { LoadingState } from "@/components/shared/loading-state"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"

interface SummaryCardsProps {
  summary: DashboardSummary | null
  loading?: boolean
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingState key={i} type="card" />
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <p className="text-xs text-slate-400">Sem dados</p>
          </div>
        ))}
      </div>
    )
  }

  const net = summary.total_income - summary.total_expenses
  const savingsRate =
    summary.total_income > 0
      ? ((net / summary.total_income) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Receitas Totais"
        value={formatCurrency(summary.total_income)}
        change={summary.income_change >= 0 ? `+${summary.income_change}%` : `${summary.income_change}%`}
        changeType={summary.income_change >= 0 ? "positive" : "negative"}
        icon={TrendingUp}
      />
      <StatCard
        label="Despesas Totais"
        value={formatCurrency(summary.total_expenses)}
        change={summary.expense_change >= 0 ? `+${summary.expense_change}%` : `${summary.expense_change}%`}
        changeType={summary.expense_change > 0 ? "negative" : "positive"}
        icon={TrendingDown}
      />
      <StatCard
        label="Saldo Líquido"
        value={formatCurrency(net)}
        change={net >= 0 ? "Positivo" : "Negativo"}
        changeType={net >= 0 ? "positive" : "negative"}
        icon={DollarSign}
      />
      <StatCard
        label="Taxa de Poupança"
        value={`${savingsRate}%`}
        icon={PiggyBank}
      />
    </div>
  )
}
