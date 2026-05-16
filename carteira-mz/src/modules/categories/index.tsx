"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { toast } from "@/hooks/use-toast"
import { CategoryList } from "./components/category-list"
import { CategoryForm } from "./components/category-form"
import * as categoryService from "@/services/mock/categories"
import type { Category, TransactionType } from "@/types"

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as categorias.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async (data: {
    name: string
    type: TransactionType
    color?: string | null
    icon?: string | null
  }) => {
    try {
      const newCategory = await categoryService.createCategory({
        name: data.name,
        type: data.type,
        color: data.color ?? null,
        icon: data.icon ?? null,
        is_default: false,
      })
      setCategories((prev) => [newCategory, ...prev])
      toast({ title: "Sucesso", description: "Categoria criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a categoria.", variant: "error" })
    }
  }

  const handleUpdate = async (data: {
    name: string
    type: TransactionType
    color?: string | null
    icon?: string | null
  }) => {
    if (!editingCategory) return
    try {
      const updated = await categoryService.updateCategory(editingCategory.id, {
        name: data.name,
        type: data.type,
        color: data.color ?? null,
        icon: data.icon ?? null,
      })
      if (updated) {
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
        toast({ title: "Sucesso", description: "Categoria actualizada com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar a categoria.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await categoryService.deleteCategory(deleteConfirm.id)
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
      toast({ title: "Sucesso", description: "Categoria removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover a categoria.", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: {
    name: string
    type: TransactionType
    color?: string | null
    icon?: string | null
  }) => {
    if (editingCategory) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  return (
    <div>
      <PageHeader title="Categorias" description="Gerencie as suas categorias de transacções">
      </PageHeader>

      <CategoryList
        categories={categories}
        loading={loading}
        onAddCategory={handleOpenCreate}
        onEditCategory={handleOpenEdit}
        onDeleteCategory={(category) => setDeleteConfirm(category)}
      />

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingCategory={editingCategory}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        title="Remover Categoria"
        description={`Tem a certeza que deseja remover a categoria "${deleteConfirm?.name}"? Esta acção não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
export default CategoriesPage
export { CategoriesPage as CategoriesModule }
