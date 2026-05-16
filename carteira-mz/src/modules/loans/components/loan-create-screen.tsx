"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { LOAN_TYPE_LABELS } from "@/constants"
import { loanSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import * as accountService from "@/services/mock/accounts"
import * as loanService from "@/services/mock/loans"
import type { Account } from "@/types"
import type { z } from "zod"

const LOAN_TYPES = ["GIVEN", "TAKEN"] as const

export function LoanCreateScreen() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
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
    accountService
      .getAccounts()
      .then(setAccounts)
      .finally(() => setLoadingData(false))
  }, [])

  async function onSubmit(data: z.infer<typeof loanSchema>) {
    try {
      await loanService.createLoan({
        account_id: data.account_id ?? null,
        person_name: data.person_name,
        phone: data.phone ?? null,
        type: data.type,
        total_amount: data.total_amount,
        paid_amount: 0,
        remaining_amount: data.total_amount,
        interest_amount: data.interest_amount,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
        status: "PENDING",
      })
      toast({ title: "Sucesso", description: "Empréstimo criado com sucesso.", variant: "success" })
      router.push("/emprestimos")
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar o empréstimo.", variant: "error" })
    }
  }

  const inputClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
  const inputErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20"
  const selectClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Novo Empréstimo</h1>
        <p className="text-sm text-slate-500 mt-1">Registe um empréstimo concedido ou obtido</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</label>
              <div className="relative">
                <select
                  value={watch("type")}
                  onChange={(e) => setValue("type", e.target.value as "GIVEN" | "TAKEN")}
                  disabled={loadingData}
                  className={cn(selectClass, errors.type && inputErrorClass)}
                >
                  {LOAN_TYPES.map((type) => (
                    <option key={type} value={type}>{LOAN_TYPE_LABELS[type]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="person_name" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome da Pessoa</label>
              <input
                id="person_name"
                type="text"
                placeholder="Nome completo"
                className={cn(inputClass, errors.person_name && inputErrorClass)}
                {...register("person_name")}
              />
              {errors.person_name && <p className="text-xs text-red-500 mt-1">{errors.person_name.message}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="phone" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Telefone</label>
              <input
                id="phone"
                type="text"
                placeholder="+258 84 000 0000"
                className={inputClass}
                {...register("phone")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label htmlFor="total_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor Total</label>
                <input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={cn(inputClass, errors.total_amount && inputErrorClass)}
                  {...register("total_amount", { valueAsNumber: true })}
                />
                {errors.total_amount && <p className="text-xs text-red-500 mt-1">{errors.total_amount.message}</p>}
              </div>

              <div className="mb-5">
                <label htmlFor="interest_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Juros</label>
                <input
                  id="interest_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={cn(inputClass, errors.interest_amount && inputErrorClass)}
                  {...register("interest_amount", { valueAsNumber: true })}
                />
                {errors.interest_amount && <p className="text-xs text-red-500 mt-1">{errors.interest_amount.message}</p>}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta Associada</label>
              <div className="relative">
                <select
                  value={watch("account_id") ?? ""}
                  onChange={(e) => setValue("account_id", e.target.value || null)}
                  disabled={loadingData}
                  className={cn(selectClass)}
                >
                  <option value="">Nenhuma</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="due_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data de Vencimento</label>
              <input
                id="due_date"
                type="date"
                className={cn(inputClass, errors.due_date && inputErrorClass)}
                {...register("due_date")}
              />
              {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</label>
              <textarea
                id="description"
                placeholder="Descrição do empréstimo"
                className={cn(inputClass, "pt-3 resize-none min-h-[56px]", errors.description && inputErrorClass)}
                rows={3}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="w-full h-[56px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] shadow-sm transition-all hover:bg-[#1E293B] disabled:opacity-60"
            >
              {isSubmitting ? "A guardar..." : "Criar Empréstimo"}
            </button>

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
