import { create } from "zustand"
import type { Loan, LoanPayment } from "@/types"
import { loans as loanService } from "@/services"

interface LoanState {
  loans: Loan[]
  loanPayments: LoanPayment[]
  isLoading: boolean
  error: string | null
  fetchLoans: () => Promise<void>
  getLoanById: (id: string) => Loan | undefined
  addLoan: (data: any) => Promise<void>
  updateLoan: (id: string, data: any) => Promise<void>
  removeLoan: (id: string) => Promise<void>
  fetchLoanPayments: (loanId: string) => Promise<void>
  addLoanPayment: (loanId: string, data: any) => Promise<void>
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  loanPayments: [],
  isLoading: false,
  error: null,
  fetchLoans: async () => {
    set({ isLoading: true, error: null })
    try {
      const loans = await loanService.getLoans()
      set({ loans: loans.filter(Boolean) as Loan[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar empréstimos", isLoading: false })
    }
  },
  getLoanById: (id) => get().loans.find(l => l.id === id),
  addLoan: async (data) => {
    set({ error: null })
    try {
      await loanService.createLoan(data)
      await get().fetchLoans()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateLoan: async (id, data) => {
    set({ error: null })
    try {
      await loanService.updateLoan(id, data)
      await get().fetchLoans()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeLoan: async (id) => {
    set({ error: null })
    try {
      await loanService.deleteLoan(id)
      await get().fetchLoans()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  fetchLoanPayments: async (loanId) => {
    set({ isLoading: true, error: null })
    try {
      const loanPayments = await loanService.getLoanPayments(loanId)
      set({ loanPayments: loanPayments.filter(Boolean) as LoanPayment[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar pagamentos", isLoading: false })
    }
  },
  addLoanPayment: async (loanId, data) => {
    set({ error: null })
    try {
      await loanService.createLoanPayment(loanId, data)
      await get().fetchLoanPayments(loanId)
      await get().fetchLoans()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
