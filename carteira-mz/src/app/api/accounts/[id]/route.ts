import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { id } = await params

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que a conta pertence ao utilizador
    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    // Eliminar registos dependentes (service_role bypassa RLS)
    await supabaseAdmin.from("goal_contributions").delete().eq("account_id", id)
    await supabaseAdmin.from("loan_payments").delete().in(
      "loan_id",
      (await supabaseAdmin.from("loans").select("id").eq("account_id", id)).data?.map(l => l.id) ?? [],
    )
    await supabaseAdmin.from("goals").delete().eq("account_id", id)
    await supabaseAdmin.from("loans").delete().eq("account_id", id)
    await supabaseAdmin.from("recurring_transactions").delete().eq("account_id", id)
    await supabaseAdmin.from("transfers").delete().eq("from_account_id", id)
    await supabaseAdmin.from("transfers").delete().eq("to_account_id", id)
    await supabaseAdmin.from("transactions").delete().eq("account_id", id)

    const { error: deleteError } = await supabaseAdmin.from("accounts").delete().eq("id", id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Delete account error:", e)
    return NextResponse.json({ error: "Erro interno ao eliminar conta" }, { status: 500 })
  }
}
