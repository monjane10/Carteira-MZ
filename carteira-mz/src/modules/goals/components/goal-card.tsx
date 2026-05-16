"use client"

import { motion } from "framer-motion"
import { Target, Trash2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { GOAL_STATUS_LABELS } from "@/constants"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import type { Goal } from "@/types"

interface GoalCardProps {
  goal: Goal
  onClick?: () => void
  onDelete?: () => void
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  ACTIVE: "info",
  COMPLETED: "success",
  CANCELLED: "default",
}

export function GoalCard({ goal, onClick, onDelete }: GoalCardProps) {
  const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)

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
          "cursor-pointer transition-all hover:shadow-md overflow-hidden",
          goal.status === "COMPLETED" && "border-emerald-200 dark:border-emerald-900",
          goal.status === "CANCELLED" && "opacity-70"
        )}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white">
                <Target className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {goal.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={STATUS_VARIANTS[goal.status] ?? "default"}>
                {GOAL_STATUS_LABELS[goal.status]}
              </Badge>
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{formatCurrency(goal.current_amount)}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(goal.target_amount)}</span>
          </div>

          <Progress value={progress} className="mb-1.5 h-1.5" />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium">{progress}%</span>
            {goal.target_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(goal.target_date)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
