"use client"

import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction, Category } from "@/types"
import { ArrowDownRight, ChevronRight } from "lucide-react"

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
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Despesas Recentes
        </h2>
        <Link
          href="/transacoes"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {expenses.map((tx) => {
          const category = tx.category_id ? categoryMap[tx.category_id] : null

          return (
            <Link
              key={tx.id}
              href="/transacoes"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {tx.description || "Sem descrição"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {category?.name || "Sem categoria"} · {formatDate(tx.transaction_date, "short")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <p className="text-sm font-bold text-red-500 dark:text-red-400">
                  -{formatCurrency(tx.amount)}
                </p>
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
