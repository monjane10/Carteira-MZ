"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  { label: "Receita", icon: TrendingUp, href: "/transacoes/nova", color: "text-emerald-600 bg-emerald-50" },
  { label: "Despesa", icon: TrendingDown, href: "/transacoes/nova", color: "text-red-500 bg-red-50" },
  { label: "Transferência", icon: ArrowLeftRight, href: "/transferencias/nova", color: "text-blue-500 bg-blue-50" },
  { label: "Empréstimo", icon: HandCoins, href: "/emprestimos/nova", color: "text-orange-500 bg-orange-50" },
]

export function Fab() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (pathname !== "/dashboard") return null

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2.5 lg:hidden">
        <AnimatePresence>
          {open && actions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-md transition-colors",
                    action.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all",
            open
              ? "bg-slate-900 text-white rotate-45"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          )}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}
