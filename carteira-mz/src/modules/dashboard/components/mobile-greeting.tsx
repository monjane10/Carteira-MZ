"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { supabase } from "@/services"
import Image from "next/image"

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
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setTime(getMozambiqueTime()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name as string | undefined
      if (name) setUserName(name)
    })
  }, [])

  const hour = time.getHours()
  const greeting = getGreeting(hour)
  const dateStr = format(time, "EEEE, dd 'de' MMMM", { locale: pt })

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{greeting},</p>
        <h1 className="truncate text-xl font-bold text-[#0F172A] dark:text-white mt-0.5">
          {userName || "Utilizador"}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 capitalize first-letter:uppercase">
          {dateStr}
        </p>
      </div>
      <div className="shrink-0">
        <Image
          src="/crescimento.png"
          alt="Ilustração de crescimento financeiro"
          width={112}
          height={80}
          className="h-16 w-24 sm:h-20 sm:w-28 object-contain"
        />
      </div>
    </div>
  )
}
