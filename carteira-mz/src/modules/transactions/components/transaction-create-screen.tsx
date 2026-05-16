"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import { transactionSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import * as accountService from "@/services/mock/accounts"
import * as categoryService from "@/services/mock/categories"
import * as transactionService from "@/services/mock/transactions"
import type { Account, Category, TransactionType } from "@/types"
import type { z } from "zod"

export function TransactionCreateScreen() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
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
  const selectedCategoryId = watch("category_id")
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  useEffect(() => {
    Promise.all([
      accountService.getAccounts(),
      categoryService.getCategories(),
    ])
      .then(([accountsData, categoriesData]) => {
        setAccounts(accountsData)
        setCategories(categoriesData)
      })
      .finally(() => setLoadingData(false))
  }, [])

  async function onSubmit(data: z.infer<typeof transactionSchema>) {
    try {
      await transactionService.createTransaction({
        account_id: data.account_id,
        category_id: data.category_id ?? null,
        type: data.type as TransactionType,
        amount: data.amount,
        description: data.description ?? null,
        reference_code: null,
        transaction_date: data.transaction_date,
        is_recurring: data.is_recurring,
        attachment_url: null,
      })
      toast({ title: "Sucesso", description: "Transacção criada com sucesso.", variant: "success" })
      router.push("/transacoes")
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a transacção.", variant: "error" })
    }
  }

  const inputClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
  const inputErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20"
  const selectClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"

  return (
    <div className="min-h-dvh w-full max-w-full bg-white flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Nova Transacção</h1>
        <p className="text-sm text-slate-500 mt-1">Registe uma entrada ou saída financeira</p>
      </div>

      <div className="flex-1 w-full max-w-full overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Tipo */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setValue("type", e.target.value as TransactionType)
                    setValue("category_id", null)
                  }}
                  disabled={loadingData}
                  className={cn(selectClass, errors.type && inputErrorClass)}
                >
                  <option value="" disabled>Seleccione o tipo</option>
                  {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((type) => (
                    <option key={type} value={type}>{TRANSACTION_TYPE_LABELS[type]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
            </div>

            {/* Conta */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta</label>
              <div className="relative">
                <select
                  value={watch("account_id")}
                  onChange={(e) => setValue("account_id", e.target.value)}
                  disabled={loadingData}
                  className={cn(selectClass, errors.account_id && inputErrorClass)}
                >
                  <option value="" disabled>Seleccione a conta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.account_id && <p className="text-xs text-red-500 mt-1">{errors.account_id.message}</p>}
            </div>

            {/* Categoria */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Categoria</label>
              <div className="relative">
                <select
                  value={selectedCategoryId ?? ""}
                  onChange={(e) => setValue("category_id", e.target.value || null)}
                  disabled={loadingData || filteredCategories.length === 0}
                  className={cn(selectClass)}
                >
                  <option value="" disabled>
                    {filteredCategories.length === 0 ? "Sem categorias" : "Seleccione categoria"}
                  </option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Valor */}
            <div className="mb-5">
              <label htmlFor="amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClass, errors.amount && inputErrorClass)}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>

            {/* Descrição */}
            <div className="mb-5">
              <label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</label>
              <input
                id="description"
                type="text"
                placeholder="Descrição da transacção"
                className={inputClass}
                {...register("description")}
              />
            </div>

            {/* Data */}
            <div className="mb-5">
              <label htmlFor="transaction_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data</label>
              <input
                id="transaction_date"
                type="date"
                className={cn(inputClass, errors.transaction_date && inputErrorClass)}
                {...register("transaction_date")}
              />
              {errors.transaction_date && <p className="text-xs text-red-500 mt-1">{errors.transaction_date.message}</p>}
            </div>

            {/* Botão Guardar */}
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B] disabled:opacity-60"
            >
              {isSubmitting ? "A guardar..." : "Guardar"}
            </button>

            {/* Cancelar */}
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full text-center text-sm text-slate-500 mt-4 py-2 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
