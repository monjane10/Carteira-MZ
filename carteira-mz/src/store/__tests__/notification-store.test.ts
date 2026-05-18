import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Notification } from "@/types"

const mockNotifications: Notification[] = [
  {
    id: "1",
    user_id: "user-1",
    type: "SYSTEM",
    title: "Notif 1",
    message: "Message 1",
    is_read: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "user-1",
    type: "BUDGET_LIMIT",
    title: "Notif 2",
    message: "Message 2",
    is_read: true,
    created_at: "2025-01-02T00:00:00Z",
  },
]

const mockService = {
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  getUnreadCount: vi.fn(),
}

const mockSupabase = {
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  })),
  removeChannel: vi.fn(),
}

vi.mock("@/services", () => ({
  notifications: mockService,
  supabase: mockSupabase,
}))

vi.mock("@/lib/push-notifications", () => ({
  showBrowserNotification: vi.fn(),
}))

const { useNotificationStore } = await import(
  "../slices/notification-store"
)

describe("notification-store", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    })
  })

  describe("initial state", () => {
    it("starts with empty notifications and zero unread", () => {
      const state = useNotificationStore.getState()
      expect(state.notifications).toEqual([])
      expect(state.unreadCount).toBe(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe("fetchNotifications", () => {
    it("loads notifications and calculates unread count", async () => {
      mockService.getNotifications.mockResolvedValueOnce(mockNotifications)

      await useNotificationStore.getState().fetchNotifications()

      const state = useNotificationStore.getState()
      expect(state.notifications).toEqual(mockNotifications)
      expect(state.unreadCount).toBe(1)
      expect(state.isLoading).toBe(false)
    })

    it("handles error and sets error state", async () => {
      mockService.getNotifications.mockRejectedValueOnce(
        new Error("API error"),
      )

      await useNotificationStore.getState().fetchNotifications()

      const state = useNotificationStore.getState()
      expect(state.notifications).toEqual([])
      expect(state.error).toBe("Erro ao carregar notificações")
      expect(state.isLoading).toBe(false)
    })
  })

  describe("markAsRead", () => {
    it("marks a notification as read and decrements unreadCount", async () => {
      useNotificationStore.setState({
        notifications: mockNotifications,
        unreadCount: 1,
      })

      await useNotificationStore.getState().markAsRead("1")

      const state = useNotificationStore.getState()
      expect(state.notifications[0].is_read).toBe(true)
      expect(state.unreadCount).toBe(0)
      expect(mockService.markAsRead).toHaveBeenCalledWith("1")
    })
  })

  describe("markAllAsRead", () => {
    it("marks all notifications as read and sets unreadCount to 0", async () => {
      useNotificationStore.setState({
        notifications: mockNotifications,
        unreadCount: 1,
      })

      await useNotificationStore.getState().markAllAsRead()

      const state = useNotificationStore.getState()
      expect(state.notifications.every((n) => n.is_read)).toBe(true)
      expect(state.unreadCount).toBe(0)
      expect(mockService.markAllAsRead).toHaveBeenCalled()
    })
  })

  describe("getUnreadCount", () => {
    it("updates unreadCount from service", async () => {
      mockService.getUnreadCount.mockResolvedValueOnce(5)

      await useNotificationStore.getState().getUnreadCount()

      const state = useNotificationStore.getState()
      expect(state.unreadCount).toBe(5)
    })
  })

  describe("subscribeToRealtime", () => {
    it("subscribes to Supabase realtime channel", () => {
      const unsubscribe = useNotificationStore.getState().subscribeToRealtime()

      expect(mockSupabase.channel).toHaveBeenCalledWith(
        "notifications-realtime",
      )
      expect(typeof unsubscribe).toBe("function")

      unsubscribe()
      expect(mockSupabase.removeChannel).toHaveBeenCalled()
    })
  })
})
