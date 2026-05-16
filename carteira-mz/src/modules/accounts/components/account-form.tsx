"use client"

import Image from "next/image"
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
import { ACCOUNT_TYPE_LABELS } from "@/constants"
import { getAccountLogo } from "@/lib/account-logos"
import type { AccountType, Account } from "@/types"
import { cn } from "@/lib/utils"

const accountFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  type: z.enum(["BANK", "MOBILE_MONEY", "CASH", "SAVINGS", "INVESTMENT", "OTHER"] as const),
  initial_balance: z.number(),
  color: z.string().nullable().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

const bankOperators = [
  { name: "BCI", color: "#0F172A" },
  { name: "Millennium BIM", color: "#1E293B" },
  { name: "ABSA", color: "#334155" },
  { name: "Standard Bank", color: "#475569" },
]

const mobileOperators = [
  { name: "M-Pesa", color: "#10B981" },
  { name: "e-Mola", color: "#059669" },
  { name: "mKesh", color: "#0D9488" },
]

interface AccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AccountFormValues) => Promise<void>
  editingAccount?: Account | null
}

export function AccountForm({
  open,
  onOpenChange,
  onSubmit,
  editingAccount,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "BANK",
      initial_balance: 0,
      color: "#0F172A",
    },
  })

  const selectedType = watch("type")
  const currentName = watch("name")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  const handleFormSubmit = async (data: AccountFormValues) => {
    await onSubmit(data)
    handleOpenChange(false)
  }

  const selectOperator = (op: { name: string; color: string }) => {
    setValue("name", op.name)
    setValue("color", op.color)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAccount ? "Editar Conta" : "Nova Conta"}
          </DialogTitle>
          <DialogDescription>
            {editingAccount
              ? "Altere os dados da sua conta."
              : "Adicione uma nova conta para controlar as suas finanças."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setValue("type", value as AccountType)
                  const isOperator = [...bankOperators, ...mobileOperators].some((o) => o.name === currentName)
                  if (value !== "BANK" && value !== "MOBILE_MONEY" && isOperator) {
                    setValue("name", "")
                    setValue("color", "#0F172A")
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {ACCOUNT_TYPE_LABELS[type]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

            {selectedType === "BANK" && !editingAccount && (
              <div className="space-y-2">
                <Label>Banco</Label>
                <div className="flex gap-2">
                  {bankOperators.map((op) => {
                    const logoPath = getAccountLogo(op.name)
                    const isSelected = currentName === op.name
                    return (
                      <button
                        key={op.name}
                        type="button"
                        onClick={() => selectOperator(op)}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                        )}
                      >
                        {logoPath && (
                          <Image
                            src={logoPath}
                            alt={op.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-600 dark:text-slate-400"
                        )}>
                          {op.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedType === "MOBILE_MONEY" && !editingAccount && (
              <div className="space-y-2">
                <Label>Operadora</Label>
                <div className="flex gap-2">
                  {mobileOperators.map((op) => {
                    const logoPath = getAccountLogo(op.name)
                    const isSelected = currentName === op.name
                    return (
                      <button
                        key={op.name}
                        type="button"
                        onClick={() => selectOperator(op)}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                        )}
                      >
                        {logoPath && (
                          <Image
                            src={logoPath}
                            alt={op.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-600 dark:text-slate-400"
                        )}>
                          {op.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome da conta"
                error={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_balance">Saldo Inicial</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={!!errors.initial_balance}
                {...register("initial_balance", { valueAsNumber: true })}
              />
              {errors.initial_balance && (
                <p className="text-xs text-red-500">
                  {errors.initial_balance.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  className="h-10 w-14 cursor-pointer p-1"
                  {...register("color")}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Cor do acento da conta
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Aguarde..."
                : editingAccount
                  ? "Salvar"
                  : "Criar Conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
