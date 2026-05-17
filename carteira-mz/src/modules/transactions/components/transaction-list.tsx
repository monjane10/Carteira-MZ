"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  AlertTriangle,
  Handshake,
  Banknote,
  Filter,
  X,
  Trash2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { TRANSACTION_TYPE_LABELS } from "@/constants"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import type { Transaction, TransactionType } from "@/types"

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

const TYPE_ICONS: Record<string, typeof ArrowUpCircle> = {
  INCOME: ArrowUpCircle,
  EXPENSE: ArrowDownCircle,
  TRANSFER: ArrowRightLeft,
  ADJUSTMENT: AlertTriangle,
  LOAN_GIVEN: Handshake,
  LOAN_TAKEN: Banknote,
  LOAN_PAYMENT: Banknote,
}

const EXPENSE_LIKE_TYPES = new Set(["EXPENSE", "ADJUSTMENT", "LOAN_GIVEN", "LOAN_TAKEN", "LOAN_PAYMENT"])
const ITEMS_PER_PAGE = 10

export function TransactionList({ transactions, loading, onEdit, onDelete }: TransactionListProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const desc = (t.description ?? "").toLowerCase()
        const cat = (t.category?.name ?? "").toLowerCase()
        if (!desc.includes(q) && !cat.includes(q)) return false
      }
      return true
    })
  }, [transactions, search, typeFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  function exportTransactionsCSV() {
    const BOM = "\uFEFF"
    const headers = "Data,Tipo,Descrição,Categoria,Conta,Valor (MZN)"
    const rows = filtered.map((t) => {
      const date = new Date(t.transaction_date).toLocaleDateString("pt-MZ")
      const type = TRANSACTION_TYPE_LABELS[t.type] ?? t.type
      const desc = (t.description ?? "").replace(/,/g, " ")
      const cat = t.category?.name ?? ""
      const acc = t.account?.name ?? ""
      const value = t.type === "INCOME" ? t.amount : -t.amount
      return `${date},${type},${desc},${cat},${acc},${value.toFixed(2)}`
    })
    const csv = BOM + headers + "\n" + rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transacoes_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowUpCircle}
        title="Nenhuma transacção"
        description="Registe a sua primeira transacção para começar a controlar as suas finanças."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Pesquisar por descrição ou categoria..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisibleCount(ITEMS_PER_PAGE)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v)
            setVisibleCount(ITEMS_PER_PAGE)
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {TRANSACTION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={exportTransactionsCSV}
          className="shrink-0"
          aria-label="Exportar CSV"
        >
          <Download className="mr-1.5 h-4 w-4" />
          CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Filter className="mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma transacção encontrada com os filtros actuais.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearch("")
              setTypeFilter("all")
            }}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visible.map((transaction, index) => {
              const Icon = TYPE_ICONS[transaction.type] ?? ArrowDownCircle
              const isIncome = transaction.type === "INCOME"
              const isExpense = EXPENSE_LIKE_TYPES.has(transaction.type)

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                  onClick={() => router.push(`/transacoes/${transaction.id}`)}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isIncome
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {transaction.description ?? "Sem descrição"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {transaction.category?.name ?? "Sem categoria"}
                      {transaction.account && <> &middot; {transaction.account.name}</>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(transaction.transaction_date)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(transaction)
                    }}
                    className="shrink-0 rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              >
                Mostrar mais ({filtered.length - visibleCount} restantes)
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-slate-400">
            Mostrando {visible.length} de {filtered.length} transacções
          </p>
        </>
      )}
    </div>
  )
}
