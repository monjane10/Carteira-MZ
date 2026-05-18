import { Suspense } from "react"
import { RecurringCreateScreen } from "@/modules/recurring-transactions/recurring-create-screen"

export default function NovaRecorrentePage() {
  return (
    <Suspense fallback={null}>
      <RecurringCreateScreen />
    </Suspense>
  )
}
