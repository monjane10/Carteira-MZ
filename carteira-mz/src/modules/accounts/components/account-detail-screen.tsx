"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Edit3, Trash2, Building2, Smartphone, Wallet, PiggyBank, TrendingUp, HelpCircle, Check } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { getAccountLogo } from "@/lib/account-logos"
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS } from "@/constants"
import { toast } from "@/hooks/use-toast"
import { accounts as accountService } from "@/services"
import { supabase } from "@/services/supabase/client"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import type { Account, AccountType } from "@/types"

const TYPE_ICONS = {
  BANK: Building2,
  MOBILE_MONEY: Smartphone,
  CASH: Wallet,
  SAVINGS: PiggyBank,
  INVESTMENT: TrendingUp,
  OTHER: HelpCircle,
} as const

export function AccountDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [institutionMap, setInstitutionMap] = useState<Map<string, string>>(new Map())
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState<AccountType>("BANK")
  const [editInstitution, setEditInstitution] = useState("")
  const [editBalance, setEditBalance] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from("financial_institutions")
      .select("id, name")
      .then(({ data }) => {
        if (data) {
          setInstitutionMap(new Map(data.map(i => [i.name, i.id])))
        }
      })
  }, [])

  useEffect(() => {
    if (!id) return
    accountService.getAccountById(id).then((acc) => {
      setAccount(acc)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-4">
        <p className="text-slate-500 mb-4">Conta não encontrada</p>
        <button onClick={() => router.back()} className="h-10 px-6 rounded-xl bg-[#0F172A] text-white text-sm font-medium">
          Voltar
        </button>
      </div>
    )
  }

  const logoPath = getAccountLogo(account.institution?.name ?? account.name)
  const FallbackIcon = TYPE_ICONS[account.type] ?? HelpCircle
  const accentColor = account.color ?? ACCOUNT_TYPE_COLORS[account.type] ?? "#64748B"

  const handleEdit = () => {
    setEditName(account.name)
    setEditType(account.type)
    setEditInstitution(account.institution?.name ?? "")
    setEditBalance(String(account.balance))
    setShowEdit(true)
  }

  const handleSave = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const institutionId = editInstitution ? (institutionMap.get(editInstitution) ?? null) : null
      await accountService.updateAccount(account.id, {
        name: editName.trim(),
        type: editType,
        initial_balance: Number(editBalance) || account.initial_balance,
        balance: Number(editBalance) || account.balance,
        color: account.color ?? null,
        icon: account.icon ?? null,
        institution_id: institutionId,
        is_active: account.is_active,
        currency: account.currency,
      })
      setAccount((prev) => prev ? { ...prev, name: editName.trim(), type: editType, balance: Number(editBalance) || prev.balance, institution_id: institutionId, institution: institutionId ? prev?.institution : null } : prev)
      setShowEdit(false)
      toast({ title: "Conta actualizada", variant: "success" })
    } catch {
      toast({ title: "Erro ao actualizar", variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await accountService.deleteAccount(account.id)
      toast({ title: "Conta removida", variant: "success" })
      router.push("/contas")
    } catch {
      toast({ title: "Erro ao remover", variant: "error" })
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-[#0F172A]">Detalhes da Conta</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 mt-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden bg-slate-50" style={{ backgroundColor: `${accentColor}10` }}>
                {logoPath ? (
                  <Image src={logoPath} alt={account.name} width={72} height={72} className="object-contain" />
                ) : (
                  <FallbackIcon className="h-8 w-8" style={{ color: accentColor }} />
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">{account.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{ACCOUNT_TYPE_LABELS[account.type] ?? account.type}</p>
            <p className="text-3xl font-bold text-[#0F172A] mt-4">{formatCurrency(account.balance)}</p>
            <p className="text-xs text-slate-400 mt-1">{account.currency === "USD" ? "Dólar Americano" : "Metical Moçambicano"}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden mt-4">
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Instituição</p>
                <p className="text-sm font-bold text-[#0F172A] truncate mt-0.5">
                  {account.institution?.name ?? account.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <div className="h-4 w-4 rounded-full border-2 border-slate-300" style={{ backgroundColor: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Tipo</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{ACCOUNT_TYPE_LABELS[account.type] ?? account.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Saldo Inicial</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{formatCurrency(account.initial_balance)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleEdit}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-white font-bold text-[14px] transition-all hover:bg-[#1E293B]"
            >
              <Edit3 className="h-5 w-5" />
              Editar Conta
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-red-600 font-bold text-[14px] transition-all hover:bg-red-100"
            >
              <Trash2 className="h-5 w-5" />
              Remover Conta
            </button>
          </div>
        </motion.div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#0F172A] text-center mb-1">Editar Conta</h3>
            <p className="text-xs text-slate-400 text-center mb-6">Altere os dados da sua conta</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</label>
                <select
                  value={editType}
                  onChange={(e) => {
                    setEditType(e.target.value as AccountType)
                    if (e.target.value !== "BANK" && e.target.value !== "MOBILE_MONEY") {
                      setEditInstitution("")
                    }
                  }}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                >
                  {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {(editType === "BANK" || editType === "MOBILE_MONEY") && (
                <div>
                  <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Instituição</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[...(editType === "BANK"
                      ? [{ name: "BCI" }, { name: "Millennium BIM" }, { name: "ABSA" }, { name: "Standard Bank" }]
                      : [{ name: "M-Pesa" }, { name: "e-Mola" }, { name: "mKesh" }]
                    )].map((inst) => {
                      const logoPath = getAccountLogo(inst.name)
                      const isSelected = editInstitution === inst.name
                      return (
                        <button
                          key={inst.name}
                          type="button"
                          onClick={() => setEditInstitution(inst.name)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all relative",
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                        >
                          {logoPath ? (
                            <div className="h-7 w-7 relative">
                              <Image src={logoPath} alt={inst.name} fill className="object-contain" />
                            </div>
                          ) : (
                            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-slate-400">
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
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Saldo</label>
                <input
                  type="number"
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                className="flex-1 h-12 rounded-xl bg-[#0F172A] text-sm font-semibold text-white transition-colors hover:bg-[#1E293B] disabled:opacity-60"
              >
                {saving ? "A guardar..." : "Salvar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        onOpenChange={(open) => { if (!open) setShowDelete(false) }}
        title="Remover Conta"
        description={`Tem a certeza que deseja remover a conta "${account.name}"? Esta acção não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
