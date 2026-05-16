import { type Loan, type LoanPayment } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

let loans: Loan[] = [
  {
    id: "loan_001",
    user_id: MOCK_USER_ID,
    account_id: "acc_cash",
    person_name: "Carlos Tembe",
    phone: "+258 84 123 4567",
    type: "GIVEN",
    total_amount: 15000,
    paid_amount: 5000,
    remaining_amount: 10000,
    interest_amount: 0,
    description: "Empréstimo para negócio de frutas",
    due_date: "2026-08-15T00:00:00Z",
    status: "PARTIALLY_PAID",
    created_at: "2026-02-10T09:00:00Z",
    updated_at: "2026-05-01T14:00:00Z",
  },
  {
    id: "loan_002",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    person_name: "Maria Langa",
    phone: "+258 82 987 6543",
    type: "GIVEN",
    total_amount: 8000,
    paid_amount: 8000,
    remaining_amount: 0,
    interest_amount: 500,
    description: "Empréstimo para material escolar",
    due_date: "2026-04-01T00:00:00Z",
    status: "PAID",
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-03-28T16:00:00Z",
  },
  {
    id: "loan_003",
    user_id: MOCK_USER_ID,
    account_id: "acc_bim",
    person_name: "João Sitoe",
    phone: "+258 84 555 7890",
    type: "TAKEN",
    total_amount: 30000,
    paid_amount: 12000,
    remaining_amount: 18000,
    interest_amount: 2000,
    description: "Empréstimo para reforma da casa",
    due_date: "2026-12-01T00:00:00Z",
    status: "PARTIALLY_PAID",
    created_at: "2026-01-05T08:00:00Z",
    updated_at: "2026-05-10T11:00:00Z",
  },
  {
    id: "loan_004",
    user_id: MOCK_USER_ID,
    account_id: "acc_mpesa",
    person_name: "Ana Nhampossa",
    phone: "+258 86 321 0987",
    type: "GIVEN",
    total_amount: 5000,
    paid_amount: 0,
    remaining_amount: 5000,
    interest_amount: 0,
    description: "Empréstimo para tratamento médico",
    due_date: "2026-06-20T00:00:00Z",
    status: "PENDING",
    created_at: "2026-05-10T12:00:00Z",
    updated_at: "2026-05-10T12:00:00Z",
  },
  {
    id: "loan_005",
    user_id: MOCK_USER_ID,
    account_id: null,
    person_name: "Banco BIM",
    phone: null,
    type: "TAKEN",
    total_amount: 50000,
    paid_amount: 30000,
    remaining_amount: 20000,
    interest_amount: 8500,
    description: "Crédito pessoal - Carro",
    due_date: "2026-09-10T00:00:00Z",
    status: "PARTIALLY_PAID",
    created_at: "2025-06-10T08:00:00Z",
    updated_at: "2026-05-05T09:00:00Z",
  },
]

let loanPayments: LoanPayment[] = [
  {
    id: "lp_001",
    loan_id: "loan_001",
    amount: 5000,
    payment_date: "2026-03-15T10:00:00Z",
    notes: "Primeira parcela",
    created_at: "2026-03-15T10:00:00Z",
  },
  {
    id: "lp_002",
    loan_id: "loan_002",
    amount: 4000,
    payment_date: "2026-02-15T10:00:00Z",
    notes: "Primeira parcela",
    created_at: "2026-02-15T10:00:00Z",
  },
  {
    id: "lp_003",
    loan_id: "loan_002",
    amount: 4500,
    payment_date: "2026-03-25T10:00:00Z",
    notes: "Segunda e última parcela com juros",
    created_at: "2026-03-25T10:00:00Z",
  },
  {
    id: "lp_004",
    loan_id: "loan_003",
    amount: 6000,
    payment_date: "2026-02-05T09:00:00Z",
    notes: "Primeira parcela",
    created_at: "2026-02-05T09:00:00Z",
  },
  {
    id: "lp_005",
    loan_id: "loan_003",
    amount: 6000,
    payment_date: "2026-04-05T09:00:00Z",
    notes: "Segunda parcela",
    created_at: "2026-04-05T09:00:00Z",
  },
  {
    id: "lp_006",
    loan_id: "loan_005",
    amount: 10000,
    payment_date: "2025-09-10T08:00:00Z",
    notes: "Primeira parcela",
    created_at: "2025-09-10T08:00:00Z",
  },
  {
    id: "lp_007",
    loan_id: "loan_005",
    amount: 10000,
    payment_date: "2025-12-10T08:00:00Z",
    notes: "Segunda parcela",
    created_at: "2025-12-10T08:00:00Z",
  },
  {
    id: "lp_008",
    loan_id: "loan_005",
    amount: 10000,
    payment_date: "2026-03-10T08:00:00Z",
    notes: "Terceira parcela",
    created_at: "2026-03-10T08:00:00Z",
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getLoans(): Promise<Loan[]> {
  await delay()
  return [...loans].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getLoanById(id: string): Promise<Loan | null> {
  await delay()
  return loans.find((l) => l.id === id) ?? null
}

export async function createLoan(
  data: Omit<Loan, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Loan> {
  await delay()
  const now = new Date().toISOString()
  const loan: Loan = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: now,
    updated_at: now,
  }
  loans.push(loan)
  return loan
}

export async function updateLoan(
  id: string,
  data: Partial<Omit<Loan, "id" | "user_id" | "created_at">>
): Promise<Loan | null> {
  await delay()
  const index = loans.findIndex((l) => l.id === id)
  if (index === -1) return null
  loans[index] = {
    ...loans[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return loans[index]
}

export async function deleteLoan(id: string): Promise<boolean> {
  await delay()
  const index = loans.findIndex((l) => l.id === id)
  if (index === -1) return false
  loans.splice(index, 1)
  loanPayments = loanPayments.filter((p) => p.loan_id !== id)
  return true
}

export async function getLoanPayments(loanId: string): Promise<LoanPayment[]> {
  await delay()
  return loanPayments
    .filter((p) => p.loan_id === loanId)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
}

export async function createLoanPayment(
  loanId: string,
  data: Omit<LoanPayment, "id" | "loan_id" | "created_at">
): Promise<LoanPayment | null> {
  await delay()
  const loan = loans.find((l) => l.id === loanId)
  if (!loan) return null

  const now = new Date().toISOString()
  const payment: LoanPayment = {
    ...data,
    id: generateId(),
    loan_id: loanId,
    created_at: now,
  }
  loanPayments.push(payment)

  loan.paid_amount += data.amount
  loan.remaining_amount = Math.max(0, loan.total_amount - loan.paid_amount)
  if (loan.remaining_amount === 0) {
    loan.status = "PAID"
  } else {
    loan.status = "PARTIALLY_PAID"
  }
  loan.updated_at = now

  return payment
}
