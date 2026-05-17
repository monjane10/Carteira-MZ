import { supabase } from "./client"
import { logger } from "./logger"
import { NotFoundError, handleError } from "./errors"
import type { Transfer } from "@/types"

const ENTITY = "transferencia"

export async function getTransfers(): Promise<Transfer[]> {
  try {
    logger.info("Fetching transfers")
    const { data, error } = await supabase
      .from("transfers")
      .select("*, from_account:accounts!from_account_id(*), to_account:accounts!to_account_id(*)")
      .order("transfer_date", { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Transfer[]
  } catch (e) {
    return handleError(ENTITY, "listar", e)
  }
}

export async function getTransferById(id: string): Promise<Transfer | null> {
  try {
    const { data, error } = await supabase
      .from("transfers")
      .select("*, from_account:accounts!from_account_id(*), to_account:accounts!to_account_id(*)")
      .eq("id", id)
      .single()
    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as unknown as Transfer
  } catch (e) {
    return handleError(ENTITY, "buscar", e)
  }
}

export async function createTransfer(data: {
  from_account_id: string
  to_account_id: string
  amount: number
  fee?: number
  description?: string | null
  transfer_date?: string
}): Promise<Transfer> {
  try {
    logger.info("Creating transfer", { amount: data.amount, from: data.from_account_id, to: data.to_account_id })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Nao autenticado")

    const { data: result, error } = await supabase
      .from("transfers")
      .insert({
        user_id: user.id,
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        fee: data.fee ?? 0,
        description: data.description ?? null,
        transfer_date: data.transfer_date ?? new Date().toISOString(),
      })
      .select("*, from_account:accounts!from_account_id(*), to_account:accounts!to_account_id(*)")
      .single()
    if (error) throw error

    const totalDebit = data.amount + (data.fee ?? 0)

    const { data: fromAcc } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", data.from_account_id)
      .single()
    if (fromAcc) {
      await supabase
        .from("accounts")
        .update({ balance: (fromAcc.balance as number) - totalDebit, updated_at: new Date().toISOString() })
        .eq("id", data.from_account_id)
    }

    const { data: toAcc } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", data.to_account_id)
      .single()
    if (toAcc) {
      await supabase
        .from("accounts")
        .update({ balance: (toAcc.balance as number) + data.amount, updated_at: new Date().toISOString() })
        .eq("id", data.to_account_id)
    }

    logger.info("Transfer created", { id: result.id })
    return result as unknown as Transfer
  } catch (e) {
    return handleError(ENTITY, "criar", e)
  }
}

export async function updateTransfer(
  id: string,
  data: Partial<Omit<Transfer, "id" | "user_id" | "created_at">>,
): Promise<Transfer> {
  try {
    const old = await getTransferById(id)
    if (!old) throw new NotFoundError(ENTITY, id)

    const newFrom = data.from_account_id ?? old.from_account_id
    const newTo = data.to_account_id ?? old.to_account_id
    const newAmount = data.amount ?? old.amount
    const newFee = data.fee ?? old.fee

    const oldTotalDebit = old.amount + old.fee
    const newTotalDebit = newAmount + newFee

    const revertBalances = async () => {
      const { data: fAcc } = await supabase.from("accounts").select("balance").eq("id", old.from_account_id).single()
      if (fAcc) {
        await supabase.from("accounts").update({ balance: (fAcc.balance as number) + oldTotalDebit }).eq("id", old.from_account_id)
      }
      const { data: tAcc } = await supabase.from("accounts").select("balance").eq("id", old.to_account_id).single()
      if (tAcc) {
        await supabase.from("accounts").update({ balance: (tAcc.balance as number) - old.amount }).eq("id", old.to_account_id)
      }
    }

    await revertBalances()

    const { data: fromAcc } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", newFrom)
      .single()
    if (fromAcc) {
      await supabase
        .from("accounts")
        .update({ balance: (fromAcc.balance as number) - newTotalDebit })
        .eq("id", newFrom)
    }

    const { data: toAcc } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", newTo)
      .single()
    if (toAcc) {
      await supabase
        .from("accounts")
        .update({ balance: (toAcc.balance as number) + newAmount })
        .eq("id", newTo)
    }

    const { data: result, error } = await supabase
      .from("transfers")
      .update({
        from_account_id: newFrom,
        to_account_id: newTo,
        amount: newAmount,
        fee: newFee,
        description: data.description ?? old.description,
        transfer_date: data.transfer_date ?? old.transfer_date,
      })
      .eq("id", id)
      .select("*, from_account:accounts!from_account_id(*), to_account:accounts!to_account_id(*)")
      .single()
    if (error) throw error

    logger.info("Transfer updated", { id })
    return result as unknown as Transfer
  } catch (e) {
    return handleError(ENTITY, "actualizar", e)
  }
}

export async function deleteTransfer(id: string): Promise<void> {
  try {
    const old = await getTransferById(id)
    if (!old) throw new NotFoundError(ENTITY, id)

    const totalDebit = old.amount + old.fee

    const { data: fromAcc } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", old.from_account_id)
      .single()
    if (fromAcc) {
      await supabase
        .from("accounts")
        .update({ balance: (fromAcc.balance as number) + totalDebit })
        .eq("id", old.from_account_id)
    }

    const { data: toAcc } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", old.to_account_id)
      .single()
    if (toAcc) {
      await supabase
        .from("accounts")
        .update({ balance: (toAcc.balance as number) - old.amount })
        .eq("id", old.to_account_id)
    }

    const { error } = await supabase.from("transfers").delete().eq("id", id)
    if (error) throw error

    logger.info("Transfer deleted", { id })
  } catch (e) {
    return handleError(ENTITY, "remover", e)
  }
}
