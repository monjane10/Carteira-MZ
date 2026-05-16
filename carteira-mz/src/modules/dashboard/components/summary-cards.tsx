"use client"

import { motion } from "framer-motion"
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={item}>
        <StatCard
          label="Saldo Total"
          value={formatCurrency(summary.total_balance)}
          change={formatCurrency(summary.balance_change)}
          changeType={summary.balance_change >= 0 ? "positive" : "negative"}
          icon={Wallet}
        />
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
