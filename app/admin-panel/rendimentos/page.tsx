"use client"

import { useState } from "react"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function YieldsPage() {
  const [rate, setRate] = useState(4)
  const [processing, setProcessing] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()

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
      // 1. Buscar todos os usuários com investimentos ativos
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, name, email, balance, investments")
        .gt("investments", 0)

      if (usersError) throw usersError

      if (!users || users.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum usuário com investimentos ativos encontrado",
          variant: "default",
        })
        setProcessing(false)
        return
      }

      // 2. Calcular e pagar rendimentos para cada usuário
      let successCount = 0
      let errorCount = 0

      for (const user of users) {
        const yieldAmount = (user.investments * rate) / 100

        // Atualizar saldo do usuário
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            balance: (user.balance || 0) + yieldAmount,
            last_yield_date: new Date().toISOString(),
            last_yield_rate: rate,
          })
          .eq("id", user.id)

        if (updateError) {
          errorCount++
          continue
        }

        // Registrar transação
        const { error: transactionError } = await supabase.from("transactions").insert({
          user_id: user.id,
          amount: yieldAmount,
          type: "yield",
          description: `Rendimento diário de ${rate}%`,
          status: "completed",
        })

        if (!transactionError) {
          successCount++
        }
      }

      toast({
        title: "Rendimentos Pagos",
        description: `Rendimentos pagos com sucesso para ${successCount} usuários. Falhas: ${errorCount}`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar os rendimentos",
        variant: "destructive",
      })
      console.error(error)
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
              Defina a taxa de rendimento diário entre 1% e 10% para todos os usuários com investimentos ativos.
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
              Esta ação irá calcular e pagar rendimentos para todos os usuários com investimentos ativos. O valor será
              calculado com base na taxa definida e adicionado ao saldo disponível de cada usuário. Esta operação não
              pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-yellow-400">Histórico de Rendimentos</h2>

          <div className="overflow-x-auto">
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
                <tr className="border-b border-gray-700">
                  <td className="py-3">{new Date().toLocaleDateString("pt-BR")}</td>
                  <td className="py-3">4%</td>
                  <td className="py-3">R$ 1.250,00</td>
                  <td className="py-3">12</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3">{new Date(Date.now() - 86400000).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3">5%</td>
                  <td className="py-3">R$ 1.500,00</td>
                  <td className="py-3">10</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3">{new Date(Date.now() - 172800000).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3">6%</td>
                  <td className="py-3">R$ 1.800,00</td>
                  <td className="py-3">8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
