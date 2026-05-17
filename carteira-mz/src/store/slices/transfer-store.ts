import { create } from "zustand"
import type { Transfer } from "@/types"
import { transfers as transferService } from "@/services"

interface TransferState {
  transfers: Transfer[]
  isLoading: boolean
  error: string | null
  fetchTransfers: () => Promise<void>
  addTransfer: (data: Parameters<typeof transferService.createTransfer>[0]) => Promise<void>
  updateTransfer: (id: string, data: Parameters<typeof transferService.updateTransfer>[1]) => Promise<void>
  removeTransfer: (id: string) => Promise<void>
}

export const useTransferStore = create<TransferState>((set) => ({
  transfers: [],
  isLoading: false,
  error: null,
  fetchTransfers: async () => {
    set({ isLoading: true, error: null })
    try {
      const transfers = await transferService.getTransfers()
      set({ transfers: transfers.filter(Boolean) as Transfer[], isLoading: false })
    } catch {
      set({ error: "Erro ao carregar transferências", isLoading: false })
    }
  },
  addTransfer: async (data) => {
    set({ error: null })
    try {
      const transfer = await transferService.createTransfer(data)
      set((state) => ({ transfers: [...state.transfers, transfer] }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  updateTransfer: async (id, data) => {
    set({ error: null })
    try {
      const transfer = await transferService.updateTransfer(id, data)
      set((state) => ({ transfers: state.transfers.map((t) => (t.id === id ? transfer : t)) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
  removeTransfer: async (id) => {
    set({ error: null })
    try {
      await transferService.deleteTransfer(id)
      set((state) => ({ transfers: state.transfers.filter((t) => t.id !== id) }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      set({ error: msg, isLoading: false })
      throw e
    }
  },
}))
