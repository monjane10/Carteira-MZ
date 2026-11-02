import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { wasNotified, markNotified, clearNotified, ONE_DAY_MS } from "../notification-throttle"

describe("notification-throttle", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-02T10:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("reports keys that were never notified as not notified", () => {
    expect(wasNotified("goal-expiring:g1:2026-11-05")).toBe(false)
  })

  it("remembers one-off notifications indefinitely", () => {
    markNotified("budget:b1:2026-11-01:80")
    vi.setSystemTime(new Date("2026-11-30T10:00:00Z"))
    expect(wasNotified("budget:b1:2026-11-01:80")).toBe(true)
  })

  it("allows notifying again after the cooldown", () => {
    markNotified("loan-overdue:l1")
    vi.setSystemTime(Date.now() + ONE_DAY_MS - 1000)
    expect(wasNotified("loan-overdue:l1", ONE_DAY_MS)).toBe(true)
    vi.setSystemTime(Date.now() + 2000)
    expect(wasNotified("loan-overdue:l1", ONE_DAY_MS)).toBe(false)
  })

  it("clears a key so the next check notifies again", () => {
    markNotified("low-balance:a1")
    clearNotified("low-balance:a1")
    expect(wasNotified("low-balance:a1")).toBe(false)
  })

  it("prunes entries older than 90 days", () => {
    markNotified("old")
    vi.setSystemTime(Date.now() + 91 * ONE_DAY_MS)
    markNotified("new")
    const stored = JSON.parse(localStorage.getItem("carteira-mz-notified") ?? "{}")
    expect(Object.keys(stored)).toEqual(["new"])
  })
})
