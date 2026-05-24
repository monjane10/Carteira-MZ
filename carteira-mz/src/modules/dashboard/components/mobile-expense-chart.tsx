"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import Link from "next/link"
import type { CategorySpending } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface MobileExpenseChartProps {
  data: CategorySpending[]
}

const COLORS = ["#0F172A", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#64748B"]

export function MobileExpenseChart({ data }: MobileExpenseChartProps) {
  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Despesas por Categoria</h2>
        <Link
          href="/relatorios"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Ver todas
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma despesa este mês</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center gap-5">
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
                <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight text-center px-0.5">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 min-w-0">
              {data.slice(0, 5).map((item, index) => (
                <div key={item.category_id} className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{item.category_name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white shrink-0 ml-1">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
