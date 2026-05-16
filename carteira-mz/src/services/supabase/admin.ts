import { supabase } from "./client"
import { logger } from "./logger"
import { handleError } from "./errors"

export interface AdminStats {
  total_users: number
  total_accounts: number
  total_transactions: number
  total_balance: number
  active_users: number
  total_loans: number
  monthly_growth: number
}

export interface AdminUser {
  id: string
  full_name: string
  email: string
  accounts_count: number
  total_balance: number
  created_at: string
  status: "active" | "inactive"
}

const ENTITY = "admin"

export async function getAdminStats(): Promise<AdminStats> {
  try {
    logger.info("Fetching admin stats")

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    const { count: totalAccounts } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true })

    const { count: totalTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })

    const { count: totalLoans } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })

    const { data: accounts } = await supabase
      .from("accounts")
      .select("balance")
      .eq("is_active", true)
    const totalBalance = (accounts ?? []).reduce((s: number, a: { balance: number }) => s + a.balance, 0)

    const { data: activeAccounts } = await supabase
      .from("accounts")
      .select("user_id")
      .eq("is_active", true)
    const activeUserIds = new Set((activeAccounts ?? []).map((a: { user_id: string }) => a.user_id))

    return {
      total_users: totalUsers ?? 0,
      total_accounts: totalAccounts ?? 0,
      total_transactions: totalTransactions ?? 0,
      total_balance: totalBalance,
      active_users: activeUserIds.size,
      total_loans: totalLoans ?? 0,
      monthly_growth: 0,
    }
  } catch (e) {
    return handleError(ENTITY, "estatisticas", e)
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    logger.info("Fetching admin users")
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })

    const rows = (profiles ?? []) as { id: string; full_name: string | null; email: string | null; created_at: string }[]
    const result: AdminUser[] = []

    for (const p of rows) {
      const { data: userAccounts } = await supabase
        .from("accounts")
        .select("balance")
        .eq("user_id", p.id)

      const accList = (userAccounts ?? []) as { balance: number }[]
      const totalBalance = accList.reduce((s, a) => s + a.balance, 0)
      const hasActive = accList.length > 0

      result.push({
        id: p.id,
        full_name: p.full_name ?? "",
        email: p.email ?? "",
        accounts_count: accList.length,
        total_balance: totalBalance,
        created_at: p.created_at,
        status: hasActive ? "active" : "inactive",
      })
    }

    return result
  } catch (e) {
    return handleError(ENTITY, "listar utilizadores", e)
  }
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    if (!profile) return null

    const { data: userAccounts } = await supabase
      .from("accounts")
      .select("balance")
      .eq("user_id", id)

    const accList = (userAccounts ?? []) as { balance: number }[]
    const totalBalance = accList.reduce((s, a) => s + a.balance, 0)

    return {
      id: profile.id,
      full_name: profile.full_name ?? "",
      email: profile.email ?? "",
      accounts_count: accList.length,
      total_balance: totalBalance,
      created_at: profile.created_at,
      status: accList.length > 0 ? "active" : "inactive",
    }
  } catch (e) {
    return handleError(ENTITY, "buscar utilizador", e)
  }
}
