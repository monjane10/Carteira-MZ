"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { BackButton } from "@/components/shared/back-button"
import { MobileNav } from "./mobile-nav"
import { Fab } from "@/components/shared/fab"

const mainTabs = ["/dashboard", "/contas", "/transacoes", "/metas"]

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const showBack = !mainTabs.includes(pathname)

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        <main className="px-4 pt-5 pb-24">
          {showBack && (
            <div className="mb-3">
              <BackButton />
            </div>
          )}
          {children}
        </main>
      </div>
      <MobileNav />
      <Fab />
    </div>
  )
}
