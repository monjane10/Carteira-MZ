import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500 dark:text-slate-400">
        Nenhum registo encontrado
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full" role="grid">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.map((row, i) => (
            <tr
              key={(row.id as string) ?? i}
              onClick={() => onRowClick?.(row)}
              role="row"
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row) } : undefined}
              className={cn(
                "bg-white transition-colors dark:bg-slate-950",
                onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  role="gridcell"
                  className={cn(
                    "px-4 py-3 text-sm text-slate-700 dark:text-slate-300",
                    col.className
                  )}
                >
                  {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
