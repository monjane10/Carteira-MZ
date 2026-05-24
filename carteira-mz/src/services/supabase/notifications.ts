import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"
import type { Notification, NotificationType } from "@/types"

const ENTITY = "notificacao"

async function getUserIdOrThrow(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sem sessão")
  return user.id
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    logger.info("Fetching notifications")
    const userId = await getUserIdOrThrow()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data ?? []
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function markAsRead(id: string): Promise<void> {
  try {
    const userId = await getUserIdOrThrow()
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
    if (error) throw error
    if (!data || data.length === 0) throw new Error("Notificação não encontrada")
    logger.info("Notification marked as read", { id })
  } catch (e) {
    return handleError(ENTITY, "marcar lida", e)
  }
}

export async function markAllAsRead(): Promise<void> {
  try {
    const userId = await getUserIdOrThrow()
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false)
      .eq("user_id", userId)
    if (error) throw error
    logger.info("All notifications marked as read")
  } catch (e) {
    return handleError(ENTITY, "marcar todas lidas", e)
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const userId = await getUserIdOrThrow()
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("user_id", userId)
    if (error) throw error
    return count ?? 0
  } catch (e) {
    return handleError(ENTITY, "contar nao lidas", e)
  }
}

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  url?: string,
): Promise<Notification | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error("Sem sessão")

    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type, title, message, url }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Erro ao criar notificação")
    }

    return await res.json()
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function createNotificationsBatch(
  list: { type: NotificationType; title: string; message: string; url?: string }[],
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error("Sem sessão")

  const promises = list.map((n) =>
    fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(n),
    }),
  )

  await Promise.allSettled(promises)
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error("Sem sessão")

    const res = await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Erro ao apagar notificação")
    }

    logger.info("Notification deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "apagar", e)
  }
}

export async function deleteAllNotifications(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error("Sem sessão")

    const res = await fetch("/api/notifications/delete-all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Erro ao apagar notificações")
    }

    logger.info("All notifications deleted")
  } catch (e) {
    return handleError(ENTITY, "apagar todas", e)
  }
}
