"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface MonthNavigatorProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  isCurrent: boolean
  /** Versão compacta, em branco, para dentro do cartão do saldo */
  variant?: "default" | "card"
}

export function MonthNavigator({ year, month, onPrev, onNext, isCurrent, variant = "default" }: MonthNavigatorProps) {
  if (variant === "card") {
    return (
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 active:bg-white/20"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="truncate px-1 text-xs font-semibold text-white">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 active:bg-white/20 disabled:opacity-30"
          aria-label="Mês seguinte"
          disabled={isCurrent}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors active:scale-95 shrink-0"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-bold text-[#0F172A] whitespace-nowrap">
          {MONTHS[month]} {year}
        </span>
        {isCurrent && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
            Actual
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors active:scale-95 shrink-0"
        aria-label="Mês seguinte"
        disabled={isCurrent}
        style={{ opacity: isCurrent ? 0.3 : 1 }}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
