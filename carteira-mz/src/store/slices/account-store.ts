import { create } from "zustand"
import type { Account } from "@/types"
import { accounts as accountService } from "@/services"

interface AccountState {
  accounts: Account[]
  isLoading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  getAccountById: (id: string) => Account | undefined
  addAccount: (data: any) => Promise<void>
  updateAccount: (id: string, data: any) => Promise<void>
  removeAccount: (id: string) => Promise<void>
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,
  fetchAccounts: async () => {
    set({ isLoading: true, error: null })
    try {
      const accounts = await accountService.getAccounts()
      set({ accounts: accounts.filter(Boolean) as Account[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar contas", isLoading: false })
    }
  },
  getAccountById: (id) => get().accounts.find(a => a.id === id),
  addAccount: async (data) => {
    set({ error: null })
    try {
      await accountService.createAccount(data)
      await get().fetchAccounts()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateAccount: async (id, data) => {
    set({ error: null })
    try {
      await accountService.updateAccount(id, data)
      await get().fetchAccounts()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeAccount: async (id) => {
    set({ error: null })
    try {
      await accountService.deleteAccount(id)
      await get().fetchAccounts()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
