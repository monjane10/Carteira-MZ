"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastContextProvider, Toaster } from "@/components/ui/toast"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastContextProvider>
          {children}
          <Toaster />
        </ToastContextProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
