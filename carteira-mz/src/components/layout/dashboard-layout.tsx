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
import { requestNotificationPermission } from "@/lib/push-notifications"

const mainTabs = ["/dashboard", "/contas", "/transacoes", "/metas"]

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const showBack = !mainTabs.includes(pathname)
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
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white pl-0 pr-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-base font-bold text-slate-900 dark:text-white">Carteira MZ</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationDropdown />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
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
      <OnboardingTour />
    </div>
  )
}
