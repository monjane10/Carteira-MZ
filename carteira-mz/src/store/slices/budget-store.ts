import { create } from "zustand"
import type { Budget } from "@/types"
import { budgets as budgetService } from "@/services"

interface BudgetState {
  budgets: Budget[]
  isLoading: boolean
  error: string | null
  fetchBudgets: () => Promise<void>
  addBudget: (data: any) => Promise<void>
  updateBudget: (id: string, data: any) => Promise<void>
  removeBudget: (id: string) => Promise<void>
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,
  fetchBudgets: async () => {
    set({ isLoading: true, error: null })
    try {
      const budgets = await budgetService.getBudgets()
      set({ budgets: budgets.filter(Boolean) as Budget[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar orçamentos", isLoading: false })
    }
  },
  addBudget: async (data) => {
    set({ error: null })
    try {
      const budget = await budgetService.createBudget(data)
      set((state) => ({ budgets: [...state.budgets, budget] }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateBudget: async (id, data) => {
    set({ error: null })
    try {
      const budget = await budgetService.updateBudget(id, data)
      set((state) => ({ budgets: state.budgets.map((b) => (b.id === id ? budget : b)) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeBudget: async (id) => {
    set({ error: null })
    try {
      await budgetService.deleteBudget(id)
      set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
