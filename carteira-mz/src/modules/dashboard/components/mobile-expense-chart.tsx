"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { CategorySpending } from "@/types"

interface MobileExpenseChartProps {
  data: CategorySpending[]
}

const COLORS = ["#0F172A", "#10B981", "#059669", "#0D9488", "#1E293B", "#334155", "#34D399", "#475569"]

export function MobileExpenseChart({ data }: MobileExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Despesas por Categoria
        </h2>
        <p className="mt-2 text-sm text-slate-500">Nenhuma despesa este mês</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Despesas por Categoria
      </h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-slate-400">Total</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.category_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium">
                  {item.category_name}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
