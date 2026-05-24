import { create } from "zustand"
import type { Notification } from "@/types"
import { notifications as notificationService, supabase } from "@/services"
import { showBrowserNotification } from "@/lib/push-notifications"
import { toast } from "@/components/ui/toast"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  getUnreadCount: () => Promise<void>
  subscribeToRealtime: () => () => void
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

async function cleanupOldNotifications() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()
    await fetch("/api/notifications/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ before: sevenDaysAgo }),
    })
  } catch { /* non-critical */ }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const notifications = await notificationService.getNotifications()
      set({ notifications, unreadCount: notifications.filter(n => !n.is_read).length, isLoading: false })
      cleanupOldNotifications()
    } catch (e) {
      console.error("Failed to fetch notifications:", e)
      set({ error: "Erro ao carregar notificações", isLoading: false })
    }
  },
  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id)
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (e) {
      console.error("Failed to mark notification as read:", e)
      set({ error: "Erro ao marcar notificação como lida" })
    }
  },
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      }))
    } catch (e) {
      console.error("Failed to mark all as read:", e)
      set({ error: "Erro ao marcar todas como lidas" })
    }
  },
  deleteNotification: async (id) => {
    try {
      await notificationService.deleteNotification(id)
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: state.notifications.filter(n => n.id !== id && !n.is_read).length,
      }))
      toast({ title: "Sucesso", description: "Notificação apagada.", variant: "success" })
    } catch (e) {
      console.error("Failed to delete notification:", e)
      toast({ title: "Erro", description: "Não foi possível apagar a notificação.", variant: "error" })
      set({ error: "Erro ao apagar notificação" })
    }
  },
  deleteAllNotifications: async () => {
    try {
      await notificationService.deleteAllNotifications()
      set({ notifications: [], unreadCount: 0 })
      toast({ title: "Sucesso", description: "Todas as notificações foram apagadas.", variant: "success" })
    } catch (e) {
      console.error("Failed to delete all notifications:", e)
      toast({ title: "Erro", description: "Não foi possível apagar as notificações.", variant: "error" })
      set({ error: "Erro ao apagar notificações" })
    }
  },
  getUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount()
      set({ unreadCount })
    } catch (e) {
      console.error("Failed to get unread count:", e)
      set({ error: "Erro ao carregar contagem de não lidas" })
    }
  },
  subscribeToRealtime: () => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          get().fetchNotifications()
          get().getUnreadCount()
          const n = payload.new as Notification
          if (n?.title) showBrowserNotification(n.title, n.message ?? "")
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },
}))
