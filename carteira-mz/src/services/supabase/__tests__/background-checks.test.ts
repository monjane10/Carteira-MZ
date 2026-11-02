import { describe, it, expect, vi, beforeEach } from "vitest"

const executeRecurringTransactions = vi.fn()
const checks = {
  checkBudgetLimits: vi.fn(),
  checkOverdueLoans: vi.fn(),
  checkLowBalances: vi.fn(),
  checkExpiringGoals: vi.fn(),
  checkRecurringTransactions: vi.fn(),
}

vi.mock("../recurring-transactions", () => ({
  executeRecurringTransactions: () => executeRecurringTransactions(),
  checkRecurringTransactions: () => checks.checkRecurringTransactions(),
}))
vi.mock("../budgets", () => ({ checkBudgetLimits: () => checks.checkBudgetLimits() }))
vi.mock("../loans", () => ({ checkOverdueLoans: () => checks.checkOverdueLoans() }))
vi.mock("../accounts", () => ({ checkLowBalances: () => checks.checkLowBalances() }))
vi.mock("../goals", () => ({ checkExpiringGoals: () => checks.checkExpiringGoals() }))

const { runDashboardBackgroundTasks } = await import("../background-checks")

describe("runDashboardBackgroundTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    executeRecurringTransactions.mockResolvedValue(0)
  })

  it("runs recurring execution and all checks on the first open", async () => {
    await runDashboardBackgroundTasks()
    expect(executeRecurringTransactions).toHaveBeenCalledTimes(1)
    for (const check of Object.values(checks)) expect(check).toHaveBeenCalledTimes(1)
  })

  it("skips the notification checks if they ran less than an hour ago", async () => {
    await runDashboardBackgroundTasks()
    await runDashboardBackgroundTasks()
    expect(executeRecurringTransactions).toHaveBeenCalledTimes(2)
    for (const check of Object.values(checks)) expect(check).toHaveBeenCalledTimes(1)
  })

  it("runs the checks again after an hour", async () => {
    await runDashboardBackgroundTasks()
    localStorage.setItem("carteira-mz-last-checks", String(Date.now() - 61 * 60 * 1000))
    await runDashboardBackgroundTasks()
    expect(checks.checkLowBalances).toHaveBeenCalledTimes(2)
  })

  it("reports when recurring transactions were created so the dashboard reloads", async () => {
    executeRecurringTransactions.mockResolvedValue(2)
    await expect(runDashboardBackgroundTasks()).resolves.toBe(true)
  })

  it("reports no changes when nothing was executed", async () => {
    await expect(runDashboardBackgroundTasks()).resolves.toBe(false)
  })
})
