"use client"

import { motion } from "framer-motion"
import { Trash2, Wallet } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { BUDGET_PERIOD_LABELS } from "@/constants"
import { formatCurrency, cn } from "@/lib/utils"
import type { Budget } from "@/types"

interface BudgetCardProps {
  budget: Budget
  onClick?: () => void
  onDelete?: () => void
}

export function BudgetCard({ budget, onClick, onDelete }: BudgetCardProps) {
  const spent = budget.spent ?? 0
  const limit = budget.amount_limit
  const usedPercent = limit > 0 ? Math.round((spent / limit) * 100) : 0
  const remaining = limit - spent
  const isOverLimit = spent > limit
  const isWarning = usedPercent >= 80 && !isOverLimit

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isOverLimit && "border-red-300 dark:border-red-800",
          isWarning && !isOverLimit && "border-amber-300 dark:border-amber-800"
        )}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: budget.category?.color
                    ? `${budget.category.color}20`
                    : "#0F172A20",
                }}
              >
                <Wallet
                  className="h-5 w-5"
                  style={{ color: budget.category?.color ?? "#0F172A" }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {budget.category?.name ?? "Sem categoria"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {BUDGET_PERIOD_LABELS[budget.period]}
                </p>
              </div>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="ml-1 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Gasto</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(spent)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Limite</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatCurrency(limit)}
              </span>
            </div>
          </div>

          <Progress
            value={Math.min(usedPercent, 100)}
            className={cn(
              "mb-2",
              isOverLimit && "[&>div]:bg-red-500",
              isWarning && !isOverLimit && "[&>div]:bg-amber-500"
            )}
          />

          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "font-medium",
                isOverLimit && "text-red-600 dark:text-red-400",
                isWarning && !isOverLimit && "text-amber-600 dark:text-amber-400",
                !isWarning && !isOverLimit && "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {usedPercent}% usado
            </span>
            <span
              className={cn(
                "font-medium",
                isOverLimit && "text-red-600 dark:text-red-400",
                remaining > 0 && "text-slate-500 dark:text-slate-400"
              )}
            >
              {isOverLimit
                ? `${formatCurrency(Math.abs(remaining))} acima`
                : `${formatCurrency(remaining)} restante`}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
