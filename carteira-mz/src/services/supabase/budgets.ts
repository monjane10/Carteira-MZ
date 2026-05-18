import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import { createNotification } from "./notifications"
import type { Budget, NotificationType } from "@/types"

const ENTITY = "orcamento"

async function notify(
  type: NotificationType,
  title: string,
  message: string,
) {
  try { await createNotification(type, title, message) } catch { /* silent */ }
}

export async function getBudgets(): Promise<Budget[]> {
  try {
    logger.info("Fetching budgets")
    const { data, error } = await supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false })
    if (error) throw error

    const budgets = (data ?? []) as unknown as (Budget & { category?: unknown })[]
    if (budgets.length === 0) return []

    const minDate = budgets.reduce((d, b) => b.start_date < d ? b.start_date : d, budgets[0].start_date)
    const maxDate = budgets.reduce((d, b) => b.end_date > d ? b.end_date : d, budgets[0].end_date)
    const categoryIds = [...new Set(budgets.map((b) => b.category_id))]

    const { data: allSpent } = await supabase
      .from("transactions")
      .select("category_id, amount, transaction_date")
      .eq("type", "EXPENSE")
      .in("category_id", categoryIds)
      .gte("transaction_date", minDate)
      .lte("transaction_date", maxDate)

    const txRows = (allSpent ?? []) as { category_id: string; amount: number; transaction_date: string }[]

    return budgets.map((b) => {
      const spent = txRows
        .filter((t) => t.category_id === b.category_id && t.transaction_date >= b.start_date && t.transaction_date <= b.end_date)
        .reduce((s, t) => s + t.amount, 0)
      return { ...b, spent } as Budget
    })
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
      .select("amount_sum:amount.sum()")
      .eq("category_id", b.category_id)
      .eq("type", "EXPENSE")
      .gte("transaction_date", b.start_date)
      .lte("transaction_date", b.end_date)
      .single()
    const spent = (spentData as unknown as { amount_sum: number | null })?.amount_sum ?? 0

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

export async function checkBudgetLimits(): Promise<void> {
  try {
    const budgets = await getBudgets()
    const now = new Date().toISOString().slice(0, 10)

    for (const b of budgets) {
      if (b.end_date < now) continue

      const bCast = b as Budget & { spent: number }
      const pct = bCast.amount_limit > 0 ? Math.round((bCast.spent / bCast.amount_limit) * 100) : 0

      if (pct >= 100) {
        notify("BUDGET_LIMIT", "Orçamento Esgotado", `O orçamento para ${bCast.category?.name ?? bCast.category_id} atingiu ${pct}% do limite (${bCast.spent}/${bCast.amount_limit} Mzn).`)
      } else if (pct >= 80) {
        notify("BUDGET_LIMIT", "Orçamento Quase Esgotado", `O orçamento para ${bCast.category?.name ?? bCast.category_id} está em ${pct}% do limite (${bCast.spent}/${bCast.amount_limit} Mzn).`)
      }
    }
  } catch (e) {
    logger.warn("Failed to check budget limits", { error: e })
  }
}
