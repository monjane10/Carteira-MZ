"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { toast } from "@/hooks/use-toast"
import { AccountsList } from "./components/accounts-list"
import { AccountForm } from "./components/account-form"
import * as accountService from "@/services/mock/accounts"
import type { Account } from "@/types"

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await accountService.getAccounts()
      setAccounts(data)
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as contas.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleCreate = async (data: {
    name: string
    type: "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
    initial_balance: number
    color?: string | null
  }) => {
    try {
      const newAccount = await accountService.createAccount({
        name: data.name,
        type: data.type,
        currency: "MZN",
        balance: data.initial_balance,
        initial_balance: data.initial_balance,
        color: data.color ?? null,
        icon: null,
        institution_id: null,
        is_active: true,
      })
      setAccounts((prev) => [newAccount, ...prev])
      toast({ title: "Sucesso", description: "Conta criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "error" })
    }
  }

  const handleUpdate = async (data: {
    name: string
    type: "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
    initial_balance: number
    color?: string | null
  }) => {
    if (!editingAccount) return
    try {
      const updated = await accountService.updateAccount(editingAccount.id, {
        name: data.name,
        type: data.type,
        initial_balance: data.initial_balance,
        color: data.color ?? null,
      })
      if (updated) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        )
        toast({ title: "Sucesso", description: "Conta actualizada com sucesso.", variant: "success" })
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar a conta.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await accountService.deleteAccount(deleteConfirm.id)
      setAccounts((prev) => prev.filter((a) => a.id !== deleteConfirm.id))
      toast({ title: "Sucesso", description: "Conta removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover a conta.", variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingAccount(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: {
    name: string
    type: "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
    initial_balance: number
    color?: string | null
  }) => {
    if (editingAccount) {
      await handleUpdate(data)
    } else {
      await handleCreate(data)
    }
  }

  return (
    <div>
      <PageHeader title="Contas" description="Gerencie as suas contas bancárias e carteiras">
      </PageHeader>

      <AccountsList
        accounts={accounts}
        loading={loading}
        onAddAccount={handleOpenCreate}
        onAccountClick={handleOpenEdit}
      />

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingAccount={editingAccount}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        title="Remover Conta"
        description={`Tem a certeza que deseja remover a conta "${deleteConfirm?.name}"? Esta acção não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
export default AccountsPage
export { AccountsPage as AccountsModule }
