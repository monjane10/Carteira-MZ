"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { BUDGET_PERIOD_LABELS } from "@/constants"
import { budgetSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { categories as categoryService, budgets as budgetService } from "@/services"
import type { Category } from "@/types"
import type { z } from "zod"

export function BudgetCreateScreen() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: "",
      amount_limit: 0,
      period: "MONTHLY",
      start_date: firstDay,
      end_date: lastDay,
    },
  })

  useEffect(() => {
    categoryService
      .getCategories()
      .then((cats) => setCategories(cats.filter((c) => c.type === "EXPENSE")))
      .finally(() => setLoadingData(false))
  }, [])

  async function onSubmit(data: z.infer<typeof budgetSchema>) {
    try {
      await budgetService.createBudget({
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      toast({ title: "Sucesso", description: "Orçamento criado com sucesso.", variant: "success" })
      router.push("/orcamentos")
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
        <h1 className="text-xl font-bold text-[#0F172A]">Novo Orçamento</h1>
        <p className="text-sm text-slate-500 mt-1">Defina limites de gastos por categoria</p>
      </div>

      <div className="flex-1 w-full max-w-full overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Categoria */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Categoria</label>
              <div className="relative">
                <select
                  value={watch("category_id")}
                  onChange={(e) => setValue("category_id", e.target.value)}
                  disabled={loadingData}
                  className={cn(selectClass, errors.category_id && inputErrorClass)}
                >
                  <option value="" disabled>Seleccione a categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>}
            </div>

            {/* Limite */}
            <div className="mb-5">
              <label htmlFor="amount_limit" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Limite</label>
              <input
                id="amount_limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClass, errors.amount_limit && inputErrorClass)}
                {...register("amount_limit", { valueAsNumber: true })}
              />
              {errors.amount_limit && <p className="text-xs text-red-500 mt-1">{errors.amount_limit.message}</p>}
            </div>

            {/* Período */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Período</label>
              <div className="relative">
                <select
                  value={watch("period")}
                  onChange={(e) => setValue("period", e.target.value as "WEEKLY" | "MONTHLY" | "YEARLY")}
                  className={selectClass}
                >
                  {Object.entries(BUDGET_PERIOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="start_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data de Início</label>
                <input
                  id="start_date"
                  type="date"
                  className={cn(inputClass, errors.start_date && inputErrorClass)}
                  {...register("start_date")}
                />
                {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label htmlFor="end_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data de Fim</label>
                <input
                  id="end_date"
                  type="date"
                  className={cn(inputClass, errors.end_date && inputErrorClass)}
                  {...register("end_date")}
                />
                {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B] disabled:opacity-60"
            >
              {isSubmitting ? "A guardar..." : "Criar Orçamento"}
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
