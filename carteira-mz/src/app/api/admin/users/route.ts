import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const supabaseAdmin = await requireAdmin(request)
  if (supabaseAdmin instanceof NextResponse) return supabaseAdmin

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("id")

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false })

  let rows = (profiles ?? []) as { id: string; full_name: string | null; email: string | null; created_at: string }[]
  if (userId) rows = rows.filter((p) => p.id === userId)
  const result: {
    id: string
    full_name: string
    email: string
    accounts_count: number
    total_balance: number
    created_at: string
    status: "active" | "inactive"
  }[] = []

  for (const p of rows) {
    const { data: userAccounts } = await supabaseAdmin
      .from("accounts")
      .select("balance")
      .eq("user_id", p.id)

    const accList = (userAccounts ?? []) as { balance: number }[]
    const totalBalance = accList.reduce((s, a) => s + a.balance, 0)
    const hasActive = accList.length > 0

    result.push({
      id: p.id,
      full_name: p.full_name ?? "",
      email: p.email ?? "",
      accounts_count: accList.length,
      total_balance: totalBalance,
      created_at: p.created_at,
      status: hasActive ? "active" : "inactive",
    })
  }

  return NextResponse.json(result)
}
