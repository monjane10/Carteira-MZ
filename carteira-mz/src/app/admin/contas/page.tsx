"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getAccounts } from "@/services/mock/accounts"
import { type Account } from "@/types"
import { ACCOUNT_TYPE_LABELS } from "@/constants"
import { formatCurrency } from "@/lib/utils"
import { getAccountLogo } from "@/lib/account-logos"

export default function AdminContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAccounts()
      setAccounts(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        A carregar...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Contas</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Tipo</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Saldo</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Moeda</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                        {(() => {
                          const logoPath = getAccountLogo(account.name)
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
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">{formatCurrency(account.balance, account.currency)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
