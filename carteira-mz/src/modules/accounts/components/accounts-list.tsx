"use client"

import { Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { AccountCard } from "./account-card"
import type { Account } from "@/types"

interface AccountsListProps {
  accounts: Account[]
  loading: boolean
  onAddAccount: () => void
  onAccountClick: (account: Account) => void
}

export function AccountsList({
  accounts,
  loading,
  onAddAccount,
  onAccountClick,
}: AccountsListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingState key={i} type="card" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhuma conta"
        description="Adicione a sua primeira conta para começar a controlar as suas finanças."
        actionLabel="Adicionar Conta"
        onAction={onAddAccount}
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={onAddAccount} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova Conta
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={() => onAccountClick(account)}
          />
        ))}
      </div>
    </div>
  )
}
