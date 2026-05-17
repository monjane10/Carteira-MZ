"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { transferSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { accounts as accountService, transfers as transferService } from "@/services"
import type { Account } from "@/types"
import type { z } from "zod"

export function TransferCreateScreen() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
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
    accountService.getAccounts().then(setAccounts).finally(() => setLoadingData(false))
  }, [])

  async function onSubmit(data: z.infer<typeof transferSchema>) {
    try {
      await transferService.createTransfer({
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        fee: data.fee,
        description: data.description ?? null,
        transfer_date: data.transfer_date,
      })
      toast({ title: "Sucesso", description: "Transferência criada com sucesso.", variant: "success" })
      router.push("/transferencias")
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
        <h1 className="text-xl font-bold text-[#0F172A]">Nova Transferência</h1>
        <p className="text-sm text-slate-500 mt-1">Transfira valores entre as suas contas</p>
      </div>

      <div className="flex-1 w-full max-w-full overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Conta de Origem */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta de Origem</label>
              <div className="relative">
                <select
                  value={fromAccount}
                  onChange={(e) => setValue("from_account_id", e.target.value)}
                  disabled={loadingData}
                  className={cn(selectClass, errors.from_account_id && inputErrorClass)}
                >
                  <option value="" disabled>Seleccione a conta</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.id === toAccount}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.from_account_id && <p className="text-xs text-red-500 mt-1">{errors.from_account_id.message}</p>}
            </div>

            {/* Conta de Destino */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Conta de Destino</label>
              <div className="relative">
                <select
                  value={toAccount}
                  onChange={(e) => setValue("to_account_id", e.target.value)}
                  disabled={loadingData}
                  className={cn(selectClass, errors.to_account_id && inputErrorClass)}
                >
                  <option value="" disabled>Seleccione a conta</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.id === fromAccount}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.to_account_id && <p className="text-xs text-red-500 mt-1">{errors.to_account_id.message}</p>}
            </div>

            {sameAccount && (
              <p className="text-xs text-amber-600 mb-4">As contas de origem e destino devem ser diferentes.</p>
            )}

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

            {/* Taxa */}
            <div className="mb-5">
              <label htmlFor="fee" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Taxa (opcional)</label>
              <input
                id="fee"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClass, errors.fee && inputErrorClass)}
                {...register("fee", { valueAsNumber: true })}
              />
              {errors.fee && <p className="text-xs text-red-500 mt-1">{errors.fee.message}</p>}
            </div>

            {/* Descrição */}
            <div className="mb-5">
              <label htmlFor="description" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Descrição</label>
              <input
                id="description"
                type="text"
                placeholder="Descrição da transferência"
                className={inputClass}
                {...register("description")}
              />
            </div>

            {/* Data */}
            <div className="mb-5">
              <label htmlFor="transfer_date" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Data</label>
              <input
                id="transfer_date"
                type="date"
                className={cn(inputClass, errors.transfer_date && inputErrorClass)}
                {...register("transfer_date")}
              />
              {errors.transfer_date && <p className="text-xs text-red-500 mt-1">{errors.transfer_date.message}</p>}
            </div>

            {/* Botão Guardar */}
            <button
              type="submit"
              disabled={isSubmitting || loadingData || sameAccount}
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
