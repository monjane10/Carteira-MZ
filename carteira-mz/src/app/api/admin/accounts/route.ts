import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { fetchAll } from "@/lib/supabase-fetch-all"

export async function GET(request: Request) {
  const supabaseAdmin = await requireAdmin(request)
  if (supabaseAdmin instanceof NextResponse) return supabaseAdmin

  try {
    const accounts = await fetchAll<Record<string, unknown>>((from, to) =>
      supabaseAdmin
        .from("accounts")
        .select("*, institution:financial_institutions(*)")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    )
    return NextResponse.json(accounts)
  } catch (e) {
    console.error("Admin accounts error:", e)
    return NextResponse.json({ error: "Erro ao carregar contas" }, { status: 500 })
  }
}
