import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  activePage: string
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActivePage: (page: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePage: "dashboard",
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePage: (page) => set({ activePage: page }),
}))
