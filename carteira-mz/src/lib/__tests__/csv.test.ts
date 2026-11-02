import { describe, it, expect } from "vitest"
import { toCsv } from "../csv"

describe("toCsv", () => {
  it("uses semicolons, comma decimals and a BOM for Excel in Portuguese", () => {
    expect(toCsv([["Mês", "Total"], ["Jan", 1234.5]])).toBe("\uFEFFMês;Total\r\nJan;1234,50")
  })

  it("keeps commas inside a cell without splitting columns", () => {
    expect(toCsv([["Casa, renda", 10]])).toBe("\uFEFFCasa, renda;10,00")
  })

  it("quotes cells with separators, quotes or line breaks", () => {
    expect(toCsv([['Loja "A"; filial', "linha\nnova"]])).toBe('\uFEFF"Loja ""A""; filial";"linha\nnova"')
  })

  it("leaves empty cells for missing values", () => {
    expect(toCsv([["a", null, undefined, "b"]])).toBe("\uFEFFa;;;b")
  })
})
