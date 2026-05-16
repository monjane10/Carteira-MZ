"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

  useEffect(() => {
    const timer = setInterval(() => setTime(getMozambiqueTime()), 60000)
    return () => clearInterval(timer)
  }, [])

  const hour = time.getHours()
  const greeting = getGreeting(hour)
  const dateStr = format(time, "EEEE, dd 'de' MMMM", { locale: pt })

  return (
    <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-medium text-emerald-600 dark:text-emerald-400">
            {greeting}
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Lourenço
          </h1>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 capitalize">
          {dateStr}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm dark:bg-slate-700 flex-shrink-0">
          L
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-red-400 flex-shrink-0"
          aria-label="Terminar sessão"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
