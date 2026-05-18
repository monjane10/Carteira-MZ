"use client"

import { useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastContextProvider, Toaster } from "@/components/ui/toast"
import { useUIStore } from "@/store"

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastContextProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </ToastContextProvider>
    </TooltipProvider>
  )
}
