"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction, Category, TransactionType } from "@/types"
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, HandCoins } from "lucide-react"

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

// Altura de cada movimento + espaço entre eles (h-12 + gap-1.5)
const ITEM_HEIGHT = 48
const ITEM_GAP = 6

/** Quantos movimentos cabem no espaço que sobra no ecrã (o ecrã inicial não tem scroll). */
function useFittingCount(max: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(3)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      const fits = Math.floor((entry.contentRect.height + ITEM_GAP) / (ITEM_HEIGHT + ITEM_GAP))
      setCount(Math.max(1, Math.min(max, fits)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [max])

  return { ref, count }
}

export function MobileExpenseList({ transactions, categoryMap }: MobileExpenseListProps) {
  const { ref, count } = useFittingCount(transactions.length || 1)
  const movimentos = transactions.slice(0, count)

  if (transactions.length === 0) {
    return (
      <section className="w-full">
        <h2 className="mb-1.5 text-sm font-bold text-[#0F172A]">Movimentos Recentes</h2>
        <p className="text-xs text-slate-500">Nenhum movimento registado</p>
      </section>
    )
  }

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0F172A]">Movimentos Recentes</h2>
        <Link
          href="/transacoes"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Ver todos
        </Link>
      </div>

      <div ref={ref} className="flex min-h-[48px] flex-1 flex-col gap-1.5 overflow-hidden">
        {movimentos.map((tx) => {
          const config = typeConfig[tx.type]
          const Icon = config.icon
          const category = tx.category_id ? categoryMap[tx.category_id] : null

          return (
            <Link
              key={tx.id}
              href="/transacoes"
              className="flex h-12 shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 transition-shadow hover:shadow-sm"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-semibold leading-tight text-[#0F172A]">
                  {tx.description || "Sem descrição"}
                </p>
                <p className="truncate text-[11px] leading-tight text-slate-500">
                  {category?.name || "Sem categoria"} · {formatDate(tx.transaction_date, "short")}
                </p>
              </div>
              <p className={`shrink-0 text-[13px] font-bold ${config.text}`}>
                {config.prefix}{formatCurrency(tx.amount)}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
