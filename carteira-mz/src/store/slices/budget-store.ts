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

export const useBudgetStore = create<BudgetState>((set) => ({
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
    set({ isLoading: true, error: null })
    try {
      const budget = await budgetService.createBudget(data)
      set(state => ({ budgets: [...state.budgets, budget].filter(Boolean) as Budget[], isLoading: false }))
    } catch {
      set({ error: "Erro ao adicionar orçamento", isLoading: false })
    }
  },
  updateBudget: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await budgetService.updateBudget(id, data)
      set(state => ({
        budgets: state.budgets.map(b => b.id === id ? updated : b).filter(Boolean) as Budget[],
        isLoading: false,
      }))
    } catch {
      set({ error: "Erro ao actualizar orçamento", isLoading: false })
    }
  },
  removeBudget: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await budgetService.deleteBudget(id)
      set(state => ({ budgets: state.budgets.filter(b => b.id !== id), isLoading: false }))
    } catch {
      set({ error: "Erro ao remover orçamento", isLoading: false })
    }
  },
}))
