// Regista neste dispositivo quando cada aviso automático foi enviado, para que as
// verificações feitas ao abrir o dashboard não repitam a mesma notificação.

const STORAGE_KEY = "carteira-mz-notified"
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

export const ONE_DAY_MS = 24 * 60 * 60 * 1000

function read(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function write(entries: Record<string, number>) {
  if (typeof window === "undefined") return
  const now = Date.now()
  for (const key of Object.keys(entries)) {
    if (now - entries[key] > MAX_AGE_MS) delete entries[key]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/** Indica se o aviso `key` já foi enviado há menos de `cooldownMs` (por omissão: alguma vez). */
export function wasNotified(key: string, cooldownMs = Infinity): boolean {
  const last = read()[key]
  return last !== undefined && Date.now() - last < cooldownMs
}

export function markNotified(key: string): void {
  const entries = read()
  entries[key] = Date.now()
  write(entries)
}

export function clearNotified(key: string): void {
  const entries = read()
  if (!(key in entries)) return
  delete entries[key]
  write(entries)
}
