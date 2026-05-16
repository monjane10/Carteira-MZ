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
    set({ isLoading: true, error: null })
    try {
      const account = await accountService.createAccount(data)
      set(state => ({ accounts: [...state.accounts, account].filter(Boolean) as Account[], isLoading: false }))
    } catch {
      set({ error: "Erro ao adicionar conta", isLoading: false })
    }
  },
  updateAccount: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await accountService.updateAccount(id, data)
      set(state => ({
        accounts: state.accounts.map(a => a.id === id ? updated : a).filter(Boolean) as Account[],
        isLoading: false,
      }))
    } catch {
      set({ error: "Erro ao actualizar conta", isLoading: false })
    }
  },
  removeAccount: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await accountService.deleteAccount(id)
      set(state => ({ accounts: state.accounts.filter(a => a.id !== id), isLoading: false }))
    } catch {
      set({ error: "Erro ao remover conta", isLoading: false })
    }
  },
}))
