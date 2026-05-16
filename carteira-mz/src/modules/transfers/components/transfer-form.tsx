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
import { transferSchema } from "@/validators"
import { formatCurrency } from "@/lib/utils"
import * as accountService from "@/services/mock/accounts"
import type { Account } from "@/types"
import type { z } from "zod"

interface TransferFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof transferSchema>) => Promise<void>
}

export function TransferForm({ open, onOpenChange, onSubmit }: TransferFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      from_account_id: "",
      to_account_id: "",
      amount: 0,
      fee: 0,
      description: "",
      transfer_date: new Date().toISOString().split("T")[0],
    },
  })

  const fromAccount = watch("from_account_id")
  const toAccount = watch("to_account_id")
  const sameAccount = !!(fromAccount && toAccount && fromAccount === toAccount)

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      accountService.getAccounts().then(setAccounts).finally(() => setLoadingData(false))
    }
  }, [open])

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: z.infer<typeof transferSchema>) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transferência</DialogTitle>
          <DialogDescription>Transfira valores entre as suas contas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta de Origem</Label>
              <Select
                value={fromAccount}
                onValueChange={(value) => setValue("from_account_id", value)}
                disabled={loadingData}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue placeholder="Seleccione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} disabled={a.id === toAccount}>
                      {a.name} ({formatCurrency(a.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.from_account_id && (
                <p className="text-xs text-red-500">{errors.from_account_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta de Destino</Label>
              <Select
                value={toAccount}
                onValueChange={(value) => setValue("to_account_id", value)}
                disabled={loadingData}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue placeholder="Seleccione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} disabled={a.id === fromAccount}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.to_account_id && (
                <p className="text-xs text-red-500">{errors.to_account_id.message}</p>
              )}
            </div>

            {sameAccount && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                As contas de origem e destino devem ser diferentes.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.amount}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Taxa</Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                {...register("fee", { valueAsNumber: true })}
              />
              {errors.fee && <p className="text-xs text-red-500">{errors.fee.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</Label>
              <Input id="description" placeholder="Descrição da transferência" className="h-14 rounded-xl text-[15px] border-slate-200 w-full" {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data</Label>
              <Input
                id="transfer_date"
                type="date"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.transfer_date}
                {...register("transfer_date")}
              />
              {errors.transfer_date && (
                <p className="text-xs text-red-500">{errors.transfer_date.message}</p>
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
            <Button type="submit" disabled={isSubmitting || loadingData || sameAccount} className="h-14 rounded-xl bg-[#0F172A] text-[15px] font-semibold">
              {isSubmitting ? "Aguarde..." : "Criar Transferência"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
