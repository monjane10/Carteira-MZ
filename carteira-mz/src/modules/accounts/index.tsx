"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { accounts, isLoading, error, fetchAccounts, addAccount, updateAccount, removeAccount } = useAccountStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [institutionMap, setInstitutionMap] = useState<Map<string, string>>(new Map())
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      fetchAccounts()
      setLoadingInstitutions(true)
      const { data: existing, error } = await supabase
        .from("financial_institutions")
        .select("id, name")
      if (cancelled) return
      if (error) {
        console.error("Erro ao carregar instituições:", error)
      } else if (existing && existing.length > 0) {
        setInstitutionMap(new Map(existing.map(i => [i.name, i.id])))
      }
      setLoadingInstitutions(false)
    }

    load()
    return () => { cancelled = true }
  }, [fetchAccounts])

  const handleCreate = async (data: {
    name: string
    type: "BANK" | "MOBILE_MONEY" | "CASH" | "SAVINGS" | "INVESTMENT" | "OTHER"
    initial_balance: number
  }) => {
    try {
      const institutionId = institutionMap.get(data.name) ?? null
      await addAccount({
        name: data.name,
        type: data.type,
        currency: "MZN",
        balance: data.initial_balance,
        initial_balance: data.initial_balance,
        color: "#0F172A",
        icon: null,
        institution_id: institutionId,
        is_active: true,
      })
      toast({ title: "Sucesso", description: "Conta criada com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await removeAccount(deleteConfirm.id)
      toast({ title: "Sucesso", description: "Conta removida com sucesso.", variant: "success" })
      setDeleteConfirm(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    if (loadingInstitutions) return
    setEditingAccount(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (account: Account) => {
    router.push(`/contas/${account.id}`)
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
