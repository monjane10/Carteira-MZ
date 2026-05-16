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
import { goalContributionSchema } from "@/validators"
import { accounts as accountService } from "@/services"
import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/types"
import type { z } from "zod"

type GoalContributionFormValues = z.infer<typeof goalContributionSchema>

interface GoalContributionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: GoalContributionFormValues) => Promise<void>
  remainingAmount: number
}

export function GoalContributionForm({
  open,
  onOpenChange,
  onSubmit,
  remainingAmount,
}: GoalContributionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoalContributionFormValues>({
    resolver: zodResolver(goalContributionSchema),
    defaultValues: {
      amount: 0,
      account_id: null,
      contribution_date: new Date().toISOString().split("T")[0],
    },
  })

  useEffect(() => {
    if (open) {
      accountService.getAccounts().then(setAccounts)
    }
  }, [open])

  const amount = watch("amount")
  const exceedsRemaining = amount > remainingAmount

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: GoalContributionFormValues) => {
    if (data.amount > remainingAmount) return
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova Contribuição</DialogTitle>
          <DialogDescription>
            Valor restante para atingir a meta: {formatCurrency(remainingAmount)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.amount || exceedsRemaining}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              {exceedsRemaining && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  O valor não pode exceder {formatCurrency(remainingAmount)}
                </p>
              )}
              <p className="text-xs text-slate-400">Máximo: {formatCurrency(remainingAmount)}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta</Label>
              <Select
                value={watch("account_id") ?? ""}
                onValueChange={(value) => setValue("account_id", value || null)}
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
              <Label htmlFor="contribution_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data</Label>
              <Input
                id="contribution_date"
                type="date"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.contribution_date}
                {...register("contribution_date")}
              />
              {errors.contribution_date && (
                <p className="text-xs text-red-500">{errors.contribution_date.message}</p>
              )}
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
            <Button type="submit" disabled={isSubmitting || exceedsRemaining} className="h-14 rounded-xl bg-[#0F172A] text-[15px] font-semibold">
              {isSubmitting ? "Aguarde..." : "Registar Contribuição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
