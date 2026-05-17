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
    set({ error: null })
    try {
      await categoryService.createCategory(data)
      await get().fetchCategories()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateCategory: async (id, data) => {
    set({ error: null })
    try {
      await categoryService.updateCategory(id, data)
      await get().fetchCategories()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeCategory: async (id) => {
    set({ error: null })
    try {
      await categoryService.deleteCategory(id)
      await get().fetchCategories()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
