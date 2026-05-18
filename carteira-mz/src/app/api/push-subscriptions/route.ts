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

    const body = await request.json()
    const { endpoint, p256dh, auth, userAgent } = body

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Campos obrigatórios: endpoint, p256dh, auth" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .insert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving push subscription:", error)
      return NextResponse.json({ error: "Erro ao salvar subscrição" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error("Push subscription API error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get("endpoint")

    if (!endpoint) {
      return NextResponse.json({ error: "Parâmetro endpoint obrigatório" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint)

    if (error) {
      console.error("Error deleting push subscription:", error)
      return NextResponse.json({ error: "Erro ao remover subscrição" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Push subscription DELETE error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
