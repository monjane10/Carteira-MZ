import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import type { Account } from "@/types"

const ENTITY = "conta"

export async function getAccounts(): Promise<Account[]> {
  try {
    logger.info("Fetching accounts")
    const { data, error } = await supabase
      .from("accounts")
      .select("*, institution:financial_institutions(*)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Account[]
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getAccountById(id: string): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*, institution:financial_institutions(*)")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as unknown as Account
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

export async function createAccount(data: {
  name: string
  type: string
  balance: number
  initial_balance: number
  currency?: string
  color?: string | null
  icon?: string | null
  institution_id?: string | null
  is_active?: boolean
}): Promise<Account> {
  try {
    logger.info("Creating account", { name: data.name, type: data.type })
    const { data: result, error } = await supabase
      .from("accounts")
      .insert({
        name: data.name,
        type: data.type,
        balance: data.balance,
        initial_balance: data.initial_balance,
        currency: data.currency ?? "MZN",
        color: data.color ?? null,
        icon: data.icon ?? null,
        institution_id: data.institution_id ?? null,
        is_active: data.is_active ?? true,
      })
      .select("*, institution:financial_institutions(*)")
      .single()
    if (error) throw error
    return result as unknown as Account
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<Account, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<Account> {
  try {
    const { data: result, error } = await supabase
      .from("accounts")
      .update(data)
      .eq("id", id)
      .select("*, institution:financial_institutions(*)")
      .single()
    if (error) throw error
    if (!result) throw new NotFoundError(ENTITY, id)
    logger.info("Updated account", { id })
    return result as unknown as Account
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    await supabase.from("goal_contributions").delete().eq("account_id", id)
    await supabase.from("loan_payments").delete().in("loan_id", (await supabase.from("loans").select("id").eq("account_id", id)).data?.map(l => l.id) ?? [])
    await supabase.from("goals").delete().eq("account_id", id)
    await supabase.from("loans").delete().eq("account_id", id)
    await supabase.from("recurring_transactions").delete().eq("account_id", id)
    await supabase.from("transfers").delete().eq("from_account_id", id)
    await supabase.from("transfers").delete().eq("to_account_id", id)
    await supabase.from("transactions").delete().eq("account_id", id)
    const { error } = await supabase.from("accounts").delete().eq("id", id)
    if (error) throw error
    logger.info("Deleted account", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}

export async function getAccountsSummary(): Promise<{
  totalBalance: number
  accounts: Account[]
}> {
  try {
    const accounts = await getAccounts()
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
    return { totalBalance, accounts }
  } catch (e) {
    return handleError(ENTITY, "resumir", e)
  }
}
