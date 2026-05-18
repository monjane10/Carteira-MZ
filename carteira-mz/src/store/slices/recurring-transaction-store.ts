import { create } from "zustand"
import type { RecurringTransaction } from "@/types"
import { recurringTransactions as recurringService } from "@/services"

interface RecurringTransactionState {
  transactions: RecurringTransaction[]
  isLoading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  addTransaction: (data: Parameters<typeof recurringService.createRecurringTransaction>[0]) => Promise<void>
  updateTransaction: (id: string, data: Parameters<typeof recurringService.updateRecurringTransaction>[1]) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
}

export const useRecurringTransactionStore = create<RecurringTransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,
  fetchTransactions: async () => {
    set({ isLoading: true, error: null })
    try {
      const transactions = await recurringService.getRecurringTransactions()
      set({ transactions, isLoading: false })
    } catch {
      set({ error: "Erro ao carregar transacções recorrentes", isLoading: false })
    }
  },
  addTransaction: async (data) => {
    set({ error: null })
    try {
      const transaction = await recurringService.createRecurringTransaction(data)
      set((state) => ({ transactions: [...state.transactions, transaction] }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg })
      throw e
    }
  },
  updateTransaction: async (id, data) => {
    set({ error: null })
    try {
      const transaction = await recurringService.updateRecurringTransaction(id, data)
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? transaction : t)),
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg })
      throw e
    }
  },
  removeTransaction: async (id) => {
    set({ error: null })
    try {
      await recurringService.deleteRecurringTransaction(id)
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg })
      throw e
    }
  },
}))
