"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { CategorySpending } from "@/types"

interface MobileExpenseChartProps {
  data: CategorySpending[]
}

const COLORS = ["#0F172A", "#10B981", "#34D399", "#475569", "#94A3B8", "#64748B", "#059669", "#CBD5E1"]

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
        <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
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
            <p className="text-[10px] font-medium text-slate-400">Total</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.category_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.category_name}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
