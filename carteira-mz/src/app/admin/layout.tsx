"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Building2, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/shared/logo"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "usuarios", label: "Utilizadores", icon: Users, href: "/admin/usuarios" },
  { id: "contas", label: "Contas", icon: Building2, href: "/admin/contas" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/admin/login"

  const handleLogout = () => {
    router.push("/admin/login")
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <Logo size="sm" />
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
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <Link href="/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Sair do Admin
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="h-6 px-2.5 rounded-full bg-[#0F172A] text-white text-[11px] font-semibold flex items-center">Admin</span>
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
