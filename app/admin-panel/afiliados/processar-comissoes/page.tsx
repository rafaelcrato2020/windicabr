"use client"

import { useState } from "react"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ProcessarComissoes() {
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const processarComissoesPendentes = async () => {
    setProcessing(true)
    setResults([])
    const processedResults: any[] = []

    try {
      // Buscar todos os depósitos aprovados
      const { data: deposits, error: depositsError } = await supabase
        .from("deposits")
        .select("id, user_id, amount, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: true })

      if (depositsError) {
        throw new Error(`Erro ao buscar depósitos: ${depositsError.message}`)
      }

      // Para cada depósito, verificar se já existe comissão registrada
      for (const deposit of deposits) {
        const { data: existingCommissions, error: commissionError } = await supabase
          .from("transactions")
          .select("id")
          .eq("type", "referral_commission")
          .ilike("description", `%Depósito de R$ ${deposit.amount.toFixed(2)}%`)
          .limit(1)

        if (commissionError) {
          processedResults.push({
            depositId: deposit.id,
            status: "erro",
            message: `Erro ao verificar comissões existentes: ${commissionError.message}`,
          })
          continue
        }

        // Se já existe comissão para este depósito, pular
        if (existingCommissions && existingCommissions.length > 0) {
          processedResults.push({
            depositId: deposit.id,
            status: "ignorado",
            message: "Comissão já processada anteriormente",
          })
          continue
        }

        // Verificar se o usuário foi indicado por alguém
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", deposit.user_id)
          .single()

        if (userError || !userData.referred_by) {
          processedResults.push({
            depositId: deposit.id,
            status: "ignorado",
            message: "Usuário não possui indicador",
          })
          continue
        }

        // Processar comissão de nível 1 (10%)
        const referrerId = userData.referred_by
        const level1Commission = deposit.amount * 0.1

        // Atualizar saldo do indicador
        const { data: referrerData, error: referrerError } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", referrerId)
          .single()

        if (referrerError) {
          processedResults.push({
            depositId: deposit.id,
            status: "erro",
            message: `Erro ao buscar dados do indicador: ${referrerError.message}`,
          })
          continue
        }

        const newReferrerBalance = (referrerData.balance || 0) + level1Commission

        // Atualizar saldo do indicador
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ balance: newReferrerBalance })
          .eq("id", referrerId)

        if (updateError) {
          processedResults.push({
            depositId: deposit.id,
            status: "erro",
            message: `Erro ao atualizar saldo do indicador: ${updateError.message}`,
          })
          continue
        }

        // Registrar a comissão como transação
        const { error: transactionError } = await supabase.from("transactions").insert({
          user_id: referrerId,
          amount: level1Commission,
          type: "referral_commission",
          description: `Comissão de indicação (10%) - Depósito de R$ ${deposit.amount.toFixed(2)}`,
          status: "completed",
        })

        if (transactionError) {
          processedResults.push({
            depositId: deposit.id,
            status: "erro",
            message: `Erro ao registrar transação: ${transactionError.message}`,
          })
          continue
        }

        // Buscar indicador de nível 2 (se existir)
        const { data: level2Data, error: level2Error } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", referrerId)
          .single()

        if (!level2Error && level2Data.referred_by) {
          // Processar comissão de nível 2 (5%)
          const level2ReferrerId = level2Data.referred_by
          const level2Commission = deposit.amount * 0.05

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
              description: `Comissão de indicação nível 2 (5%) - Depósito de R$ ${deposit.amount.toFixed(2)}`,
              status: "completed",
            })
          }
        }

        processedResults.push({
          depositId: deposit.id,
          status: "sucesso",
          message: `Comissão processada com sucesso: R$ ${level1Commission.toFixed(2)}`,
        })
      }

      setResults(processedResults)
      toast({
        title: "Processamento concluído",
        description: `${processedResults.filter((r) => r.status === "sucesso").length} comissões processadas com sucesso`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao processar comissões: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Processar Comissões Pendentes</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <p className="text-gray-300 mb-6">
          Esta ferramenta irá processar comissões de indicação para todos os depósitos aprovados que ainda não tiveram
          comissões processadas. O processo pode levar alguns minutos dependendo da quantidade de depósitos.
        </p>

        <button
          onClick={processarComissoesPendentes}
          disabled={processing}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Processando...
            </>
          ) : (
            "Iniciar Processamento"
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Resultados do Processamento</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-4">ID do Depósito</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2 px-4">{result.depositId}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          result.status === "sucesso"
                            ? "bg-green-500/20 text-green-400"
                            : result.status === "erro"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {result.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
