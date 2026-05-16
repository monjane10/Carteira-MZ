"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BUDGET_PERIOD_LABELS } from "@/constants"
import { budgetSchema } from "@/validators"
import * as categoryService from "@/services/mock/categories"
import type { Budget, Category } from "@/types"
import type { z } from "zod"

type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BudgetFormValues) => Promise<void>
  editingBudget?: Budget | null
}

export function BudgetForm({ open, onOpenChange, onSubmit, editingBudget }: BudgetFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: "",
      amount_limit: 0,
      period: "MONTHLY",
      start_date: firstDay,
      end_date: lastDay,
    },
  })

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      categoryService
        .getCategories()
        .then((cats) => setCategories(cats.filter((c) => c.type === "EXPENSE")))
        .finally(() => setLoadingData(false))
      if (editingBudget) {
        setValue("category_id", editingBudget.category_id)
        setValue("amount_limit", editingBudget.amount_limit)
        setValue("period", editingBudget.period)
        setValue("start_date", editingBudget.start_date.split("T")[0])
        setValue("end_date", editingBudget.end_date.split("T")[0])
      }
    }
  }, [open, editingBudget, setValue])

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: BudgetFormValues) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
          <DialogDescription>
            {editingBudget
              ? "Altere os dados do orçamento."
              : "Defina um orçamento para uma categoria."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={watch("category_id")}
                onValueChange={(value) => setValue("category_id", value)}
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-xs text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_limit">Limite</Label>
              <Input
                id="amount_limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={!!errors.amount_limit}
                {...register("amount_limit", { valueAsNumber: true })}
              />
              {errors.amount_limit && (
                <p className="text-xs text-red-500">{errors.amount_limit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={watch("period")}
                onValueChange={(value) =>
                  setValue("period", value as "WEEKLY" | "MONTHLY" | "YEARLY")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione o período" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BUDGET_PERIOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  error={!!errors.start_date}
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className="text-xs text-red-500">{errors.start_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Fim</Label>
                <Input
                  id="end_date"
                  type="date"
                  error={!!errors.end_date}
                  {...register("end_date")}
                />
                {errors.end_date && (
                  <p className="text-xs text-red-500">{errors.end_date.message}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loadingData}>
              {isSubmitting ? "Aguarde..." : editingBudget ? "Salvar" : "Criar Orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
