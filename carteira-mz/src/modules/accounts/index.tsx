"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { toast } from "@/hooks/use-toast"
import { AccountsList } from "./components/accounts-list"
import { AccountForm } from "./components/account-form"
import { useAccountStore } from "@/store"
import { supabase } from "@/services/supabase/client"
import type { Account } from "@/types"

function AccountsPage() {
  const { accounts, isLoading, error, fetchAccounts, addAccount, updateAccount, removeAccount } = useAccountStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleCreate = async (data: {
    name: string
    type: "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
    initial_balance: number
  }) => {
    try {
      const { data: inst } = await supabase
        .from("financial_institutions")
        .select("id")
        .eq("name", data.name)
        .maybeSingle()
      await addAccount({
        name: data.name,
        type: data.type,
        currency: "MZN",
        balance: data.initial_balance,
        initial_balance: data.initial_balance,
        color: "#0F172A",
        icon: null,
        institution_id: inst?.id ?? null,
        is_active: true,
      })
      toast({ title: "Sucesso", description: "Conta criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "error" })
    }
  }

  const handleUpdate = async (data: {
    name: string
    type: "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
    initial_balance: number
  }) => {
    if (!editingAccount) return
    try {
      await updateAccount(editingAccount.id, {
        name: data.name,
        type: data.type,
        initial_balance: data.initial_balance,
        color: editingAccount.color ?? null,
      })
      toast({ title: "Sucesso", description: "Conta actualizada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível actualizar a conta.", variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await removeAccount(deleteConfirm.id)
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

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchAccounts} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <LoadingState type="card" />
      ) : (
        <AccountsList
          accounts={accounts}
          loading={false}
          onAddAccount={handleOpenCreate}
          onAccountClick={handleOpenEdit}
        />
      )}

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
