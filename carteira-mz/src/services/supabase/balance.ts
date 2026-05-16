import type { TransactionType } from "@/types"

export function balanceDelta(type: TransactionType, amount: number): number {
  switch (type) {
    case "INCOME":     return amount
    case "EXPENSE":    return -amount
    case "LOAN_GIVEN":  return -amount
    case "LOAN_TAKEN":  return amount
    case "ADJUSTMENT":  return amount
    case "TRANSFER":
    case "LOAN_PAYMENT": return 0
  }
}
