"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Building2, LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "usuarios", label: "Utilizadores", icon: Users, href: "/admin/usuarios" },
  { id: "contas", label: "Contas", icon: Building2, href: "/admin/contas" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isLoginPage = pathname === "/admin/login"

  const handleLogout = () => {
    router.push("/admin/login")
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className={cn(
        "bg-emerald-600 text-white flex flex-col shrink-0 transition-all duration-200",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/logo.png" alt="Carteira MZ" fill className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Carteira MZ</p>
              <p className="text-[10px] text-white/60 leading-tight">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/15">
          <Link href="/login" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Sair do Admin
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <span className="h-6 px-2.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold flex items-center">Admin</span>
            <span className="text-sm text-slate-400">Painel Administrativo</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </header>
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
