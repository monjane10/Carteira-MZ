import { type Transaction } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

const now = new Date()
const y = now.getFullYear()
const m = now.getMonth()

function dateStr(year: number, month: number, day: number): string {
  const d = new Date(year, month, day, Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
  return d.toISOString()
}

function subMonths(n: number): number {
  const d = new Date(y, m - n, 1)
  return d.getMonth()
}

function subYear(n: number): number {
  return n === 0 ? y : y - 1
}

let transactions: Transaction[] = [
  {
    id: "tx_001",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_salario",
    type: "INCOME",
    amount: 85000,
    description: "Salário Maio 2026",
    reference_code: "SAL-2026-05",
    transaction_date: dateStr(y, m, 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(y, m, 5),
    updated_at: dateStr(y, m, 5),
  },
  {
    id: "tx_002",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_freelance",
    type: "INCOME",
    amount: 15000,
    description: "Projecto Web - Cliente XYZ",
    reference_code: null,
    transaction_date: dateStr(y, m, 3),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 3),
    updated_at: dateStr(y, m, 3),
  },
  {
    id: "tx_003",
    user_id: MOCK_USER_ID,
    account_id: "acc_mpesa",
    category_id: "cat_alimentacao",
    type: "EXPENSE",
    amount: 850,
    description: "Almoço no Shoprite",
    reference_code: null,
    transaction_date: dateStr(y, m, 2),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 2),
    updated_at: dateStr(y, m, 2),
  },
  {
    id: "tx_004",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_moradia",
    type: "EXPENSE",
    amount: 12000,
    description: "Renda do Apartamento",
    reference_code: "RENDA-05",
    transaction_date: dateStr(y, m, 1),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(y, m, 1),
    updated_at: dateStr(y, m, 1),
  },
  {
    id: "tx_005",
    user_id: MOCK_USER_ID,
    account_id: "acc_mpesa",
    category_id: "cat_transporte",
    type: "EXPENSE",
    amount: 150,
    description: "Transporte público (chapa)",
    reference_code: null,
    transaction_date: dateStr(y, m, 4),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 4),
    updated_at: dateStr(y, m, 4),
  },
  {
    id: "tx_006",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_utilidades",
    type: "EXPENSE",
    amount: 2500,
    description: "Factura Electricidade - EDM",
    reference_code: "EDM-202605",
    transaction_date: dateStr(y, m, 8),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(y, m, 8),
    updated_at: dateStr(y, m, 8),
  },
  {
    id: "tx_007",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_assinaturas",
    type: "EXPENSE",
    amount: 1200,
    description: "Netflix + Spotify + YouTube Premium",
    reference_code: null,
    transaction_date: dateStr(y, m, 10),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(y, m, 10),
    updated_at: dateStr(y, m, 10),
  },
  {
    id: "tx_008",
    user_id: MOCK_USER_ID,
    account_id: "acc_cash",
    category_id: "cat_alimentacao",
    type: "EXPENSE",
    amount: 3400,
    description: "Compras semanais no Mercado",
    reference_code: null,
    transaction_date: dateStr(y, m, 6),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 6),
    updated_at: dateStr(y, m, 6),
  },
  {
    id: "tx_009",
    user_id: MOCK_USER_ID,
    account_id: "acc_poupanca",
    category_id: "cat_investimentos",
    type: "INCOME",
    amount: 5000,
    description: "Depósito Poupança Maio",
    reference_code: "DEP-05-2026",
    transaction_date: dateStr(y, m, 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(y, m, 5),
    updated_at: dateStr(y, m, 5),
  },
  {
    id: "tx_010",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_alimentacao",
    type: "EXPENSE",
    amount: 6700,
    description: "Jantar no Restaurante do Gil",
    reference_code: null,
    transaction_date: dateStr(y, m, 12),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 12),
    updated_at: dateStr(y, m, 12),
  },
  {
    id: "tx_011",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_saude",
    type: "EXPENSE",
    amount: 2500,
    description: "Consulta médica - Clínica Sommerschield",
    reference_code: "CONS-0512",
    transaction_date: dateStr(y, m, 11),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 11),
    updated_at: dateStr(y, m, 11),
  },
  {
    id: "tx_012",
    user_id: MOCK_USER_ID,
    account_id: "acc_emola",
    category_id: "cat_transporte",
    type: "EXPENSE",
    amount: 2000,
    description: "Gasolina",
    reference_code: null,
    transaction_date: dateStr(y, m, 9),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(y, m, 9),
    updated_at: dateStr(y, m, 9),
  },
  {
    id: "tx_013",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_salario",
    type: "INCOME",
    amount: 85000,
    description: "Salário Abril 2026",
    reference_code: "SAL-2026-04",
    transaction_date: dateStr(subYear(0), subMonths(1), 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 5),
    updated_at: dateStr(subYear(0), subMonths(1), 5),
  },
  {
    id: "tx_014",
    user_id: MOCK_USER_ID,
    account_id: "acc_mpesa",
    category_id: "cat_freelance",
    type: "INCOME",
    amount: 8000,
    description: "Design gráfico - Logótipo",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(1), 15),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 15),
    updated_at: dateStr(subYear(0), subMonths(1), 15),
  },
  {
    id: "tx_015",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_moradia",
    type: "EXPENSE",
    amount: 12000,
    description: "Renda do Apartamento",
    reference_code: "RENDA-04",
    transaction_date: dateStr(subYear(0), subMonths(1), 1),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 1),
    updated_at: dateStr(subYear(0), subMonths(1), 1),
  },
  {
    id: "tx_016",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_utilidades",
    type: "EXPENSE",
    amount: 2300,
    description: "Factura Água - FIPAG",
    reference_code: "FIPAG-202604",
    transaction_date: dateStr(subYear(0), subMonths(1), 8),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 8),
    updated_at: dateStr(subYear(0), subMonths(1), 8),
  },
  {
    id: "tx_017",
    user_id: MOCK_USER_ID,
    account_id: "acc_cash",
    category_id: "cat_lazer",
    type: "EXPENSE",
    amount: 5000,
    description: "Fim-de-semana na Praia do Bilene",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(1), 20),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 20),
    updated_at: dateStr(subYear(0), subMonths(1), 20),
  },
  {
    id: "tx_018",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_educacao",
    type: "EXPENSE",
    amount: 6000,
    description: "Curso Online - Programação Web",
    reference_code: "UDEMY-2026",
    transaction_date: dateStr(subYear(0), subMonths(1), 12),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 12),
    updated_at: dateStr(subYear(0), subMonths(1), 12),
  },
  {
    id: "tx_019",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_salario",
    type: "INCOME",
    amount: 82000,
    description: "Salário Março 2026",
    reference_code: "SAL-2026-03",
    transaction_date: dateStr(subYear(0), subMonths(2), 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 5),
    updated_at: dateStr(subYear(0), subMonths(2), 5),
  },
  {
    id: "tx_020",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_moradia",
    type: "EXPENSE",
    amount: 12000,
    description: "Renda do Apartamento",
    reference_code: "RENDA-03",
    transaction_date: dateStr(subYear(0), subMonths(2), 1),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 1),
    updated_at: dateStr(subYear(0), subMonths(2), 1),
  },
  {
    id: "tx_021",
    user_id: MOCK_USER_ID,
    account_id: "acc_mpesa",
    category_id: "cat_compras",
    type: "EXPENSE",
    amount: 4500,
    description: "Roupas - Mcel Digital",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(2), 18),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 18),
    updated_at: dateStr(subYear(0), subMonths(2), 18),
  },
  {
    id: "tx_022",
    user_id: MOCK_USER_ID,
    account_id: "acc_cash",
    category_id: "cat_alimentacao",
    type: "EXPENSE",
    amount: 2800,
    description: "Feira de organicos",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(2), 10),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 10),
    updated_at: dateStr(subYear(0), subMonths(2), 10),
  },
  {
    id: "tx_023",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_lazer",
    type: "EXPENSE",
    amount: 3500,
    description: "Cinema + Jantar",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(2), 25),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 25),
    updated_at: dateStr(subYear(0), subMonths(2), 25),
  },
  {
    id: "tx_024",
    user_id: MOCK_USER_ID,
    account_id: "acc_emola",
    category_id: "cat_utilidades",
    type: "EXPENSE",
    amount: 1800,
    description: "Recarga de Internet - Vodacom",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(2), 15),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 15),
    updated_at: dateStr(subYear(0), subMonths(2), 15),
  },
  {
    id: "tx_025",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_salario",
    type: "INCOME",
    amount: 82000,
    description: "Salário Fevereiro 2026",
    reference_code: "SAL-2026-02",
    transaction_date: dateStr(subYear(0), subMonths(3), 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(3), 5),
    updated_at: dateStr(subYear(0), subMonths(3), 5),
  },
  {
    id: "tx_026",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_moradia",
    type: "EXPENSE",
    amount: 12000,
    description: "Renda do Apartamento",
    reference_code: "RENDA-02",
    transaction_date: dateStr(subYear(0), subMonths(3), 1),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(3), 1),
    updated_at: dateStr(subYear(0), subMonths(3), 1),
  },
  {
    id: "tx_027",
    user_id: MOCK_USER_ID,
    account_id: "acc_poupanca",
    category_id: "cat_investimentos",
    type: "INCOME",
    amount: 10000,
    description: "Depósito Poupança - Bônus Anual",
    reference_code: "BONUS-2026",
    transaction_date: dateStr(subYear(0), subMonths(3), 20),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(3), 20),
    updated_at: dateStr(subYear(0), subMonths(3), 20),
  },
  {
    id: "tx_028",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_saude",
    type: "EXPENSE",
    amount: 1200,
    description: "Farmácia - Medicamentos",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(3), 14),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(3), 14),
    updated_at: dateStr(subYear(0), subMonths(3), 14),
  },
  {
    id: "tx_029",
    user_id: MOCK_USER_ID,
    account_id: "acc_mpesa",
    category_id: "cat_assinaturas",
    type: "EXPENSE",
    amount: 750,
    description: "Assinatura M-Pesa (pacote mensal)",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(3), 1),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(3), 1),
    updated_at: dateStr(subYear(0), subMonths(3), 1),
  },
  {
    id: "tx_030",
    user_id: MOCK_USER_ID,
    account_id: "acc_cash",
    category_id: "cat_presente",
    type: "INCOME",
    amount: 3000,
    description: "Aniversário - Presente da família",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(3), 8),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(3), 8),
    updated_at: dateStr(subYear(0), subMonths(3), 8),
  },
  {
    id: "tx_031",
    user_id: MOCK_USER_ID,
    account_id: "acc_emola",
    category_id: "cat_transporte",
    type: "EXPENSE",
    amount: 500,
    description: "Taxa de levantamento e-Mola",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(2), 5),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 5),
    updated_at: dateStr(subYear(0), subMonths(2), 5),
  },
  {
    id: "tx_032",
    user_id: MOCK_USER_ID,
    account_id: "acc_poupanca",
    category_id: "cat_investimentos",
    type: "INCOME",
    amount: 5000,
    description: "Depósito Poupança Abril",
    reference_code: "DEP-04-2026",
    transaction_date: dateStr(subYear(0), subMonths(1), 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 5),
    updated_at: dateStr(subYear(0), subMonths(1), 5),
  },
  {
    id: "tx_033",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    category_id: "cat_compras",
    type: "EXPENSE",
    amount: 8900,
    description: "Telemóvel novo - Xiaomi",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(1), 22),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(1), 22),
    updated_at: dateStr(subYear(0), subMonths(1), 22),
  },
  {
    id: "tx_034",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_educacao",
    type: "EXPENSE",
    amount: 3500,
    description: "Material escolar - Filho",
    reference_code: null,
    transaction_date: dateStr(subYear(0), subMonths(2), 7),
    is_recurring: false,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(2), 7),
    updated_at: dateStr(subYear(0), subMonths(2), 7),
  },
  {
    id: "tx_035",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    category_id: "cat_salario",
    type: "INCOME",
    amount: 82000,
    description: "Salário Janeiro 2026",
    reference_code: "SAL-2026-01",
    transaction_date: dateStr(subYear(0), subMonths(4), 5),
    is_recurring: true,
    attachment_url: null,
    created_at: dateStr(subYear(0), subMonths(4), 5),
    updated_at: dateStr(subYear(0), subMonths(4), 5),
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getTransactions(): Promise<Transaction[]> {
  await delay()
  return [...transactions].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  )
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  await delay()
  return transactions.find((t) => t.id === id) ?? null
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Transaction> {
  await delay()
  const now = new Date().toISOString()
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: now,
    updated_at: now,
  }
  transactions.push(transaction)
  return transaction
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>
): Promise<Transaction | null> {
  await delay()
  const index = transactions.findIndex((t) => t.id === id)
  if (index === -1) return null
  transactions[index] = {
    ...transactions[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return transactions[index]
}

export async function deleteTransaction(id: string): Promise<boolean> {
  await delay()
  const index = transactions.findIndex((t) => t.id === id)
  if (index === -1) return false
  transactions.splice(index, 1)
  return true
}

export async function getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  await delay()
  return transactions
    .filter((t) => t.account_id === accountId)
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  await delay()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return transactions
    .filter((t) => {
      const d = new Date(t.transaction_date).getTime()
      return d >= start && d <= end
    })
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  await delay()
  return [...transactions]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, limit)
}
