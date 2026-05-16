"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { LoanCard } from "./components/loan-card"
import { LoanForm } from "./components/loan-form"
import { LoanDetail } from "./components/loan-detail"
import * as loanService from "@/services/mock/loans"
import type { Loan } from "@/types"
import type { z } from "zod"
import type { loanSchema } from "@/validators"

type LoanFormValues = z.infer<typeof loanSchema>

function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Loan | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loanService.getLoans()
      setLoans(data)
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os empréstimos.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const handleCreate = async (data: LoanFormValues) => {
    try {
      const newLoan = await loanService.createLoan({
        account_id: data.account_id ?? null,
        person_name: data.person_name,
        phone: data.phone ?? null,
        type: data.type,
        total_amount: data.total_amount,
        paid_amount: 0,
        remaining_amount: data.total_amount,
        interest_amount: data.interest_amount ?? 0,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
        status: "PENDING",
      })
      setLoans((prev) => [newLoan, ...prev])
      toast({ title: "Sucesso", description: "Empréstimo criado com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar o empréstimo.", variant: "error" })
    }
  }

  const handleUpdate = async (data: LoanFormValues) => {
    if (!editingLoan) return
    try {
      const updated = await loanService.updateLoan(editingLoan.id, {
        account_id: data.account_id ?? null,
        person_name: data.person_name,
        phone: data.phone ?? null,
        type: data.type,
        total_amount: data.total_amount,
        interest_amount: data.interest_amount ?? 0,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
      })
      if (updated) {
        setLoans((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
        toast({ title: "Sucesso", description: "Empréstimo actualizado com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar o empréstimo.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await loanService.deleteLoan(deleteConfirm.id)
      setLoans((prev) => prev.filter((l) => l.id !== deleteConfirm.id))
      toast({ title: "Sucesso", description: "Empréstimo removido com sucesso.", variant: "success" })
      setDeleteConfirm(null)
      if (selectedLoanId === deleteConfirm.id) setSelectedLoanId(null)
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover o empréstimo.", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingLoan(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (loan: Loan) => {
    setEditingLoan(loan)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: LoanFormValues) => {
    if (editingLoan) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  if (selectedLoanId) {
    return (
      <div>
        <LoanDetail
          loanId={selectedLoanId}
          onBack={() => setSelectedLoanId(null)}
          onLoanUpdated={fetchLoans}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Empréstimos" description="Gerencie os empréstimos concedidos e obtidos">
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Empréstimo
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum empréstimo registado.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenCreate}>
            Registar primeiro empréstimo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onClick={() => {
                setSelectedLoanId(loan.id)
              }}
              onDelete={() => setDeleteConfirm(loan)}
            />
          ))}
        </div>
      )}

      <LoanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingLoan={editingLoan}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        title="Remover Empréstimo"
        description="Tem a certeza que deseja remover este empréstimo? Esta acção não pode ser desfeita."
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
export default LoansPage
export { LoansPage as LoansModule }
