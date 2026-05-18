import { logger } from "./logger"
import { handleError } from "./errors"
import type { Account } from "@/types"

const ENTITY = "admin"

export interface AdminUser {
  id: string
  full_name: string
  email: string
  accounts_count: number
  total_balance: number
  created_at: string
  status: "active" | "inactive"
}

export async function getAdminAccounts(): Promise<Account[]> {
  try {
    logger.info("Fetching admin accounts")
    const res = await fetch("/api/admin/accounts")
    if (!res.ok) throw new Error("Falha ao carregar contas")
    return await res.json()
  } catch (e) {
    return handleError(ENTITY, "listar contas", e)
  }
}

export interface AdminStats {
  total_users: number
  total_accounts: number
  total_transactions: number
  total_balance: number
  active_users: number
  total_loans: number
  monthly_growth: number
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    logger.info("Fetching admin stats")
    const res = await fetch("/api/admin/stats")
    if (!res.ok) throw new Error("Falha ao carregar estatisticas")
    return await res.json()
  } catch (e) {
    return handleError(ENTITY, "estatisticas", e)
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    logger.info("Fetching admin users")
    const res = await fetch("/api/admin/users")
    if (!res.ok) throw new Error("Falha ao carregar utilizadores")
    return await res.json()
  } catch (e) {
    return handleError(ENTITY, "listar utilizadores", e)
  }
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  try {
    logger.info("Fetching admin user", { id })
    const res = await fetch(`/api/admin/users?id=${id}`)
    if (!res.ok) throw new Error("Falha ao carregar utilizador")
    const users: AdminUser[] = await res.json()
    return users.find((u) => u.id === id) ?? null
  } catch (e) {
    return handleError(ENTITY, "buscar utilizador", e)
  }
}
