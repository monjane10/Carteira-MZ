"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useUIStore } from "@/store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { BackButton } from "@/components/shared/back-button"
import { Fab } from "@/components/shared/fab"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const mainTabs = ["/dashboard", "/contas", "/transacoes", "/metas"]

interface DashboardLayoutProps {
  children: ReactNode
}

function Back({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const showBack = isMobile && !mainTabs.includes(pathname)

  return (
    <>
      {showBack && (
        <div className="mb-3">
          <BackButton />
        </div>
      )}
      {children}
    </>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const isMobile = useMediaQuery("(max-width: 1023px)")

  if (isMobile === undefined) {
    return (
      <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
        <div className="flex-1 overflow-y-auto">
          <main className="px-4 pt-5 pb-24">{children}</main>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
        <div className="flex-1 overflow-y-auto">
          <main className="px-4 pt-5 pb-24">
            <Back>{children}</Back>
          </main>
        </div>
        <MobileNav />
        <Fab />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          sidebarOpen && "lg:pl-0"
        )}
      >
        <Header />
        <ScrollArea className="flex-1">
          <main className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={useUIStore.getState().activePage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
