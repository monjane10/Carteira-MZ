"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { Logo } from "@/components/shared/logo"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { MobileNav } from "./mobile-nav"
import { Fab } from "@/components/shared/fab"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { OnboardingTour } from "@/components/shared/onboarding-tour"
import { supabase } from "@/services/supabase/client"
import { cn } from "@/lib/utils"
import { requestNotificationPermission } from "@/lib/push-notifications"

const mainTabs = ["/dashboard", "/contas", "/transacoes", "/metas", "/perfil"]

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const showBack = !mainTabs.includes(pathname)
  // O ecrã inicial no telemóvel ocupa a altura disponível, sem scroll
  const isHome = pathname === "/dashboard"
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const handleLogout = async () => {
    try {
      const registration = await navigator.serviceWorker?.getRegistration("/")
      if (registration) {
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          await fetch("/api/push-subscriptions?endpoint=" + encodeURIComponent(sub.endpoint), { method: "DELETE" })
          await sub.unsubscribe()
        }
      }
    } catch { /* non-critical */ }
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-dvh flex-col bg-white">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white pl-0 pr-4">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-base font-bold text-slate-900">Carteira MZ</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationDropdown />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Terminar Sessão"
        description="Tem a certeza que deseja terminar a sessão?"
        onConfirm={handleLogout}
      />
      <div data-scroll-container className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        <main className={cn("flex w-full min-w-0 flex-1 flex-col px-4 pt-2", isHome ? "pb-[64px] md:pb-28" : "pb-28")}>
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
      <OnboardingTour />
    </div>
  )
}
