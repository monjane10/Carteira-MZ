"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { DashboardModule } from "@/modules/dashboard"
import { MobileDashboard } from "@/modules/dashboard/mobile-index"

export default function DashboardPage() {
  const isMobile = useMediaQuery("(max-width: 1023px)")

  if (isMobile === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-16 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  if (isMobile) {
    return <MobileDashboard />
  }

  return <DashboardModule />
}
