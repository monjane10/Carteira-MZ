"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  { label: "Receita", icon: TrendingUp, href: "/transacoes/nova?type=INCOME", color: "text-emerald-600 bg-emerald-50" },
  { label: "Despesa", icon: TrendingDown, href: "/transacoes/nova?type=EXPENSE", color: "text-red-500 bg-red-50" },
  { label: "Transferência", icon: ArrowLeftRight, href: "/transferencias/nova", color: "text-blue-500 bg-blue-50" },
  { label: "Empréstimo", icon: HandCoins, href: "/emprestimos/nova", color: "text-orange-500 bg-orange-50" },
]

export function Fab() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const pathname = usePathname()

  // Esconde ao fazer scroll para baixo (para não tapar o conteúdo) e volta ao subir.
  // No telemóvel o scroll é feito num contentor do layout, não na janela: o evento
  // "scroll" não sobe na árvore, por isso é apanhado na fase de captura.
  useEffect(() => {
    const onScroll = (e: Event) => {
      const target = e.target
      const y = target instanceof HTMLElement ? target.scrollTop : window.scrollY
      const delta = y - lastScrollY.current
      if (Math.abs(delta) < 8) return
      setHidden(delta > 0 && y > 80)
      lastScrollY.current = y
    }
    window.addEventListener("scroll", onScroll, { capture: true, passive: true })
    return () => window.removeEventListener("scroll", onScroll, { capture: true })
  }, [])

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

      <div
        className={cn(
          "fixed bottom-24 right-3 z-50 flex flex-col items-end gap-2 transition-all duration-200",
          hidden && !open && "pointer-events-none translate-y-6 opacity-0"
        )}
      >
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
                  aria-label={action.label}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
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
          aria-label={open ? "Fechar acções rápidas" : "Abrir acções rápidas"}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all",
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
