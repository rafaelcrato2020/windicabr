import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const referralCode = url.searchParams.get("referralCode")

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    // Buscar perfil do usuário
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("id, name, email, referral_code, referred_by")
      .eq("id", userId)
      .single()

    if (userError) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar afiliados diretos (nível 1)
    const { data: directAffiliates, error: affiliatesError } = await supabase
      .from("profiles")
      .select("id, name, email, created_at")
      .eq("referred_by", userId)

    // Se um código de referência foi fornecido, verificar se é válido
    let referrerInfo = null
    if (referralCode) {
      const { data: referrer, error: referrerError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("referral_code", referralCode)
        .single()

      if (!referrerError && referrer) {
        referrerInfo = referrer
      }
    }

    // Verificar se o usuário tem um referenciador
    let referredByInfo = null
    if (userProfile.referred_by) {
      const { data: referredBy, error: referredByError } = await supabase
        .from("profiles")
        .select("id, name, email, referral_code")
        .eq("id", userProfile.referred_by)
        .single()

      if (!referredByError && referredBy) {
        referredByInfo = referredBy
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userProfile,
        directAffiliates: directAffiliates || [],
        directAffiliatesCount: directAffiliates ? directAffiliates.length : 0,
        referrerInfo,
        referredByInfo,
      },
    })
  } catch (error: any) {
    console.error("Erro na depuração de referência:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
