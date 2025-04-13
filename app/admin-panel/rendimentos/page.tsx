"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function YieldsPage() {
  const [processing, setProcessing] = useState(false)
  const [yieldHistory, setYieldHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userCount, setUserCount] = useState(0)
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

    async function fetchUserCount() {
      try {
        const { data, error } = await supabase
          .from("investments")
          .select("user_id")
          .eq("status", "active")
          .not("amount", "is", null) // Sintaxe correta para verificar se não é nulo

        if (error) throw error

        // Contar usuários únicos com investimentos ativos
        const uniqueUsers = new Set(data.map((item) => item.user_id))
        setUserCount(uniqueUsers.size)
      } catch (error) {
        console.error("Erro ao buscar contagem de usuários:", error)
      }
    }

    fetchYieldHistory()
    fetchUserCount()
  }, [supabase, processing])

  // Verificar se a tabela available_earnings existe
  const checkAndCreateAvailableEarningsTable = async () => {
    try {
      // Verificar se a tabela available_earnings existe
      const { error } = await supabase.from("available_earnings").select("id").limit(1)

      if (error && error.message.includes("does not exist")) {
        // Criar a tabela available_earnings
        await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.available_earnings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES auth.users(id),
              amount DECIMAL(15, 2) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              is_withdrawn BOOLEAN DEFAULT FALSE
            );
          `,
        })
        console.log("Tabela available_earnings criada com sucesso")
      }
    } catch (err) {
      console.error("Erro ao verificar/criar tabela available_earnings:", err)
    }
  }

  // Função para atualizar o progresso do ciclo de 20 dias úteis
  const updateCycleProgress = async (userId: string) => {
    try {
      // Verificar se a tabela bot_daily_performance existe
      const { data: tableExists, error: tableCheckError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_daily_performance")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_daily_performance não existe. Criando...")

        // Criar a tabela se não existir
        await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.bot_daily_performance (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              daily_profit DECIMAL(15, 2) DEFAULT 0,
              daily_profit_percentage DECIMAL(5, 2) DEFAULT 0,
              total_trades INTEGER DEFAULT 0,
              successful_trades INTEGER DEFAULT 0,
              failed_trades INTEGER DEFAULT 0,
              completed_days INTEGER DEFAULT 0
            );
          `,
        })
      }

      // Verificar se já existe um registro para hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: existingRecord, error: recordError } = await supabase
        .from("bot_daily_performance")
        .select("*")
        .gte("date", today.toISOString())
        .single()

      if (recordError && recordError.code !== "PGRST116") {
        console.error("Erro ao verificar registro de desempenho diário:", recordError)
        return
      }

      // Verificar se a tabela user_cycle_progress existe
      const { data: cycleTableExists, error: cycleTableCheckError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "user_cycle_progress")
        .single()

      if (cycleTableCheckError || !cycleTableExists) {
        console.log("Tabela user_cycle_progress não existe. Criando...")

        // Criar a tabela se não existir
        await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.user_cycle_progress (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES auth.users(id),
              cycle_progress DECIMAL(5, 2) DEFAULT 0,
              days_completed INTEGER DEFAULT 0,
              last_goal_date DATE,
              completed_business_days TEXT[] DEFAULT '{}',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        })
      }

      // Verificar se o usuário já tem um registro de progresso
      const { data: userProgress, error: userProgressError } = await supabase
        .from("user_cycle_progress")
        .select("*")
        .eq("user_id", userId)
        .single()

      const todayStr = today.toISOString().split("T")[0] // Formato YYYY-MM-DD

      if (userProgressError && userProgressError.code !== "PGRST116") {
        // Criar um novo registro para o usuário
        await supabase.from("user_cycle_progress").insert({
          user_id: userId,
          cycle_progress: 6, // 6% de progresso
          days_completed: 1, // Primeiro dia completado
          last_goal_date: todayStr,
          completed_business_days: [todayStr],
        })
      } else if (userProgress) {
        // Verificar se já atingiu a meta hoje
        if (!userProgress.completed_business_days.includes(todayStr)) {
          // Atualizar o progresso existente
          const newProgress = Math.min(userProgress.cycle_progress + 6, 120) // Limitar a 120%
          const newDaysCompleted = Math.min(userProgress.days_completed + 1, 20) // Limitar a 20 dias
          const newCompletedDays = [...userProgress.completed_business_days, todayStr]

          await supabase
            .from("user_cycle_progress")
            .update({
              cycle_progress: newProgress,
              days_completed: newDaysCompleted,
              last_goal_date: todayStr,
              completed_business_days: newCompletedDays,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userProgress.id)
        }
      }

      // Atualizar o status do bot
      if (existingRecord) {
        // Atualizar o registro existente
        await supabase
          .from("bot_daily_performance")
          .update({
            daily_profit_percentage: 6, // 6% fixo
            completed_days: (existingRecord.completed_days || 0) + 1,
          })
          .eq("id", existingRecord.id)
      } else {
        // Criar um novo registro
        await supabase.from("bot_daily_performance").insert({
          daily_profit_percentage: 6, // 6% fixo
          completed_days: 1,
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso do ciclo:", error)
    }
  }

  const handlePayYields = async () => {
    // Taxa fixa de 6%
    const fixedRate = 6

    setProcessing(true)

    try {
      // Verificar e criar a tabela available_earnings se necessário
      await checkAndCreateAvailableEarningsTable()

      // Buscar usuários com investimentos ativos
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("user_id, amount")
        .eq("status", "active")
        .not("amount", "is", null)

      if (investmentsError) {
        console.error("Erro ao buscar investimentos:", investmentsError)
        throw investmentsError
      }

      if (!investments || investments.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum investimento ativo encontrado",
          variant: "default",
        })
        setProcessing(false)
        return
      }

      // Agrupar investimentos por usuário
      const userInvestments: Record<string, number> = {}
      investments.forEach((inv) => {
        const userId = inv.user_id
        const amount = Number(inv.amount) || 0

        if (!userInvestments[userId]) {
          userInvestments[userId] = 0
        }

        userInvestments[userId] += amount
      })

      // Calcular e pagar rendimentos para cada usuário com investimentos
      let successCount = 0
      let errorCount = 0
      let totalPaid = 0
      const currentDate = new Date().toISOString()
      const processedUsers = new Set<string>()

      for (const userId in userInvestments) {
        try {
          // Evitar processar o mesmo usuário mais de uma vez
          if (processedUsers.has(userId)) continue
          processedUsers.add(userId)

          const investedAmount = userInvestments[userId]

          // Calcular rendimento baseado no valor investido
          const yieldAmount = (investedAmount * fixedRate) / 100

          if (yieldAmount <= 0) continue

          // Buscar o perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", userId)
            .single()

          if (profileError) {
            console.error("Erro ao buscar perfil do usuário:", profileError)
            errorCount++
            continue
          }

          // Atualizar saldo do usuário
          const newBalance = (profileData.balance || 0) + yieldAmount
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              balance: newBalance,
              last_yield_date: currentDate,
              last_yield_rate: fixedRate,
            })
            .eq("id", userId)

          if (updateError) {
            console.error("Erro ao atualizar saldo do usuário:", updateError)
            errorCount++
            continue
          }

          // Registrar o rendimento disponível para saque
          const { error: availableEarningsError } = await supabase.from("available_earnings").insert({
            user_id: userId,
            amount: yieldAmount,
            is_withdrawn: false,
          })

          if (availableEarningsError) {
            console.error("Erro ao registrar rendimento disponível:", availableEarningsError)
          }

          // Registrar transação de rendimento
          const { error: transactionError } = await supabase.from("transactions").insert({
            user_id: userId,
            amount: yieldAmount,
            type: "yield",
            description: `Rendimento diário de ${fixedRate}% sobre investimento`,
            status: "completed",
          })

          if (transactionError) {
            console.error("Erro ao registrar transação:", transactionError)
            errorCount++
          } else {
            // Atualizar o progresso do ciclo de 20 dias úteis
            await updateCycleProgress(userId)

            successCount++
            totalPaid += yieldAmount
          }
        } catch (userError) {
          console.error("Erro ao processar rendimento para usuário:", userError)
          errorCount++
        }
      }

      // Atualizar o status do bot para indicar que a meta diária foi atingida
      try {
        // Verificar se a tabela bot_global_config existe
        const { data: configTableExists, error: configTableCheckError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .eq("table_name", "bot_global_config")
          .single()

        if (!configTableCheckError && configTableExists) {
          // Atualizar o status do bot
          await supabase
            .from("bot_global_config")
            .update({
              last_yield_date: currentDate,
              daily_target_reached: true,
            })
            .eq("id", 1) // Assumindo que há apenas um registro de configuração global
        }
      } catch (botStatusError) {
        console.error("Erro ao atualizar status do bot:", botStatusError)
      }

      toast({
        title: "Rendimentos Pagos",
        description: `Rendimentos de 6% pagos com sucesso para ${successCount} usuários com investimentos. Total: $ ${totalPaid.toFixed(2)}. Falhas: ${errorCount}`,
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
            <div className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white">6%</div>
            <p className="mt-2 text-sm text-gray-400">
              Taxa de rendimento diário fixa de 6% para todos os usuários com investimentos ativos.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-700 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Usuários com investimentos ativos:</span>
              <span className="text-lg font-bold text-green-400">{userCount}</span>
            </div>
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
              Esta ação irá calcular e pagar rendimentos apenas para usuários com investimentos ativos. O valor será
              calculado com base na taxa fixa de 6% e adicionado ao saldo disponível de cada usuário. Esta operação
              também atualizará o progresso do ciclo de 20 dias úteis e o status do bot. Esta operação não pode ser
              desfeita.
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
