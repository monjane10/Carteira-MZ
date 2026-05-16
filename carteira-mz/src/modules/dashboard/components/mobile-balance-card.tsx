"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"
import { Eye, EyeOff } from "lucide-react"

interface MobileBalanceCardProps {
  summary: DashboardSummary
}

export function MobileBalanceCard({ summary }: MobileBalanceCardProps) {
  const [showValues, setShowValues] = useState(true)

  const hidden = "••••••"

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg shadow-slate-900/10">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-emerald-500/5 blur-lg" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">Saldo Total</p>
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-white/20"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        <p className="mt-2 text-2xl font-bold tracking-tight">
          {showValues ? formatCurrency(summary.total_balance) : hidden}
        </p>

        <div className="mt-5 flex items-center">
          <div className="flex-1">
            <p className="text-xs font-medium text-emerald-400">Receitas</p>
            <p className="mt-0.5 text-sm font-bold">
              {showValues ? formatCurrency(summary.monthly_income) : hidden}
            </p>
          </div>
          <div className="mx-3 h-10 w-px bg-slate-700" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-400">Despesas</p>
            <p className="mt-0.5 text-sm font-bold">
              {showValues ? formatCurrency(summary.monthly_expenses) : hidden}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
