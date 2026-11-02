// CSV para o Excel em português: separador ";" e vírgula decimal.
const SEPARATOR = ";"

export type CsvValue = string | number | null | undefined

function formatCell(value: CsvValue): string {
  if (value === null || value === undefined) return ""
  const text = typeof value === "number" ? value.toFixed(2).replace(".", ",") : value
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: CsvValue[][]): string {
  return "\uFEFF" + rows.map((row) => row.map(formatCell).join(SEPARATOR)).join("\r\n")
}

export function downloadCsv(filename: string, rows: CsvValue[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
