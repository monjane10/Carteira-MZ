import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"
import type { Notification } from "@/types"

const ENTITY = "notificacao"

export async function getNotifications(): Promise<Notification[]> {
  try {
    logger.info("Fetching notifications")
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data ?? []
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function markAsRead(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
    if (error) throw error
    logger.info("Notification marked as read", { id })
  } catch (e) {
    return handleError(ENTITY, "marcar lida", e)
  }
}

export async function markAllAsRead(): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false)
    if (error) throw error
    logger.info("All notifications marked as read")
  } catch (e) {
    return handleError(ENTITY, "marcar todas lidas", e)
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
    if (error) throw error
    return count ?? 0
  } catch (e) {
    return handleError(ENTITY, "contar nao lidas", e)
  }
}
