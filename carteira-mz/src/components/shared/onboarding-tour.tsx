"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Wallet, ArrowUpDown, Handshake, PieChart } from "lucide-react"
import { supabase } from "@/services"

const STORAGE_KEY = "carteira-mz-onboarding-done"

const steps = [
  {
    icon: LayoutDashboard,
    title: "Bem-vindo ao Carteira MZ",
    description: "O seu gestor financeiro pessoal, feito para Moçambique. Acompanhe receitas, despesas, contas, metas, empréstimos e orçamentos num só lugar. Tudo offline-first com suporte para M-Pesa, eMola e contas bancárias.",
  },
  {
    icon: Wallet,
    title: "Registe as suas Contas",
    description: "Adicione contas bancárias, carteiras móveis (M-Pesa, eMola) ou dinheiro físico. Veja o saldo total actualizado em tempo real e organize as suas finanças por instituição.",
  },
  {
    icon: ArrowUpDown,
    title: "Registe Receitas e Despesas",
    description: "Adicione transacções com categoria, conta e data. O saldo da conta é actualizado automaticamente. Pode marcar transacções como recorrentes para não se esquecer de contas fixas.",
  },
  {
    icon: Handshake,
    title: "Empréstimos, Metas e Orçamentos",
    description: "Registe empréstimos concedidos ou obtidos, crie metas de poupança com contribuições e defina orçamentos mensais por categoria para controlar gastos.",
  },
  {
    icon: PieChart,
    title: "Acompanhe com Relatórios",
    description: "Veja gráficos de evolução mensal, gastos por categoria e compare períodos. Receba notificações de saldo baixo, metas a expirar e lembretes de empréstimos.",
  },
]

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (done) return

    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .single()
        if (!data?.onboarding_completed) {
          setOpen(true)
        } else {
          localStorage.setItem(STORAGE_KEY, "true")
        }
      } catch {
        setOpen(true)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = async () => {
    localStorage.setItem(STORAGE_KEY, "true")
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id)
    }
    setOpen(false)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const current = steps[step]
  const Icon = current.icon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6"
          >
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center py-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-5">
                <Icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {current.title}
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {current.description}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 my-5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-6 bg-emerald-500"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 disabled:opacity-30 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                {step < steps.length - 1 ? (
                  <>
                    Seguinte
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  "Começar"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
