"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { CategorySpending } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface CategoryPieChartProps {
  data: CategorySpending[]
}

const DEFAULT_COLORS = ["#10B981", "#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#059669", "#047857"]

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: d.category_name,
        value: d.total,
        color: d.category_color ?? undefined,
      })),
    [data]
  )

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Despesas por Categoria
        </h3>
        <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
          Nenhuma despesa no período
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
        Despesas por Categoria
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                fontSize: 12,
              }}
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.category_id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    d.category_color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                }}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {d.category_name}
              </span>
            </div>
            <span className="font-medium text-slate-900 dark:text-white">
              {d.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
