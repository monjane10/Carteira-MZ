"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Building2, Smartphone, Check, ChevronRight, Save } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatCurrency } from "@/lib/utils"
import { getAccountLogo } from "@/lib/account-logos"
import { ACCOUNT_TYPE_LABELS } from "@/constants"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import * as accountService from "@/services/mock/accounts"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  type: z.enum(["BANK", "MOBILE_MONEY"]),
  institution: z.string().min(1, "Seleccione uma instituição"),
  initial_balance: z.number().min(0).default(0),
  currency: z.enum(["MZN", "USD"]),
})

type FormData = z.infer<typeof schema>

const banks = [
  { name: "BCI", color: "#F59E0B" },
  { name: "Millennium BIM", color: "#EC4899" },
  { name: "ABSA", color: "#3B82F6" },
  { name: "Standard Bank", color: "#64748B" },
]

const mobiles = [
  { name: "M-Pesa", color: "#10B981" },
  { name: "e-Mola", color: "#F59E0B" },
  { name: "mKesh", color: "#0D9488" },
]

export function AccountCreateScreen() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<"BANK" | "MOBILE_MONEY">("BANK")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      type: "BANK",
      institution: "",
      initial_balance: 0,
      currency: "MZN",
    },
  })

  const selectedInstitution = watch("institution")
  const selectedCurrency = watch("currency")
  const accountName = watch("name")
  const balance = watch("initial_balance")
  const currentType = watch("type")

  const institutions = accountType === "BANK" ? banks : mobiles

  const logoPath = selectedInstitution ? getAccountLogo(selectedInstitution) : null

  const previewName = accountName || selectedInstitution || "Nome da Conta"

  async function onSubmit(data: FormData) {
    try {
      await accountService.createAccount({
        name: data.name || data.institution,
        type: data.type,
        currency: data.currency,
        balance: data.initial_balance,
        initial_balance: data.initial_balance,
        color: "#0F172A",
        icon: null,
        institution_id: null,
        is_active: true,
      })
      toast({ title: "Sucesso", description: "Conta criada com sucesso.", variant: "success" })
      router.push("/contas")
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "error" })
    }
  }

  return (
    <div className="min-h-dvh w-full max-w-full bg-white flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Nova Conta</h1>
        <p className="text-sm text-slate-500 mt-1">Adicione uma conta bancária ou carteira móvel</p>
      </div>

      <div className="flex-1 w-full max-w-full overflow-y-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}

        >
          {/* Tipo de Conta */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#0F172A] mb-3">Tipo de conta</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAccountType("BANK")
                  setValue("type", "BANK")
                  setValue("institution", "")
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl font-medium text-sm h-12 transition-all",
                  accountType === "BANK"
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600"
                )}
              >
                <Building2 className="h-5 w-5" />
                Banco
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType("MOBILE_MONEY")
                  setValue("type", "MOBILE_MONEY")
                  setValue("institution", "")
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl font-medium text-sm h-12 transition-all",
                  accountType === "MOBILE_MONEY"
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600"
                )}
              >
                <Smartphone className="h-5 w-5" />
                Carteira Móvel
              </button>
            </div>
          </div>

          {/* Instituição */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#0F172A] mb-3">Instituição</p>
            <div className="grid grid-cols-4 gap-2">
              {institutions.map((inst) => {
                const logo = getAccountLogo(inst.name)
                const isSelected = selectedInstitution === inst.name
                return (
                  <button
                    key={inst.name}
                    type="button"
                    onClick={() => setValue("institution", inst.name)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    {logo ? (
                      <div className="h-7 w-7 relative">
                        <Image src={logo} alt={inst.name} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: inst.color }}>
                        {inst.name[0]}
                      </div>
                    )}
                    <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">
                      {inst.name}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution.message}</p>}
          </div>

          {/* Nome da Conta */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome da conta</label>
            <input
              type="text"
              placeholder="Ex.: Conta Principal, Poupança, Salários"
              {...register("name")}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Saldo Inicial + Moeda */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Saldo inicial</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("initial_balance", { valueAsNumber: true })}
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 pr-16 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                {selectedCurrency === "MZN" ? "MTn" : "$"}
              </span>
            </div>
          </div>

          {/* Moeda */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#0F172A] block mb-1.5">Moeda</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue("currency", "MZN")}
                className={cn(
                  "flex-1 h-13 rounded-xl font-semibold text-sm transition-all",
                  selectedCurrency === "MZN"
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600"
                )}
              >
                MTn
              </button>
              <button
                type="button"
                onClick={() => setValue("currency", "USD")}
                className={cn(
                  "flex-1 h-13 rounded-xl font-semibold text-sm transition-all",
                  selectedCurrency === "USD"
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600"
                )}
              >
                $
              </button>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-100 mb-5" />

          {/* Pré-visualização */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Pré-visualização da conta
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-slate-100">
                  {logoPath ? (
                    <Image src={logoPath} alt={previewName} width={40} height={40} className="object-contain" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-slate-600 bg-slate-100">
                      {previewName[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] truncate">{previewName}</p>
                  <p className="text-xs text-slate-500">{ACCOUNT_TYPE_LABELS[currentType] || currentType}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#0F172A]">
                    {balance > 0 ? formatCurrency(balance) : `0,00 ${selectedCurrency === "MZN" ? "MTn" : "$"}`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Botão Guardar */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B] disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? "A guardar..." : "Guardar Conta"}
          </button>

          {/* Cancelar */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-center text-sm text-slate-500 mt-4 py-2 hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </motion.div>
      </div>
    </div>
  )
}
