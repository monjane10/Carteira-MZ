import { create } from "zustand"

type Theme = "dark" | "light"

interface UIState {
  sidebarOpen: boolean
  theme: Theme
  activePage: string
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setActivePage: (page: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  activePage: "dashboard",
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set(state => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  setTheme: (theme) => set({ theme }),
  setActivePage: (page) => set({ activePage: page }),
}))
