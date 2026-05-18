import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPushToUser } from "@/lib/web-push"
import type { PushSubscriptionRow } from "@/lib/web-push"

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
    const { type, title, message } = body

    if (!type || !title || !message) {
      return NextResponse.json({ error: "Campos obrigatórios: type, title, message" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({ user_id: user.id, type, title, message })
      .select()
      .single()

    if (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 })
    }

    // Enviar push notifications para todos os dispositivos do utilizador
    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id)

    if (subscriptions && subscriptions.length > 0) {
      const expiredIds = await sendPushToUser(
        subscriptions as PushSubscriptionRow[],
        {
          title,
          body: message,
          url: "/dashboard",
        },
      )

      // Remover subscrições expiradas (dispositivos que desinstalaram ou revogaram permissão)
      if (expiredIds.length > 0) {
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .in("id", expiredIds)
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error("Notification API error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
