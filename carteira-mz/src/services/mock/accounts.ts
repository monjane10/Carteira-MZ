import { type Account } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

let accounts: Account[] = [
  {
    id: "acc_bci",
    user_id: MOCK_USER_ID,
    institution_id: null,
    name: "BCI",
    type: "BANK",
    currency: "MZN",
    balance: 45000,
    initial_balance: 10000,
    color: "#0F172A",
    icon: "building-bank",
    is_active: true,
    created_at: "2025-01-10T08:00:00Z",
    updated_at: "2026-05-15T14:30:00Z",
  },
  {
    id: "acc_bim",
    user_id: MOCK_USER_ID,
    institution_id: null,
    name: "BIM",
    type: "BANK",
    currency: "MZN",
    balance: 23750,
    initial_balance: 5000,
    color: "#1E293B",
    icon: "building-bank",
    is_active: true,
    created_at: "2025-02-05T09:00:00Z",
    updated_at: "2026-05-14T16:45:00Z",
  },
  {
    id: "acc_mpesa",
    user_id: MOCK_USER_ID,
    institution_id: null,
    name: "M-Pesa",
    type: "MOBILE_MONEY",
    currency: "MZN",
    balance: 8340,
    initial_balance: 0,
    color: "#10B981",
    icon: "smartphone",
    is_active: true,
    created_at: "2025-03-01T10:00:00Z",
    updated_at: "2026-05-16T08:15:00Z",
  },
  {
    id: "acc_emola",
    user_id: MOCK_USER_ID,
    institution_id: null,
    name: "e-Mola",
    type: "MOBILE_MONEY",
    currency: "MZN",
    balance: 3200,
    initial_balance: 0,
    color: "#059669",
    icon: "smartphone",
    is_active: true,
    created_at: "2025-03-15T11:00:00Z",
    updated_at: "2026-05-12T09:30:00Z",
  },
  {
    id: "acc_cash",
    user_id: MOCK_USER_ID,
    institution_id: null,
    name: "Dinheiro",
    type: "CASH",
    currency: "MZN",
    balance: 12500,
    initial_balance: 3000,
    color: "#F59E0B",
    icon: "wallet",
    is_active: true,
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2026-05-16T07:00:00Z",
  },
  {
    id: "acc_poupanca",
    user_id: MOCK_USER_ID,
    institution_id: null,
    name: "Poupança",
    type: "SAVINGS",
    currency: "MZN",
    balance: 100000,
    initial_balance: 20000,
    color: "#334155",
    icon: "piggy-bank",
    is_active: true,
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2026-05-10T12:00:00Z",
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 201) + 200
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getAccounts(): Promise<Account[]> {
  await delay()
  return [...accounts]
}

export async function getAccountById(id: string): Promise<Account | null> {
  await delay()
  return accounts.find((a) => a.id === id) ?? null
}

export async function createAccount(
  data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Account> {
  await delay()
  const now = new Date().toISOString()
  const account: Account = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: now,
    updated_at: now,
  }
  accounts.push(account)
  return account
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<Account, "id" | "user_id" | "created_at">>
): Promise<Account | null> {
  await delay()
  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) return null
  accounts[index] = {
    ...accounts[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return accounts[index]
}

export async function deleteAccount(id: string): Promise<boolean> {
  await delay()
  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) return false
  accounts.splice(index, 1)
  return true
}

export async function getAccountsSummary(): Promise<{ totalBalance: number; accounts: Account[] }> {
  await delay()
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  return { totalBalance, accounts: [...accounts] }
}
