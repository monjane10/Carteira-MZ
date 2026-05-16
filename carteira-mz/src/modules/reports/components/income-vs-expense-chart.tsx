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
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { MonthlyEvolution } from "@/types"

interface IncomeVsExpenseChartProps {
  data: MonthlyEvolution[]
  loading?: boolean
}

export function IncomeVsExpenseChart({ data, loading }: IncomeVsExpenseChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Receitas vs Despesas
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
            Receitas vs Despesas
          </h3>
          <p className="text-sm text-slate-500">Sem dados disponíveis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Receitas vs Despesas
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  backgroundColor: "white",
                }}
                formatter={(value) => [formatCurrency(Number(value))]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                dataKey="income"
                name="Receitas"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Despesas"
                fill="#0F172A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
