import { Suspense } from "react"
import { TransactionCreateScreen } from "@/modules/transactions/components/transaction-create-screen"

export default function NovaTransacaoPage() {
  return (
    <Suspense fallback={null}>
      <TransactionCreateScreen />
    </Suspense>
  )
}
