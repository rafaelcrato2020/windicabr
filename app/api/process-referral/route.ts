import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { userId, referralCode } = await request.json()

    if (!userId || !referralCode) {
      return NextResponse.json(
        { success: false, error: "ID do usuário e código de referência são obrigatórios" },
        { status: 400 },
      )
    }

    // Buscar o usuário que fez a indicação pelo código de referência
    const { data: referrerData, error: referrerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", referralCode)
      .single()

    if (referrerError || !referrerData) {
      return NextResponse.json({ success: false, error: "Código de referência inválido" }, { status: 400 })
    }

    // Atualizar o perfil do novo usuário com o ID do referenciador
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referrerData.id })
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json({ success: false, error: "Erro ao atualizar referência" }, { status: 500 })
    }

    // Verificar se a tabela referral_commissions existe
    const { data: tableExists } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "referral_commissions")
      .eq("table_schema", "public")

    // Se a tabela existir, registrar a comissão (será processada quando houver investimento)
    if (tableExists && tableExists.length > 0) {
      await supabase.from("referral_commissions").insert({
        referrer_id: referrerData.id,
        referred_id: userId,
        status: "pending",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao processar referência:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
