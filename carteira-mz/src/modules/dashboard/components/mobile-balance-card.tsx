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
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#0F1D40] px-4 py-3 text-white shadow-sm"
      style={{ backgroundImage: "linear-gradient(135deg, #0B1633 0%, #0F1D40 50%, #1A2D5A 100%)" }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/[0.03]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-wide text-blue-200 uppercase">Saldo Total</p>
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90 transition-colors"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="flex items-baseline gap-1">
          <p className="text-[1.65rem] font-bold leading-tight tracking-tight text-white break-words">
            {showValues ? amountPart : hidden}
          </p>
          {showValues && currencyPart && (
            <span className="text-sm font-medium text-white/80">{currencyPart}</span>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-3 border-t border-white/10 pt-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wide">Receitas</p>
              <p className="text-sm font-bold leading-tight text-white truncate">
                {showValues ? formatCurrency(summary.monthly_income) : hidden}
              </p>
            </div>
          </div>

          <div className="h-7 w-px bg-white/10 shrink-0" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <ArrowDown className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wide">Despesas</p>
              <p className="text-sm font-bold leading-tight text-white truncate">
                {showValues ? formatCurrency(summary.monthly_expenses) : hidden}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
