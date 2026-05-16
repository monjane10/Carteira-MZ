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
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import { transactionSchema } from "@/validators"
import * as accountService from "@/services/mock/accounts"
import * as categoryService from "@/services/mock/categories"
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
    resolver: zodResolver(transactionSchema) as any,
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
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setValue("type", value as TransactionType)
                  setValue("category_id", null)
                }}
                disabled={loadingData}
              >
                <SelectTrigger>
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
              <Label>Conta</Label>
              <Select
                value={watch("account_id")}
                onValueChange={(value) => setValue("account_id", value)}
                disabled={loadingData}
              >
                <SelectTrigger>
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
              <Label>Categoria</Label>
              <Select
                value={watch("category_id") ?? ""}
                onValueChange={(value) => setValue("category_id", value || null)}
                disabled={loadingData || filteredCategories.length === 0}
              >
                <SelectTrigger>
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
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={!!errors.amount}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição da transacção"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data</Label>
              <Input
                id="transaction_date"
                type="date"
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
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loadingData}>
              {isSubmitting ? "Aguarde..." : editingTransaction ? "Salvar" : "Criar Transacção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
