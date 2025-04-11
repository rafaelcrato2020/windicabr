// Função para solicitar processamento automático de saque
export async function requestAutoWithdrawal(withdrawalId: string): Promise<{
  success: boolean
  message: string
  txHash?: string
  error?: string
}> {
  try {
    const response = await fetch("/api/auto-withdrawal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ withdrawalId }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Erro ao processar saque automático")
    }

    return {
      success: true,
      message: "Saque processado automaticamente com sucesso",
      txHash: result.txHash,
    }
  } catch (error: any) {
    console.error("Erro ao solicitar saque automático:", error)
    return {
      success: false,
      message: "Falha no processamento automático",
      error: error.message,
    }
  }
}

// Função para verificar se um saque é elegível para processamento automático
export async function isEligibleForAutoProcessing(amount: number): Promise<boolean> {
  // Aqui você pode implementar suas regras de negócio
  // Por exemplo, saques abaixo de $500 são processados automaticamente
  const autoProcessLimit = 500
  return amount <= autoProcessLimit
}
