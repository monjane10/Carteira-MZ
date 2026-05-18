import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  const amount = new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
  return `${amount} Mzn`
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (format === "relative") {
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Hoje"
    if (days === 1) return "Ontem"
    if (days < 7) return `Há ${days} dias`
    if (days < 30) return `Há ${Math.floor(days / 7)} semanas`
    if (days < 365) return `Há ${Math.floor(days / 30)} meses`
    return `Há ${Math.floor(days / 365)} anos`
  }
  if (format === "long") {
    return d.toLocaleDateString("pt-MZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }
  return d.toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15)
}
