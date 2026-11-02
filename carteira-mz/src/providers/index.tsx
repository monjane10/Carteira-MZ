"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastContextProvider, Toaster } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastContextProvider>
        {children}
        <Toaster />
      </ToastContextProvider>
    </TooltipProvider>
  )
}
