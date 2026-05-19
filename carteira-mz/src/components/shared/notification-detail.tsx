"use client"

import { useRouter } from "next/navigation"
import { Info, AlertTriangle, CheckCircle, PiggyBank, X, ArrowRightLeft, ChevronLeft, Eye, EyeOff, Trash2 } from "lucide-react"
import type { Notification } from "@/types"
import { formatDate } from "@/lib/utils"
import { useNotificationStore } from "@/store"
import { supabase } from "@/services"

const TYPE_ICONS: Record<string, typeof Info> = {
  BUDGET_LIMIT: AlertTriangle,
  GOAL_COMPLETED: CheckCircle,
  GOAL_CONTRIBUTION: PiggyBank,
  LOW_BALANCE: AlertTriangle,
  LOAN_DUE: X,
  LOAN_RECEIVED: ArrowRightLeft,
  TRANSFER_COMPLETED: ArrowRightLeft,
  RECURRING_DUE: Info,
  GOAL_EXPIRING: AlertTriangle,
  SYSTEM: Info,
}

const TYPE_COLORS: Record<string, string> = {
  BUDGET_LIMIT: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  GOAL_COMPLETED: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  GOAL_CONTRIBUTION: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
  LOW_BALANCE: "text-red-600 bg-red-100 dark:bg-red-900/30",
  LOAN_DUE: "text-red-600 bg-red-100 dark:bg-red-900/30",
  LOAN_RECEIVED: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  TRANSFER_COMPLETED: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  RECURRING_DUE: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  GOAL_EXPIRING: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  SYSTEM: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
}

const TYPE_ACTIONS: Record<string, { label: string; href: string } | null> = {
  LOW_BALANCE: { label: "Ver conta", href: "/contas" },
  BUDGET_LIMIT: { label: "Ver orçamento", href: "/orcamentos" },
  GOAL_COMPLETED: { label: "Ver meta", href: "/metas" },
  GOAL_CONTRIBUTION: { label: "Ver meta", href: "/metas" },
  LOAN_DUE: { label: "Ver empréstimo", href: "/emprestimos" },
  LOAN_RECEIVED: { label: "Ver empréstimo", href: "/emprestimos" },
  TRANSFER_COMPLETED: { label: "Ver transferência", href: "/transferencias" },
  RECURRING_DUE: { label: "Ver transacção", href: "/transacoes" },
  GOAL_EXPIRING: { label: "Ver meta", href: "/metas" },
  SYSTEM: null,
}

interface NotificationDetailProps {
  notification: Notification
  onBack: () => void
}

export function NotificationDetail({ notification: n, onBack }: NotificationDetailProps) {
  const router = useRouter()
  const { markAsRead, fetchNotifications, getUnreadCount } = useNotificationStore()
  const Icon = TYPE_ICONS[n.type] ?? Info
  const action = TYPE_ACTIONS[n.type]

  const handleMarkRead = async () => {
    await markAsRead(n.id)
  }

  const handleDelete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("notifications")
      .delete()
      .eq("id", n.id)
      .eq("user_id", user.id)
    fetchNotifications()
    getUnreadCount()
    onBack()
  }

  const handleAction = () => {
    if (n.url) {
      router.push(n.url)
    } else if (action) {
      router.push(action.href)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Apagar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-center text-center mb-6">
          <span className={`flex h-16 w-16 items-center justify-center rounded-full ${TYPE_COLORS[n.type] ?? "text-blue-600 bg-blue-100"}`}>
            <Icon className="h-8 w-8" />
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
            {n.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(n.created_at, "relative")}
          </p>
        </div>

        {n.message && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3.5 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {n.message}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between px-1 py-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            Tipo: {n.type.replace(/_/g, " ")}
          </span>
          <span className={`text-xs ${n.is_read ? "text-slate-400" : "text-emerald-600 font-medium"}`}>
            {n.is_read ? "Lida" : "Não lida"}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex gap-2">
        {!n.is_read && (
          <button
            onClick={handleMarkRead}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1"
          >
            <EyeOff className="h-4 w-4" />
            Marcar lida
          </button>
        )}
        {(n.url || action) && (
          <button
            onClick={handleAction}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex-1"
          >
            <Eye className="h-4 w-4" />
            {action?.label ?? "Abrir"}
          </button>
        )}
      </div>
    </div>
  )
}
