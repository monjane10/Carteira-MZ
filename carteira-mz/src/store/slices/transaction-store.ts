import { create } from "zustand"
import type { Transaction } from "@/types"
import { transactions as transactionService } from "@/services"

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  getTransactionById: (id: string) => Transaction | undefined
  addTransaction: (data: Parameters<typeof transactionService.createTransaction>[0]) => Promise<void>
  updateTransaction: (id: string, data: Parameters<typeof transactionService.updateTransaction>[1]) => Promise<void>
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
    } catch (e) {
      console.error("Failed to fetch transactions:", e)
      set({ error: "Erro ao carregar transações", isLoading: false })
    }
  },
  getTransactionById: (id) => get().transactions.find(t => t.id === id),
  addTransaction: async (data) => {
    set({ error: null })
    try {
      const transaction = await transactionService.createTransaction(data)
      set((state) => ({ transactions: [...state.transactions, transaction] }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateTransaction: async (id, data) => {
    set({ error: null })
    try {
      const transaction = await transactionService.updateTransaction(id, data)
      set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? transaction : t)) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeTransaction: async (id) => {
    set({ error: null })
    try {
      await transactionService.deleteTransaction(id)
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
