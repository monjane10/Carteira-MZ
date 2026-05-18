"use client"

import { TrendingDown, Award, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary, CategorySpending } from "@/types"

interface MobileMetricsProps {
  summary: DashboardSummary
  categorySpending?: CategorySpending[]
}

export function MobileMetrics({ summary, categorySpending }: MobileMetricsProps) {
  const topCategory = categorySpending && categorySpending.length > 0 ? categorySpending[0] : null

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">Top categoria</p>
          <div className="flex h-4 w-4 items-center justify-center rounded bg-red-50">
            <TrendingDown className="h-2.5 w-2.5 text-red-500" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-900 truncate -mt-0.5">
          {topCategory ? topCategory.category_name : "—"}
        </p>
        {topCategory && (
          <p className="text-[9px] text-slate-400 -mt-0.5">
            {formatCurrency(topCategory.total)}{topCategory.percentage ? ` (${topCategory.percentage}%)` : ""}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">Maior despesa</p>
          <div className="flex h-4 w-4 items-center justify-center rounded bg-orange-50">
            <Award className="h-2.5 w-2.5 text-orange-500" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-900 truncate -mt-0.5">
          {summary.biggest_expense ? formatCurrency(summary.biggest_expense.amount) : "—"}
        </p>
        {summary.biggest_expense?.description && (
          <p className="text-[9px] text-slate-400 truncate -mt-0.5">
            {summary.biggest_expense.description}
          </p>
        )}
      </div>
    </div>
  )
}
