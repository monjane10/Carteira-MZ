import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import { balanceDelta } from "./balance"
import type { Transaction, TransactionType } from "@/types"

const ENTITY = "transaccao"

export async function getTransactions(): Promise<Transaction[]> {
  try {
    logger.info("Fetching transactions")
    const { data, error } = await supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .order("transaction_date", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Transaction[]
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as unknown as Transaction
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

async function applyBalance(accountId: string, delta: number): Promise<void> {
  if (delta === 0) return
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single()
  if (!account) {
    logger.warn("Account not found for balance update", { accountId })
    return
  }
  const newBalance = (account.balance as number) + delta
  const { error } = await supabase
    .from("accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", accountId)
  if (error) logger.warn("Balance update failed", { accountId, delta, error: error.message })
}

export async function createTransaction(data: {
  account_id: string
  type: TransactionType
  amount: number
  category_id?: string | null
  description?: string | null
  reference_code?: string | null
  transaction_date?: string
  is_recurring?: boolean
  attachment_url?: string | null
}): Promise<Transaction> {
  try {
    logger.info("Creating transaction", { type: data.type, amount: data.amount })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")
    const { data: result, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        account_id: data.account_id,
        type: data.type,
        amount: data.amount,
        category_id: data.category_id ?? null,
        description: data.description ?? null,
        reference_code: data.reference_code ?? null,
        transaction_date: data.transaction_date ?? new Date().toISOString(),
        is_recurring: data.is_recurring ?? false,
        attachment_url: data.attachment_url ?? null,
      })
      .select("*, account:accounts(*), category:categories(*)")
      .single()
    if (error) throw error

    await applyBalance(data.account_id, balanceDelta(data.type, data.amount))
    logger.info("Transaction created", { id: result.id })
    return result as unknown as Transaction
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>,
): Promise<Transaction> {
  try {
    const old = await getTransactionById(id)
    if (!old) throw new NotFoundError(ENTITY, id)

    const newType = (data.type ?? old.type) as TransactionType
    const newAmount = data.amount ?? old.amount
    const newAccountId = data.account_id ?? old.account_id

    await applyBalance(old.account_id, -balanceDelta(old.type as TransactionType, old.amount))
    await applyBalance(newAccountId, balanceDelta(newType, newAmount))

    const { data: result, error } = await supabase
      .from("transactions")
      .update({
        account_id: newAccountId,
        type: newType,
        amount: newAmount,
        category_id: data.category_id ?? old.category_id,
        description: data.description ?? old.description,
        reference_code: data.reference_code ?? old.reference_code,
        transaction_date: data.transaction_date ?? old.transaction_date,
        is_recurring: data.is_recurring ?? old.is_recurring,
        attachment_url: data.attachment_url ?? old.attachment_url,
      })
      .eq("id", id)
      .select("*, account:accounts(*), category:categories(*)")
      .single()
    if (error) throw error

    logger.info("Transaction updated", { id })
    return result as unknown as Transaction
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const old = await getTransactionById(id)
    if (!old) throw new NotFoundError(ENTITY, id)

    const { error } = await supabase.from("transactions").delete().eq("id", id)
    if (error) throw error

    await applyBalance(old.account_id, -balanceDelta(old.type as TransactionType, old.amount))
    logger.info("Transaction deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}

export async function getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .eq("account_id", accountId)
      .order("transaction_date", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Transaction[]
  } catch (e) {
    return handleError(ENTITY, "listar por conta", e)
  }
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Transaction[]
  } catch (e) {
    return handleError(ENTITY, "listar por periodo", e)
  }
}

export async function getRecentTransactions(
  limit = 5,
  startDate?: string,
  endDate?: string,
): Promise<Transaction[]> {
  try {
    let query = supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
    if (startDate) {
      query = query.gte("transaction_date", startDate)
    }
    if (endDate) {
      query = query.lte("transaction_date", endDate)
    }
    const { data, error } = await query
      .order("transaction_date", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as unknown as Transaction[]
  } catch (e) {
    return handleError(ENTITY, "listar recentes", e)
  }
}
