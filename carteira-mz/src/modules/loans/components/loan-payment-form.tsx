"use client"

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
import { Label } from "@/components/ui/label"
import { loanPaymentSchema } from "@/validators"
import { formatCurrency } from "@/lib/utils"
import type { z } from "zod"

type LoanPaymentFormValues = z.infer<typeof loanPaymentSchema>

interface LoanPaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LoanPaymentFormValues) => Promise<void>
  remainingAmount: number
}

export function LoanPaymentForm({
  open,
  onOpenChange,
  onSubmit,
  remainingAmount,
}: LoanPaymentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoanPaymentFormValues>({
    resolver: zodResolver(loanPaymentSchema),
    defaultValues: {
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  const amount = watch("amount")
  const exceedsRemaining = amount > remainingAmount

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: LoanPaymentFormValues) => {
    if (data.amount > remainingAmount) return
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registar Pagamento</DialogTitle>
          <DialogDescription>
            Valor restante do empréstimo: {formatCurrency(remainingAmount)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
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
              <Label htmlFor="payment_date">Data do Pagamento</Label>
              <Input
                id="payment_date"
                type="date"
                error={!!errors.payment_date}
                {...register("payment_date")}
              />
              {errors.payment_date && (
                <p className="text-xs text-red-500">{errors.payment_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" placeholder="Observações (opcional)" {...register("notes")} />
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
            <Button type="submit" disabled={isSubmitting || exceedsRemaining}>
              {isSubmitting ? "Aguarde..." : "Registar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
