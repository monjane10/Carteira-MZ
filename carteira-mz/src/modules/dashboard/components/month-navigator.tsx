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
    <div className="flex items-center justify-between px-1">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[#0F172A]">
          {MONTHS[month]} {year}
        </span>
        {isCurrent && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Actual
          </span>
        )}
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={onNext}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Mês seguinte"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
