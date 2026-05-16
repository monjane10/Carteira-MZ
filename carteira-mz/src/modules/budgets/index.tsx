"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { BudgetCard } from "./components/budget-card"
import { BudgetForm } from "./components/budget-form"
import * as budgetService from "@/services/mock/budgets"
import type { Budget } from "@/types"
import type { z } from "zod"
import type { budgetSchema } from "@/validators"
import { Wallet } from "lucide-react"

type BudgetFormValues = z.infer<typeof budgetSchema>

function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await budgetService.getBudgets()
      setBudgets(data)
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os orçamentos.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleCreate = async (data: BudgetFormValues) => {
    try {
      const newBudget = await budgetService.createBudget({
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      setBudgets((prev) => [newBudget, ...prev])
      toast({ title: "Sucesso", description: "Orçamento criado com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar o orçamento.", variant: "error" })
    }
  }

  const handleUpdate = async (data: BudgetFormValues) => {
    if (!editingBudget) return
    try {
      const updated = await budgetService.updateBudget(editingBudget.id, {
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      if (updated) {
        setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        toast({ title: "Sucesso", description: "Orçamento actualizado com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar o orçamento.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await budgetService.deleteBudget(deleteConfirm.id)
      setBudgets((prev) => prev.filter((b) => b.id !== deleteConfirm.id))
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
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Orçamento
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingState key={i} type="card" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhum orçamento"
          description="Crie o seu primeiro orçamento para controlar os gastos."
          actionLabel="Criar Orçamento"
          onAction={handleOpenCreate}
        />
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
