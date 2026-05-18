"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Repeat, Trash2, Pause, Play } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { useRecurringTransactionStore } from "@/store"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { RecurringFrequency } from "@/types"

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  DAILY: "Diário",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
}

function RecurringTransactionsPage() {
  const router = useRouter()
  const { transactions, isLoading, fetchTransactions, toggleActive, removeTransaction } = useRecurringTransactionStore()
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await removeTransaction(id)
      toast({ title: "Removida", description: "Transacção recorrente removida.", variant: "success" })
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "error" })
    } finally {
      setDeleting(null)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    await toggleActive(id, current)
    toast({ title: current ? "Pausada" : "Activada", description: "Transacção recorrente actualizada.", variant: "success" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader title="Transacções Recorrentes" description="Gerencie transacções automatizadas">
        <Button variant="default" size="sm" onClick={() => router.push("/recorrentes/nova")}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova Recorrente
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingState key={i} type="card" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Nenhuma transacção recorrente"
          description="Crie transacções automáticas para despesas ou receitas fixas."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {transactions.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      t.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      <Repeat className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{t.description || "Sem descrição"}</p>
                      <p className="text-xs text-slate-500">{t.account?.name ?? "—"}</p>
                    </div>
                  </div>
                  <Badge variant={t.is_active ? "success" : "default"}>
                    {t.is_active ? "Activo" : "Pausado"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Valor</span>
                  <span className={`text-sm font-bold ${
                    t.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-sm">
                  <span className="text-slate-500">Frequência</span>
                  <span className="font-medium text-slate-700">{FREQUENCY_LABELS[t.frequency]}</span>
                </div>

                <div className="flex items-center justify-between py-1 text-sm">
                  <span className="text-slate-500">Próxima execução</span>
                  <span className="font-medium text-slate-700">{formatDate(t.next_execution)}</span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggle(t.id, t.is_active)}
                  >
                    {t.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {t.is_active ? "Pausar" : "Activar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default RecurringTransactionsPage
export { RecurringTransactionsPage as RecurringTransactionsModule }
