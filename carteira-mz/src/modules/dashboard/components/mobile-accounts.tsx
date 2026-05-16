"use client"

import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/types"
import { Building2, Smartphone, Wallet, PiggyBank } from "lucide-react"

interface MobileAccountsProps {
  accounts: Account[]
}

const accountIcons: Record<string, typeof Building2> = {
  BANK: Building2,
  MOBILE_MONEY: Smartphone,
  CASH: Wallet,
  SAVINGS: PiggyBank,
  INVESTMENT: Building2,
  OTHER: Wallet,
}

export function MobileAccounts({ accounts }: MobileAccountsProps) {
  const active = accounts.filter((a) => a.is_active)

  if (active.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Minhas Contas
        </h2>
        <p className="mt-2 text-sm text-slate-500">Nenhuma conta activa</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Minhas Contas
      </h2>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {active.map((account) => {
          const Icon = accountIcons[account.type] || Wallet

          return (
            <div
              key={account.id}
              className="flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              style={{ width: "160px" }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: account.color || "#0F172A" + "15" }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: account.color || "#0F172A" }}
                />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                {account.name}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(account.balance)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
