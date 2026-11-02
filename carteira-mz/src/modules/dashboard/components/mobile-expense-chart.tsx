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
    <section className="w-full shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-sm font-bold text-[#0F172A]">Despesas por Categoria</h2>
        <Link
          href="/relatorios"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Ver todas
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <p className="text-xs text-slate-500">Nenhuma despesa este mês</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 84, height: 84 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={42}
                    strokeWidth={0}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[8px] font-medium text-slate-500 leading-none">Total</p>
                <p className="text-[8px] font-bold text-slate-900 leading-tight text-center px-0.5">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-1 min-w-0">
              {data.slice(0, 4).map((item, index) => (
                <div key={item.category_id} className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-600 truncate">{item.category_name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 shrink-0 ml-1">
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
