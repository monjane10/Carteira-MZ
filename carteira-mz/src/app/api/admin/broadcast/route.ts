import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { sendPushToUser } from "@/lib/web-push"
import type { PushSubscriptionRow } from "@/lib/web-push"

export async function POST(request: Request) {
  const supabaseAdmin = await requireAdmin(request)
  if (supabaseAdmin instanceof NextResponse) return supabaseAdmin

  try {
    const { title, message } = await request.json()
    if (!title || !message) {
      return NextResponse.json({ error: "Campos obrigatórios: title, message" }, { status: 400 })
    }

    const { data: users } = await supabaseAdmin
      .from("profiles")
      .select("id")

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Nenhum utilizador encontrado" }, { status: 404 })
    }

    const notifications = users.map((u: { id: string }) => ({
      user_id: u.id,
      type: "SYSTEM",
      title,
      message,
      created_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert(notifications)

    if (insertError) {
      console.error("Broadcast insert error:", insertError)
      return NextResponse.json({ error: "Erro ao criar notificações" }, { status: 500 })
    }

    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")

    if (subscriptions && subscriptions.length > 0) {
      const expiredIds = await sendPushToUser(
        subscriptions as PushSubscriptionRow[],
        { title, body: message, url: "/dashboard" },
      )

      if (expiredIds.length > 0) {
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .in("id", expiredIds)
      }
    }

    return NextResponse.json({ success: true, total_users: users.length })
  } catch (e) {
    console.error("Broadcast API error:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
