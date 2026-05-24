"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, ChevronRight, LayoutDashboard, Wallet, ArrowRightLeft, Handshake, Target, BarChart3, PiggyBank, ListOrdered, Bell, User, HelpCircle } from "lucide-react"

const sections = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    content: "Visão geral das suas finanças com gráficos de evolução mensal e gastos por categoria. Navegue entre meses usando as setas ao lado do título do mês. O botão \"Hoje\" aparece quando está num mês anterior para voltar rapidamente. Os cards de resumo mostram saldo total, receitas, despesas e poupança do mês.",
  },
  {
    id: "contas",
    icon: Wallet,
    title: "Contas",
    content: "Registe contas bancárias, carteiras móveis (M-Pesa, eMola), dinheiro físico, poupanças ou investimentos. Cada conta exibe o saldo actualizado automaticamente com cada transacção. Pode editar o tipo e a instituição a qualquer momento. Use o saldo total no topo para ter uma visão consolidada do seu património.",
  },
  {
    id: "transacoes",
    icon: ArrowRightLeft,
    title: "Transacções",
    content: "Registe receitas (salário, freelance, gorjetas) e despesas (alimentação, transporte, água, luz). Escolha a conta, categoria, valor e data. Transacções futuras aparecem com um ícone de calendário. Pode marcar como recorrente para despesas fixas como renda ou mensalidades.",
  },
  {
    id: "transferencias",
    icon: ArrowRightLeft,
    title: "Transferências",
    content: "Transfira valores entre as suas contas — por exemplo, do M-Pesa para o banco ou do dinheiro físico para a poupança. O valor é descontado automaticamente da conta de origem e adicionado à de destino. Pode incluir uma taxa (ex: custo de levantamento) que será registada como despesa.",
  },
  {
    id: "emprestimos",
    icon: Handshake,
    title: "Empréstimos",
    content: "Registe empréstimos concedidos (você emprestou a alguém) ou obtidos (você pediu a alguém). Acompanhe o valor pendente, pagamentos realizados, juros e datas de vencimento. Ao registar um pagamento, o saldo do empréstimo é actualizado. Empréstimos vencidos são destacados a vermelho.",
  },
  {
    id: "metas",
    icon: Target,
    title: "Metas",
    content: "Defina objectivos financeiros como poupança para viagem, fundo de emergência, entrada para casa ou qualquer outro. Escolha uma conta associada, defina o valor alvo e a data limite. Adicione contribuições regularmente — o valor é descontado automaticamente da conta escolhida e o progresso é exibido com barra percentual.",
  },
  {
    id: "orcamentos",
    icon: PiggyBank,
    title: "Orçamentos",
    content: "Crie orçamentos mensais por categoria para controlar gastos. Defina um limite (ex: 5.000 MZN para alimentação) e veja em tempo real quanto já gastou. Quando o orçamento está quase a esgotar (80%), recebe uma notificação. O progresso é actualizado automaticamente com base nas transacções do mês.",
  },
  {
    id: "categorias",
    icon: ListOrdered,
    title: "Categorias",
    content: "Organize as suas transacções por categorias como Alimentação, Transporte, Salário, Água/Luz, Saúde, Educação, Lazer e mais. Pode criar categorias personalizadas com ícone e cor à sua escolha. As categorias predefinidas já vêm configuradas para começar a usar imediatamente.",
  },
  {
    id: "relatorios",
    icon: BarChart3,
    title: "Relatórios",
    content: "Visualize relatórios detalhados sobre as suas finanças com filtros por período (mês, trimestre, ano), conta e categoria. Compare períodos para ver evolução. Útil para preparar o orçamento do próximo mês ou fazer balanço anual. Os gráficos podem ser exportados.",
  },
  {
    id: "notificacoes",
    icon: Bell,
    title: "Notificações",
    content: "Receba alertas sobre saldo baixo, metas a expirar, empréstimos por pagar, orçamentos quase esgotados e transacções recorrentes. As notificações podem ser marcadas como lidas individualmente ou todas de uma vez. Toque no sino no cabeçalho para abrir a central de notificações.",
  },
  {
    id: "perfil",
    icon: User,
    title: "Perfil",
    content: "Personalize a sua experiência: altere o nome, email e número de telefone. Active o tema escuro para usar à noite. Escolha receber notificações push no browser. A sua moeda e fuso horário são configurados automaticamente para Moçambique (MZN, Africa/Maputo).",
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
