"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { TransactionList } from "./components/transaction-list"
import { TransactionForm } from "./components/transaction-form"
import * as transactionService from "@/services/mock/transactions"
import type { Transaction } from "@/types"
import type { z } from "zod"
import type { transactionSchema } from "@/validators"

type TransactionFormValues = z.infer<typeof transactionSchema>

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await transactionService.getTransactions()
      setTransactions(data)
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as transacções.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleCreate = async (data: TransactionFormValues) => {
    try {
      const newTransaction = await transactionService.createTransaction({
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
      setTransactions((prev) => [newTransaction, ...prev])
      toast({ title: "Sucesso", description: "Transacção criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a transacção.", variant: "error" })
    }
  }

  const handleUpdate = async (data: TransactionFormValues) => {
    if (!editingTransaction) return
    try {
      const updated = await transactionService.updateTransaction(editingTransaction.id, {
        account_id: data.account_id,
        category_id: data.category_id ?? null,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        transaction_date: data.transaction_date,
        is_recurring: data.is_recurring ?? false,
      })
      if (updated) {
        setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        toast({ title: "Sucesso", description: "Transacção actualizada com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar a transacção.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await transactionService.deleteTransaction(deleteConfirm.id)
      setTransactions((prev) => prev.filter((t) => t.id !== deleteConfirm.id))
      toast({ title: "Sucesso", description: "Transacção removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover a transacção.", variant: "error" })
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

      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={(t) => setDeleteConfirm(t)}
      />

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
