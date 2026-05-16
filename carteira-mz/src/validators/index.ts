import { z } from "zod"

export const accountSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  type: z.enum(["BANK", "MOBILE_MONEY", "CASH", "SAVINGS", "INVESTMENT", "OTHER"]),
  institution_id: z.string().nullable().optional(),
  currency: z.string().default("MZN"),
  balance: z.number().min(0).default(0),
  initial_balance: z.number().default(0),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export const transactionSchema = z.object({
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().nullable().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "ADJUSTMENT", "LOAN_GIVEN", "LOAN_TAKEN", "LOAN_PAYMENT"]),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().nullable().optional(),
  reference_code: z.string().nullable().optional(),
  transaction_date: z.string().min(1, "Data é obrigatória"),
  is_recurring: z.boolean().default(false),
})

export const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "ADJUSTMENT", "LOAN_GIVEN", "LOAN_TAKEN", "LOAN_PAYMENT"]),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

export const transferSchema = z.object({
  from_account_id: z.string().min(1, "Conta de origem é obrigatória"),
  to_account_id: z.string().min(1, "Conta de destino é obrigatória"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  fee: z.number().min(0).default(0),
  description: z.string().nullable().optional(),
  transfer_date: z.string().min(1, "Data é obrigatória"),
})

export const loanSchema = z.object({
  account_id: z.string().nullable().optional(),
  person_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(150),
  phone: z.string().nullable().optional(),
  type: z.enum(["GIVEN", "TAKEN"]),
  total_amount: z.number().min(1, "Valor deve ser maior que zero"),
  paid_amount: z.number().min(0).default(0),
  interest_amount: z.number().min(0).default(0),
  description: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
})

export const loanPaymentSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  payment_date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().nullable().optional(),
})

export const goalSchema = z.object({
  account_id: z.string().nullable().optional(),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(150),
  description: z.string().nullable().optional(),
  target_amount: z.number().min(1, "Valor alvo deve ser maior que zero"),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
})

export const goalContributionSchema = z.object({
  account_id: z.string().nullable().optional(),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  contribution_date: z.string().min(1, "Data é obrigatória"),
})

export const budgetSchema = z.object({
  category_id: z.string().min(1, "Categoria é obrigatória"),
  amount_limit: z.number().min(1, "Limite deve ser maior que zero"),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de fim é obrigatória"),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(150),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirm_password: z.string().min(6, "Confirme a senha"),
}).refine(data => data.password === data.confirm_password, {
  message: "Senhas não coincidem",
  path: ["confirm_password"],
})

export type AccountFormData = z.infer<typeof accountSchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type TransferFormData = z.infer<typeof transferSchema>
export type LoanFormData = z.infer<typeof loanSchema>
export type LoanPaymentFormData = z.infer<typeof loanPaymentSchema>
export type GoalFormData = z.infer<typeof goalSchema>
export type GoalContributionFormData = z.infer<typeof goalContributionSchema>
export type BudgetFormData = z.infer<typeof budgetSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
