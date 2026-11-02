import { logger } from "./logger"
import { checkBudgetLimits } from "./budgets"
import { checkOverdueLoans } from "./loans"
import { checkLowBalances } from "./accounts"
import { checkExpiringGoals } from "./goals"
import { checkRecurringTransactions, executeRecurringTransactions } from "./recurring-transactions"

const LAST_CHECKS_KEY = "carteira-mz-last-checks"
const CHECKS_INTERVAL_MS = 60 * 60 * 1000

let running = false

function checksAreDue(): boolean {
  if (typeof window === "undefined") return false
  const last = Number(localStorage.getItem(LAST_CHECKS_KEY) ?? 0)
  return Date.now() - last >= CHECKS_INTERVAL_MS
}

/**
 * Corre ao abrir o dashboard. Executa as recorrentes vencidas (um único pedido) e,
 * no máximo uma vez por hora, as verificações que geram avisos.
 * Devolve true se foram lançadas transacções, para o dashboard recarregar os dados.
 */
export async function runDashboardBackgroundTasks(): Promise<boolean> {
  if (running) return false
  running = true
  try {
    const executed = await executeRecurringTransactions()

    if (checksAreDue()) {
      localStorage.setItem(LAST_CHECKS_KEY, String(Date.now()))
      await Promise.allSettled([
        checkBudgetLimits(),
        checkOverdueLoans(),
        checkLowBalances(),
        checkExpiringGoals(),
        checkRecurringTransactions(),
      ])
    }

    return executed > 0
  } catch (e) {
    logger.warn("Dashboard background tasks failed", { error: e })
    return false
  } finally {
    running = false
  }
}
