"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { LoanCard } from "./components/loan-card"
import { LoanForm } from "./components/loan-form"
import { LoanDetail } from "./components/loan-detail"
import { useLoanStore } from "@/store"
import type { Loan } from "@/types"
import type { z } from "zod"
import type { loanSchema } from "@/validators"

type LoanFormValues = z.infer<typeof loanSchema>

function LoansPage() {
  const { loans, isLoading, error, fetchLoans, addLoan, updateLoan, removeLoan } = useLoanStore()
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLoan] = useState<Loan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Loan | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const handleCreate = async (data: LoanFormValues) => {
    try {
      await addLoan({
        account_id: data.account_id ?? null,
        person_name: data.person_name,
        phone: data.phone ?? null,
        type: data.type,
        total_amount: data.total_amount,
        interest_amount: data.interest_amount ?? 0,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
      })
      toast({ title: "Sucesso", description: "Empréstimo criado com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleUpdate = async (data: LoanFormValues) => {
    if (!editingLoan) return
    try {
      await updateLoan(editingLoan.id, {
        account_id: data.account_id ?? null,
        person_name: data.person_name,
        phone: data.phone ?? null,
        type: data.type,
        total_amount: data.total_amount,
        interest_amount: data.interest_amount ?? 0,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
      })
      toast({ title: "Sucesso", description: "Empréstimo actualizado com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await removeLoan(deleteConfirm.id)
      toast({ title: "Sucesso", description: "Empréstimo removido com sucesso.", variant: "success" })
      setDeleteConfirm(null)
      if (selectedLoanId === deleteConfirm.id) setSelectedLoanId(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    } finally {
      setDeleting(false)
    }
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
          onLoanUpdated={fetchLoans}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Empréstimos" description="Gerencie os empréstimos concedidos e obtidos">
        <Link href="/emprestimos/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Empréstimo
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchLoans} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingState key={i} type="card" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum empréstimo registado.</p>
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
