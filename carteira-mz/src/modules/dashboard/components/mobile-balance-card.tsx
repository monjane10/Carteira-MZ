"use client"

import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"

interface MobileBalanceCardProps {
  summary: DashboardSummary
}

export function MobileBalanceCard({ summary }: MobileBalanceCardProps) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5 text-white">
      <p className="text-xs font-medium text-slate-400">Saldo Total</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">
        {formatCurrency(summary.total_balance)}
      </p>

      <div className="mt-4 flex items-center">
        <div className="flex-1">
          <p className="text-xs text-emerald-400 font-medium">Receitas</p>
          <p className="mt-0.5 text-sm font-semibold">
            {formatCurrency(summary.monthly_income)}
          </p>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="flex-1 pl-4">
          <p className="text-xs text-red-400 font-medium">Despesas</p>
          <p className="mt-0.5 text-sm font-semibold">
            {formatCurrency(summary.monthly_expenses)}
          </p>
        </div>
      </div>
    </div>
  )
}
