"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, ChevronRight, LayoutDashboard, Wallet, ArrowRightLeft, Handshake, Target, BarChart3, PiggyBank, ListOrdered, Settings, HelpCircle } from "lucide-react"

const sections = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    content: "Visão geral das suas finanças com gráficos de evolução mensal e gastos por categoria. Navegue entre meses usando as setas ao lado do mês. O botão \"Hoje\" aparece quando está num mês anterior.",
  },
  {
    id: "contas",
    icon: Wallet,
    title: "Contas",
    content: "Registe as suas contas bancárias, carteiras móveis (M-Pesa, eMola), dinheiro físico e outros. Cada conta mostra o saldo actual. Pode editar o tipo e instituição a qualquer momento. As contas são usadas em transacções, transferências e empréstimos.",
  },
  {
    id: "transacoes",
    icon: ArrowRightLeft,
    title: "Transacções",
    content: "Registe receitas e despesas. Escolha o tipo (Receita/Despesa), conta, categoria, valor e data. Pode marcar como recorrente. As transacções afectam automaticamente o saldo da conta seleccionada.",
  },
  {
    id: "transferencias",
    icon: ArrowRightLeft,
    title: "Transferências",
    content: "Transfira valores entre as suas contas. A transferência é descontada da conta de origem e adicionada à conta de destino automaticamente. Pode incluir uma taxa (ex: custo de levantamento).",
  },
  {
    id: "emprestimos",
    icon: Handshake,
    title: "Empréstimos",
    content: "Registe empréstimos concedidos (você emprestou) ou obtidos (você pediu). Acompanhe o valor pendente, pagamentos realizados e datas de vencimento. Ao registar um pagamento, o saldo do empréstimo é actualizado automaticamente.",
  },
  {
    id: "metas",
    icon: Target,
    title: "Metas",
    content: "Defina objectivos financeiros como poupança para viagem, fundo de emergência ou qualquer outro. Acompanhe o progresso com contribuições. Ao adicionar uma contribuição, o valor é descontado da conta associada.",
  },
  {
    id: "orcamentos",
    icon: PiggyBank,
    title: "Orçamentos",
    content: "Crie orçamentos mensais por categoria para controlar gastos. Defina um limite e acompanhe quanto já gastou. O progresso é actualizado automaticamente com base nas transacções do período.",
  },
  {
    id: "categorias",
    icon: ListOrdered,
    title: "Categorias",
    content: "Organize as suas transacções por categorias (Alimentação, Transporte, Salário, etc.). Pode criar categorias personalizadas com ícone e cor. As categorias predefinidas já vêm configuradas.",
  },
  {
    id: "relatorios",
    icon: BarChart3,
    title: "Relatórios",
    content: "Visualize relatórios detalhados sobre as suas finanças com filtros por período, conta e categoria. Útil para análise mensal, anual ou personalizada.",
  },
  {
    id: "configuracoes",
    icon: Settings,
    title: "Configurações",
    content: "Personalize a sua experiência: altere o nome, email, palavra-passe, prefira o tema escuro ou claro e gerir as suas preferências de notificação.",
  },
]

export function UserGuide() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const selectedSection = sections.find((s) => s.id === selected)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg transition-all"
        aria-label="Abrir manual do utilizador"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => { setOpen(false); setSelected(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-[#0F172A]">Manual do Utilizador</h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSelected(null) }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                {selectedSection ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="mb-4 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      Voltar
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <selectedSection.icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A]">{selectedSection.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedSection.content}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setSelected(section.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                          <section.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{section.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
