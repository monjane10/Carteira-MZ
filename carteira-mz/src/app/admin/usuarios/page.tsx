"use client"

import { useState, useEffect } from "react"
import { getAdminUsers, type AdminUser } from "@/services/mock/admin"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAdminUsers()
      setUsers(data)
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
      <h1 className="text-xl font-bold text-slate-900">Utilizadores</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Contas</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Saldo Total</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Estado</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{user.full_name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
                  <td className="px-5 py-3.5 text-right text-slate-700">{user.accounts_count}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">{formatCurrency(user.total_balance)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {user.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
