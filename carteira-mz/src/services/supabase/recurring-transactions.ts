import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"
import { createNotification } from "./notifications"
import { createTransaction } from "./transactions"
import type { RecurringTransaction, RecurringFrequency } from "@/types"

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

function calcNextExecution(date: string, frequency: RecurringFrequency): string {
  const d = new Date(date)
  switch (frequency) {
    case "DAILY": d.setDate(d.getDate() + 1); break
    case "WEEKLY": d.setDate(d.getDate() + 7); break
    case "MONTHLY": d.setMonth(d.getMonth() + 1); break
    case "YEARLY": d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().slice(0, 10)
}

export async function executeRecurringTransactions(): Promise<void> {
  try {
    const transactions = await getRecurringTransactions()
    const today = new Date().toISOString().slice(0, 10)

    for (const t of transactions) {
      if (!t.is_active) continue
      if (t.next_execution > today) continue

      await createTransaction({
        account_id: t.account_id,
        category_id: t.category_id,
        type: t.type,
        amount: t.amount,
        description: t.description ? `[Recorrente] ${t.description}` : `[Recorrente] ${t.type}`,
        transaction_date: today,
        is_recurring: true,
      })

      const nextDate = calcNextExecution(today, t.frequency)

      await supabase
        .from("recurring_transactions")
        .update({
          next_execution: nextDate,
          last_execution: today,
        })
        .eq("id", t.id)

      createNotification(
        "RECURRING_DUE",
        "Transacção Recorrente Executada",
        `A transacção "${t.description ?? t.type}" de ${t.amount} MZN foi executada automaticamente.`,
      )
    }
  } catch (e) {
    logger.warn("Failed to execute recurring transactions", { error: e })
  }
}

export async function checkRecurringTransactions(): Promise<void> {
  try {
    const transactions = await getRecurringTransactions()
    const today = new Date()
    const threeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    for (const t of transactions) {
      if (!t.is_active) continue
      if (t.next_execution && t.next_execution <= threeDays && t.next_execution >= today.toISOString().slice(0, 10)) {
        createNotification(
          "RECURRING_DUE",
          "Transacção Recorrente Próxima",
          `A transacção "${t.description ?? t.type}" de ${t.amount} MZN está agendada para ${t.next_execution}.`,
        )
      }
    }
  } catch (e) {
    logger.warn("Failed to check recurring transactions", { error: e })
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
