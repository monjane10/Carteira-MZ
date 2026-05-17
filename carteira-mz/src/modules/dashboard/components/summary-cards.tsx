"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import type { DashboardSummary } from "@/types"

interface SummaryCardsProps {
  summary: DashboardSummary
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const economy = summary.monthly_income - summary.monthly_expenses
  const [showBalance, setShowBalance] = useState(true)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={item} className="sm:col-span-2 lg:col-span-1">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#3B82F6] p-5 shadow-sm">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/[0.03]" />

          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium tracking-wide text-blue-200 uppercase">
              Saldo Total
            </span>
            <button
              type="button"
              onClick={() => setShowBalance((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90 transition-colors"
              aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-bold tracking-tight text-white">
              {showBalance ? formatCurrency(summary.total_balance) : "••••••"}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Receitas</p>
                <p className="text-sm font-bold text-white truncate">
                  {formatCurrency(summary.monthly_income)}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <ArrowDown className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Despesas</p>
                <p className="text-sm font-bold text-white truncate">
                  {formatCurrency(summary.monthly_expenses)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <StatCard
          label="Receitas do Mês"
          value={formatCurrency(summary.monthly_income)}
          change={formatPercentage(summary.income_change)}
          changeType={summary.income_change >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          label="Despesas do Mês"
          value={formatCurrency(summary.monthly_expenses)}
          change={formatPercentage(summary.expense_change)}
          changeType={summary.expense_change <= 0 ? "positive" : "negative"}
          icon={TrendingDown}
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          label="Economia do Mês"
          value={formatCurrency(economy)}
          changeType={economy >= 0 ? "positive" : "negative"}
          icon={PiggyBank}
        />
      </motion.div>
    </motion.div>
  )
}
