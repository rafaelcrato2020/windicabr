import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { initPaymentGateway } from "@/utils/crypto-payment"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { withdrawalId } = await request.json()

    if (!withdrawalId) {
      return NextResponse.json({ success: false, error: "ID do saque é obrigatório" }, { status: 400 })
    }

    // Buscar detalhes do saque
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .eq("status", "pending")
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ success: false, error: "Saque não encontrado ou já processado" }, { status: 404 })
    }

    // Verificar se o saque está dentro dos limites para processamento automático
    // Por exemplo, saques abaixo de $500 são processados automaticamente
    const autoProcessLimit = 500
    if (withdrawal.amount > autoProcessLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Saques acima de $${autoProcessLimit} requerem aprovação manual`,
        },
        { status: 400 },
      )
    }

    // Inicializar o gateway de pagamento
    const paymentGateway = initPaymentGateway()

    // Processar o saque
    try {
      const txHash = await paymentGateway.processWithdrawal(
        withdrawal.pix_key, // Endereço da carteira
        withdrawal.amount,
      )

      // Atualizar o status do saque
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "approved",
          notes: `Processado automaticamente. TxHash: ${txHash}`,
        })
        .eq("id", withdrawalId)

      if (updateError) {
        throw new Error(`Erro ao atualizar status do saque: ${updateError.message}`)
      }

      // Atualizar a transação relacionada
      await supabase
        .from("transactions")
        .update({
          status: "completed",
          description: `Saque processado automaticamente. TxHash: ${txHash}`,
        })
        .eq("user_id", withdrawal.user_id)
        .eq("type", "withdrawal")
        .eq("amount", withdrawal.amount)
        .eq("status", "pending")

      return NextResponse.json({
        success: true,
        message: "Saque processado automaticamente com sucesso",
        txHash,
      })
    } catch (error: any) {
      console.error("Erro ao processar saque automático:", error)

      // Marcar o saque para revisão manual
      await supabase
        .from("withdrawals")
        .update({
          notes: `Falha no processamento automático: ${error.message}. Requer revisão manual.`,
        })
        .eq("id", withdrawalId)

      return NextResponse.json({ success: false, error: `Erro ao processar saque: ${error.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Erro na API de saque automático:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
