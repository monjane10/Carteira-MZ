"use client"

import { useState, useMemo } from "react"
import { Wallet, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { AccountCard } from "./account-card"
import type { Account, AccountType } from "@/types"
import { ACCOUNT_TYPE_LABELS } from "@/constants"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AccountsListProps {
  accounts: Account[]
  loading: boolean
  onAddAccount: () => void
  onAccountClick: (account: Account) => void
}

export function AccountsList({
  accounts,
  loading,
  onAccountClick,
}: AccountsListProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const name = a.name.toLowerCase()
        const inst = a.institution?.name?.toLowerCase() ?? ""
        if (!name.includes(q) && !inst.includes(q)) return false
      }
      return true
    })
  }, [accounts, search, typeFilter])

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
        onAction={() => window.location.href = "/contas/nova"}
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Pesquisar contas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {ACCOUNT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Filter className="mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma conta encontrada com os filtros actuais.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => { setSearch(""); setTypeFilter("all") }}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={() => onAccountClick(account)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
