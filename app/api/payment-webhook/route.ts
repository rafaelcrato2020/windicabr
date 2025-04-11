import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

// Esta função verifica a assinatura do webhook para garantir que a solicitação é legítima
function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(calculatedSignature, "hex"), Buffer.from(signature, "hex"))
}

export async function POST(request: Request) {
  try {
    // Obter a assinatura do cabeçalho
    const signature = request.headers.get("x-payment-signature")
    if (!signature) {
      return NextResponse.json({ success: false, error: "Assinatura ausente" }, { status: 401 })
    }

    // Obter o corpo da solicitação
    const payload = await request.json()

    // Verificar a assinatura
    const isValid = verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET || "")

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Assinatura inválida" }, { status: 401 })
    }

    // Processar o pagamento
    const supabase = createServerClient()

    // Extrair informações do payload
    const { event_type, transaction_id, address, amount, currency, status, user_id, deposit_id } = payload

    if (event_type === "deposit_confirmed") {
      // Atualizar o status do depósito
      const { error: depositError } = await supabase
        .from("deposits")
        .update({
          status: "approved",
          payment_details: {
            transaction_id,
            confirmed_at: new Date().toISOString(),
          },
        })
        .eq("id", deposit_id)

      if (depositError) {
        console.error("Erro ao atualizar depósito:", depositError)
        return NextResponse.json({ success: false, error: "Erro ao atualizar depósito" }, { status: 500 })
      }

      // Buscar o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user_id)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        return NextResponse.json({ success: false, error: "Erro ao buscar perfil" }, { status: 500 })
      }

      // Atualizar o saldo do usuário
      const newBalance = (profileData.balance || 0) + Number(amount)
      const { error: updateError } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", user_id)

      if (updateError) {
        console.error("Erro ao atualizar saldo:", updateError)
        return NextResponse.json({ success: false, error: "Erro ao atualizar saldo" }, { status: 500 })
      }

      // Registrar a transação
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id,
        amount: Number(amount),
        type: "deposit",
        description: `Depósito automático de ${amount} ${currency}`,
        status: "completed",
      })

      if (transactionError) {
        console.error("Erro ao registrar transação:", transactionError)
      }

      return NextResponse.json({ success: true, message: "Depósito processado com sucesso" })
    }

    return NextResponse.json({ success: true, message: "Webhook recebido" })
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
