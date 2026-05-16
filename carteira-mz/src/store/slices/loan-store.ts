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
    set({ isLoading: true, error: null })
    try {
      const loan = await loanService.createLoan(data)
      set(state => ({ loans: [...state.loans, loan].filter(Boolean) as Loan[], isLoading: false }))
    } catch {
      set({ error: "Erro ao adicionar empréstimo", isLoading: false })
    }
  },
  updateLoan: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await loanService.updateLoan(id, data)
      set(state => ({
        loans: state.loans.map(l => l.id === id ? updated : l).filter(Boolean) as Loan[],
        isLoading: false,
      }))
    } catch {
      set({ error: "Erro ao actualizar empréstimo", isLoading: false })
    }
  },
  removeLoan: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await loanService.deleteLoan(id)
      set(state => ({ loans: state.loans.filter(l => l.id !== id), isLoading: false }))
    } catch {
      set({ error: "Erro ao remover empréstimo", isLoading: false })
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
    set({ isLoading: true, error: null })
    try {
      await loanService.createLoanPayment(loanId, data)
      const loanPayments = await loanService.getLoanPayments(loanId)
      const loans = await loanService.getLoans()
      set({ loans: loans.filter(Boolean) as Loan[], loanPayments: loanPayments.filter(Boolean) as LoanPayment[], isLoading: false })
    } catch {
      set({ error: "Erro ao adicionar pagamento", isLoading: false })
    }
  },
}))
