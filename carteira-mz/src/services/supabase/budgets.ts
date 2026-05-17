import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import type { Budget } from "@/types"

const ENTITY = "orcamento"

export async function getBudgets(): Promise<Budget[]> {
  try {
    logger.info("Fetching budgets")
    const { data, error } = await supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false })
    if (error) throw error

    const budgets = (data ?? []) as unknown as (Budget & { category?: unknown })[]
    const enriched: Budget[] = []

    for (const b of budgets) {
      const { data: spentData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("category_id", b.category_id)
        .eq("type", "EXPENSE")
        .gte("transaction_date", b.start_date)
        .lte("transaction_date", b.end_date)
      const spent = (spentData ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)
      enriched.push({ ...b, spent } as Budget)
    }

    return enriched
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    const b = data as unknown as Budget & { category?: unknown }
    const { data: spentData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("category_id", b.category_id)
      .eq("type", "EXPENSE")
      .gte("transaction_date", b.start_date)
      .lte("transaction_date", b.end_date)
    const spent = (spentData ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)

    return { ...b, spent } as Budget
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

export async function createBudget(data: {
  category_id: string
  amount_limit: number
  period: string
  start_date: string
  end_date: string
}): Promise<Budget> {
  try {
    logger.info("Creating budget", { category_id: data.category_id })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")
    const { data: result, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      .select("*, category:categories(*)")
      .single()
    if (error) throw error
    logger.info("Budget created", { id: result.id })
    return { ...result, spent: 0 } as unknown as Budget
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateBudget(
  id: string,
  data: Partial<Omit<Budget, "id" | "user_id" | "created_at">>,
): Promise<Budget> {
  try {
    const { data: result, error } = await supabase
      .from("budgets")
      .update({
        category_id: data.category_id,
        amount_limit: data.amount_limit,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      .eq("id", id)
      .select("*, category:categories(*)")
      .single()
    if (error) throw error
    if (!result) throw new NotFoundError(ENTITY, id)

    logger.info("Budget updated", { id })
    return result as unknown as Budget
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteBudget(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("budgets").delete().eq("id", id)
    if (error) throw error
    logger.info("Budget deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}
