"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, CheckCheck, X, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { useNotificationStore } from "@/store"
import { formatDate } from "@/lib/utils"


const TYPE_ICONS: Record<string, typeof Info> = {
  BUDGET_LIMIT: AlertTriangle,
  GOAL_COMPLETED: CheckCircle,
  LOW_BALANCE: AlertTriangle,
  LOAN_DUE: X,
  SYSTEM: Info,
}

const TYPE_COLORS: Record<string, string> = {
  BUDGET_LIMIT: "text-amber-600 bg-amber-100",
  GOAL_COMPLETED: "text-emerald-600 bg-emerald-100",
  LOW_BALANCE: "text-red-600 bg-red-100",
  LOAN_DUE: "text-red-600 bg-red-100",
  SYSTEM: "text-blue-600 bg-blue-100",
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    getUnreadCount()
  }, [fetchNotifications, getUnreadCount])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <Bell className="h-8 w-8 mb-2" />
                <span className="text-sm">Sem notificações</span>
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
        </div>
      )}
    </div>
  )
}
