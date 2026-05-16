"use client"

import { Plus, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import type { Category } from "@/types"

interface CategoryListProps {
  categories: Category[]
  loading: boolean
  onAddCategory: () => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (category: Category) => void
}

export function CategoryList({
  categories,
  loading,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingState key={i} type="card" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="Nenhuma categoria"
        description="Crie categorias para organizar as suas transacções."
        actionLabel="Adicionar Categoria"
        onAction={onAddCategory}
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={onAddCategory} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: category.color
                    ? `${category.color}15`
                    : "#F1F5F9",
                  color: category.color ?? "#64748B",
                }}
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: category.color ?? "#64748B",
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {category.name}
                </p>
                <div className="mt-1">
                  <Badge
                    variant={
                      category.type === "INCOME" ? "success" : "default"
                    }
                    className="text-[10px]"
                  >
                    {TRANSACTION_TYPE_LABELS[category.type] ?? category.type}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onEditCategory(category)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDeleteCategory(category)}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
