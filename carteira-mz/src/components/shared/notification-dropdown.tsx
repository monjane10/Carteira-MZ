"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCheck, X, Info, AlertTriangle, CheckCircle, PiggyBank, ArrowRightLeft, BellOff } from "lucide-react"
import { useNotificationStore } from "@/store"
import { formatDate } from "@/lib/utils"

const TYPE_ICONS: Record<string, typeof Info> = {
  BUDGET_LIMIT: AlertTriangle,
  GOAL_COMPLETED: CheckCircle,
  GOAL_CONTRIBUTION: PiggyBank,
  LOW_BALANCE: AlertTriangle,
  LOAN_DUE: X,
  LOAN_RECEIVED: ArrowRightLeft,
  SYSTEM: Info,
}

const TYPE_COLORS: Record<string, string> = {
  BUDGET_LIMIT: "text-amber-600 bg-amber-100",
  GOAL_COMPLETED: "text-emerald-600 bg-emerald-100",
  GOAL_CONTRIBUTION: "text-violet-600 bg-violet-100",
  LOW_BALANCE: "text-red-600 bg-red-100",
  LOAN_DUE: "text-red-600 bg-red-100",
  LOAN_RECEIVED: "text-emerald-600 bg-emerald-100",
  SYSTEM: "text-blue-600 bg-blue-100",
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, getUnreadCount, subscribeToRealtime } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    getUnreadCount()
    const unsubscribe = subscribeToRealtime()
    return () => unsubscribe()
  }, [fetchNotifications, getUnreadCount, subscribeToRealtime])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>

                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notificações
                </span>

                {unreadCount > 0 ? (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar todas lidas
                  </button>
                ) : (
                  <div className="w-20" />
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 px-4">
                    <BellOff className="h-12 w-12 mb-3 text-slate-300 dark:text-slate-600" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Nenhuma notificação
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Quando houver novidades, aparecerão aqui
                    </span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = TYPE_ICONS[n.type] ?? Info
                    return (
                      <button
                        key={n.id}
                        onClick={() => { if (!n.is_read) markAsRead(n.id) }}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                          !n.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TYPE_COLORS[n.type] ?? "text-blue-600 bg-blue-100"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{n.title}</p>
                          {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                          <p className="text-[11px] text-slate-400 mt-1">{formatDate(n.created_at, "relative")}</p>
                        </div>
                        {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
