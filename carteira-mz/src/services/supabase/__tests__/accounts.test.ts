import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Account } from "@/types"

const mockCreateNotification = vi.fn()

vi.mock("@/services/supabase/notifications", () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}))

const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
}

vi.mock("@/services/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => mockSupabaseQuery),
  },
}))

const { checkLowBalances } = await import("../accounts")

const activeAccount = (overrides: Partial<Account> = {}): Account => ({
  id: "acc-1",
  user_id: "user-1",
  institution_id: null,
  name: "Conta Corrente",
  type: "BANK",
  currency: "MZN",
  balance: 200,
  initial_balance: 0,
  color: null,
  icon: null,
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
})

function mockAccounts(accounts: Account[]) {
  mockSupabaseQuery.order.mockResolvedValue({ data: accounts, error: null })
}

describe("checkLowBalances", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a LOW_BALANCE notification when account balance is below threshold", async () => {
    mockAccounts([activeAccount({ balance: 200 })])
    await checkLowBalances(500)

    expect(mockCreateNotification).toHaveBeenCalledWith(
      "LOW_BALANCE",
      "Saldo baixo em Conta Corrente",
      expect.stringContaining("Conta Corrente"),
      "/contas/acc-1",
    )
  })

  it("skips accounts with balance above threshold", async () => {
    mockAccounts([activeAccount({ balance: 1000 })])
    await checkLowBalances(500)

    expect(mockCreateNotification).not.toHaveBeenCalled()
  })

  it("skips inactive accounts even if below threshold", async () => {
    mockAccounts([activeAccount({ is_active: false, balance: 100 })])
    await checkLowBalances(500)

    expect(mockCreateNotification).not.toHaveBeenCalled()
  })

  it("creates notifications for multiple low-balance accounts", async () => {
    mockAccounts([
      activeAccount({ id: "acc-1", name: "Conta A", balance: 100 }),
      activeAccount({ id: "acc-2", name: "Conta B", balance: 50 }),
      activeAccount({ id: "acc-3", name: "Conta C", balance: 1000 }),
    ])
    await checkLowBalances(500)

    expect(mockCreateNotification).toHaveBeenCalledTimes(2)
    expect(mockCreateNotification).toHaveBeenCalledWith(
      "LOW_BALANCE",
      expect.stringContaining("Conta A"),
      expect.any(String),
      "/contas/acc-1",
    )
    expect(mockCreateNotification).toHaveBeenCalledWith(
      "LOW_BALANCE",
      expect.stringContaining("Conta B"),
      expect.any(String),
      "/contas/acc-2",
    )
  })

  it("uses default threshold of 500", async () => {
    mockAccounts([
      activeAccount({ id: "acc-1", name: "Conta Alta", balance: 500 }),
      activeAccount({ id: "acc-2", name: "Conta Baixa", balance: 499 }),
    ])
    await checkLowBalances()

    expect(mockCreateNotification).toHaveBeenCalledTimes(1)
    expect(mockCreateNotification).toHaveBeenCalledWith(
      "LOW_BALANCE",
      expect.stringContaining("Conta Baixa"),
      expect.any(String),
      "/contas/acc-2",
    )
  })
})
