"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { categorySchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import * as categoryService from "@/services/mock/categories"
import type { CategoryFormData } from "@/validators"

const CATEGORY_TYPES = [
  { value: "INCOME", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
] as const

export function CategoryCreateScreen() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: null,
    },
  })

  const selectedType = watch("type")

  async function onSubmit(data: CategoryFormData) {
    try {
      await categoryService.createCategory({
        name: data.name,
        type: data.type,
        color: data.color ?? null,
        icon: data.icon ?? null,
        is_default: false,
      })
      toast({ title: "Sucesso", description: "Categoria criada com sucesso.", variant: "success" })
      router.push("/categorias")
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a categoria.", variant: "error" })
    }
  }

  const inputClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
  const inputErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20"
  const selectClass = "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"

  return (
    <div className="min-h-dvh w-full max-w-full bg-white flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Nova Categoria</h1>
        <p className="text-sm text-slate-500 mt-1">Organize as suas receitas e despesas por categorias</p>
      </div>

      <div className="flex-1 w-full max-w-full overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label htmlFor="name" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome</label>
              <input
                id="name"
                type="text"
                placeholder="Nome da categoria"
                className={cn(inputClass, errors.name && inputErrorClass)}
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setValue("type", e.target.value as "INCOME" | "EXPENSE")}
                  className={cn(selectClass, errors.type && inputErrorClass)}
                >
                  {CATEGORY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="icon" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Ícone (opcional)</label>
              <input
                id="icon"
                type="text"
                placeholder="Nome do ícone"
                className={inputClass}
                {...register("icon")}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B] disabled:opacity-60"
            >
              {isSubmitting ? "A guardar..." : "Criar Categoria"}
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
