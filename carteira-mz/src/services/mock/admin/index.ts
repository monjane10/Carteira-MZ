export interface AdminUser {
  id: string
  full_name: string
  email: string
  accounts_count: number
  total_balance: number
  created_at: string
  status: "active" | "inactive"
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

export const ADMIN_CREDENTIALS = {
  email: "admin@carteiramz.co.mz",
  password: "admin123",
}

const mockUsers: AdminUser[] = [
  { id: "u1", full_name: "Lourenço Monjane", email: "lourenco@email.com", accounts_count: 4, total_balance: 192790, created_at: "2025-01-10T08:00:00Z", status: "active" },
  { id: "u2", full_name: "Maria Silva", email: "maria@email.com", accounts_count: 2, total_balance: 85000, created_at: "2025-02-15T10:00:00Z", status: "active" },
  { id: "u3", full_name: "João Tembe", email: "joao@email.com", accounts_count: 3, total_balance: 124500, created_at: "2025-03-01T09:00:00Z", status: "active" },
  { id: "u4", full_name: "Ana Macamo", email: "ana@email.com", accounts_count: 1, total_balance: 32000, created_at: "2025-03-20T11:00:00Z", status: "active" },
  { id: "u5", full_name: "Carlos Matsinhe", email: "carlos@email.com", accounts_count: 2, total_balance: 67000, created_at: "2025-04-05T14:00:00Z", status: "inactive" },
  { id: "u6", full_name: "Helena Nkosi", email: "helena@email.com", accounts_count: 5, total_balance: 210000, created_at: "2025-04-12T08:00:00Z", status: "active" },
  { id: "u7", full_name: "Pedro Guambe", email: "pedro@email.com", accounts_count: 1, total_balance: 15000, created_at: "2025-05-01T10:00:00Z", status: "active" },
  { id: "u8", full_name: "Sofia Cossa", email: "sofia@email.com", accounts_count: 3, total_balance: 95000, created_at: "2025-05-18T09:00:00Z", status: "inactive" },
  { id: "u9", full_name: "Mário Sitoe", email: "mario@email.com", accounts_count: 2, total_balance: 78000, created_at: "2025-06-01T11:00:00Z", status: "active" },
  { id: "u10", full_name: "Isabel Langa", email: "isabel@email.com", accounts_count: 1, total_balance: 43000, created_at: "2025-06-15T15:00:00Z", status: "active" },
]

const stats: AdminStats = {
  total_users: 10,
  total_accounts: 24,
  total_transactions: 156,
  total_balance: 940290,
  active_users: 8,
  total_loans: 12,
  monthly_growth: 15.3,
}

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getAdminStats(): Promise<AdminStats> {
  await delay()
  return { ...stats }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await delay()
  return [...mockUsers]
}

export async function getAdminUserById(id: string): Promise<AdminUser | undefined> {
  await delay()
  return mockUsers.find(u => u.id === id)
}
