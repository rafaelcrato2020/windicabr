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

    console.log(`Processando referência: userId=${userId}, referralCode=${referralCode}`)

    // Verificar se o usuário que está sendo referido existe
    const { data: userExists, error: userCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError) {
      console.error("Erro ao verificar usuário:", userCheckError)
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar o usuário que fez a indicação pelo código de referência
    const { data: referrerData, error: referrerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", referralCode)
      .single()

    if (referrerError || !referrerData) {
      console.error("Erro ao buscar referenciador:", referrerError)
      return NextResponse.json({ success: false, error: "Código de referência inválido" }, { status: 400 })
    }

    console.log(`Referenciador encontrado: ${referrerData.id}`)

    // Verificar se não é auto-referência
    if (userId === referrerData.id) {
      console.error("Tentativa de auto-referência detectada")
      return NextResponse.json(
        { success: false, error: "Não é possível usar seu próprio código de referência" },
        { status: 400 },
      )
    }

    // Atualizar o perfil do novo usuário com o ID do referenciador
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referrerData.id })
      .eq("id", userId)

    if (updateError) {
      console.error("Erro ao atualizar referência:", updateError)
      return NextResponse.json({ success: false, error: "Erro ao atualizar referência" }, { status: 500 })
    }

    console.log(`Perfil atualizado com sucesso: userId=${userId}, referred_by=${referrerData.id}`)

    return NextResponse.json({
      success: true,
      message: "Referência processada com sucesso",
      data: {
        userId,
        referrerId: referrerData.id,
      },
    })
  } catch (error: any) {
    console.error("Erro ao processar referência:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
