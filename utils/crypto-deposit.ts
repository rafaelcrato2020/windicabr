import { createBrowserClient } from "@/utils/supabase/client"

interface DepositAddress {
  address: string
  qrCodeUrl: string
  statusUrl: string
  amountToPay: number
  expiresAt: Date
}

// Função para gerar um endereço de depósito
export async function generateDepositAddress(amount: number): Promise<DepositAddress> {
  try {
    const supabase = createBrowserClient()

    // Obter a sessão atual
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("Usuário não autenticado")
    }

    // Criar registro de depósito pendente
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        user_id: session.user.id,
        amount,
        status: "pending",
        payment_method: "crypto",
        payment_details: {
          currency: "USDT",
          network: "TRC20",
        },
      })
      .select()
      .single()

    if (depositError) {
      throw new Error(`Erro ao criar registro de depósito: ${depositError.message}`)
    }

    // Chamar API para gerar endereço
    const response = await fetch("/api/generate-deposit-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        depositId: deposit.id,
      }),
    })

    if (!response.ok) {
      throw new Error("Falha ao gerar endereço de depósito")
    }

    const data = await response.json()

    return {
      address: data.address,
      qrCodeUrl: data.qrCodeUrl,
      statusUrl: data.statusUrl,
      amountToPay: data.amountToPay,
      expiresAt: new Date(data.expiresAt),
    }
  } catch (error: any) {
    console.error("Erro ao gerar endereço de depósito:", error)
    throw error
  }
}

// Função para verificar o status de um depósito
export async function checkDepositStatus(depositId: string): Promise<{
  status: "pending" | "confirmed" | "expired" | "failed"
  confirmations?: number
  txHash?: string
}> {
  try {
    const supabase = createBrowserClient()

    // Buscar o status diretamente do banco de dados
    const { data: deposit, error } = await supabase
      .from("deposits")
      .select("status, payment_details")
      .eq("id", depositId)
      .single()

    if (error) {
      throw new Error("Falha ao verificar status do depósito")
    }

    if (deposit.status === "approved") {
      return {
        status: "confirmed",
        txHash: deposit.payment_details?.txn_id,
        confirmations: deposit.payment_details?.confirms_needed || 1,
      }
    }

    if (deposit.status === "rejected") {
      return {
        status: "failed",
      }
    }

    // Verificar se expirou
    const expiresAt = new Date(deposit.payment_details?.expiresAt)
    if (expiresAt && expiresAt < new Date()) {
      return {
        status: "expired",
      }
    }

    return {
      status: "pending",
      confirmations: deposit.payment_details?.confirms_received || 0,
    }
  } catch (error: any) {
    console.error("Erro ao verificar status do depósito:", error)
    throw error
  }
}
