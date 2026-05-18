"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { DashboardModule } from "@/modules/dashboard"
import { MobileDashboard } from "@/modules/dashboard/mobile-index"

export default function DashboardSwitcher() {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop === undefined) return null

  return isDesktop ? <DashboardModule /> : <MobileDashboard />
}
