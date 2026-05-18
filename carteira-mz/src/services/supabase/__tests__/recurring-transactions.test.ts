import { describe, it, expect, vi, beforeEach } from "vitest"
import { supabase } from "../client"
import { executeRecurringTransactions } from "../recurring-transactions"
import type { RecurringTransaction } from "@/types"

vi.mock("../client", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}))

vi.mock("../notifications", () => ({
  createNotification: vi.fn(),
}))

vi.mock("../transactions", () => ({
  createTransaction: vi.fn(),
}))

const createMockTransaction = (overrides?: Partial<RecurringTransaction>): RecurringTransaction => ({
  id: "1",
  user_id: "u1",
  account_id: "a1",
  category_id: "c1",
  type: "EXPENSE",
  amount: 100,
  description: "Test",
  frequency: "MONTHLY",
  start_date: "2024-01-01",
  next_execution: "2024-03-01",
  last_execution: null,
  is_active: true,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  ...overrides,
})

describe("executeRecurringTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date("2024-03-15"))
  })

  it("should not execute inactive transactions", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    const { createTransaction } = await import("../transactions")
    await executeRecurringTransactions()
    expect(createTransaction).not.toHaveBeenCalled()
  })

  it("should execute due active transactions", async () => {
    const mockTx = createMockTransaction()

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockTx], error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    } as any)

    const { createTransaction } = await import("../transactions")
    await executeRecurringTransactions()
    expect(createTransaction).toHaveBeenCalledTimes(1)
  })

  it("should skip future transactions", async () => {
    const mockTx = createMockTransaction({ next_execution: "2024-04-01" })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockTx], error: null }),
    } as any)

    const { createTransaction } = await import("../transactions")
    await executeRecurringTransactions()
    expect(createTransaction).not.toHaveBeenCalled()
  })

  it("should handle errors gracefully", async () => {
    vi.mocked(supabase.from).mockImplementation(() => {
      throw new Error("Network error")
    })

    await expect(executeRecurringTransactions()).resolves.not.toThrow()
  })
})
