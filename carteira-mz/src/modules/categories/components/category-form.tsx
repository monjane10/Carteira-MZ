"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import type { TransactionType, Category } from "@/types"

const categoryFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  type: z.enum([
    "INCOME",
    "EXPENSE",
    "TRANSFER",
    "ADJUSTMENT",
    "LOAN_GIVEN",
    "LOAN_TAKEN",
    "LOAN_PAYMENT",
  ] as const),
  icon: z.string().nullable().optional(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CategoryFormValues) => Promise<void>
  editingCategory?: Category | null
}

export function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  editingCategory,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: null,
    },
  })

  const selectedType = watch("type")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  const transactionTypes: TransactionType[] = [
    "INCOME",
    "EXPENSE",
    "TRANSFER",
    "ADJUSTMENT",
    "LOAN_GIVEN",
    "LOAN_TAKEN",
    "LOAN_PAYMENT",
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Altere os dados da categoria."
              : "Adicione uma nova categoria para organizar as suas transacções."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome</Label>
              <Input
                id="name"
                placeholder="Nome da categoria"
                className="h-14 rounded-xl text-[15px] border-slate-200 w-full"
                error={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-[#0F172A] block mb-1.5">Tipo</Label>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  setValue("type", value as TransactionType)
                }
              >
                <SelectTrigger className="h-14 rounded-xl text-[15px] border-slate-200 w-full">
                  <SelectValue placeholder="Seleccione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TRANSACTION_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-14 rounded-xl text-[15px]"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-14 rounded-xl bg-[#0F172A] text-[15px] font-semibold">
              {isSubmitting
                ? "Aguarde..."
                : editingCategory
                  ? "Salvar"
                  : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
