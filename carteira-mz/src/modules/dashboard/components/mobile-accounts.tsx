"use client"

import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/types"
import { Building2, Smartphone, Wallet, PiggyBank, ChevronRight } from "lucide-react"

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
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Minhas Contas
        </h2>
        <Link
          href="/contas"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {active.map((account) => {
          const Icon = accountIcons[account.type] || Wallet

          return (
            <Link
              key={account.id}
              href="/contas"
              className="flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              style={{ width: "165px" }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: (account.color || "#0F172A") + "15" }}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    style={{ color: account.color || "#0F172A" }}
                  />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                {account.name}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(account.balance)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
