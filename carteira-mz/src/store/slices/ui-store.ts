import { create } from "zustand"

type Theme = "dark" | "light"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem("carteira-mz-theme") as Theme | null
  if (stored === "dark" || stored === "light") return stored
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  return "light"
}

function saveTheme(theme: Theme) {
  if (typeof window !== "undefined") {
    localStorage.setItem("carteira-mz-theme", theme)
  }
}

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
  theme: getInitialTheme(),
  activePage: "dashboard",
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set(state => {
    const next = state.theme === "dark" ? "light" : "dark"
    saveTheme(next)
    return { theme: next }
  }),
  setTheme: (theme) => {
    saveTheme(theme)
    set({ theme })
  },
  setActivePage: (page) => set({ activePage: page }),
}))
