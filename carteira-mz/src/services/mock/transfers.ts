import { type Transfer } from "@/types"
import { generateId } from "@/lib/utils"

const MOCK_USER_ID = "user_1"

let transfers: Transfer[] = [
  {
    id: "trf_001",
    user_id: MOCK_USER_ID,
    from_account_id: "acc_bci",
    to_account_id: "acc_poupanca",
    amount: 15000,
    fee: 0,
    description: "Transferência para poupança",
    transfer_date: "2026-05-05T10:00:00Z",
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "trf_002",
    user_id: MOCK_USER_ID,
    from_account_id: "acc_bci",
    to_account_id: "acc_mpesa",
    amount: 5000,
    fee: 15,
    description: "Recarga M-Pesa",
    transfer_date: "2026-05-02T09:30:00Z",
    created_at: "2026-05-02T09:30:00Z",
  },
  {
    id: "trf_003",
    user_id: MOCK_USER_ID,
    from_account_id: "acc_bim",
    to_account_id: "acc_cash",
    amount: 8000,
    fee: 0,
    description: "Levantamento para despesas",
    transfer_date: "2026-04-10T11:00:00Z",
    created_at: "2026-04-10T11:00:00Z",
  },
  {
    id: "trf_004",
    user_id: MOCK_USER_ID,
    from_account_id: "acc_bci",
    to_account_id: "acc_emola",
    amount: 3000,
    fee: 10,
    description: "Recarga e-Mola",
    transfer_date: "2026-04-20T14:00:00Z",
    created_at: "2026-04-20T14:00:00Z",
  },
  {
    id: "trf_005",
    user_id: MOCK_USER_ID,
    from_account_id: "acc_poupanca",
    to_account_id: "acc_bci",
    amount: 25000,
    fee: 0,
    description: "Resgate poupança para reforma",
    transfer_date: "2026-03-15T08:00:00Z",
    created_at: "2026-03-15T08:00:00Z",
  },
]

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 51) + 30
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getTransfers(): Promise<Transfer[]> {
  await delay()
  return [...transfers].sort(
    (a, b) => new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime()
  )
}

export async function createTransfer(
  data: Omit<Transfer, "id" | "user_id" | "created_at">
): Promise<Transfer> {
  await delay()
  const transfer: Transfer = {
    ...data,
    id: generateId(),
    user_id: MOCK_USER_ID,
    created_at: new Date().toISOString(),
  }
  transfers.push(transfer)
  return transfer
}
