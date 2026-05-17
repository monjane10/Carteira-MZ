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
    set({ error: null })
    try {
      await transactionService.createTransaction(data)
      await get().fetchTransactions()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateTransaction: async (id, data) => {
    set({ error: null })
    try {
      await transactionService.updateTransaction(id, data)
      await get().fetchTransactions()
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
      await get().fetchTransactions()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
