import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetSession = vi.fn()

vi.mock("@/services/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}))

const { createNotification } = await import("../notifications")

describe("createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sends a POST request to /api/notifications with correct payload", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "test-token" } },
    })

    const mockResponse = {
      id: "notif-1",
      type: "LOW_BALANCE",
      title: "Saldo baixo",
      message: "Conta com saldo baixo",
      url: "/contas/1",
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await createNotification(
      "LOW_BALANCE",
      "Saldo baixo",
      "Conta com saldo baixo",
      "/contas/1",
    )

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        type: "LOW_BALANCE",
        title: "Saldo baixo",
        message: "Conta com saldo baixo",
        url: "/contas/1",
      }),
    })
    expect(result).toEqual(mockResponse)
  })

  it("throws when no session is available", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })

    await expect(
      createNotification("SYSTEM", "Test", "Test message"),
    ).rejects.toThrow()
  })

  it("throws when API returns error status", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "test-token" } },
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Erro ao criar notificação" }),
    })

    await expect(
      createNotification("SYSTEM", "Test", "Test message"),
    ).rejects.toThrow("Erro ao criar notificacao")
  })
})
