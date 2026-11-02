import { describe, it, expect, vi } from "vitest"
import { fetchAll } from "../supabase-fetch-all"

describe("fetchAll", () => {
  it("reads every page until a short page is returned", async () => {
    const all = Array.from({ length: 2500 }, (_, i) => i)
    const query = vi.fn(async (from: number, to: number) => ({ data: all.slice(from, to + 1), error: null }))

    const rows = await fetchAll(query)

    expect(rows).toHaveLength(2500)
    expect(query).toHaveBeenCalledTimes(3)
    expect(query).toHaveBeenNthCalledWith(2, 1000, 1999)
  })

  it("stops after one request when there are fewer rows than a page", async () => {
    const query = vi.fn(async () => ({ data: [1, 2, 3], error: null }))
    await expect(fetchAll(query)).resolves.toEqual([1, 2, 3])
    expect(query).toHaveBeenCalledTimes(1)
  })

  it("throws when a page fails", async () => {
    const query = vi.fn(async () => ({ data: null, error: { message: "boom" } }))
    await expect(fetchAll(query)).rejects.toThrow("boom")
  })
})
