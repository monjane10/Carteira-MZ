"use client"

import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction, Category } from "@/types"

interface RecentTransactionsProps {
  transactions: Transaction[]
  categoryMap?: Record<string, Category>
  onViewAll?: () => void
}

export function RecentTransactions({
  transactions,
  categoryMap,
  onViewAll,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Transacções Recentes
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Ver todas
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="space-y-1">
        {transactions.map((tx) => {
          const isIncome = tx.type === "INCOME"
          const category = tx.category_id && categoryMap
            ? categoryMap[tx.category_id]
            : undefined

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isIncome
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                )}
              >
                {isIncome ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {tx.description ?? "Sem descrição"}
                </p>
                <p className="text-xs text-slate-500">
                  {category?.name ?? tx.category_id ?? "Sem categoria"}
                  {" · "}
                  {formatDate(tx.transaction_date, "relative")}
                </p>
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-sm font-semibold",
                  isIncome
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
