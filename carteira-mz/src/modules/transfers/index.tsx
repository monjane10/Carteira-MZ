"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { TransferList } from "./components/transfer-list"
import { TransferForm } from "./components/transfer-form"
import * as transferService from "@/services/mock/transfers"
import type { Transfer } from "@/types"
import type { z } from "zod"
import type { transferSchema } from "@/validators"

type TransferFormValues = z.infer<typeof transferSchema>

function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const fetchTransfers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await transferService.getTransfers()
      setTransfers(data)
    } catch {
      setError("Não foi possível carregar as transferências.")
      toast({ title: "Erro", description: "Não foi possível carregar as transferências.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  const handleCreate = async (data: TransferFormValues) => {
    try {
      const newTransfer = await transferService.createTransfer({
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        fee: data.fee ?? 0,
        description: data.description ?? null,
        transfer_date: data.transfer_date,
      })
      setTransfers((prev) => [newTransfer, ...prev])
      toast({ title: "Sucesso", description: "Transferência criada com sucesso.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível criar a transferência.", variant: "error" })
    }
  }

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
      ) : loading ? (
        <LoadingState type="card" />
      ) : (
        <TransferList transfers={transfers} loading={false} />
      )}

      <TransferForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
    </div>
  )
}
export default TransfersPage
export { TransfersPage as TransfersModule }
