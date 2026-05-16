"use client"

import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { getAccountLogo } from "@/lib/account-logos"
import type { Account } from "@/types"
import { Building2, Smartphone, Wallet, PiggyBank, ChevronRight } from "lucide-react"

interface MobileAccountsProps {
  accounts: Account[]
}

const fallbackIcons: Record<string, typeof Building2> = {
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
      <div className="w-full">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Minhas Contas
        </h2>
        <p className="mt-2 text-sm text-slate-500">Nenhuma conta activa</p>
      </div>
    )
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Minhas Contas
        </h2>
        <Link
          href="/contas"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 shrink-0"
        >
          Ver todas
        </Link>
      </div>

      <div className="overflow-x-auto overflow-y-hidden pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-3" style={{ width: "max-content", minWidth: "100%" }}>
          {active.map((account) => {
            const logoPath = getAccountLogo(account.name)
            const FallbackIcon = fallbackIcons[account.type] || Wallet

            return (
              <Link
                key={account.id}
                href="/contas"
                className="w-[170px] shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-700">
                    {logoPath ? (
                      <Image
                        src={logoPath}
                        alt={account.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <FallbackIcon
                        className="h-3 w-3"
                        style={{ color: account.color || "#0F172A" }}
                      />
                    )}
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {account.name}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                  {formatCurrency(account.balance)}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
