"use client"

import { motion } from "framer-motion"
import { ArrowRight, Repeat } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transfer } from "@/types"

interface TransferListProps {
  transfers: Transfer[]
  loading: boolean
}

export function TransferList({ transfers, loading }: TransferListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (transfers.length === 0) {
    return (
      <EmptyState
        icon={Repeat}
        title="Nenhuma transferência"
        description="Registe a sua primeira transferência entre contas."
      />
    )
  }

  return (
    <div className="space-y-2">
      {transfers.map((transfer, index) => (
        <motion.div
          key={transfer.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {transfer.from_account?.name ?? "Conta origem"}
                <ArrowRight className="mx-1.5 inline h-3.5 w-3.5 text-slate-400" />
                {transfer.to_account?.name ?? "Conta destino"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {transfer.description ?? "Sem descrição"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatCurrency(transfer.amount)}
              </p>
              <p className="text-xs text-slate-400">{formatDate(transfer.transfer_date)}</p>
            </div>
          </div>
          {transfer.fee > 0 && (
            <p className="mt-2 text-xs text-slate-400">Taxa: {formatCurrency(transfer.fee)}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
