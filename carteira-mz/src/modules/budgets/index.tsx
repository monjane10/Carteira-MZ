"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { BudgetCard } from "./components/budget-card"
import { BudgetForm } from "./components/budget-form"
import { useBudgetStore } from "@/store"
import type { Budget } from "@/types"
import type { z } from "zod"
import type { budgetSchema } from "@/validators"
import { Wallet } from "lucide-react"

type BudgetFormValues = z.infer<typeof budgetSchema>

function BudgetsPage() {
  const { budgets, isLoading, error, fetchBudgets, addBudget, updateBudget, removeBudget } = useBudgetStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleCreate = async (data: BudgetFormValues) => {
    try {
      await addBudget({
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      toast({ title: "Sucesso", description: "Orçamento criado com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar o orçamento.", variant: "error" })
    }
  }

  const handleUpdate = async (data: BudgetFormValues) => {
    if (!editingBudget) return
    try {
      await updateBudget(editingBudget.id, {
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      toast({ title: "Sucesso", description: "Orçamento actualizado com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar o orçamento.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await removeBudget(deleteConfirm.id)
      toast({ title: "Sucesso", description: "Orçamento removido com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover o orçamento.", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingBudget(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: BudgetFormValues) => {
    if (editingBudget) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  return (
    <div>
      <PageHeader title="Orçamentos" description="Controle os seus gastos por categoria">
        <Link href="/orcamentos/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchBudgets} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingState key={i} type="card" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Wallet className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum orçamento</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Crie o seu primeiro orçamento para controlar os gastos.</p>
          <Link href="/orcamentos/nova">
            <Button size="sm" className="mt-4">
              Criar Orçamento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onClick={() => handleOpenEdit(budget)}
              onDelete={() => setDeleteConfirm(budget)}
            />
          ))}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingBudget={editingBudget}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        title="Remover Orçamento"
        description="Tem a certeza que deseja remover este orçamento? Esta acção não pode ser desfeita."
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
export default BudgetsPage
export { BudgetsPage as BudgetsModule }
