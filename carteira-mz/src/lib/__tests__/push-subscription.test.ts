import { describe, it, expect } from "vitest"
import { getPushSubscriptionPayload } from "../push-subscription"

describe("getPushSubscriptionPayload", () => {
  it("returns payload when all keys are present", () => {
    const sub: PushSubscriptionJSON = {
      endpoint: "https://example.com/push",
      keys: { p256dh: "abc123", auth: "def456" },
    }
    const result = getPushSubscriptionPayload(sub)
    expect(result).toEqual({
      endpoint: "https://example.com/push",
      p256dh: "abc123",
      auth: "def456",
    })
  })

  it("returns null when endpoint is missing", () => {
    const sub: PushSubscriptionJSON = {
      endpoint: "",
      keys: { p256dh: "abc123", auth: "def456" },
    }
    expect(getPushSubscriptionPayload(sub)).toBeNull()
  })

  it("returns null when keys is missing entirely", () => {
    const sub: PushSubscriptionJSON = {
      endpoint: "https://example.com/push",
      keys: undefined as unknown as PushSubscriptionJSON["keys"],
    }
    expect(getPushSubscriptionPayload(sub)).toBeNull()
  })

  it("returns null when p256dh is missing", () => {
    const sub: PushSubscriptionJSON = {
      endpoint: "https://example.com/push",
      keys: { auth: "def456" } as PushSubscriptionJSON["keys"],
    }
    expect(getPushSubscriptionPayload(sub)).toBeNull()
  })

  it("returns null when auth is missing", () => {
    const sub: PushSubscriptionJSON = {
      endpoint: "https://example.com/push",
      keys: { p256dh: "abc123" } as PushSubscriptionJSON["keys"],
    }
    expect(getPushSubscriptionPayload(sub)).toBeNull()
  })
})
