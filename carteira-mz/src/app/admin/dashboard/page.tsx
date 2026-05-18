"use client"

import { useState, useEffect } from "react"
import { Users, Building2, ArrowUpDown, Banknote, Send } from "lucide-react"
import { admin, type AdminStats, type AdminUser } from "@/services"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function StatCard({ title, value, icon: Icon, subtitle, color }: { title: string; value: string; icon: React.ElementType; subtitle?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [broadcastTitle, setBroadcastTitle] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function load() {
      const [s, u] = await Promise.all([admin.getAdminStats(), admin.getAdminUsers()])
      setStats(s)
      setUsers(u.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  async function handleBroadcast() {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return
    setSending(true)
    try {
      const result = await admin.broadcastNotification(broadcastTitle.trim(), broadcastMessage.trim())
      toast({
        title: "Broadcast enviado",
        description: `Notificação enviada para ${result.total_users} utilizadores.`,
        variant: "success",
      })
      setBroadcastTitle("")
      setBroadcastMessage("")
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar broadcast.", variant: "error" })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        A carregar...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Utilizadores"
          value={String(stats?.total_users ?? 0)}
          icon={Users}
          subtitle={`${stats?.active_users ?? 0} activos`}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Contas"
          value={String(stats?.total_accounts ?? 0)}
          icon={Building2}
          color="bg-emerald-400"
        />
        <StatCard
          title="Total Transacções"
          value={String(stats?.total_transactions ?? 0)}
          icon={ArrowUpDown}
          color="bg-teal-500"
        />
        <StatCard
          title="Saldo Total"
          value={formatCurrency(stats?.total_balance ?? 0)}
          icon={Banknote}
          subtitle={`+${stats?.monthly_growth ?? 0}% este mês`}
          color="bg-emerald-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Send className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-900">Notificação Broadcast</h2>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Título da notificação"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <textarea
            placeholder="Mensagem"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
          />
          <button
            onClick={handleBroadcast}
            disabled={sending || !broadcastTitle.trim() || !broadcastMessage.trim()}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar para Todos
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Utilizadores Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Nome</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Contas</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Saldo Total</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-900">{user.full_name}</td>
                  <td className="px-5 py-3 text-slate-500">{user.email}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{user.accounts_count}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900">{formatCurrency(user.total_balance)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {user.status === "active" ? "Activo" : "Inactivo"}
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
