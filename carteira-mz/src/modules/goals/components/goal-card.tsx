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
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: goal.color ?? "#0F172A" }}
        />
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: goal.color ? `${goal.color}20` : "#0F172A20",
                  color: goal.color ?? "#0F172A",
                }}
              >
                <Target className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {goal.title}
                </p>
                {goal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-1 shrink-0">
              <Badge variant={STATUS_VARIANTS[goal.status] ?? "default"}>
                {GOAL_STATUS_LABELS[goal.status]}
              </Badge>
              {onDelete && goal.status !== "COMPLETED" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="ml-1 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Progresso</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(goal.current_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Meta</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatCurrency(goal.target_amount)}
              </span>
            </div>
          </div>

          <Progress value={progress} className="mb-2" />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium" style={{ color: goal.color ?? undefined }}>
              {progress}%
            </span>
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
