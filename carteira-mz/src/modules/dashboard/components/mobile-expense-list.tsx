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
  INCOME: { icon: ArrowUpRight, bg: "bg-emerald-50 text-emerald-500", text: "text-emerald-600", prefix: "+" },
  EXPENSE: { icon: ArrowDownRight, bg: "bg-red-50 text-red-500", text: "text-red-500", prefix: "-" },
  TRANSFER: { icon: ArrowLeftRight, bg: "bg-blue-50 text-blue-500", text: "text-blue-600", prefix: "" },
  ADJUSTMENT: { icon: ArrowLeftRight, bg: "bg-slate-100 text-slate-500", text: "text-slate-600", prefix: "" },
  LOAN_GIVEN: { icon: HandCoins, bg: "bg-orange-50 text-orange-500", text: "text-orange-600", prefix: "-" },
  LOAN_TAKEN: { icon: HandCoins, bg: "bg-violet-50 text-violet-500", text: "text-violet-600", prefix: "+" },
  LOAN_PAYMENT: { icon: HandCoins, bg: "bg-emerald-50 text-emerald-500", text: "text-emerald-600", prefix: "-" },
}

export function MobileExpenseList({ transactions, categoryMap }: MobileExpenseListProps) {
  const movimentos = transactions.slice(0, 5)

  if (movimentos.length === 0) {
    return (
      <section className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0F172A]">Movimentos Recentes</h2>
        </div>
        <p className="text-sm text-slate-500">Nenhum movimento registado</p>
      </section>
    )
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#0F172A]">Movimentos Recentes</h2>
        <Link
          href="/transacoes"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Ver todos
        </Link>
      </div>

      <div className="space-y-2">
        {movimentos.map((tx) => {
          const config = typeConfig[tx.type]
          const Icon = config.icon
          const category = tx.category_id ? categoryMap[tx.category_id] : null

          return (
            <Link
              key={tx.id}
              href="/transacoes"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-shadow hover:shadow-sm"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] truncate">
                  {tx.description || "Sem descrição"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {category?.name || "Sem categoria"} · {formatDate(tx.transaction_date, "short")}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <p className={`text-sm font-bold ${config.text}`}>
                  {config.prefix}{formatCurrency(tx.amount)}
                </p>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
