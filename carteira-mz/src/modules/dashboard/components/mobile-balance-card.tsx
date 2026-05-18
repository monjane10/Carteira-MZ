"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"
import { Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react"

interface MobileBalanceCardProps {
  summary: DashboardSummary
}

export function MobileBalanceCard({ summary }: MobileBalanceCardProps) {
  const [showValues, setShowValues] = useState(true)

  const hidden = "••••••"

  const balanceStr = formatCurrency(summary.total_balance)
  const [amountPart, currencyPart] = balanceStr.includes("Mzn")
    ? [balanceStr.replace(" Mzn", ""), "Mzn"]
    : [balanceStr, ""]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1633] via-[#0F1D40] to-[#1A2D5A] p-5 text-white shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/[0.03]" />

      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-medium tracking-wide text-blue-200/70 uppercase">Saldo Total</p>
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90 transition-colors"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <p className="text-3xl font-bold tracking-tight text-white">
            {showValues ? amountPart : hidden}
          </p>
          {showValues && currencyPart && (
            <span className="text-sm font-medium text-white/60">{currencyPart}</span>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Receitas</p>
              <p className="text-sm font-bold text-white truncate">
                {showValues ? formatCurrency(summary.monthly_income) : hidden}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 shrink-0" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <ArrowDown className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Despesas</p>
              <p className="text-sm font-bold text-white truncate">
                {showValues ? formatCurrency(summary.monthly_expenses) : hidden}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
