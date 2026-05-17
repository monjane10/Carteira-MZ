"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { CategoryList } from "./components/category-list"
import { CategoryForm } from "./components/category-form"
import { useCategoryStore } from "@/store"
import type { Category, TransactionType } from "@/types"

function CategoriesPage() {
  const { categories, isLoading, error, fetchCategories, addCategory, updateCategory, removeCategory } = useCategoryStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async (data: {
    name: string
    type: TransactionType
    icon?: string | null
  }) => {
    try {
      await addCategory({
        name: data.name,
        type: data.type,
        color: null,
        icon: data.icon ?? null,
        is_default: false,
      })
      toast({ title: "Sucesso", description: "Categoria criada com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleUpdate = async (data: {
    name: string
    type: TransactionType
    icon?: string | null
  }) => {
    if (!editingCategory) return
    try {
      await updateCategory(editingCategory.id, {
        name: data.name,
        type: data.type,
        color: editingCategory.color ?? null,
        icon: data.icon ?? null,
      })
      toast({ title: "Sucesso", description: "Categoria actualizada com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await removeCategory(deleteConfirm.id)
      toast({ title: "Sucesso", description: "Categoria removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
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
        <Link href="/categorias/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Categoria
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchCategories} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <LoadingState type="card" />
      ) : (
        <CategoryList
          categories={categories}
          loading={false}
          onAddCategory={handleOpenCreate}
          onEditCategory={handleOpenEdit}
          onDeleteCategory={(category) => setDeleteConfirm(category)}
        />
      )}

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
