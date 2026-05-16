"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

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
  const [time, setTime] = useState(getMozambiqueTime())

  useEffect(() => {
    const timer = setInterval(() => setTime(getMozambiqueTime()), 60000)
    return () => clearInterval(timer)
  }, [])

  const hour = time.getHours()
  const greeting = getGreeting(hour)
  const dateStr = format(time, "EEEE, dd 'de' MMMM", { locale: pt })

  return (
    <div>
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {greeting} 👋
      </p>
      <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        Lourenço
      </h1>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 capitalize">
        {dateStr}
      </p>
    </div>
  )
}
