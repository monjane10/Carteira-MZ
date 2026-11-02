import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { fetchAll } from "@/lib/supabase-fetch-all"

export async function GET(request: Request) {
  const supabaseAdmin = await requireAdmin(request)
  if (supabaseAdmin instanceof NextResponse) return supabaseAdmin

  const countRows = (table: string) =>
    supabaseAdmin.from(table).select("*", { count: "exact", head: true }).then(({ count }) => count ?? 0)

  try {
    const [totalUsers, totalAccounts, totalTransactions, totalLoans, activeAccounts] = await Promise.all([
      countRows("profiles"),
      countRows("accounts"),
      countRows("transactions"),
      countRows("loans"),
      fetchAll<{ user_id: string; balance: number }>((from, to) =>
        supabaseAdmin.from("accounts").select("user_id, balance").eq("is_active", true).order("id").range(from, to),
      ),
    ])

    const totalBalance = activeAccounts.reduce((s, a) => s + Number(a.balance), 0)
    const activeUserIds = new Set(activeAccounts.map((a) => a.user_id))

    return NextResponse.json({
      total_users: totalUsers,
      total_accounts: totalAccounts,
      total_transactions: totalTransactions,
      total_balance: totalBalance,
      active_users: activeUserIds.size,
      total_loans: totalLoans,
      monthly_growth: 0,
    })
  } catch (e) {
    console.error("Admin stats error:", e)
    return NextResponse.json({ error: "Erro ao carregar estatísticas" }, { status: 500 })
  }
}
