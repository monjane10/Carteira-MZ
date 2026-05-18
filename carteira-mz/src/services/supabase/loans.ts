import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import { createNotification } from "./notifications"
import type { Loan, LoanPayment, NotificationType } from "@/types"

const ENTITY = "emprestimo"

async function notify(
  type: NotificationType,
  title: string,
  message: string,
  url?: string,
) {
  try { await createNotification(type, title, message, url) } catch (e) { console.error("Loan notification error:", e) }
}

export async function getLoans(): Promise<Loan[]> {
  try {
    logger.info("Fetching loans")
    const { data, error } = await supabase
      .from("loans")
      .select("*, account:accounts(*)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Loan[]
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getLoanById(id: string): Promise<Loan | null> {
  try {
    const { data, error } = await supabase
      .from("loans")
      .select("*, account:accounts(*)")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as unknown as Loan
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

export async function createLoan(data: {
  person_name: string
  type: string
  total_amount: number
  account_id?: string | null
  phone?: string | null
  interest_amount?: number
  description?: string | null
  due_date?: string | null
}): Promise<Loan> {
  try {
    logger.info("Creating loan", { person: data.person_name, amount: data.total_amount })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")
    const { data: result, error } = await supabase
      .from("loans")
      .insert({
        user_id: user.id,
        person_name: data.person_name,
        type: data.type,
        total_amount: data.total_amount,
        paid_amount: 0,
        remaining_amount: data.total_amount,
        account_id: data.account_id ?? null,
        phone: data.phone ?? null,
        interest_amount: data.interest_amount ?? 0,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
      })
      .select("*, account:accounts(*)")
      .single()
    if (error) throw error
    logger.info("Loan created", { id: result.id })

    if (data.type === "TAKEN") {
      notify("LOAN_DUE", "Empréstimo a Pagar", `Empréstimo de ${data.total_amount} Mzn com ${result.person_name} — vence em ${data.due_date ?? "data a definir"}.`, "/emprestimos")
    } else {
      notify("LOAN_RECEIVED", "Empréstimo Concedido", `Emprestou ${data.total_amount} Mzn a ${result.person_name}.`, "/emprestimos")
    }

    return result as unknown as Loan
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateLoan(
  id: string,
  data: Partial<Omit<Loan, "id" | "user_id" | "created_at">>,
): Promise<Loan> {
  try {
    const existing = await getLoanById(id)
    if (!existing) throw new NotFoundError(ENTITY, id)

    const updateData: Record<string, unknown> = {}
    if (data.person_name !== undefined) updateData.person_name = data.person_name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.type !== undefined) updateData.type = data.type
    if (data.total_amount !== undefined) updateData.total_amount = data.total_amount
    if (data.interest_amount !== undefined) updateData.interest_amount = data.interest_amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.due_date !== undefined) updateData.due_date = data.due_date
    if (data.account_id !== undefined) updateData.account_id = data.account_id

    const paid = data.paid_amount ?? existing.paid_amount
    const total = data.total_amount ?? existing.total_amount
    const remaining = Math.max(0, total - paid)
    updateData.remaining_amount = remaining
    updateData.status = paid >= total ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : existing.status

    const { data: result, error } = await supabase
      .from("loans")
      .update(updateData)
      .eq("id", id)
      .select("*, account:accounts(*)")
      .single()
    if (error) throw error

    logger.info("Loan updated", { id })
    return result as unknown as Loan
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteLoan(id: string): Promise<void> {
  try {
    const existing = await getLoanById(id)
    if (!existing) throw new NotFoundError(ENTITY, id)

    await supabase.from("loan_payments").delete().eq("loan_id", id)
    const { error } = await supabase.from("loans").delete().eq("id", id)
    if (error) throw error
    logger.info("Loan deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}

export async function getLoanPayments(loanId: string): Promise<LoanPayment[]> {
  try {
    const { data, error } = await supabase
      .from("loan_payments")
      .select("*")
      .eq("loan_id", loanId)
      .order("payment_date", { ascending: false })
    if (error) throw error
    return data ?? []
  } catch (e) {
    return handleError(ENTITY + " pagamentos", "listar", e)
  }
}

export async function createLoanPayment(
  loanId: string,
  data: {
    amount: number
    payment_date?: string
    notes?: string | null
  },
): Promise<LoanPayment> {
  try {
    const existing = await getLoanById(loanId)
    if (!existing) throw new NotFoundError(ENTITY, loanId)

    const { data: payment, error } = await supabase
      .from("loan_payments")
      .insert({
        loan_id: loanId,
        amount: data.amount,
        payment_date: data.payment_date ?? new Date().toISOString(),
        notes: data.notes ?? null,
      })
      .select()
      .single()
    if (error) throw error

    const newPaid = existing.paid_amount + data.amount
    const newRemaining = Math.max(0, existing.total_amount - newPaid)
    const newStatus = newPaid >= existing.total_amount ? "PAID" : "PARTIALLY_PAID"

    await supabase
      .from("loans")
      .update({
        paid_amount: newPaid,
        remaining_amount: newRemaining,
        status: newStatus,
      })
      .eq("id", loanId)

    logger.info("Loan payment created", { loanId, amount: data.amount })

    if (existing.type === "GIVEN") {
      notify("LOAN_RECEIVED", "Pagamento Recebido", `${existing.person_name} pagou ${data.amount} Mzn. Restam ${newRemaining} Mzn.`, "/emprestimos")
    } else {
      notify("LOAN_DUE", "Pagamento Efectuado", `Pagou ${data.amount} Mzn a ${existing.person_name}. Restam ${newRemaining} Mzn.`, "/emprestimos")
    }

    return payment
  } catch (e) {
    return handleError(ENTITY + " pagamento", "criar", e)
  }
}

export async function checkOverdueLoans(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("loans")
      .select("id, person_name, type, remaining_amount, due_date, status")
      .in("status", ["PENDING", "PARTIALLY_PAID"])
      .not("due_date", "is", null)

    if (error) throw error

    const loans = (data ?? []) as { id: string; person_name: string; type: string; remaining_amount: number; due_date: string; status: string }[]
    const today = new Date().toISOString().slice(0, 10)

    for (const loan of loans) {
      if (loan.due_date && loan.due_date < today) {
        if (loan.type === "TAKEN") {
          notify("LOAN_DUE", "Empréstimo Vencido", `O empréstimo com ${loan.person_name} de ${loan.remaining_amount} Mzn venceu em ${loan.due_date}.`, "/emprestimos")
        } else {
          notify("LOAN_DUE", "Pagamento em Atraso", `${loan.person_name} ainda deve ${loan.remaining_amount} Mzn (venceu em ${loan.due_date}).`, "/emprestimos")
        }
      }
    }
  } catch (e) {
    logger.warn("Failed to check overdue loans", { error: e })
  }
}
