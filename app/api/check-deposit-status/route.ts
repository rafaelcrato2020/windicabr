import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { initCoinPayments } from "@/utils/coinpayments"

// Criar cliente Supabase diretamente para rotas de API
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const depositId = searchParams.get("depositId")

    if (!depositId) {
      return NextResponse.json({ success: false, error: "ID do depósito é obrigatório" }, { status: 400 })
    }

    // Buscar o depósito
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single()

    if (depositError || !deposit) {
      return NextResponse.json({ success: false, error: "Depósito não encontrado" }, { status: 404 })
    }

    // Se o depósito já foi confirmado, retornar o status atual
    if (deposit.status === "approved") {
      return NextResponse.json({
        success: true,
        status: "confirmed",
        txHash: deposit.payment_details?.txn_id,
      })
    }

    // Se o depósito foi rejeitado
    if (deposit.status === "rejected") {
      return NextResponse.json({
        success: true,
        status: "failed",
      })
    }

    // Verificar se o endereço expirou
    const expiresAt = new Date(deposit.payment_details?.expiresAt)
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json({
        success: true,
        status: "expired",
      })
    }

    // Se temos um ID de transação, verificar o status atual na CoinPayments
    if (deposit.payment_details?.txn_id) {
      const coinPayments = initCoinPayments()
      const txInfo = await coinPayments.getTransactionInfo(deposit.payment_details.txn_id)

      // Atualizar os detalhes do pagamento no banco de dados
      await supabase
        .from("deposits")
        .update({
          payment_details: {
            ...deposit.payment_details,
            status: txInfo.status,
            status_text: txInfo.status_text,
            confirms_received: txInfo.confirms_received,
            time_completed: txInfo.time_completed,
            last_updated: new Date().toISOString(),
          },
        })
        .eq("id", depositId)

      // Status 100 ou maior significa confirmado
      if (Number.parseInt(txInfo.status) >= 100 && deposit.status !== "approved") {
        // Atualizar o status do depósito
        await supabase
          .from("deposits")
          .update({
            status: "approved",
            payment_details: {
              ...deposit.payment_details,
              status: txInfo.status,
              status_text: txInfo.status_text,
              confirms_received: txInfo.confirms_received,
              time_completed: txInfo.time_completed,
              confirmed_at: new Date().toISOString(),
            },
          })
          .eq("id", depositId)

        // Atualizar o saldo do usuário
        const { data: profileData } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", deposit.user_id)
          .single()

        if (profileData) {
          const newBalance = (profileData.balance || 0) + deposit.amount
          await supabase.from("profiles").update({ balance: newBalance }).eq("id", deposit.user_id)
        }

        // Registrar a transação
        await supabase.from("transactions").insert({
          user_id: deposit.user_id,
          amount: deposit.amount,
          type: "deposit",
          description: `Depósito automático de ${deposit.amount} USDT`,
          status: "completed",
        })

        return NextResponse.json({
          success: true,
          status: "confirmed",
          confirmations: txInfo.confirms_received,
          txHash: deposit.payment_details.txn_id,
        })
      }

      // Status negativo indica erro ou cancelamento
      if (Number.parseInt(txInfo.status) < 0 && deposit.status !== "rejected") {
        await supabase
          .from("deposits")
          .update({
            status: "rejected",
            payment_details: {
              ...deposit.payment_details,
              status: txInfo.status,
              status_text: txInfo.status_text,
              rejected_at: new Date().toISOString(),
            },
          })
          .eq("id", depositId)

        return NextResponse.json({
          success: true,
          status: "failed",
        })
      }

      // Status em andamento
      return NextResponse.json({
        success: true,
        status: "pending",
        confirmations: txInfo.confirms_received || 0,
      })
    }

    // Se não temos um ID de transação, retornar pendente
    return NextResponse.json({
      success: true,
      status: "pending",
      confirmations: 0,
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do depósito:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
