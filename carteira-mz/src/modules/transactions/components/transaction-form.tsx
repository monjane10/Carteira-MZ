"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Building2 } from "lucide-react"
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import { transactionSchema } from "@/validators"
import { accounts as accountService, categories as categoryService } from "@/services"
import type { Account, Category, Transaction, TransactionType } from "@/types"
import type { z } from "zod"

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof transactionSchema>) => Promise<void>
  editingTransaction?: Transaction | null
}

export function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  editingTransaction,
}: TransactionFormProps) {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: "",
      category_id: null,
      type: "EXPENSE",
      amount: 0,
      description: "",
      transaction_date: new Date().toISOString().split("T")[0],
      is_recurring: false,
    },
  })

  const selectedType = watch("type")
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      Promise.all([
        accountService.getAccounts(),
        categoryService.getCategories(),
      ])
        .then(([accountsData, categoriesData]) => {
          setAccounts(accountsData)
          setCategories(categoriesData)
          if (editingTransaction) {
            setValue("account_id", editingTransaction.account_id)
            setValue("category_id", editingTransaction.category_id)
            setValue("type", editingTransaction.type)
            setValue("amount", editingTransaction.amount)
            setValue("description", editingTransaction.description ?? "")
            setValue("transaction_date", editingTransaction.transaction_date.split("T")[0])
            setValue("is_recurring", editingTransaction.is_recurring)
          }
        })
        .finally(() => setLoadingData(false))
    }
  }, [open, editingTransaction, setValue])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: z.infer<typeof transactionSchema>) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? "Editar Transacção" : "Nova Transacção"}</DialogTitle>
          <DialogDescription>
            {editingTransaction ? "Altere os dados da transacção." : "Registe uma nova transacção financeira."}
          </DialogDescription>
        </DialogHeader>
        {!loadingData && accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Building2 className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1">Nenhuma conta criada</p>
            <p className="text-xs text-slate-500 mb-5 max-w-[220px]">
              Precisa de pelo menos uma conta para registar transacções.
            </p>
            <Button
              type="button"
              onClick={() => { router.push("/contas/nova"); onOpenChange(false) }}
              className="h-11 rounded-xl bg-[#0F172A] text-sm font-semibold"
            >
              Criar Conta
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setValue("type", value as TransactionType)
                  setValue("category_id", null)
                }}
                disabled={loadingData}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue placeholder="Seleccione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {TRANSACTION_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta</Label>
              <Select
                value={watch("account_id")}
                onValueChange={(value) => setValue("account_id", value)}
                disabled={loadingData}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue placeholder="Seleccione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account_id && <p className="text-xs text-red-500">{errors.account_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Categoria</Label>
              <Select
                value={watch("category_id") ?? ""}
                onValueChange={(value) => setValue("category_id", value || null)}
                disabled={loadingData || filteredCategories.length === 0}
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue
                    placeholder={filteredCategories.length === 0 ? "Sem categorias" : "Seleccione categoria"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição da transacção"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data</Label>
              <Input
                id="transaction_date"
                type="date"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.transaction_date}
                {...register("transaction_date")}
              />
              {errors.transaction_date && (
                <p className="text-xs text-red-500">{errors.transaction_date.message}</p>
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
            <Button type="submit" disabled={isSubmitting || loadingData} className="h-14 rounded-xl bg-[#0F172A] text-[15px] font-semibold">
              {isSubmitting ? "Aguarde..." : editingTransaction ? "Salvar" : "Criar Transacção"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
