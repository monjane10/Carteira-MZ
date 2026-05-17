"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Edit3, Trash2, ArrowUpRight, ArrowDownLeft, RefreshCw, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import { toast } from "@/hooks/use-toast"
import { transactions as transactionService } from "@/services"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TransactionForm } from "./transaction-form"
import type { Transaction } from "@/types"
import type { z } from "zod"
import type { transactionSchema } from "@/validators"

type TransactionFormValues = z.infer<typeof transactionSchema>

const TYPE_ICONS = {
  INCOME: ArrowUpRight,
  EXPENSE: ArrowDownLeft,
  TRANSFER: RefreshCw,
  ADJUSTMENT: RefreshCw,
  LOAN_GIVEN: ArrowUpRight,
  LOAN_TAKEN: ArrowDownLeft,
  LOAN_PAYMENT: RefreshCw,
} as const

const TYPE_COLORS = {
  INCOME: "#10B981",
  EXPENSE: "#EF4444",
  TRANSFER: "#3B82F6",
  ADJUSTMENT: "#F59E0B",
  LOAN_GIVEN: "#8B5CF6",
  LOAN_TAKEN: "#8B5CF6",
  LOAN_PAYMENT: "#64748B",
} as const

export function TransactionDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    transactionService.getTransactionById(id).then((t) => {
      setTransaction(t)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex flex-col px-4 pt-5 pb-28">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="rounded-2xl border border-slate-100 bg-white p-6 mt-2 text-center">
          <div className="flex justify-center mb-4">
            <Skeleton className="h-20 w-20 rounded-2xl" />
          </div>
          <Skeleton className="h-6 w-24 mx-auto rounded-full mb-3" />
          <Skeleton className="h-8 w-36 mx-auto" />
          <Skeleton className="h-4 w-44 mx-auto mt-3" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-4">
        <p className="text-slate-500 mb-4">Transacção não encontrada</p>
        <button onClick={() => router.back()} className="h-10 px-6 rounded-xl bg-[#0F172A] text-white text-sm font-medium">
          Voltar
        </button>
      </div>
    )
  }

  const Icon = TYPE_ICONS[transaction.type] ?? RefreshCw
  const typeColor = TYPE_COLORS[transaction.type] ?? "#64748B"

  const handleEditSubmit = async (data: TransactionFormValues) => {
    try {
      const updated = await transactionService.updateTransaction(transaction.id, {
        account_id: data.account_id,
        category_id: data.category_id ?? null,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        transaction_date: data.transaction_date,
        is_recurring: data.is_recurring ?? false,
      })
      setTransaction(updated)
      setShowEdit(false)
      toast({ title: "Transacção actualizada", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await transactionService.deleteTransaction(transaction.id)
      toast({ title: "Transacção removida", variant: "success" })
      router.push("/transacoes")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <h1 className="text-xl font-bold text-[#0F172A] px-4 pt-5 pb-3">Detalhes da Transacção</h1>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 mt-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl" style={{ backgroundColor: `${typeColor}15` }}>
                <Icon className="h-8 w-8" style={{ color: typeColor }} />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3" style={{ backgroundColor: `${typeColor}12`, color: typeColor }}>
              {TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{formatCurrency(transaction.amount)}</p>
            {transaction.description && (
              <p className="text-sm text-slate-500 mt-3">{transaction.description}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden mt-4">
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Data</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">
                  {new Date(transaction.transaction_date).toLocaleDateString("pt-MZ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <div className="h-4 w-4 rounded-full border-2 border-slate-300" style={{ backgroundColor: typeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Conta</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{transaction.account?.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <div className="h-4 w-4 rounded-full border-2 border-slate-300" style={{ backgroundColor: transaction.category?.color ?? "#CBD5E1" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Categoria</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{transaction.category?.name ?? "—"}</p>
              </div>
            </div>
            {transaction.is_recurring && (
              <div className="flex items-center gap-3.5 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Recorrente</p>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">Sim</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B]"
            >
              <Edit3 className="h-5 w-5" />
              Editar Transacção
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-red-600 font-bold text-[14px] transition-all hover:bg-red-100"
            >
              <Trash2 className="h-5 w-5" />
              Remover Transacção
            </button>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={(open) => { if (!open) setShowDelete(false) }}
        title="Remover Transacção"
        description={`Tem a certeza que deseja remover esta transacção? O saldo da conta será ajustado. Esta acção não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <TransactionForm
        open={showEdit}
        onOpenChange={setShowEdit}
        onSubmit={handleEditSubmit}
        editingTransaction={transaction}
      />
    </div>
  )
}
