import { create } from "zustand"
import type { Goal, GoalContribution } from "@/types"
import { goals as goalService } from "@/services"

interface GoalState {
  goals: Goal[]
  goalContributions: GoalContribution[]
  isLoading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  getGoalById: (id: string) => Goal | undefined
  addGoal: (data: any) => Promise<void>
  updateGoal: (id: string, data: any) => Promise<void>
  removeGoal: (id: string) => Promise<void>
  fetchGoalContributions: (goalId: string) => Promise<void>
  addGoalContribution: (goalId: string, data: any) => Promise<void>
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  goalContributions: [],
  isLoading: false,
  error: null,
  fetchGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      const goals = await goalService.getGoals()
      set({ goals: goals.filter(Boolean) as Goal[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar metas", isLoading: false })
    }
  },
  getGoalById: (id) => get().goals.find(g => g.id === id),
  addGoal: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const goal = await goalService.createGoal(data)
      set(state => ({ goals: [...state.goals, goal].filter(Boolean) as Goal[], isLoading: false }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateGoal: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await goalService.updateGoal(id, data)
      set(state => ({
        goals: state.goals.map(g => g.id === id ? updated : g).filter(Boolean) as Goal[],
        isLoading: false,
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeGoal: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await goalService.deleteGoal(id)
      set(state => ({ goals: state.goals.filter(g => g.id !== id), isLoading: false }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  fetchGoalContributions: async (goalId) => {
    set({ isLoading: true, error: null })
    try {
      const goalContributions = await goalService.getGoalContributions(goalId)
      set({ goalContributions: goalContributions.filter(Boolean) as GoalContribution[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar contribuições", isLoading: false })
    }
  },
  addGoalContribution: async (goalId, data) => {
    set({ isLoading: true, error: null })
    try {
      await goalService.createGoalContribution(goalId, data)
      const goalContributions = await goalService.getGoalContributions(goalId)
      const goals = await goalService.getGoals()
      set({ goals: goals.filter(Boolean) as Goal[], goalContributions: goalContributions.filter(Boolean) as GoalContribution[], isLoading: false })
    } catch {
      set({ error: "Erro ao adicionar contribuição", isLoading: false })
    }
  },
}))
