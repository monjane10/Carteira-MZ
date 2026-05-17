"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { goalSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { accounts as accountService, goals as goalService } from "@/services"
import type { Account } from "@/types"
import type { z } from "zod"

export function GoalCreateScreen() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
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
    accountService
      .getAccounts()
      .then(setAccounts)
      .finally(() => setLoadingData(false))
  }, [])

  async function onSubmit(data: z.infer<typeof goalSchema>) {
    try {
      await goalService.createGoal({
        account_id: data.account_id ?? null,
        title: data.title,
        description: data.description ?? null,
        target_amount: data.target_amount,
        target_date: data.target_date ?? null,
        color: data.color ?? null,
        icon: data.icon ?? null,
      })
      toast({ title: "Sucesso", description: "Meta criada com sucesso.", variant: "success" })
      router.push("/metas")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const inputClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
  const inputErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20"
  const selectClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"

  return (
    <div className="min-h-dvh w-full max-w-full bg-white flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Nova Meta</h1>
        <p className="text-sm text-slate-500 mt-1">Defina uma meta financeira para alcançar</p>
      </div>

      <div className="flex-1 w-full max-w-full overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Título */}
            <div className="mb-5">
              <label htmlFor="title" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Título</label>
              <input
                id="title"
                type="text"
                placeholder="Ex: Fundo de Emergência"
                className={cn(inputClass, errors.title && inputErrorClass)}
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Descrição */}
            <div className="mb-5">
              <label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</label>
              <textarea
                id="description"
                placeholder="Descrição opcional"
                className={cn(inputClass, "min-h-[120px] py-3 resize-none")}
                {...register("description")}
              />
            </div>

            {/* Valor Alvo */}
            <div className="mb-5">
              <label htmlFor="target_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor Alvo</label>
              <input
                id="target_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClass, errors.target_amount && inputErrorClass)}
                {...register("target_amount", { valueAsNumber: true })}
              />
              {errors.target_amount && <p className="text-xs text-red-500 mt-1">{errors.target_amount.message}</p>}
            </div>

            {/* Valor Actual */}
            <div className="mb-5">
              <label htmlFor="current_amount" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Valor Actual</label>
              <input
                id="current_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
                {...register("current_amount", { valueAsNumber: true })}
              />
            </div>

            {/* Conta */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta Associada</label>
              <div className="relative">
                <select
                  value={watch("account_id") ?? ""}
                  onChange={(e) => setValue("account_id", e.target.value || null)}
                  disabled={loadingData}
                  className={selectClass}
                >
                  <option value="">Nenhuma</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Data Alvo */}
            <div className="mb-5">
              <label htmlFor="target_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data Alvo</label>
              <input
                id="target_date"
                type="date"
                className={inputClass}
                {...register("target_date")}
              />
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B] disabled:opacity-60"
            >
              {isSubmitting ? "A guardar..." : "Criar Meta"}
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
