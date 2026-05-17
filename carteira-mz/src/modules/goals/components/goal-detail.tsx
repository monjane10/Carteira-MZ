"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Target, Calendar, Plus, TrendingUp, PiggyBank, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { GOAL_STATUS_LABELS } from "@/constants"
import { formatCurrency, formatDate } from "@/lib/utils"
import { GoalContributionForm } from "./goal-contribution-form"
import { goals as goalService } from "@/services"
import type { Goal, GoalContribution } from "@/types"
import type { z } from "zod"
import type { goalContributionSchema } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type GoalContributionFormValues = z.infer<typeof goalContributionSchema>

interface GoalDetailProps {
  goalId: string
  onBack: () => void
  onGoalUpdated: () => void
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  ACTIVE: "info",
  COMPLETED: "success",
  CANCELLED: "default",
}

export function GoalDetail({ goalId, onBack, onGoalUpdated }: GoalDetailProps) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [showContributionForm, setShowContributionForm] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [goalData, contributionsData] = await Promise.all([
        goalService.getGoalById(goalId),
        goalService.getGoalContributions(goalId),
      ])
      setGoal(goalData)
      setContributions(contributionsData)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [goalId])

  const handleAddContribution = async (data: GoalContributionFormValues) => {
    try {
      await goalService.createGoalContribution(goalId, {
        amount: data.amount,
        account_id: data.account_id ?? null,
        contribution_date: data.contribution_date,
      })
      toast({ title: "Sucesso", description: "Contribuição registada com sucesso.", variant: "success" })
      setShowContributionForm(false)
      onGoalUpdated()
      fetchData()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    }
  }

  const progress = goal ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0
  const remaining = goal ? Math.max(goal.target_amount - goal.current_amount, 0) : 0

  const chartData = [...contributions]
    .reverse()
    .reduce<{ date: string; amount: number }[]>((acc, c) => {
      const dateKey = formatDate(c.contribution_date)
      const existing = acc.find((d) => d.date === dateKey)
      if (existing) {
        existing.amount += c.amount
      } else {
        acc.push({ date: dateKey, amount: c.amount })
      }
      return acc
    }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-sm text-slate-500">Meta não encontrada.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onBack}>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{goal.title}</h2>
                {goal.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{goal.description}</p>
                )}
              </div>
            </div>
            <Badge variant={STATUS_VARIANTS[goal.status] ?? "default"}>
              {GOAL_STATUS_LABELS[goal.status]}
            </Badge>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Actual</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(goal.current_amount)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Meta</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Restante</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(remaining)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Progresso</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {progress}%
              </p>
            </div>
          </div>

          <Progress value={progress} className="mb-2" />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{progress}% concluído</span>
            {goal.target_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Alvo: {formatDate(goal.target_date)}
              </span>
            )}
          </div>

          {goal.account && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Conta associada: {goal.account.name}
            </p>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Histórico de Contribuições
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Contribuições</h3>
        {goal.status === "ACTIVE" && (
          <Button size="sm" onClick={() => setShowContributionForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nova Contribuição
          </Button>
        )}
      </div>

      {contributions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <PiggyBank className="mb-3 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma contribuição registada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {contributions.map((c, index) => (
            <motion.div
              key={c.id}
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
                    {formatCurrency(c.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(c.contribution_date)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <GoalContributionForm
        open={showContributionForm}
        onOpenChange={setShowContributionForm}
        onSubmit={handleAddContribution}
        remainingAmount={remaining}
      />
    </motion.div>
  )
}
