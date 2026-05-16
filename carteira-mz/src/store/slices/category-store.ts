import { create } from "zustand"
import type { Category } from "@/types"
import { categories as categoryService } from "@/services"

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  addCategory: (data: any) => Promise<void>
  updateCategory: (id: string, data: any) => Promise<void>
  removeCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const categories = await categoryService.getCategories()
      set({ categories: categories.filter(Boolean) as Category[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar categorias", isLoading: false })
    }
  },
  getCategoryById: (id) => get().categories.find(c => c.id === id),
  addCategory: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const category = await categoryService.createCategory(data)
      set(state => ({ categories: [...state.categories, category].filter(Boolean) as Category[], isLoading: false }))
    } catch {
      set({ error: "Erro ao adicionar categoria", isLoading: false })
    }
  },
  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await categoryService.updateCategory(id, data)
      set(state => ({
        categories: state.categories.map(c => c.id === id ? updated : c).filter(Boolean) as Category[],
        isLoading: false,
      }))
    } catch {
      set({ error: "Erro ao actualizar categoria", isLoading: false })
    }
  },
  removeCategory: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await categoryService.deleteCategory(id)
      set(state => ({ categories: state.categories.filter(c => c.id !== id), isLoading: false }))
    } catch {
      set({ error: "Erro ao remover categoria", isLoading: false })
    }
  },
}))
