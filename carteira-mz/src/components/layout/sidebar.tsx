"use client"

import Link from "next/link"
import { useUIStore } from "@/store"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  ArrowLeftRight,
  HandCoins,
  Target,
  PieChart,
  BarChart3,
  Settings,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/shared/logo"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "contas", label: "Contas", icon: Wallet, href: "/contas" },
  { id: "transacoes", label: "Transacções", icon: ArrowUpDown, href: "/transacoes" },
  { id: "transferencias", label: "Transferências", icon: ArrowLeftRight, href: "/transferencias" },
  { id: "emprestimos", label: "Empréstimos", icon: HandCoins, href: "/emprestimos" },
  { id: "metas", label: "Metas", icon: Target, href: "/metas" },
  { id: "orcamentos", label: "Orçamentos", icon: PieChart, href: "/orcamentos" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, href: "/relatorios" },
  { id: "configuracoes", label: "Configurações", icon: Settings, href: "/configuracoes" },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activePage, setActivePage } = useUIStore()

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 lg:static lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: "280px" }}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  setActivePage(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
