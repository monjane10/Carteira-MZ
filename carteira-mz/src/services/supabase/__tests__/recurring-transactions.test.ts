import { describe, it, expect, vi, beforeEach } from "vitest"
import { supabase } from "../client"
import { createNotification } from "../notifications"
import { executeRecurringTransactions } from "../recurring-transactions"

vi.mock("../client", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock("../notifications", () => ({
  createNotification: vi.fn(),
}))

type RpcResult = Awaited<ReturnType<typeof supabase.rpc>>

function mockRpc(data: unknown, error: unknown = null) {
  vi.mocked(supabase.rpc).mockResolvedValue({ data, error } as unknown as RpcResult)
}

describe("executeRecurringTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("executes due transactions through the atomic server function", async () => {
    mockRpc([])
    await executeRecurringTransactions()
    expect(supabase.rpc).toHaveBeenCalledWith("execute_due_recurring_transactions")
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it("does not notify when nothing was executed", async () => {
    mockRpc([])
    await executeRecurringTransactions()
    expect(createNotification).not.toHaveBeenCalled()
  })

  it("notifies once per executed recurring transaction", async () => {
    mockRpc([
      { recurring_id: "1", description: "Renda", amount: 5000, executions: 1 },
      { recurring_id: "2", description: "Internet", amount: 1500, executions: 3 },
    ])
    await executeRecurringTransactions()

    expect(createNotification).toHaveBeenCalledTimes(2)
    expect(createNotification).toHaveBeenCalledWith(
      "RECURRING_DUE",
      "Transacção Recorrente Executada",
      expect.stringContaining("Renda"),
    )
    expect(createNotification).toHaveBeenCalledWith(
      "RECURRING_DUE",
      "Transacção Recorrente Executada",
      expect.stringContaining("(3 vezes)"),
    )
  })

  it("handles server errors gracefully", async () => {
    mockRpc(null, { message: "function does not exist" })
    await expect(executeRecurringTransactions()).resolves.not.toThrow()
    expect(createNotification).not.toHaveBeenCalled()
  })
})
