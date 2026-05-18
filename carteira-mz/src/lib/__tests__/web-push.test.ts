import { describe, it, expect, vi, beforeEach } from "vitest"
import type { PushSubscriptionRow } from "../web-push"

const mockSubscription: PushSubscriptionRow = {
  id: "sub-1",
  user_id: "user-1",
  endpoint: "https://example.com/push",
  p256dh: "abc123",
  auth: "def456",
  user_agent: "TestAgent",
  created_at: "2025-01-01T00:00:00Z",
}

const mockPayload = { title: "Test", body: "Hello", url: "/test" }

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}))

describe("sendPushNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("skips sending when VAPID keys are not configured", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = ""
    process.env.VAPID_PRIVATE_KEY = ""
    const mod = await import("../web-push")
    await mod.sendPushNotification(mockSubscription, mockPayload)
    expect((await import("web-push")).default.sendNotification).not.toHaveBeenCalled()
  })

  it("calls webPush.sendNotification with correct arguments", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key"
    process.env.VAPID_PRIVATE_KEY = "test-private-key"
    const webPush = await import("web-push")
    vi.mocked(webPush.default.sendNotification).mockResolvedValueOnce(undefined)

    const mod = await import("../web-push")
    await mod.sendPushNotification(mockSubscription, mockPayload)

    expect(webPush.default.sendNotification).toHaveBeenCalledWith(
      {
        endpoint: mockSubscription.endpoint,
        keys: { p256dh: mockSubscription.p256dh, auth: mockSubscription.auth },
      },
      JSON.stringify(mockPayload),
      { TTL: 86400 },
    )
  })

  it("returns expired when status code is 410 (Gone)", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key"
    process.env.VAPID_PRIVATE_KEY = "test-private-key"
    const webPush = await import("web-push")
    const error = new Error("Gone")
    ;(error as { statusCode: number }).statusCode = 410
    vi.mocked(webPush.default.sendNotification).mockRejectedValueOnce(error)

    const mod = await import("../web-push")
    const result = await mod.sendPushNotification(mockSubscription, mockPayload)
    expect(result).toEqual({ expired: true, id: "sub-1" })
  })

  it("returns expired when status code is 404 (Not Found)", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key"
    process.env.VAPID_PRIVATE_KEY = "test-private-key"
    const webPush = await import("web-push")
    const error = new Error("Not Found")
    ;(error as { statusCode: number }).statusCode = 404
    vi.mocked(webPush.default.sendNotification).mockRejectedValueOnce(error)

    const mod = await import("../web-push")
    const result = await mod.sendPushNotification(mockSubscription, mockPayload)
    expect(result).toEqual({ expired: true, id: "sub-1" })
  })

  it("rethrows on other errors", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key"
    process.env.VAPID_PRIVATE_KEY = "test-private-key"
    const webPush = await import("web-push")
    const error = new Error("Network error")
    vi.mocked(webPush.default.sendNotification).mockRejectedValueOnce(error)

    const mod = await import("../web-push")
    await expect(
      mod.sendPushNotification(mockSubscription, mockPayload),
    ).rejects.toThrow("Network error")
  })
})

describe("sendPushToUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("sends to all subscriptions and returns expired IDs", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key"
    process.env.VAPID_PRIVATE_KEY = "test-private-key"

    const sub2 = { ...mockSubscription, id: "sub-2" }
    const webPush = await import("web-push")
    const error = new Error("Gone")
    ;(error as { statusCode: number }).statusCode = 410

    vi.mocked(webPush.default.sendNotification)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(error)

    const mod = await import("../web-push")
    const result = await mod.sendPushToUser([mockSubscription, sub2], mockPayload)
    expect(result).toEqual(["sub-2"])
    expect(webPush.default.sendNotification).toHaveBeenCalledTimes(2)
  })

  it("returns empty array when all succeed", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key"
    process.env.VAPID_PRIVATE_KEY = "test-private-key"

    const webPush = await import("web-push")
    vi.mocked(webPush.default.sendNotification).mockResolvedValue(undefined)

    const mod = await import("../web-push")
    const result = await mod.sendPushToUser([mockSubscription], mockPayload)
    expect(result).toEqual([])
  })
})
