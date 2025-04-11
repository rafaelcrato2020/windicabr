import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { initCoinPayments } from "@/utils/coinpayments"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { amount, depositId } = await request.json()

    if (!amount || !depositId) {
      return NextResponse.json({ success: false, error: "Valor e ID do depósito são obrigatórios" }, { status: 400 })
    }

    // Buscar o depósito para verificar o usuário
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("user_id")
      .eq("id", depositId)
      .single()

    if (depositError || !deposit) {
      return NextResponse.json({ success: false, error: "Depósito não encontrado" }, { status: 404 })
    }

    // Buscar o email do usuário
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", deposit.user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    // Inicializar o cliente CoinPayments
    const coinPayments = initCoinPayments()

    // Criar uma transação
    const transaction = await coinPayments.createTransaction({
      amount: amount,
      currencyFrom: "BRL", // Moeda que o cliente está pagando
      currencyTo: "USDT", // Moeda que você quer receber
      buyerEmail: userData.email,
      depositId: depositId,
      userId: deposit.user_id,
    })

    // Atualizar o depósito com as informações da transação
    await supabase
      .from("deposits")
      .update({
        payment_details: {
          txn_id: transaction.txnId,
          address: transaction.address,
          qrCodeUrl: transaction.qrCodeUrl,
          statusUrl: transaction.statusUrl,
          amountToPay: transaction.amountToPay,
          expiresAt: transaction.expiresAt.toISOString(),
          confirms_needed: transaction.confirms_needed,
        },
      })
      .eq("id", depositId)

    return NextResponse.json({
      success: true,
      address: transaction.address,
      qrCodeUrl: transaction.qrCodeUrl,
      statusUrl: transaction.statusUrl,
      amountToPay: transaction.amountToPay,
      expiresAt: transaction.expiresAt.toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao gerar endereço de depósito:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
