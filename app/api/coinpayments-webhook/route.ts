import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { initCoinPayments } from "@/utils/coinpayments"

export async function POST(request: Request) {
  try {
    // Obter a assinatura HMAC do cabeçalho
    const hmacSignature = request.headers.get("HMAC") || ""
    if (!hmacSignature) {
      return NextResponse.json({ success: false, error: "Assinatura HMAC ausente" }, { status: 401 })
    }

    // Obter o corpo da solicitação
    const payload = await request.json()

    // Inicializar o cliente CoinPayments
    const coinPayments = initCoinPayments()

    // Verificar a assinatura
    const isValid = coinPayments.verifyIpnSignature(payload, hmacSignature)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Assinatura HMAC inválida" }, { status: 401 })
    }

    // Verificar se é uma notificação de pagamento
    if (payload.ipn_type !== "deposit" || !payload.status) {
      return NextResponse.json({ success: true, message: "Notificação não processável" })
    }

    // Extrair informações personalizadas
    const custom = JSON.parse(payload.custom || "{}")
    const depositId = custom.depositId
    const userId = custom.userId

    if (!depositId || !userId) {
      return NextResponse.json({ success: false, error: "Informações personalizadas ausentes" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verificar o status do pagamento
    // 100 = confirmado
    if (Number.parseInt(payload.status) >= 100) {
      // Atualizar o status do depósito
      const { error: depositError } = await supabase
        .from("deposits")
        .update({
          status: "approved",
          payment_details: {
            ...payload,
            confirmed_at: new Date().toISOString(),
          },
        })
        .eq("id", depositId)

      if (depositError) {
        console.error("Erro ao atualizar depósito:", depositError)
        return NextResponse.json({ success: false, error: "Erro ao atualizar depósito" }, { status: 500 })
      }

      // Buscar o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        return NextResponse.json({ success: false, error: "Erro ao buscar perfil" }, { status: 500 })
      }

      // Atualizar o saldo do usuário
      const amount = Number.parseFloat(payload.amount)
      const newBalance = (profileData.balance || 0) + amount
      const { error: updateError } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", userId)

      if (updateError) {
        console.error("Erro ao atualizar saldo:", updateError)
        return NextResponse.json({ success: false, error: "Erro ao atualizar saldo" }, { status: 500 })
      }

      // Registrar a transação
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        amount: amount,
        type: "deposit",
        description: `Depósito automático de ${amount} ${payload.currency}`,
        status: "completed",
      })

      if (transactionError) {
        console.error("Erro ao registrar transação:", transactionError)
      }

      // Processar comissões de afiliados
      await processReferralCommission(supabase, userId, amount)

      return NextResponse.json({
        success: true,
        message: "Depósito processado com sucesso",
      })
    } else if (Number.parseInt(payload.status) < 0) {
      // Status negativo indica erro ou cancelamento
      await supabase
        .from("deposits")
        .update({
          status: "rejected",
          payment_details: {
            ...payload,
            rejected_at: new Date().toISOString(),
          },
        })
        .eq("id", depositId)

      return NextResponse.json({
        success: true,
        message: "Depósito marcado como rejeitado",
      })
    }

    // Para status em andamento (0-99), apenas atualizamos os detalhes
    await supabase
      .from("deposits")
      .update({
        payment_details: payload,
      })
      .eq("id", depositId)

    return NextResponse.json({
      success: true,
      message: "Status de pagamento atualizado",
    })
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Função para processar comissões de afiliados
async function processReferralCommission(supabase: any, userId: string, depositAmount: number) {
  try {
    // Verificar se o usuário foi indicado por alguém
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .single()

    if (userError || !userData.referred_by) {
      console.log("Usuário não possui indicador ou erro ao buscar:", userError)
      return
    }

    // Processar comissão de nível 1 (10%)
    const referrerId = userData.referred_by
    const level1Commission = depositAmount * 0.1

    // Atualizar saldo do indicador
    const { data: referrerData, error: referrerError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", referrerId)
      .single()

    if (referrerError) {
      console.error("Erro ao buscar dados do indicador:", referrerError)
      return
    }

    const newReferrerBalance = (referrerData.balance || 0) + level1Commission

    // Atualizar saldo do indicador
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: newReferrerBalance })
      .eq("id", referrerId)

    if (updateError) {
      console.error("Erro ao atualizar saldo do indicador:", updateError)
      return
    }

    // Registrar a comissão como transação
    await supabase.from("transactions").insert({
      user_id: referrerId,
      amount: level1Commission,
      type: "referral_commission",
      description: `Comissão de indicação (10%) - Depósito de R$ ${depositAmount.toFixed(2)}`,
      status: "completed",
    })

    // Buscar indicador de nível 2 (se existir)
    const { data: level2Data, error: level2Error } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", referrerId)
      .single()

    if (!level2Error && level2Data.referred_by) {
      // Processar comissão de nível 2 (5%)
      const level2ReferrerId = level2Data.referred_by
      const level2Commission = depositAmount * 0.05

      // Atualizar saldo do indicador nível 2
      const { data: level2ReferrerData, error: level2ReferrerError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", level2ReferrerId)
        .single()

      if (!level2ReferrerError) {
        const newLevel2Balance = (level2ReferrerData.balance || 0) + level2Commission

        await supabase.from("profiles").update({ balance: newLevel2Balance }).eq("id", level2ReferrerId)

        // Registrar a comissão como transação
        await supabase.from("transactions").insert({
          user_id: level2ReferrerId,
          amount: level2Commission,
          type: "referral_commission",
          description: `Comissão de indicação nível 2 (5%) - Depósito de R$ ${depositAmount.toFixed(2)}`,
          status: "completed",
        })
      }
    }

    // Processar níveis 3 e 4 de forma similar...
    // Nível 3 (3%)
    if (!level2Error && level2Data.referred_by) {
      const { data: level3Data, error: level3Error } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", level2Data.referred_by)
        .single()

      if (!level3Error && level3Data.referred_by) {
        const level3ReferrerId = level3Data.referred_by
        const level3Commission = depositAmount * 0.03

        const { data: level3ReferrerData } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", level3ReferrerId)
          .single()

        if (level3ReferrerData) {
          const newLevel3Balance = (level3ReferrerData.balance || 0) + level3Commission

          await supabase.from("profiles").update({ balance: newLevel3Balance }).eq("id", level3ReferrerId)

          await supabase.from("transactions").insert({
            user_id: level3ReferrerId,
            amount: level3Commission,
            type: "referral_commission",
            description: `Comissão de indicação nível 3 (3%) - Depósito de R$ ${depositAmount.toFixed(2)}`,
            status: "completed",
          })
        }
      }
    }

    // Nível 4 (2%)
    if (!level2Error && level2Data.referred_by) {
      const { data: level3Data, error: level3Error } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", level2Data.referred_by)
        .single()

      if (!level3Error && level3Data && level3Data.referred_by) {
        const { data: level4Data, error: level4Error } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", level3Data.referred_by)
          .single()

        if (!level4Error && level4Data && level4Data.referred_by) {
          const level4ReferrerId = level4Data.referred_by
          const level4Commission = depositAmount * 0.02

          const { data: level4ReferrerData } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", level4ReferrerId)
            .single()

          if (level4ReferrerData) {
            const newLevel4Balance = (level4ReferrerData.balance || 0) + level4Commission

            await supabase.from("profiles").update({ balance: newLevel4Balance }).eq("id", level4ReferrerId)

            await supabase.from("transactions").insert({
              user_id: level4ReferrerId,
              amount: level4Commission,
              type: "referral_commission",
              description: `Comissão de indicação nível 4 (2%) - Depósito de R$ ${depositAmount.toFixed(2)}`,
              status: "completed",
            })
          }
        }
      }
    }

    console.log("Comissões de indicação processadas com sucesso")
  } catch (error) {
    console.error("Erro ao processar comissões de indicação:", error)
  }
}
