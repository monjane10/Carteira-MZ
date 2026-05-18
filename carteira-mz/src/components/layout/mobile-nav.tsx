"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Wallet,
  ArrowUpDown,
  Target,
  Grid,
  ArrowLeftRight,
  HandCoins,
  PieChart,
  BarChart3,
  Repeat,
  Settings,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainItems = [
  { id: "dashboard", label: "Home", icon: Home, href: "/dashboard" },
  { id: "contas", label: "Contas", icon: Wallet, href: "/contas" },
  { id: "transacoes", label: "Transações", icon: ArrowUpDown, href: "/transacoes" },
  { id: "metas", label: "Metas", icon: Target, href: "/metas" },
  { id: "mais", label: "Mais", icon: Grid, href: "#" },
]

const moreItems = [
  { id: "transferencias", label: "Transferências", icon: ArrowLeftRight, href: "/transferencias" },
  { id: "emprestimos", label: "Empréstimos", icon: HandCoins, href: "/emprestimos" },
  { id: "orcamentos", label: "Orçamentos", icon: PieChart, href: "/orcamentos" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, href: "/relatorios" },
  { id: "recorrentes", label: "Recorrentes", icon: Repeat, href: "/recorrentes" },
  { id: "configuracoes", label: "Configurações", icon: Settings, href: "/configuracoes" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Mais Opções</h3>
              <button
                onClick={() => setShowMore(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-2 pt-1 pb-2">
          {mainItems.map((item) => {
            const Icon = item.icon
            const isMainActive = pathname === item.href || pathname.startsWith(item.href + "/")

            if (item.id === "mais") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="relative flex flex-col items-center gap-0.5 px-4 pt-1 text-[11px] font-medium transition-colors"
                >
                  <Icon className={cn("h-5 w-5", showMore ? "text-emerald-500" : "text-slate-400")} />
                  <span className={showMore ? "text-emerald-600" : "text-slate-400"}>{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 px-4 pt-1 text-[11px] font-medium transition-colors"
              >
                {isMainActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-emerald-500"
                  />
                )}
                <Icon className={cn("h-5 w-5", isMainActive ? "text-emerald-500" : "text-slate-400")} />
                <span className={isMainActive ? "text-emerald-600 font-semibold" : "text-slate-400"}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
