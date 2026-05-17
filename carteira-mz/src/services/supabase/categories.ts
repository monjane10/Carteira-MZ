import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import type { Category } from "@/types"

const ENTITY = "categoria"

export async function getCategories(): Promise<Category[]> {
  try {
    logger.info("Fetching categories")
    const user = (await supabase.auth.getUser()).data.user
    let query = supabase.from("categories").select("*").order("name")
    if (user) {
      query = query.or("user_id.eq." + user.id + ",user_id.is.null") as typeof query
    } else {
      query = query.is("user_id", null) as typeof query
    }
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

export async function createCategory(data: {
  name: string
  type: string
  icon?: string | null
  color?: string | null
}): Promise<Category> {
  try {
    logger.info("Creating category", { name: data.name })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")
    const { data: result, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: data.name,
        type: data.type,
        icon: data.icon ?? null,
        color: data.color ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return result
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "user_id" | "created_at">>,
): Promise<Category> {
  try {
    const { data: result, error } = await supabase
      .from("categories")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    if (!result) throw new NotFoundError(ENTITY, id)
    logger.info("Updated category", { id })
    return result
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) throw error
    logger.info("Deleted category", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}
