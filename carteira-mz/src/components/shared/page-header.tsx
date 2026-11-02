import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 text-xl font-bold text-slate-900">
          {title}
        </h1>
        {children && <div className="flex max-w-full flex-wrap items-center gap-2">{children}</div>}
      </div>
      {description && (
        <p className="mt-0.5 text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}
