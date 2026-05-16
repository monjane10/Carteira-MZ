"use client"

import { Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import type { Goal } from "@/types"

interface GoalsOverviewProps {
  goals: Goal[]
}

export function GoalsOverview({ goals }: GoalsOverviewProps) {
  const activeGoals = goals
    .filter((g) => g.status === "ACTIVE")
    .slice(0, 3)

  if (activeGoals.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Metas Activas
          </h3>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Nenhuma meta activa no momento
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Metas Activas
        </h3>
      </div>
      <div className="space-y-4">
        {activeGoals.map((goal) => {
          const percentage = Math.min(
            Math.round((goal.current_amount / goal.target_amount) * 100),
            100
          )

          return (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {goal.title}
                </p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>{formatCurrency(goal.current_amount)}</span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
