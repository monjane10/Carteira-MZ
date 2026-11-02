import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import { createNotification } from "./notifications"
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")
    const { data: result, error } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
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

    if (data.initial_balance > 0) {
      await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: result.id,
        type: "INCOME",
        amount: data.initial_balance,
        description: "Saldo inicial",
        transaction_date: new Date().toISOString(),
      })
    }

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
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (token) {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        logger.info("Deleted account via API", { id })
        return
      }
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Erro ao remover conta pelo servidor")
    }

    // Fallback client-side (se nao houver sessao)
    const checkError = (label: string, result: { error: unknown }) => {
      if (result.error) throw new Error(`Erro ao eliminar ${label}: ${String(result.error)}`)
    }

    checkError("contribuições de metas", await supabase.from("goal_contributions").delete().eq("account_id", id))
    const loanIds = (await supabase.from("loans").select("id").eq("account_id", id)).data?.map(l => l.id) ?? []
    if (loanIds.length > 0) {
      checkError("pagamentos de empréstimos", await supabase.from("loan_payments").delete().in("loan_id", loanIds))
    }
    checkError("metas", await supabase.from("goals").delete().eq("account_id", id))
    checkError("empréstimos", await supabase.from("loans").delete().eq("account_id", id))
    checkError("transacções recorrentes", await supabase.from("recurring_transactions").delete().eq("account_id", id))
    checkError("transferências (origem)", await supabase.from("transfers").delete().eq("from_account_id", id))
    checkError("transferências (destino)", await supabase.from("transfers").delete().eq("to_account_id", id))
    checkError("transacções", await supabase.from("transactions").delete().eq("account_id", id))

    const { error } = await supabase.from("accounts").delete().eq("id", id)
    if (error) throw error
    logger.info("Deleted account", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}

const LOW_BALANCE_STORAGE_KEY = "carteira-mz-low-balance-notified"
const LOW_BALANCE_COOLDOWN_MS = 24 * 60 * 60 * 1000

function readLowBalanceNotified(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(LOW_BALANCE_STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function saveLowBalanceNotified(notified: Record<string, number>) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOW_BALANCE_STORAGE_KEY, JSON.stringify(notified))
}

// Notifica uma vez quando o saldo fica baixo e, no máximo, uma vez por dia enquanto se mantiver baixo.
export async function checkLowBalances(threshold = 500): Promise<void> {
  try {
    const accounts = await getAccounts()
    const notified = readLowBalanceNotified()
    const now = Date.now()

    for (const account of accounts) {
      const isLow = account.is_active && account.balance < threshold
      if (!isLow) {
        delete notified[account.id]
        continue
      }
      const last = notified[account.id]
      if (last && now - last < LOW_BALANCE_COOLDOWN_MS) continue

      await createNotification(
        "LOW_BALANCE",
        `Saldo baixo em ${account.name}`,
        `O saldo da sua conta ${account.name} está abaixo de ${threshold} MZN (${account.balance} MZN). Considere fazer um depósito.`,
        `/contas/${account.id}`,
      )
      notified[account.id] = now
    }

    saveLowBalanceNotified(notified)
  } catch (e) {
    logger.warn("Failed to check low balances", { error: e })
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
