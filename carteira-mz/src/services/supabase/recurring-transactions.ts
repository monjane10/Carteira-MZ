import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"
import type { RecurringTransaction } from "@/types"

const ENTITY = "transacao-recorrente"

export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  try {
    logger.info("Fetching recurring transactions")
    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .order("next_execution", { ascending: true })
    if (error) throw error
    return data ?? []
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function createRecurringTransaction(data: {
  account_id: string
  category_id: string | null
  type: "INCOME" | "EXPENSE"
  amount: number
  description: string | null
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  start_date: string
}): Promise<RecurringTransaction> {
  try {
    logger.info("Creating recurring transaction", { account_id: data.account_id })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")
    const { data: result, error } = await supabase
      .from("recurring_transactions")
      .insert({
        user_id: user.id,
        account_id: data.account_id,
        category_id: data.category_id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        frequency: data.frequency,
        start_date: data.start_date,
        next_execution: data.start_date,
        is_active: true,
      })
      .select("*, account:accounts(*), category:categories(*)")
      .single()
    if (error) throw error
    logger.info("Recurring transaction created", { id: result.id })
    return result
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateRecurringTransaction(
  id: string,
  data: Partial<Omit<RecurringTransaction, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<RecurringTransaction> {
  try {
    const { data: result, error } = await supabase
      .from("recurring_transactions")
      .update(data)
      .eq("id", id)
      .select("*, account:accounts(*), category:categories(*)")
      .single()
    if (error) throw error
    logger.info("Recurring transaction updated", { id })
    return result
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id)
    if (error) throw error
    logger.info("Recurring transaction deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}
