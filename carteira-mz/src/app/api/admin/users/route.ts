import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { fetchAll } from "@/lib/supabase-fetch-all"

export async function GET(request: Request) {
  const supabaseAdmin = await requireAdmin(request)
  if (supabaseAdmin instanceof NextResponse) return supabaseAdmin

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("id")

  try {
    const [profiles, accounts] = await Promise.all([
      fetchAll<{ id: string; full_name: string | null; email: string | null; created_at: string }>((from, to) => {
        let q = supabaseAdmin
          .from("profiles")
          .select("id, full_name, email, created_at")
          .order("created_at", { ascending: false })
        if (userId) q = q.eq("id", userId)
        return q.range(from, to)
      }),
      fetchAll<{ user_id: string; balance: number }>((from, to) => {
        let q = supabaseAdmin.from("accounts").select("user_id, balance").order("id")
        if (userId) q = q.eq("user_id", userId)
        return q.range(from, to)
      }),
    ])

    const totals = new Map<string, { count: number; balance: number }>()
    for (const a of accounts) {
      const t = totals.get(a.user_id) ?? { count: 0, balance: 0 }
      t.count += 1
      t.balance += Number(a.balance)
      totals.set(a.user_id, t)
    }

    const result = profiles.map((p) => {
      const t = totals.get(p.id) ?? { count: 0, balance: 0 }
      return {
        id: p.id,
        full_name: p.full_name ?? "",
        email: p.email ?? "",
        accounts_count: t.count,
        total_balance: t.balance,
        created_at: p.created_at,
        status: t.count > 0 ? ("active" as const) : ("inactive" as const),
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error("Admin users error:", e)
    return NextResponse.json({ error: "Erro ao carregar utilizadores" }, { status: 500 })
  }
}
