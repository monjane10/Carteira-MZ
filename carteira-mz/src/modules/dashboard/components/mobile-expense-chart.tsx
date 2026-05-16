"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { CategorySpending } from "@/types"

interface MobileExpenseChartProps {
  data: CategorySpending[]
}

const COLORS = ["#10B981", "#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#059669", "#047857"]

export function MobileExpenseChart({ data }: MobileExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Despesas por Categoria
        </h2>
        <p className="mt-2 text-sm text-slate-500">Nenhuma despesa este mês</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Despesas por Categoria
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={60}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] font-medium text-slate-400 leading-none">Total</p>
            <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight text-center px-1 break-all">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.category_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {item.category_name}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white shrink-0 ml-1">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
