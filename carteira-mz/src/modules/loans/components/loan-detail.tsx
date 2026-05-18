"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Phone, Calendar, Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { LOAN_STATUS_LABELS, LOAN_TYPE_LABELS } from "@/constants"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { LoanPaymentForm } from "./loan-payment-form"
import { loans as loanService } from "@/services"
import type { Loan, LoanPayment } from "@/types"
import type { z } from "zod"
import type { loanPaymentSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"

type LoanPaymentFormValues = z.infer<typeof loanPaymentSchema>

interface LoanDetailProps {
  loanId: string
  onLoanUpdated: () => void
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  PAID: "success",
  PENDING: "warning",
  PARTIALLY_PAID: "info",
  OVERDUE: "error",
}

export function LoanDetail({ loanId, onLoanUpdated }: LoanDetailProps) {
  const [loan, setLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<LoanPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [loanData, paymentsData] = await Promise.all([
          loanService.getLoanById(loanId),
          loanService.getLoanPayments(loanId),
        ])
        if (cancelled) return
        setLoan(loanData)
        setPayments(paymentsData)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        toast({ title: "Erro", description: msg, variant: "error" })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [loanId, refreshKey])

  const handleAddPayment = async (data: LoanPaymentFormValues) => {
    try {
      await loanService.createLoanPayment(loanId, {
        amount: data.amount,
        payment_date: data.payment_date,
        notes: data.notes ?? null,
      })
      toast({ title: "Sucesso", description: "Pagamento registado com sucesso.", variant: "success" })
      setShowPaymentForm(false)
      onLoanUpdated()
      setRefreshKey(k => k + 1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-sm text-slate-500">Empréstimo não encontrado.</p>
      </div>
    )
  }

  const progress =
    loan.total_amount > 0 ? Math.round((loan.paid_amount / loan.total_amount) * 100) : 0

  const isOverdue =
    loan.status !== "PAID" &&
    !!loan.due_date &&
    new Date(loan.due_date) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{loan.person_name}</h2>
                {loan.phone && (
                  <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Phone className="h-3.5 w-3.5" />
                    {loan.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant={loan.type === "GIVEN" ? "info" : "warning"}>
                {LOAN_TYPE_LABELS[loan.type]}
              </Badge>
              <Badge variant={STATUS_VARIANTS[loan.status] ?? "default"}>
                {LOAN_STATUS_LABELS[loan.status]}
              </Badge>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(loan.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pago</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(loan.paid_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Restante</p>
              <p
                className={cn(
                  "text-lg font-bold",
                  loan.remaining_amount > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {formatCurrency(loan.remaining_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Juros</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(loan.interest_amount)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <Progress value={progress} className="mb-1" />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{progress}% pago</span>
              {loan.due_date && (
                <span className={cn("flex items-center gap-1", isOverdue && "font-medium text-red-500")}>
                  <Calendar className="h-3 w-3" />
                  {isOverdue ? "Vencido a " : "Vence em "}
                  {formatDate(loan.due_date)}
                </span>
              )}
            </div>
          </div>

          {loan.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{loan.description}</p>
          )}

          {loan.account && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Conta associada: {loan.account.name}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Histórico de Pagamentos</h3>
        {loan.remaining_amount > 0 && (
          <Button size="sm" onClick={() => setShowPaymentForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Novo Pagamento
          </Button>
        )}
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <TrendingUp className="mb-3 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum pagamento registado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(payment.payment_date)}</p>
                </div>
              </div>
              {payment.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{payment.notes}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <LoanPaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        onSubmit={handleAddPayment}
        remainingAmount={loan.remaining_amount}
      />
    </motion.div>
  )
}
