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
}

export function MonthNavigator({ year, month, onPrev, onNext, isCurrent }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors active:scale-95 shrink-0"
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
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors active:scale-95 shrink-0"
        aria-label="Mês seguinte"
        disabled={isCurrent}
        style={{ opacity: isCurrent ? 0.3 : 1 }}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
