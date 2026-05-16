"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { GoalCard } from "./components/goal-card"
import { GoalForm } from "./components/goal-form"
import { GoalDetail } from "./components/goal-detail"
import * as goalService from "@/services/mock/goals"
import type { Goal } from "@/types"
import type { z } from "zod"
import type { goalSchema } from "@/validators"
import { Target } from "lucide-react"

type GoalFormValues = z.infer<typeof goalSchema>

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try {
      const data = await goalService.getGoals()
      setGoals(data)
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as metas.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleCreate = async (data: GoalFormValues) => {
    try {
      const newGoal = await goalService.createGoal({
        account_id: data.account_id ?? null,
        title: data.title,
        description: data.description ?? null,
        target_amount: data.target_amount,
        current_amount: data.current_amount ?? 0,
        target_date: data.target_date ?? null,
        color: data.color ?? null,
        icon: data.icon ?? null,
        status: "ACTIVE",
      })
      setGoals((prev) => [newGoal, ...prev])
      toast({ title: "Sucesso", description: "Meta criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a meta.", variant: "error" })
    }
  }

  const handleUpdate = async (data: GoalFormValues) => {
    if (!editingGoal) return
    try {
      const updated = await goalService.updateGoal(editingGoal.id, {
        account_id: data.account_id ?? null,
        title: data.title,
        description: data.description ?? null,
        target_amount: data.target_amount,
        current_amount: data.current_amount ?? 0,
        target_date: data.target_date ?? null,
        color: data.color ?? null,
        icon: data.icon ?? null,
      })
      if (updated) {
        setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
        toast({ title: "Sucesso", description: "Meta actualizada com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar a meta.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await goalService.deleteGoal(deleteConfirm.id)
      setGoals((prev) => prev.filter((g) => g.id !== deleteConfirm.id))
      toast({ title: "Sucesso", description: "Meta removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
      if (selectedGoalId === deleteConfirm.id) setSelectedGoalId(null)
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover a meta.", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingGoal(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: GoalFormValues) => {
    if (editingGoal) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  if (selectedGoalId) {
    return (
      <div>
        <GoalDetail
          goalId={selectedGoalId}
          onBack={() => setSelectedGoalId(null)}
          onGoalUpdated={fetchGoals}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Metas" description="Defina e acompanhe as suas metas financeiras">
        <Link href="/metas/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Meta
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingState key={i} type="card" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Target className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma meta</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Crie a sua primeira meta financeira para começar a poupar.</p>
          <Link href="/metas/nova">
            <Button size="sm" className="mt-4">
              Criar Meta
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => {
                setSelectedGoalId(goal.id)
              }}
              onDelete={() => setDeleteConfirm(goal)}
            />
          ))}
        </div>
      )}

      <GoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingGoal={editingGoal}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        title="Remover Meta"
        description="Tem a certeza que deseja remover esta meta? Esta acção não pode ser desfeita."
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
export default GoalsPage
export { GoalsPage as GoalsModule }
