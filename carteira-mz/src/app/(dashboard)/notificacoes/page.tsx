"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, AlertTriangle, CheckCircle, PiggyBank, X, ArrowRightLeft, BellOff, CheckCheck, Trash2 } from "lucide-react"
import { useNotificationStore } from "@/store"
import { PageHeader } from "@/components/shared/page-header"
import { NotificationDetail } from "@/components/shared/notification-detail"
import { Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Notification } from "@/types"

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

export default function NotificationsPage() {
  const [selected, setSelected] = useState<Notification | null>(null)
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteAllNotifications, getUnreadCount, subscribeToRealtime } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    getUnreadCount()
    const unsubscribe = subscribeToRealtime()
    return () => unsubscribe()
  }, [fetchNotifications, getUnreadCount, subscribeToRealtime])

  return (
    <div className="min-h-dvh bg-white dark:bg-slate-950 flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <PageHeader
          title="Notificações"
          description="Histórico de todas as notificações"
        >
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas lidas
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Apagar todas
              </button>
            )}
          </div>
        </PageHeader>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center pt-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-20 text-slate-400"
          >
            <BellOff className="h-16 w-16 mb-4 text-slate-300 dark:text-slate-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Nenhuma notificação
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Quando houver novidades, aparecerão aqui
            </span>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, index) => {
              const Icon = TYPE_ICONS[n.type] ?? Info
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => { setSelected(n); if (!n.is_read) markAsRead(n.id) }}
                  className={`w-full text-left rounded-xl px-4 py-3.5 flex gap-3 transition-colors ${
                    !n.is_read
                      ? "bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50"
                      : "bg-white dark:bg-slate-950 border border-transparent"
                  }`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_COLORS[n.type] ?? "text-blue-600 bg-blue-100"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.is_read ? "font-bold" : "font-medium"} text-slate-900 dark:text-white`}>
                        {n.title}
                      </p>
                      {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                    </div>
                    {n.message && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                      {formatDate(n.created_at, "relative")}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
          >
            <NotificationDetail notification={selected} onBack={() => setSelected(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
