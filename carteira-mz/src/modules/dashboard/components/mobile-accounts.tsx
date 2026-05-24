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
        <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Minhas Contas</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nenhuma conta activa</p>
      </div>
    )
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Minhas Contas</h2>
        <Link
          href="/contas"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Ver todas
        </Link>
      </div>

      <div className="overflow-x-auto overflow-y-hidden pb-1 hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-3" style={{ width: "max-content", minWidth: "100%" }}>
          {active.map((account) => {
            const logoPath = getAccountLogo(account.institution?.name ?? account.name)
            const FallbackIcon = fallbackIcons[account.type] || Wallet

            return (
              <Link
                key={account.id}
                href={`/contas/${account.id}`}
                className="w-[150px] shrink-0 rounded-xl border border-slate-100 bg-white px-2.5 py-2 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg overflow-hidden bg-slate-50">
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
                        className="h-3.5 w-3.5"
                        style={{ color: account.color || "#0F172A" }}
                      />
                    )}
                  </div>
                  <ChevronRight className="h-2.5 w-2.5 text-slate-300 dark:text-slate-600 shrink-0" />
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-slate-500 truncate">
                  {account.name}
                </p>
                <p className="text-[11px] font-bold text-[#0F172A] dark:text-white truncate">
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
