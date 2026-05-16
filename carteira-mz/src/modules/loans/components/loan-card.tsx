"use client"

import { motion } from "framer-motion"
import { User, Phone, Calendar, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from "@/constants"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import type { Loan } from "@/types"

interface LoanCardProps {
  loan: Loan
  onClick?: () => void
  onDelete?: () => void
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  PAID: "success",
  PENDING: "warning",
  PARTIALLY_PAID: "info",
  OVERDUE: "error",
}

export function LoanCard({ loan, onClick, onDelete }: LoanCardProps) {
  const progress =
    loan.total_amount > 0 ? Math.round((loan.paid_amount / loan.total_amount) * 100) : 0

  const isOverdue =
    loan.status !== "PAID" &&
    !!loan.due_date &&
    new Date(loan.due_date) < new Date()

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
          isOverdue && "border-red-300 dark:border-red-800"
        )}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{loan.person_name}</p>
                {loan.phone && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Phone className="h-3 w-3" />
                    {loan.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-1">
              <div className="flex gap-1">
                <Badge variant={loan.type === "GIVEN" ? "info" : "warning"}>
                  {LOAN_TYPE_LABELS[loan.type]}
                </Badge>
                <Badge variant={STATUS_VARIANTS[loan.status] ?? "default"}>
                  {LOAN_STATUS_LABELS[loan.status]}
                </Badge>
              </div>
              {onDelete && (
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
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(loan.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Pago</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(loan.paid_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Restante</span>
              <span
                className={cn(
                  "font-medium",
                  loan.remaining_amount > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {formatCurrency(loan.remaining_amount)}
              </span>
            </div>
          </div>

          <Progress value={progress} className="mb-2" />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{progress}% pago</span>
            {loan.due_date && (
              <span className={cn("flex items-center gap-1", isOverdue && "font-medium text-red-500")}>
                <Calendar className="h-3 w-3" />
                {isOverdue ? "Vencido: " : "Vence: "}
                {formatDate(loan.due_date)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
