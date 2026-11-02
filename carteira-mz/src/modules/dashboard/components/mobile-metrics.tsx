"use client"

import { TrendingDown, Award } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary, CategorySpending } from "@/types"

interface MobileMetricsProps {
  summary: DashboardSummary
  categorySpending?: CategorySpending[]
}

export function MobileMetrics({ summary, categorySpending }: MobileMetricsProps) {
  const topCategory = categorySpending && categorySpending.length > 0 ? categorySpending[0] : null

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-50">
          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Top categoria</p>
          <p className="truncate text-xs font-bold leading-tight text-slate-900">
            {topCategory ? topCategory.category_name : "-"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-50">
          <Award className="h-3.5 w-3.5 text-orange-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Maior despesa</p>
          <p className="truncate text-xs font-bold leading-tight text-slate-900">
            {summary.biggest_expense ? formatCurrency(summary.biggest_expense.amount) : "-"}
          </p>
        </div>
      </div>
    </div>
  )
}
