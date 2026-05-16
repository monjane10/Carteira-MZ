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
import { LOAN_TYPE_LABELS } from "@/constants"
import { loanSchema } from "@/validators"
import * as accountService from "@/services/mock/accounts"
import type { Account, Loan } from "@/types"
import type { z } from "zod"

interface LoanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof loanSchema>) => Promise<void>
  editingLoan?: Loan | null
}

export function LoanForm({ open, onOpenChange, onSubmit, editingLoan }: LoanFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loanSchema>>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: {
      person_name: "",
      phone: "",
      type: "GIVEN",
      total_amount: 0,
      interest_amount: 0,
      account_id: null,
      description: "",
      due_date: null,
    },
  })

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      accountService
        .getAccounts()
        .then(setAccounts)
        .finally(() => setLoadingData(false))
      if (editingLoan) {
        setValue("person_name", editingLoan.person_name)
        setValue("phone", editingLoan.phone ?? "")
        setValue("type", editingLoan.type)
        setValue("total_amount", editingLoan.total_amount)
        setValue("interest_amount", editingLoan.interest_amount)
        setValue("account_id", editingLoan.account_id)
        setValue("description", editingLoan.description ?? "")
        setValue("due_date", editingLoan.due_date ? editingLoan.due_date.split("T")[0] : null)
      }
    }
  }, [open, editingLoan, setValue])

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: z.infer<typeof loanSchema>) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLoan ? "Editar Empréstimo" : "Novo Empréstimo"}</DialogTitle>
          <DialogDescription>
            {editingLoan ? "Altere os dados do empréstimo." : "Registe um novo empréstimo."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="person_name" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome da Pessoa</Label>
              <Input
                id="person_name"
                placeholder="Nome completo"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.person_name}
                {...register("person_name")}
              />
              {errors.person_name && <p className="text-xs text-red-500">{errors.person_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Telefone</Label>
              <Input id="phone" placeholder="+258 84 000 0000" className="h-14 rounded-xl text-[15px] border-slate-200 w-full" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as "GIVEN" | "TAKEN")}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GIVEN">{LOAN_TYPE_LABELS.GIVEN}</SelectItem>
                  <SelectItem value="TAKEN">{LOAN_TYPE_LABELS.TAKEN}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta Associada</Label>
              <Select
                value={watch("account_id") ?? ""}
                onValueChange={(value) => setValue("account_id", value || null)}
                disabled={loadingData}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue placeholder="Seleccione a conta (opcional)" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor Total</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                  error={!!errors.total_amount}
                  {...register("total_amount", { valueAsNumber: true })}
                />
                {errors.total_amount && (
                  <p className="text-xs text-red-500">{errors.total_amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Juros</Label>
                <Input
                  id="interest_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                  {...register("interest_amount", { valueAsNumber: true })}
                />
                {errors.interest_amount && (
                  <p className="text-xs text-red-500">{errors.interest_amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</Label>
              <Input id="description" placeholder="Descrição do empréstimo" className="h-14 rounded-xl text-[15px] border-slate-200 w-full" {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data de Vencimento</Label>
              <Input id="due_date" type="date" className="h-14 rounded-xl text-[15px] border-slate-200 w-full" {...register("due_date")} />
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
              {isSubmitting ? "Aguarde..." : editingLoan ? "Salvar" : "Criar Empréstimo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
