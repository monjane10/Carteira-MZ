"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, ArrowRight, Calendar, Edit3 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { TransferList } from "./components/transfer-list"
import { TransferForm } from "./components/transfer-form"
import { transfers as transferService, accounts as accountService } from "@/services"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transfer, Account } from "@/types"
import type { z } from "zod"
import type { transferSchema } from "@/validators"
import { motion } from "framer-motion"

type TransferFormValues = z.infer<typeof transferSchema>

function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  const fetchTransfers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, accs] = await Promise.all([
        transferService.getTransfers(),
        accountService.getAccounts(),
      ])
      setTransfers(data)
      setAccounts(accs)
    } catch {
      setError("Não foi possível carregar as transferências.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  useEffect(() => {
    if (selectedTransfer) {
      window.history.pushState({ view: "detail" }, "")
      const onPop = () => setSelectedTransfer(null)
      window.addEventListener("popstate", onPop)
      return () => window.removeEventListener("popstate", onPop)
    }
  }, [selectedTransfer])

  const handleCreate = async (data: TransferFormValues) => {
    try {
      const newTransfer = await transferService.createTransfer({
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        fee: data.fee ?? 0,
        description: data.description ?? null,
        transfer_date: data.transfer_date,
      })
      setTransfers((prev) => [newTransfer, ...prev])
      toast({ title: "Sucesso", description: "Transferência criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a transferência.", variant: "error" })
    }
  }

  const handleUpdate = async (data: TransferFormValues) => {
    if (!editingTransfer) return
    try {
      const updated = await transferService.updateTransfer(editingTransfer.id, {
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        fee: data.fee ?? 0,
        description: data.description ?? null,
        transfer_date: data.transfer_date,
      })
      if (updated) {
        setTransfers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        setSelectedTransfer(updated)
        toast({ title: "Sucesso", description: "Transferência actualizada com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar a transferência.", variant: "error" })
    }
  }

  const handleOpenEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: TransferFormValues) => {
    if (editingTransfer) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
    setFormOpen(false)
  }

  const fromAccount = selectedTransfer ? accounts.find((a) => a.id === selectedTransfer.from_account_id) : null
  const toAccount = selectedTransfer ? accounts.find((a) => a.id === selectedTransfer.to_account_id) : null

  if (selectedTransfer) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-5"
      >
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ArrowRight className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Transferência</h2>
              <p className="text-sm text-slate-500">{selectedTransfer.description || "Sem descrição"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs text-slate-400 font-medium">Origem</p>
              <p className="text-sm font-bold text-[#0F172A] mt-0.5">{fromAccount?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Destino</p>
              <p className="text-sm font-bold text-[#0F172A] mt-0.5">{toAccount?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Valor</p>
              <p className="text-sm font-bold text-[#0F172A] mt-0.5">{formatCurrency(selectedTransfer.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Taxa</p>
              <p className="text-sm font-bold text-[#0F172A] mt-0.5">{selectedTransfer.fee > 0 ? formatCurrency(selectedTransfer.fee) : "Sem taxa"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(selectedTransfer.transfer_date, "long")}
          </div>
        </div>

        <button
          onClick={() => handleOpenEdit(selectedTransfer)}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-sm font-bold text-white transition-all hover:bg-[#1E293B]"
        >
          <Edit3 className="h-4 w-4" />
          Editar Transferência
        </button>

        <TransferForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          editingTransfer={editingTransfer}
        />
      </motion.div>
    )
  }

  return (
    <div>
      <PageHeader title="Transferências" description="Gerencie as transferências entre as suas contas">
        <Link href="/transferencias/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Transferência
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchTransfers} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : loading ? (
        <LoadingState type="card" />
      ) : (
        <TransferList
          transfers={transfers}
          loading={false}
          onClick={(t) => setSelectedTransfer(t)}
        />
      )}

      <TransferForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingTransfer={editingTransfer}
      />
    </div>
  )
}
export default TransfersPage
export { TransfersPage as TransfersModule }
