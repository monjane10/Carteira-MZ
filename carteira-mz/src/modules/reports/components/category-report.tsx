"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/shared/loading-state"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { CategorySpending } from "@/types"

interface CategoryReportProps {
  data: CategorySpending[]
  loading?: boolean
}

export function CategoryReport({ data, loading }: CategoryReportProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Gastos por Categoria
          </h3>
          <LoadingState type="chart" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Gastos por Categoria
          </h3>
          <p className="text-sm text-slate-500">Sem dados disponíveis.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    name: d.category_name,
    value: d.total,
    color: d.category_color ?? "#64748B",
  }))

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Gastos por Categoria
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barCategoryGap="25%">
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  backgroundColor: "white",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "Total"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
