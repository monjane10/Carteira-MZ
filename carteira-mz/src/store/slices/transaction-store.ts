import { create } from "zustand"
import type { Transaction } from "@/types"
import { transactions as transactionService } from "@/services"

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  getTransactionById: (id: string) => Transaction | undefined
  addTransaction: (data: any) => Promise<void>
  updateTransaction: (id: string, data: any) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  fetchTransactions: async () => {
    set({ isLoading: true, error: null })
    try {
      const transactions = await transactionService.getTransactions()
      set({ transactions: transactions.filter(Boolean) as Transaction[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar transações", isLoading: false })
    }
  },
  getTransactionById: (id) => get().transactions.find(t => t.id === id),
  addTransaction: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const transaction = await transactionService.createTransaction(data)
      set(state => ({ transactions: [...state.transactions, transaction].filter(Boolean) as Transaction[], isLoading: false }))
    } catch {
      set({ error: "Erro ao adicionar transação", isLoading: false })
    }
  },
  updateTransaction: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await transactionService.updateTransaction(id, data)
      set(state => ({
        transactions: state.transactions.map(t => t.id === id ? updated : t).filter(Boolean) as Transaction[],
        isLoading: false,
      }))
    } catch {
      set({ error: "Erro ao actualizar transação", isLoading: false })
    }
  },
  removeTransaction: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await transactionService.deleteTransaction(id)
      set(state => ({ transactions: state.transactions.filter(t => t.id !== id), isLoading: false }))
    } catch {
      set({ error: "Erro ao remover transação", isLoading: false })
    }
  },
}))
