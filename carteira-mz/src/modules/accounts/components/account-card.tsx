"use client"

import Image from "next/image"
import { Building2, Smartphone, Wallet, PiggyBank, TrendingUp, HelpCircle, ChevronRight } from "lucide-react"
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
        "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-950",
        onClick && "cursor-pointer"
      )}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-center gap-3 pl-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
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
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
            {account.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-[#0F172A] dark:text-white">
            {formatCurrency(account.balance)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
      </div>
    </button>
  )
}
