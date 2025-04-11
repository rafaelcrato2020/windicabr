import { createRouteHandlerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { userId, referralCode } = await request.json()

    if (!userId || !referralCode) {
      return NextResponse.json(
        { success: false, error: "ID do usuário e código de referência são obrigatórios" },
        { status: 400 },
      )
    }

    // Verificar se o usuário que está sendo atualizado existe
    const { data: userExists, error: userCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError || !userExists) {
      console.error("Erro ao verificar usuário:", userCheckError)
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o referenciador não é o mesmo que o usuário (evitar auto-referência)
    if (userExists.id === referralCode) {
      return NextResponse.json(
        { success: false, error: "Não é possível usar seu próprio código de referência" },
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
