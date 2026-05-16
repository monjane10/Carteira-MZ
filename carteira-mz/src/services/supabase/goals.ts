import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import type { Goal, GoalContribution } from "@/types"

const ENTITY = "meta"

export async function getGoals(): Promise<Goal[]> {
  try {
    logger.info("Fetching goals")
    const { data, error } = await supabase
      .from("goals")
      .select("*, account:accounts(*)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Goal[]
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getGoalById(id: string): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*, account:accounts(*)")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as unknown as Goal
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

export async function createGoal(data: {
  title: string
  target_amount: number
  account_id?: string | null
  description?: string | null
  target_date?: string | null
  color?: string | null
  icon?: string | null
}): Promise<Goal> {
  try {
    logger.info("Creating goal", { title: data.title })
    const { data: result, error } = await supabase
      .from("goals")
      .insert({
        title: data.title,
        target_amount: data.target_amount,
        current_amount: 0,
        account_id: data.account_id ?? null,
        description: data.description ?? null,
        target_date: data.target_date ?? null,
        color: data.color ?? null,
        icon: data.icon ?? null,
      })
      .select("*, account:accounts(*)")
      .single()
    if (error) throw error
    logger.info("Goal created", { id: result.id })
    return result as unknown as Goal
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateGoal(
  id: string,
  data: Partial<Omit<Goal, "id" | "user_id" | "created_at">>,
): Promise<Goal> {
  try {
    const existing = await getGoalById(id)
    if (!existing) throw new NotFoundError(ENTITY, id)

    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.target_amount !== undefined) updateData.target_amount = data.target_amount
    if (data.current_amount !== undefined) updateData.current_amount = data.current_amount
    if (data.target_date !== undefined) updateData.target_date = data.target_date
    if (data.color !== undefined) updateData.color = data.color
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.account_id !== undefined) updateData.account_id = data.account_id

    const current = data.current_amount ?? existing.current_amount
    const target = data.target_amount ?? existing.target_amount
    updateData.status = current >= target ? "COMPLETED" : (data.status ?? existing.status)

    const { data: result, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .select("*, account:accounts(*)")
      .single()
    if (error) throw error

    logger.info("Goal updated", { id })
    return result as unknown as Goal
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const existing = await getGoalById(id)
    if (!existing) throw new NotFoundError(ENTITY, id)

    await supabase.from("goal_contributions").delete().eq("goal_id", id)
    const { error } = await supabase.from("goals").delete().eq("id", id)
    if (error) throw error
    logger.info("Goal deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}

export async function getGoalContributions(goalId: string): Promise<GoalContribution[]> {
  try {
    const { data, error } = await supabase
      .from("goal_contributions")
      .select("*")
      .eq("goal_id", goalId)
      .order("contribution_date", { ascending: false })
    if (error) throw error
    return data ?? []
  } catch (e) {
    return handleError(ENTITY + " contribuicoes", "listar", e)
  }
}

export async function createGoalContribution(
  goalId: string,
  data: {
    amount: number
    account_id?: string | null
    contribution_date?: string
  },
): Promise<GoalContribution> {
  try {
    const existing = await getGoalById(goalId)
    if (!existing) throw new NotFoundError(ENTITY, goalId)

    const { data: contribution, error } = await supabase
      .from("goal_contributions")
      .insert({
        goal_id: goalId,
        amount: data.amount,
        account_id: data.account_id ?? null,
        contribution_date: data.contribution_date ?? new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error

    const newCurrent = Math.min(existing.target_amount, existing.current_amount + data.amount)
    const newStatus = newCurrent >= existing.target_amount ? "COMPLETED" : "ACTIVE"

    await supabase
      .from("goals")
      .update({ current_amount: newCurrent, status: newStatus })
      .eq("id", goalId)

    logger.info("Goal contribution created", { goalId, amount: data.amount })
    return contribution
  } catch (e) {
    return handleError(ENTITY + " contribuicao", "criar", e)
  }
}
