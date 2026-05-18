import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const supabaseAdmin = await requireAdmin(request)
  if (supabaseAdmin instanceof NextResponse) return supabaseAdmin

  const { data } = await supabaseAdmin
    .from("accounts")
    .select("*, institution:financial_institutions(*)")
    .order("created_at", { ascending: false })

  return NextResponse.json(data ?? [])
}
