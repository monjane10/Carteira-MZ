"use client"

import Image from "next/image"
import { Building2, Smartphone, Wallet, PiggyBank, TrendingUp, HelpCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { getAccountLogo } from "@/lib/account-logos"
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS } from "@/constants"
import type { Account } from "@/types"

interface AccountCardProps {
  account: Account
  onClick?: () => void
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  BANK: Building2,
  MOBILE_MONEY: Smartphone,
  CASH: Wallet,
  SAVINGS: PiggyBank,
  INVESTMENT: TrendingUp,
  OTHER: HelpCircle,
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const FallbackIcon = TYPE_ICONS[account.type] ?? HelpCircle
  const accentColor = account.color ?? ACCOUNT_TYPE_COLORS[account.type] ?? "#64748B"
  const logoPath = getAccountLogo(account.name)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950",
        onClick && "cursor-pointer"
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
          {logoPath ? (
            <Image
              src={logoPath}
              alt={account.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <FallbackIcon className="h-5 w-5" style={{ color: accentColor }} />
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {account.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
        </p>
      </div>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
        {formatCurrency(account.balance)}
      </p>
    </button>
  )
}
