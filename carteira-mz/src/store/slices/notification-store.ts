import { create } from "zustand"
import type { Notification } from "@/types"
import { notifications as notificationService, supabase } from "@/services"
import { showBrowserNotification } from "@/lib/push-notifications"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  getUnreadCount: () => Promise<void>
  subscribeToRealtime: () => () => void
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    user_id: "",
    type: "LOW_BALANCE",
    title: "Saldo baixo na conta Milhão",
    message: "O saldo da sua conta Milhão está abaixo de 500 MZN. Considere fazer um depósito.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    user_id: "",
    type: "GOAL_CONTRIBUTION",
    title: "Contribuição recebida na meta PlayStation 5",
    message: "Recebeste 2.500 MZN de contribuição para a meta PlayStation 5. Estás a 70% do objectivo!",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "3",
    user_id: "",
    type: "LOAN_RECEIVED",
    title: "Empréstimo recebido de 15.000 MZN",
    message: "O empréstimo de 15.000 MZN foi depositado na tua conta principal.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "4",
    user_id: "",
    type: "BUDGET_LIMIT",
    title: "Orçamento de Alimentação quase no limite",
    message: "Já gastaste 85% do orçamento de Alimentação este mês (8.500 MZN de 10.000 MZN).",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5",
    user_id: "",
    type: "LOAN_DUE",
    title: "Pagamento de empréstimo vence amanhã",
    message: "A prestação de 3.200 MZN do empréstimo vence amanhã. Certifica-te de que tens saldo suficiente.",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await notificationService.getNotifications()
      const notifications = data.length > 0 ? data : MOCK_NOTIFICATIONS
      set({ notifications, unreadCount: notifications.filter(n => !n.is_read).length, isLoading: false })
    } catch {
      set({ notifications: MOCK_NOTIFICATIONS, unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.is_read).length, isLoading: false })
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
