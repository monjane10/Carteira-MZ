import { describe, it, expect } from "vitest"
import { formatCurrency, formatDate, formatPercentage, cn } from "@/lib/utils"

describe("formatCurrency", () => {
  it("formats MZN currency", () => {
    const result = formatCurrency(1500)
    expect(result).toContain("Mzn")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0")
  })

  it("formats negative values", () => {
    const result = formatCurrency(-500)
    expect(result).toContain("500")
  })
})

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    const result = formatDate("2024-03-15")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("handles empty string gracefully", () => {
    const result = formatDate("")
    expect(typeof result).toBe("string")
  })

  it("returns Hoje for today", () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(formatDate(today, "relative")).toBe("Hoje")
  })
})

describe("formatPercentage", () => {
  it("formats a positive percentage", () => {
    expect(formatPercentage(25.5)).toBe("+25.5%")
  })

  it("formats a negative percentage", () => {
    expect(formatPercentage(-10)).toBe("-10.0%")
  })

  it("formats zero", () => {
    expect(formatPercentage(0)).toBe("+0.0%")
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("removes conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })
})
