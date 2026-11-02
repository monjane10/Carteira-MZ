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
  User,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const leftItems = [
  { id: "dashboard", label: "Home", icon: Home, href: "/dashboard" },
  { id: "contas", label: "Contas", icon: Wallet, href: "/contas" },
]

const rightItems = [
  { id: "transacoes", label: "Transações", icon: ArrowUpDown, href: "/transacoes" },
]

const moreItems = [
  { id: "metas", label: "Metas", icon: Target, href: "/metas" },
  { id: "transferencias", label: "Transferências", icon: ArrowLeftRight, href: "/transferencias" },
  { id: "emprestimos", label: "Empréstimos", icon: HandCoins, href: "/emprestimos" },
  { id: "orcamentos", label: "Orçamentos", icon: PieChart, href: "/orcamentos" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, href: "/relatorios" },
  { id: "recorrentes", label: "Recorrentes", icon: Repeat, href: "/recorrentes" },
  { id: "perfil", label: "Perfil", icon: User, href: "/perfil" },
]

const quickActions = [
  { label: "Receita", icon: TrendingUp, href: "/transacoes/nova?type=INCOME", color: "text-emerald-600 bg-emerald-50" },
  { label: "Despesa", icon: TrendingDown, href: "/transacoes/nova?type=EXPENSE", color: "text-red-500 bg-red-50" },
  { label: "Transferência", icon: ArrowLeftRight, href: "/transferencias/nova", color: "text-blue-500 bg-blue-50" },
  { label: "Empréstimo", icon: HandCoins, href: "/emprestimos/nova", color: "text-orange-500 bg-orange-50" },
]

type Panel = "more" | "add" | null

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

export function MobileNav() {
  const pathname = usePathname()
  const [panel, setPanel] = useState<Panel>(null)
  const close = () => setPanel(null)
  const toggle = (p: Exclude<Panel, null>) => setPanel((current) => (current === p ? null : p))
  const moreActive = moreItems.some((item) => isActivePath(pathname, item.href))

  const renderTab = (item: (typeof leftItems)[number]) => {
    const Icon = item.icon
    const active = isActivePath(pathname, item.href)
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={close}
        className="relative flex flex-1 flex-col items-center gap-0.5 pt-1 text-[11px] font-medium transition-colors"
      >
        {active && (
          <motion.div
            layoutId="activeTab"
            className="absolute -top-px left-1/2 -ml-3 h-0.5 w-6 rounded-full bg-emerald-600"
          />
        )}
        <Icon className={cn("h-5 w-5", active ? "text-emerald-600" : "text-slate-500")} />
        <span className={active ? "font-semibold text-emerald-600" : "text-slate-500"}>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      <AnimatePresence>
        {panel && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
        )}

        {panel === "more" && (
          <motion.div
            key="more"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Mais Opções</h3>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                const active = isActivePath(pathname, item.href)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium transition-colors",
                      active ? "bg-emerald-500/10 text-emerald-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
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

        {panel === "add" && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Adicionar</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    onClick={close}
                    className={cn("flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold", action.color)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-lg items-end px-2 pt-1 pb-2">
          {leftItems.map(renderTab)}

          {/* Botão principal: adicionar receita, despesa, transferência ou empréstimo */}
          <div className="flex flex-1 justify-center">
            <button
              type="button"
              onClick={() => toggle("add")}
              aria-label={panel === "add" ? "Fechar adicionar" : "Adicionar"}
              aria-expanded={panel === "add"}
              className={cn(
                "-mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white transition-all active:scale-95",
                panel === "add" ? "rotate-45 bg-slate-900" : "bg-emerald-500 hover:bg-emerald-600",
              )}
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>

          {rightItems.map(renderTab)}

          <button
            type="button"
            onClick={() => toggle("more")}
            aria-expanded={panel === "more"}
            className="relative flex flex-1 flex-col items-center gap-0.5 pt-1 text-[11px] font-medium transition-colors"
          >
            {moreActive && panel !== "more" && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-px left-1/2 -ml-3 h-0.5 w-6 rounded-full bg-emerald-600"
              />
            )}
            <Grid className={cn("h-5 w-5", panel === "more" || moreActive ? "text-emerald-600" : "text-slate-500")} />
            <span className={panel === "more" || moreActive ? "font-semibold text-emerald-600" : "text-slate-500"}>
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
