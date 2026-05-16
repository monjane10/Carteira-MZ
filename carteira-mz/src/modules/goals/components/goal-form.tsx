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
import { cn } from "@/lib/utils"
import { goalSchema } from "@/validators"
import * as accountService from "@/services/mock/accounts"
import type { Account, Goal } from "@/types"
import type { z } from "zod"

const ICON_OPTIONS = [
  { value: "target", label: "Alvo" },
  { value: "piggy-bank", label: "Poupança" },
  { value: "plane", label: "Viagem" },
  { value: "car", label: "Carro" },
  { value: "home", label: "Casa" },
  { value: "graduation-cap", label: "Educação" },
  { value: "heart-pulse", label: "Saúde" },
  { value: "shopping-bag", label: "Compras" },
  { value: "gift", label: "Presente" },
  { value: "shield-check", label: "Segurança" },
]

const COLOR_OPTIONS = [
  "#10B981", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
]

interface GoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof goalSchema>) => Promise<void>
  editingGoal?: Goal | null
}

export function GoalForm({ open, onOpenChange, onSubmit, editingGoal }: GoalFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      target_amount: 0,
      current_amount: 0,
      account_id: null,
      target_date: null,
      color: null,
      icon: null,
    },
  })

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      accountService
        .getAccounts()
        .then(setAccounts)
        .finally(() => setLoadingData(false))
      if (editingGoal) {
        setValue("title", editingGoal.title)
        setValue("description", editingGoal.description ?? "")
        setValue("target_amount", editingGoal.target_amount)
        setValue("current_amount", editingGoal.current_amount)
        setValue("account_id", editingGoal.account_id)
        setValue("target_date", editingGoal.target_date ? editingGoal.target_date.split("T")[0] : null)
        setValue("color", editingGoal.color)
        setValue("icon", editingGoal.icon)
      }
    }
  }, [open, editingGoal, setValue])

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: z.infer<typeof goalSchema>) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
          <DialogDescription>
            {editingGoal ? "Altere os dados da meta financeira." : "Defina uma nova meta financeira."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Fundo de Emergência"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.title}
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</Label>
              <Input id="description" placeholder="Descrição opcional" className="h-14 rounded-xl text-[15px] border-slate-200 w-full" {...register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor Alvo</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                  error={!!errors.target_amount}
                  {...register("target_amount", { valueAsNumber: true })}
                />
                {errors.target_amount && (
                  <p className="text-xs text-red-500">{errors.target_amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor Actual</Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                  {...register("current_amount", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta Associada</Label>
              <Select
                value={watch("account_id") ?? ""}
                onValueChange={(value) => setValue("account_id", value || null)}
                disabled={loadingData}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data Alvo</Label>
              <Input id="target_date" type="date" className="h-14 rounded-xl text-[15px] border-slate-200 w-full" {...register("target_date")} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Ícone</Label>
              <Select
                value={watch("icon") ?? ""}
                onValueChange={(value) => setValue("icon", value || null)}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Cor</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      watch("color") === color
                        ? "border-slate-900 scale-110 dark:border-white"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-14 rounded-xl text-[15px]"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loadingData} className="h-14 rounded-xl bg-[#0F172A] text-[15px] font-semibold">
              {isSubmitting ? "Aguarde..." : editingGoal ? "Salvar" : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


