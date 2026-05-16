"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { LogOut } from "lucide-react"

function getMozambiqueTime(): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 7200000)
}

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

export function MobileGreeting() {
  const router = useRouter()
  const [time, setTime] = useState(getMozambiqueTime())
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(getMozambiqueTime()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    setShowConfirm(false)
    router.push("/login")
  }

  const hour = time.getHours()
  const greeting = getGreeting(hour)
  const dateStr = format(time, "EEEE, dd 'de' MMMM", { locale: pt })

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">
            {greeting}
          </p>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-white">
            Lourenço
          </h1>
          <p className="mt-0.5 text-xs text-slate-400 capitalize">
            {dateStr}
          </p>
        </div>

        <div className="flex items-start pt-1">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-red-400 flex-shrink-0"
            aria-label="Terminar sessão"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#0F172A] text-center">
                Terminar sessão
              </h3>
              <p className="text-sm text-slate-500 text-center mt-1">
                Tem a certeza que deseja sair da sua conta?
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Terminar Sessão
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
