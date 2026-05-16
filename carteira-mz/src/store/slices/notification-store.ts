import { create } from "zustand"
import type { Notification } from "@/types"
import { notifications as notificationService } from "@/services"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  getUnreadCount: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const notifications = await notificationService.getNotifications()
      set({ notifications, isLoading: false })
    } catch {
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
    } catch {
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
    } catch {
      set({ error: "Erro ao marcar todas como lidas" })
    }
  },
  getUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount()
      set({ unreadCount })
    } catch {
      set({ error: "Erro ao carregar contagem de não lidas" })
    }
  },
}))
