"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { TransactionList } from "./components/transaction-list"
import { TransactionForm } from "./components/transaction-form"
import { useTransactionStore } from "@/store"
import type { Transaction } from "@/types"
import type { z } from "zod"
import type { transactionSchema } from "@/validators"

type TransactionFormValues = z.infer<typeof transactionSchema>

function TransactionsPage() {
  const { transactions, isLoading, error, fetchTransactions, addTransaction, updateTransaction, removeTransaction } = useTransactionStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleCreate = async (data: TransactionFormValues) => {
    try {
      await addTransaction({
        account_id: data.account_id,
        category_id: data.category_id ?? null,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        reference_code: null,
        transaction_date: data.transaction_date,
        is_recurring: data.is_recurring ?? false,
        attachment_url: null,
      })
      toast({ title: "Sucesso", description: "Transacção criada com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleUpdate = async (data: TransactionFormValues) => {
    if (!editingTransaction) return
    try {
      await updateTransaction(editingTransaction.id, {
        account_id: data.account_id,
        category_id: data.category_id ?? null,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        transaction_date: data.transaction_date,
        is_recurring: data.is_recurring ?? false,
      })
      toast({ title: "Sucesso", description: "Transacção actualizada com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await removeTransaction(deleteConfirm.id)
      toast({ title: "Sucesso", description: "Transacção removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingTransaction(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: TransactionFormValues) => {
    if (editingTransaction) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  return (
    <div>
      <PageHeader title="Transacções" description="Registe e consulte todas as suas transacções financeiras">
        <Link href="/transacoes/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Transacção
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchTransactions} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <LoadingState type="card" />
      ) : (
        <TransactionList
          transactions={transactions}
          loading={false}
          onEdit={handleOpenEdit}
          onDelete={(t) => setDeleteConfirm(t)}
        />
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        title="Remover Transacção"
        description="Tem a certeza que deseja remover esta transacção? Esta acção não pode ser desfeita."
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
export default TransactionsPage
export { TransactionsPage as TransactionsModule }
