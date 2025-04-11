import { createBrowserClient } from "@/utils/supabase/client"
import { createServerClient } from "@/utils/supabase/server"

// Função que pode ser usada tanto no cliente quanto no servidor
export async function processReferralCommission(
  userId: string,
  amount: number,
  description: string,
  supabaseClient?: any,
) {
  try {
    // Usar o cliente fornecido ou criar um novo
    const supabase = supabaseClient || createBrowserClient()

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
    const level1Commission = amount * 0.1

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
      description: `Comissão de indicação (10%) - ${description}`,
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
      const level2Commission = amount * 0.05

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
          description: `Comissão de indicação nível 2 (5%) - ${description}`,
          status: "completed",
        })
      }

      // Processar nível 3 (3%)
      const { data: level3Data, error: level3Error } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", level2ReferrerId)
        .single()

      if (!level3Error && level3Data && level3Data.referred_by) {
        const level3ReferrerId = level3Data.referred_by
        const level3Commission = amount * 0.03

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
            description: `Comissão de indicação nível 3 (3%) - ${description}`,
            status: "completed",
          })
        }

        // Processar nível 4 (2%)
        const { data: level4Data, error: level4Error } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", level3ReferrerId)
          .single()

        if (!level4Error && level4Data && level4Data.referred_by) {
          const level4ReferrerId = level4Data.referred_by
          const level4Commission = amount * 0.02

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
              description: `Comissão de indicação nível 4 (2%) - ${description}`,
              status: "completed",
            })
          }
        }
      }
    }

    console.log("Comissões de indicação processadas com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao processar comissões de indicação:", error)
    return false
  }
}

// Versão para uso no servidor
export async function processReferralCommissionServer(userId: string, amount: number, description: string) {
  const supabase = createServerClient()
  return processReferralCommission(userId, amount, description, supabase)
}
