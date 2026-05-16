import { type Notification } from "@/types"

const MOCK_USER_ID = "user_1"

let notifications: Notification[] = [
  {
    id: "notif_001",
    user_id: MOCK_USER_ID,
    type: "BUDGET_LIMIT",
    title: "Limite de orçamento próximo",
    message: "A categoria Alimentação atingiu 74% do orçamento mensal de 15.000 MZN.",
    is_read: false,
    created_at: "2026-05-14T10:30:00Z",
  },
  {
    id: "notif_002",
    user_id: MOCK_USER_ID,
    type: "GOAL_COMPLETED",
    title: "Meta concluída!",
    message: "Parabéns! Você concluiu a meta 'Curso Profissional'.",
    is_read: true,
    created_at: "2026-03-10T12:00:00Z",
  },
  {
    id: "notif_003",
    user_id: MOCK_USER_ID,
    type: "LOW_BALANCE",
    title: "Saldo baixo - e-Mola",
    message: "O saldo da sua conta e-Mola é de apenas 3.200 MZN.",
    is_read: false,
    created_at: "2026-05-16T07:00:00Z",
  },
  {
    id: "notif_004",
    user_id: MOCK_USER_ID,
    type: "LOAN_DUE",
    title: "Vencimento de empréstimo",
    message: "O empréstimo concedido a Ana Nhampossa vence em 20 de Junho.",
    is_read: false,
    created_at: "2026-05-15T08:00:00Z",
  },
  {
    id: "notif_005",
    user_id: MOCK_USER_ID,
    type: "SYSTEM",
    title: "Bem-vindo ao Carteira-MZ",
    message: "Obrigado por usar o Carteira-MZ! Acompanhe suas finanças com facilidade.",
    is_read: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "notif_006",
    user_id: MOCK_USER_ID,
    type: "GOAL_COMPLETED",
    title: "Meta concluída!",
    message: "Parabéns! Você concluiu a meta 'Carro Novo'.",
    is_read: true,
    created_at: "2026-05-05T09:00:00Z",
  },
  {
    id: "notif_007",
    user_id: MOCK_USER_ID,
    type: "BUDGET_LIMIT",
    title: "Orçamento de assinaturas quase esgotado",
    message: "A categoria Assinaturas gastou 1.950 MZN dos 2.000 MZN orçados.",
    is_read: false,
    created_at: "2026-05-15T14:00:00Z",
  },
  {
    id: "notif_008",
    user_id: MOCK_USER_ID,
    type: "LOAN_DUE",
    title: "Pagamento de empréstimo pendente",
    message: "O empréstimo com Carlos Tembe tem 10.000 MZN pendentes.",
    is_read: true,
    created_at: "2026-05-01T10:00:00Z",
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 201) + 200
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getNotifications(): Promise<Notification[]> {
  await delay()
  return [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function markAsRead(id: string): Promise<Notification | null> {
  await delay()
  const index = notifications.findIndex((n) => n.id === id)
  if (index === -1) return null
  notifications[index] = { ...notifications[index], is_read: true }
  return notifications[index]
}

export async function markAllAsRead(): Promise<boolean> {
  await delay()
  notifications = notifications.map((n) => ({ ...n, is_read: true }))
  return true
}

export async function getUnreadCount(): Promise<number> {
  await delay()
  return notifications.filter((n) => !n.is_read).length
}
