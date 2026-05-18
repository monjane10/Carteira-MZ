"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Search, Plus, Eye, X, Building2, CircleDollarSign } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { admin } from "@/services"
import { type Account, type AccountType } from "@/types"
import { ACCOUNT_TYPE_LABELS } from "@/constants"
import { getAccountLogo } from "@/lib/account-logos"
import { Pagination } from "@/components/shared/pagination"

const ACCOUNT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  ...(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
]

export default function AdminContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    async function load() {
      const data = await admin.getAdminAccounts()
      setAccounts(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        searchQuery === "" ||
        account.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType =
        typeFilter === "all" || account.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [accounts, searchQuery, typeFilter])

  const totalPages = Math.ceil(filteredAccounts.length / pageSize)
  const safePage = Math.min(page, totalPages || 1)
  const paginatedAccounts = filteredAccounts.slice((safePage - 1) * pageSize, safePage * pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        A carregar...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Contas</h1>
        <button
          onClick={() => toast({ title: "Nova Conta", description: "Funcionalidade em desenvolvimento" })}
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Pesquisar por nome da conta..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            className="h-10 rounded-xl border border-slate-200 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          {ACCOUNT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Tipo</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Saldo</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Moeda</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Estado</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Acções</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account) => (
                <tr key={account.id} className="border-b border-slate-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                        {(() => {
                          const logoPath = getAccountLogo(account.institution?.name ?? account.name)
                          if (logoPath) {
                            return <Image src={logoPath} alt={account.name} width={32} height={32} className="object-contain" />
                          }
                          return (
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: account.color ?? "#64748B" }}
                            >
                              {account.name.charAt(0)}
                            </div>
                          )
                        })()}
                      </div>
                      <span className="font-medium text-slate-900">{account.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{ACCOUNT_TYPE_LABELS[account.type]}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">{account.balance.toLocaleString("pt-MZ")}</td>
                  <td className="px-5 py-3.5 text-slate-500">{account.currency}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      account.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {account.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toast({ title: "Ver Conta", description: `Detalhes de ${account.name}` })}
                      className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredAccounts.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
      </div>
    </div>
  )
}
