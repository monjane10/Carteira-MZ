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
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-medium text-slate-400 tracking-wide">Saldo Total</p>
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        <p className="text-3xl font-bold tracking-tight">
          {showValues ? formatCurrency(summary.total_balance) : hidden}
        </p>

        <div className="mt-5 flex items-center">
          <div className="flex-1">
            <p className="text-[11px] font-medium text-emerald-400 tracking-wide">Receitas</p>
            <p className="mt-0.5 text-sm font-bold">
              {showValues ? formatCurrency(summary.monthly_income) : hidden}
            </p>
          </div>
          <div className="mx-4 h-7 w-px bg-white/10" />
          <div className="flex-1">
            <p className="text-[11px] font-medium text-red-400 tracking-wide">Despesas</p>
            <p className="mt-0.5 text-sm font-bold">
              {showValues ? formatCurrency(summary.monthly_expenses) : hidden}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
