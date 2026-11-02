"use client"

import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { getAccountLogo } from "@/lib/account-logos"
import type { Account } from "@/types"
import { Building2, Smartphone, Wallet, PiggyBank } from "lucide-react"

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
        <h2 className="text-sm font-bold text-[#0F172A]">Minhas Contas</h2>
        <p className="mt-1 text-xs text-slate-500">Nenhuma conta activa</p>
      </div>
    )
  }

  return (
    <section className="w-full shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-sm font-bold text-[#0F172A]">Minhas Contas</h2>
        <Link
          href="/contas"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
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
                className="flex w-[140px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {logoPath ? (
                    <Image
                      src={logoPath}
                      alt={account.name}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  ) : (
                    <FallbackIcon
                      className="h-3.5 w-3.5"
                      style={{ color: account.color || "#0F172A" }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium leading-tight text-slate-500">
                    {account.name}
                  </p>
                  <p className="truncate text-xs font-bold leading-tight text-[#0F172A]">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
