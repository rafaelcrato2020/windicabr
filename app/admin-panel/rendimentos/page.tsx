"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function YieldsPage() {
  const [rate, setRate] = useState(4)
  const [processing, setProcessing] = useState(false)
  const [yieldHistory, setYieldHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  // Buscar histórico de rendimentos
  useEffect(() => {
    async function fetchYieldHistory() {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("type", "yield")
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error

        // Agrupar rendimentos por data
        const groupedYields = data.reduce((acc: any, transaction: any) => {
          const date = new Date(transaction.created_at).toLocaleDateString("pt-BR")

          if (!acc[date]) {
            acc[date] = {
              date,
              rate: transaction.description ? Number.parseFloat(transaction.description.replace(/[^0-9.]/g, "")) : 0,
              total: transaction.amount,
              count: 1,
            }
          } else {
            acc[date].total += transaction.amount
            acc[date].count += 1
          }

          return acc
        }, {})

        setYieldHistory(Object.values(groupedYields))
      } catch (error) {
        console.error("Erro ao buscar histórico de rendimentos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchYieldHistory()
  }, [supabase, processing])

  const handlePayYields = async () => {
    if (rate < 1 || rate > 10) {
      toast({
        title: "Erro",
        description: "A taxa de rendimento deve estar entre 1% e 10%",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      // Buscar apenas usuários com saldo disponível
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, name, email, balance")
        .gt("balance", 0)

      if (usersError) {
        console.error("Erro ao buscar usuários:", usersError)
        throw usersError
      }

      if (!users || users.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum usuário com saldo disponível encontrado",
          variant: "default",
        })
        setProcessing(false)
        return
      }

      // Calcular e pagar rendimentos para cada usuário com saldo
      let successCount = 0
      let errorCount = 0
      let totalPaid = 0

      for (const user of users) {
        try {
          // Calcular rendimento baseado apenas no saldo disponível
          const yieldAmount = (user.balance * rate) / 100

          if (yieldAmount <= 0) continue

          // Atualizar saldo do usuário
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              balance: user.balance + yieldAmount,
              last_yield_date: new Date().toISOString(),
              last_yield_rate: rate,
            })
            .eq("id", user.id)

          if (updateError) {
            console.error("Erro ao atualizar saldo do usuário:", updateError)
            errorCount++
            continue
          }

          // Registrar transação de rendimento
          const { error: transactionError } = await supabase.from("transactions").insert({
            user_id: user.id,
            amount: yieldAmount,
            type: "yield",
            description: `Rendimento diário de ${rate}% sobre saldo`,
            status: "completed",
          })

          if (transactionError) {
            console.error("Erro ao registrar transação:", transactionError)
            errorCount++
          } else {
            // Registrar também na tabela yields para manter consistência
            const { error: yieldError } = await supabase
              .from("yields")
              .insert({
                user_id: user.id,
                amount: yieldAmount,
                percentage: rate,
                status: "completed",
                paid_at: new Date().toISOString(),
              })
              .single()

            if (yieldError && !yieldError.message.includes("does not exist")) {
              console.error("Erro ao registrar yield:", yieldError)
            }

            successCount++
            totalPaid += yieldAmount
          }
        } catch (userError) {
          console.error("Erro ao processar rendimento para usuário:", userError)
          errorCount++
        }
      }

      toast({
        title: "Rendimentos Pagos",
        description: `Rendimentos pagos com sucesso para ${successCount} usuários com saldo. Total: $ ${totalPaid.toFixed(2)}. Falhas: ${errorCount}`,
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao processar rendimentos:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar os rendimentos",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Rendimentos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-green-400">Pagar Rendimentos Diários</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Rendimento (%)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
            <p className="mt-2 text-sm text-gray-400">
              Defina a taxa de rendimento diário entre 1% e 10% para todos os usuários com saldo disponível.
            </p>
          </div>

          <button
            onClick={handlePayYields}
            disabled={processing}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Processando Rendimentos...
              </>
            ) : (
              "Pagar Rendimentos Agora"
            )}
          </button>

          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <h3 className="text-sm font-medium text-yellow-400 mb-2">Importante</h3>
            <p className="text-sm text-gray-300">
              Esta ação irá calcular e pagar rendimentos apenas para usuários com saldo disponível. O valor será
              calculado com base na taxa definida e adicionado ao saldo disponível de cada usuário. Esta operação não
              pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">Histórico de Rendimentos</h2>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : yieldHistory.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Taxa</th>
                    <th className="pb-3">Total Pago</th>
                    <th className="pb-3">Usuários</th>
                  </tr>
                </thead>
                <tbody>
                  {yieldHistory.map((item, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-3">{item.date}</td>
                      <td className="py-3">{item.rate}%</td>
                      <td className="py-3">R$ {item.total.toFixed(2)}</td>
                      <td className="py-3">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhum histórico de rendimentos encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
