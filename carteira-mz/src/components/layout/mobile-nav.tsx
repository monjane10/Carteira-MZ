"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, ArrowUpDown, Target, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "contas", label: "Contas", icon: Wallet, href: "/contas" },
  { id: "transacoes", label: "Transações", icon: ArrowUpDown, href: "/transacoes" },
  { id: "metas", label: "Metas", icon: Target, href: "/metas" },
  { id: "mais", label: "Mais", icon: MoreHorizontal, href: "/relatorios" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-950 lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
