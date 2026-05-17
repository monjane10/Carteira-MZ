"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Edit3, Trash2, ArrowRightLeft, Calendar, Percent } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { transfers as transferService } from "@/services"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TransferForm } from "./transfer-form"
import type { Transfer } from "@/types"
import type { z } from "zod"
import type { transferSchema } from "@/validators"

type TransferFormValues = z.infer<typeof transferSchema>

export function TransferDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    transferService.getTransferById(id).then((t) => {
      setTransfer(t)
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
          <Skeleton className="h-8 w-36 mx-auto" />
          <Skeleton className="h-4 w-44 mx-auto mt-3" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden mt-4">
          {[1, 2, 3, 4].map((i) => (
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

  if (!transfer) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-4">
        <p className="text-slate-500 mb-4">Transferência não encontrada</p>
        <button onClick={() => router.back()} className="h-10 px-6 rounded-xl bg-[#0F172A] text-white text-sm font-medium">
          Voltar
        </button>
      </div>
    )
  }

  const handleEditSubmit = async (data: TransferFormValues) => {
    try {
      const updated = await transferService.updateTransfer(transfer.id, {
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        fee: data.fee ?? 0,
        description: data.description ?? null,
        transfer_date: data.transfer_date,
      })
      setTransfer(updated)
      setShowEdit(false)
      toast({ title: "Transferência actualizada", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await transferService.deleteTransfer(transfer.id)
      toast({ title: "Transferência removida", variant: "success" })
      router.push("/transferencias")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <h1 className="text-xl font-bold text-[#0F172A] px-4 pt-5 pb-3">Detalhes da Transferência</h1>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 mt-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
                <ArrowRightLeft className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{formatCurrency(transfer.amount)}</p>
            {transfer.description && (
              <p className="text-sm text-slate-500 mt-3">{transfer.description}</p>
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
                  {new Date(transfer.transfer_date).toLocaleDateString("pt-MZ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-400 shrink-0">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Origem</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{transfer.from_account?.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-400 shrink-0">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Destino</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{transfer.to_account?.name ?? "—"}</p>
              </div>
            </div>
            {transfer.fee > 0 && (
              <div className="flex items-center gap-3.5 px-4 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                  <Percent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Taxa</p>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">{formatCurrency(transfer.fee)}</p>
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
              Editar Transferência
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-red-600 font-bold text-[14px] transition-all hover:bg-red-100"
            >
              <Trash2 className="h-5 w-5" />
              Remover Transferência
            </button>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={(open) => { if (!open) setShowDelete(false) }}
        title="Remover Transferência"
        description={`Tem a certeza que deseja remover esta transferência? Os saldos das contas serão ajustados. Esta acção não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <TransferForm
        open={showEdit}
        onOpenChange={setShowEdit}
        onSubmit={handleEditSubmit}
        editingTransfer={transfer}
      />
    </div>
  )
}
