import { type Goal, type GoalContribution } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

let goals: Goal[] = [
  {
    id: "goal_001",
    user_id: MOCK_USER_ID,
    account_id: "acc_poupanca",
    title: "Fundo de Emergência",
    description: "Poupar 6 meses de despesas essenciais",
    target_amount: 150000,
    current_amount: 105000,
    target_date: "2026-12-31T00:00:00Z",
    color: "#10B981",
    icon: "shield-check",
    status: "ACTIVE",
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2026-05-10T12:00:00Z",
  },
  {
    id: "goal_002",
    user_id: MOCK_USER_ID,
    account_id: "acc_poupanca",
    title: "Viagem para Portugal",
    description: "Férias em Lisboa e Porto",
    target_amount: 120000,
    current_amount: 72000,
    target_date: "2026-10-01T00:00:00Z",
    color: "#3B82F6",
    icon: "plane",
    status: "ACTIVE",
    created_at: "2025-06-01T08:00:00Z",
    updated_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "goal_003",
    user_id: MOCK_USER_ID,
    account_id: "acc_bci",
    title: "Carro Novo",
    description: "Entrada para um carro seminovo",
    target_amount: 250000,
    current_amount: 250000,
    target_date: "2026-06-01T00:00:00Z",
    color: "#F59E0B",
    icon: "car",
    status: "COMPLETED",
    created_at: "2025-03-01T08:00:00Z",
    updated_at: "2026-05-05T09:00:00Z",
  },
  {
    id: "goal_004",
    user_id: MOCK_USER_ID,
    account_id: null,
    title: "Curso Profissional",
    description: "Certificação em Gestão de Projectos",
    target_amount: 35000,
    current_amount: 35000,
    target_date: "2026-03-15T00:00:00Z",
    color: "#8B5CF6",
    icon: "graduation-cap",
    status: "COMPLETED",
    created_at: "2025-09-01T08:00:00Z",
    updated_at: "2026-03-10T12:00:00Z",
  },
]

let goalContributions: GoalContribution[] = [
  {
    id: "gc_001",
    goal_id: "goal_001",
    account_id: "acc_bci",
    amount: 5000,
    contribution_date: "2026-01-05T10:00:00Z",
    created_at: "2026-01-05T10:00:00Z",
  },
  {
    id: "gc_002",
    goal_id: "goal_001",
    account_id: "acc_bci",
    amount: 5000,
    contribution_date: "2026-02-05T10:00:00Z",
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    id: "gc_003",
    goal_id: "goal_001",
    account_id: "acc_bci",
    amount: 5000,
    contribution_date: "2026-03-05T10:00:00Z",
    created_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "gc_004",
    goal_id: "goal_001",
    account_id: "acc_bci",
    amount: 5000,
    contribution_date: "2026-04-05T10:00:00Z",
    created_at: "2026-04-05T10:00:00Z",
  },
  {
    id: "gc_005",
    goal_id: "goal_001",
    account_id: "acc_bci",
    amount: 5000,
    contribution_date: "2026-05-05T10:00:00Z",
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "gc_006",
    goal_id: "goal_002",
    account_id: "acc_poupanca",
    amount: 12000,
    contribution_date: "2026-01-10T09:00:00Z",
    created_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "gc_007",
    goal_id: "goal_002",
    account_id: "acc_poupanca",
    amount: 12000,
    contribution_date: "2026-02-10T09:00:00Z",
    created_at: "2026-02-10T09:00:00Z",
  },
  {
    id: "gc_008",
    goal_id: "goal_002",
    account_id: "acc_poupanca",
    amount: 12000,
    contribution_date: "2026-03-10T09:00:00Z",
    created_at: "2026-03-10T09:00:00Z",
  },
  {
    id: "gc_009",
    goal_id: "goal_002",
    account_id: "acc_poupanca",
    amount: 12000,
    contribution_date: "2026-04-10T09:00:00Z",
    created_at: "2026-04-10T09:00:00Z",
  },
  {
    id: "gc_010",
    goal_id: "goal_002",
    account_id: "acc_poupanca",
    amount: 12000,
    contribution_date: "2026-05-10T09:00:00Z",
    created_at: "2026-05-10T09:00:00Z",
  },
  {
    id: "gc_011",
    goal_id: "goal_003",
    account_id: "acc_bci",
    amount: 20000,
    contribution_date: "2026-03-01T08:00:00Z",
    created_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "gc_012",
    goal_id: "goal_003",
    account_id: "acc_bci",
    amount: 50000,
    contribution_date: "2026-04-01T08:00:00Z",
    created_at: "2026-04-01T08:00:00Z",
  },
  {
    id: "gc_013",
    goal_id: "goal_003",
    account_id: "acc_bci",
    amount: 10000,
    contribution_date: "2026-05-01T08:00:00Z",
    created_at: "2026-05-01T08:00:00Z",
  },
  {
    id: "gc_014",
    goal_id: "goal_004",
    account_id: "acc_bim",
    amount: 15000,
    contribution_date: "2025-12-01T10:00:00Z",
    created_at: "2025-12-01T10:00:00Z",
  },
  {
    id: "gc_015",
    goal_id: "goal_004",
    account_id: "acc_bim",
    amount: 15000,
    contribution_date: "2026-02-01T10:00:00Z",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "gc_016",
    goal_id: "goal_004",
    account_id: "acc_bim",
    amount: 5000,
    contribution_date: "2026-03-10T10:00:00Z",
    created_at: "2026-03-10T10:00:00Z",
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getGoals(): Promise<Goal[]> {
  await delay()
  return [...goals].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getGoalById(id: string): Promise<Goal | null> {
  await delay()
  return goals.find((g) => g.id === id) ?? null
}

export async function createGoal(
  data: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Goal> {
  await delay()
  const now = new Date().toISOString()
  const goal: Goal = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: now,
    updated_at: now,
  }
  goals.push(goal)
  return goal
}

export async function updateGoal(
  id: string,
  data: Partial<Omit<Goal, "id" | "user_id" | "created_at">>
): Promise<Goal | null> {
  await delay()
  const index = goals.findIndex((g) => g.id === id)
  if (index === -1) return null
  goals[index] = {
    ...goals[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return goals[index]
}

export async function deleteGoal(id: string): Promise<boolean> {
  await delay()
  const index = goals.findIndex((g) => g.id === id)
  if (index === -1) return false
  goals.splice(index, 1)
  goalContributions = goalContributions.filter((c) => c.goal_id !== id)
  return true
}

export async function getGoalContributions(goalId: string): Promise<GoalContribution[]> {
  await delay()
  return goalContributions
    .filter((c) => c.goal_id === goalId)
    .sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime())
}

export async function createGoalContribution(
  goalId: string,
  data: Omit<GoalContribution, "id" | "goal_id" | "created_at">
): Promise<GoalContribution | null> {
  await delay()
  const goal = goals.find((g) => g.id === goalId)
  if (!goal) return null

  const now = new Date().toISOString()
  const contribution: GoalContribution = {
    ...data,
    id: generateId(),
    goal_id: goalId,
    created_at: now,
  }
  goalContributions.push(contribution)

  goal.current_amount += data.amount
  if (goal.current_amount >= goal.target_amount) {
    goal.current_amount = goal.target_amount
    goal.status = "COMPLETED"
  }
  goal.updated_at = now

  return contribution
}
