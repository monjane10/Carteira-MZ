"use client"

import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction, Category, TransactionType } from "@/types"
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, HandCoins, ChevronRight } from "lucide-react"

interface MobileExpenseListProps {
  transactions: Transaction[]
  categoryMap: Record<string, Category>
}

const typeConfig: Record<TransactionType, { icon: typeof ArrowDownRight; bg: string; text: string; prefix: string }> = {
  INCOME: { icon: ArrowUpRight, bg: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400", text: "text-emerald-600 dark:text-emerald-400", prefix: "+" },
  EXPENSE: { icon: ArrowDownRight, bg: "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400", text: "text-red-500 dark:text-red-400", prefix: "-" },
  TRANSFER: { icon: ArrowLeftRight, bg: "bg-blue-50 text-blue-500 dark:bg-blue-950/50 dark:text-blue-400", text: "text-blue-600 dark:text-blue-400", prefix: "" },
  ADJUSTMENT: { icon: ArrowLeftRight, bg: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", text: "text-slate-600 dark:text-slate-400", prefix: "" },
  LOAN_GIVEN: { icon: HandCoins, bg: "bg-orange-50 text-orange-500 dark:bg-orange-950/50 dark:text-orange-400", text: "text-orange-600 dark:text-orange-400", prefix: "-" },
  LOAN_TAKEN: { icon: HandCoins, bg: "bg-violet-50 text-violet-500 dark:bg-violet-950/50 dark:text-violet-400", text: "text-violet-600 dark:text-violet-400", prefix: "+" },
  LOAN_PAYMENT: { icon: HandCoins, bg: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400", text: "text-emerald-600 dark:text-emerald-400", prefix: "-" },
}

export function MobileExpenseList({ transactions, categoryMap }: MobileExpenseListProps) {
  const movimentos = transactions.slice(0, 5)

  if (movimentos.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Movimentos Recentes
        </h2>
        <p className="mt-2 text-sm text-slate-500">Nenhum movimento registado</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Movimentos Recentes
        </h2>
        <Link
          href="/transacoes"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Ver todos
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {movimentos.map((tx) => {
          const config = typeConfig[tx.type]
          const Icon = config.icon
          const category = tx.category_id ? categoryMap[tx.category_id] : null

          return (
            <Link
              key={tx.id}
              href="/transacoes"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-shadow hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                <Icon className="h-4 w-4" />
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
                <p className={`text-sm font-bold ${config.text}`}>
                  {config.prefix}{formatCurrency(tx.amount)}
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
