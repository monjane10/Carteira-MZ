import { type Category } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

let categories: Category[] = [
  {
    id: "cat_salario",
    user_id: MOCK_USER_ID,
    name: "Salário",
    type: "INCOME",
    icon: "briefcase",
    color: "#10B981",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_freelance",
    user_id: MOCK_USER_ID,
    name: "Freelance",
    type: "INCOME",
    icon: "laptop",
    color: "#3B82F6",
    is_default: false,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_investimentos",
    user_id: MOCK_USER_ID,
    name: "Investimentos",
    type: "INCOME",
    icon: "trending-up",
    color: "#8B5CF6",
    is_default: false,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_presente",
    user_id: MOCK_USER_ID,
    name: "Presente",
    type: "INCOME",
    icon: "gift",
    color: "#F472B6",
    is_default: false,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_outros_rendimentos",
    user_id: MOCK_USER_ID,
    name: "Outros Rendimentos",
    type: "INCOME",
    icon: "plus-circle",
    color: "#6B7280",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_alimentacao",
    user_id: MOCK_USER_ID,
    name: "Alimentação",
    type: "EXPENSE",
    icon: "utensils",
    color: "#F59E0B",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_transporte",
    user_id: MOCK_USER_ID,
    name: "Transporte",
    type: "EXPENSE",
    icon: "car",
    color: "#EF4444",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_saude",
    user_id: MOCK_USER_ID,
    name: "Saúde",
    type: "EXPENSE",
    icon: "heart-pulse",
    color: "#EC4899",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_educacao",
    user_id: MOCK_USER_ID,
    name: "Educação",
    type: "EXPENSE",
    icon: "book-open",
    color: "#6366F1",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_lazer",
    user_id: MOCK_USER_ID,
    name: "Lazer",
    type: "EXPENSE",
    icon: "gamepad-2",
    color: "#F97316",
    is_default: false,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_moradia",
    user_id: MOCK_USER_ID,
    name: "Moradia",
    type: "EXPENSE",
    icon: "home",
    color: "#14B8A6",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_utilidades",
    user_id: MOCK_USER_ID,
    name: "Utilidades",
    type: "EXPENSE",
    icon: "zap",
    color: "#EAB308",
    is_default: true,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_compras",
    user_id: MOCK_USER_ID,
    name: "Compras",
    type: "EXPENSE",
    icon: "shopping-bag",
    color: "#A855F7",
    is_default: false,
    created_at: "2025-01-01T08:00:00Z",
  },
  {
    id: "cat_assinaturas",
    user_id: MOCK_USER_ID,
    name: "Assinaturas",
    type: "EXPENSE",
    icon: "credit-card",
    color: "#64748B",
    is_default: false,
    created_at: "2025-01-01T08:00:00Z",
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getCategories(): Promise<Category[]> {
  await delay()
  return [...categories]
}

export async function getCategoryById(id: string): Promise<Category | null> {
  await delay()
  return categories.find((c) => c.id === id) ?? null
}

export async function createCategory(
  data: Omit<Category, "id" | "user_id" | "created_at">
): Promise<Category> {
  await delay()
  const category: Category = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: new Date().toISOString(),
  }
  categories.push(category)
  return category
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "user_id" | "created_at">>
): Promise<Category | null> {
  await delay()
  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) return null
  categories[index] = { ...categories[index], ...data }
  return categories[index]
}

export async function deleteCategory(id: string): Promise<boolean> {
  await delay()
  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) return false
  categories.splice(index, 1)
  return true
}
