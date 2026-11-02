"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { TransferList } from "./components/transfer-list"
import { useTransferStore } from "@/store"

function TransfersPage() {
  const router = useRouter()
  const { transfers, isLoading, error, fetchTransfers } = useTransferStore()

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  return (
    <div>
      <PageHeader title="Transferências" description="Gerencie as transferências entre as suas contas">
        <Link href="/transferencias/nova">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Transferência
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={fetchTransfers} className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <LoadingState type="card" />
      ) : (
        <TransferList
          transfers={transfers}
          loading={false}
          onClick={(t) => router.push(`/transferencias/${t.id}`)}
        />
      )}
    </div>
  )
}
export default TransfersPage
export { TransfersPage as TransfersModule }
