"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Eye, X, Mail, Calendar, Wallet, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { admin, type AdminUser } from "@/services"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Pagination } from "@/components/shared/pagination"

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    async function load() {
      const data = await admin.getAdminUsers()
      setUsers(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.status === "active") ||
        (statusFilter === "inactive" && user.status === "inactive")
      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const safePage = Math.min(page, totalPages || 1)
  const paginatedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize)

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
        <h1 className="text-xl font-bold text-slate-900">Utilizadores</h1>
        <button
          onClick={() => toast({ title: "Novo Utilizador", description: "Funcionalidade em desenvolvimento" })}
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Utilizador
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Pesquisar por nome ou email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            className="h-10 rounded-xl border border-slate-200 pl-9 pr-4 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Contas</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Saldo Total</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Estado</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Criado em</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Acções</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-gray-50 transition-colors">
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
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors"
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
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        />
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Detalhes do Utilizador</h2>
              <button onClick={() => setSelectedUser(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                  {selectedUser.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedUser.full_name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    selectedUser.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {selectedUser.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Registado em {formatDate(selectedUser.created_at, "long")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Wallet className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedUser.accounts_count} conta(s) — saldo total {formatCurrency(selectedUser.total_balance)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    toast({ title: "Utilizador removido", description: "Conta do utilizador removida com sucesso." })
                    setSelectedUser(null)
                  }}
                  className="flex items-center gap-2 h-10 w-full rounded-xl border border-red-200 text-red-600 text-sm font-medium justify-center hover:bg-red-50 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Remover Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
