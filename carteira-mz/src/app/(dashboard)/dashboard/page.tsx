"use client"

import dynamic from "next/dynamic"

const DashboardSwitcher = dynamic(
  () => import("./dashboard-switcher"),
  { ssr: false },
)

export default function DashboardPage() {
  return <DashboardSwitcher />
}
