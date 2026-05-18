import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { before } = await request.json()
    if (!before) {
      return NextResponse.json({ error: "Campo obrigatório: before" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("type", "SYSTEM")
      .lt("created_at", before)

    if (error) {
      console.error("Cleanup error:", error)
      return NextResponse.json({ error: "Erro ao limpar notificações" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Cleanup API error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
