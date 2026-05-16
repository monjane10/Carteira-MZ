import { type Budget } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

const now = new Date()
const y = now.getFullYear()
const m = now.getMonth()

function monthStart(year: number, month: number): string {
  return new Date(year, month, 1).toISOString()
}

function monthEnd(year: number, month: number): string {
  return new Date(year, month + 1, 0, 23, 59, 59).toISOString()
}

let budgets: Budget[] = [
  {
    id: "budget_001",
    user_id: MOCK_USER_ID,
    category_id: "cat_alimentacao",
    amount_limit: 15000,
    period: "MONTHLY",
    start_date: monthStart(y, m),
    end_date: monthEnd(y, m),
    created_at: monthStart(y, m),
    updated_at: monthStart(y, m),
    spent: 11050,
  },
  {
    id: "budget_002",
    user_id: MOCK_USER_ID,
    category_id: "cat_transporte",
    amount_limit: 5000,
    period: "MONTHLY",
    start_date: monthStart(y, m),
    end_date: monthEnd(y, m),
    created_at: monthStart(y, m),
    updated_at: monthStart(y, m),
    spent: 2650,
  },
  {
    id: "budget_003",
    user_id: MOCK_USER_ID,
    category_id: "cat_lazer",
    amount_limit: 8000,
    period: "MONTHLY",
    start_date: monthStart(y, m),
    end_date: monthEnd(y, m),
    created_at: monthStart(y, m),
    updated_at: monthStart(y, m),
    spent: 5000,
  },
  {
    id: "budget_004",
    user_id: MOCK_USER_ID,
    category_id: "cat_saude",
    amount_limit: 5000,
    period: "MONTHLY",
    start_date: monthStart(y, m),
    end_date: monthEnd(y, m),
    created_at: monthStart(y, m),
    updated_at: monthStart(y, m),
    spent: 2500,
  },
  {
    id: "budget_005",
    user_id: MOCK_USER_ID,
    category_id: "cat_assinaturas",
    amount_limit: 2000,
    period: "MONTHLY",
    start_date: monthStart(y, m),
    end_date: monthEnd(y, m),
    created_at: monthStart(y, m),
    updated_at: monthStart(y, m),
    spent: 1950,
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getBudgets(): Promise<Budget[]> {
  await delay()
  return [...budgets]
}

export async function createBudget(
  data: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Budget> {
  await delay()
  const now = new Date().toISOString()
  const budget: Budget = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: now,
    updated_at: now,
  }
  budgets.push(budget)
  return budget
}

export async function updateBudget(
  id: string,
  data: Partial<Omit<Budget, "id" | "user_id" | "created_at">>
): Promise<Budget | null> {
  await delay()
  const index = budgets.findIndex((b) => b.id === id)
  if (index === -1) return null
  budgets[index] = {
    ...budgets[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return budgets[index]
}

export async function deleteBudget(id: string): Promise<boolean> {
  await delay()
  const index = budgets.findIndex((b) => b.id === id)
  if (index === -1) return false
  budgets.splice(index, 1)
  return true
}
