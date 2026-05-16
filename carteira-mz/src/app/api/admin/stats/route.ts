import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: totalAccounts } = await supabaseAdmin
    .from("accounts")
    .select("*", { count: "exact", head: true })

  const { count: totalTransactions } = await supabaseAdmin
    .from("transactions")
    .select("*", { count: "exact", head: true })

  const { count: totalLoans } = await supabaseAdmin
    .from("loans")
    .select("*", { count: "exact", head: true })

  const { data: accounts } = await supabaseAdmin
    .from("accounts")
    .select("balance")
    .eq("is_active", true)
  const totalBalance = (accounts ?? []).reduce((s: number, a: { balance: number }) => s + a.balance, 0)

  const { data: activeAccounts } = await supabaseAdmin
    .from("accounts")
    .select("user_id")
    .eq("is_active", true)
  const activeUserIds = new Set((activeAccounts ?? []).map((a: { user_id: string }) => a.user_id))

  return NextResponse.json({
    total_users: totalUsers ?? 0,
    total_accounts: totalAccounts ?? 0,
    total_transactions: totalTransactions ?? 0,
    total_balance: totalBalance,
    active_users: activeUserIds.size,
    total_loans: totalLoans ?? 0,
    monthly_growth: 0,
  })
}
