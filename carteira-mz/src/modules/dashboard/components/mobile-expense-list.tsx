"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction, Category } from "@/types"
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react"

const typeIcons = {
  INCOME: ArrowUpRight,
  EXPENSE: ArrowDownRight,
  TRANSFER: ArrowLeftRight,
  ADJUSTMENT: ArrowLeftRight,
  LOAN_GIVEN: ArrowUpRight,
  LOAN_TAKEN: ArrowDownRight,
  LOAN_PAYMENT: ArrowDownRight,
}

const typeColors = {
  INCOME: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50",
  EXPENSE: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/50",
  TRANSFER: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50",
  ADJUSTMENT: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
  LOAN_GIVEN: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/50",
  LOAN_TAKEN: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/50",
  LOAN_PAYMENT: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50",
}

interface MobileExpenseListProps {
  transactions: Transaction[]
  categoryMap: Record<string, Category>
}

export function MobileExpenseList({ transactions, categoryMap }: MobileExpenseListProps) {
  const expenses = transactions.filter((t) => t.type === "EXPENSE")

  if (expenses.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Despesas Recentes
        </h2>
        <p className="mt-2 text-sm text-slate-500">Nenhuma despesa registada</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Despesas Recentes
      </h2>

      <div className="mt-3 space-y-2">
        {expenses.map((tx) => {
          const Icon = typeIcons[tx.type]
          const colorClass = typeColors[tx.type]
          const category = tx.category_id ? categoryMap[tx.category_id] : null

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {tx.description || "Sem descrição"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {category?.name || "Sem categoria"} · {formatDate(tx.transaction_date, "short")}
                </p>
              </div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 flex-shrink-0">
                -{formatCurrency(tx.amount)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
