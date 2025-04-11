"use client"

import { useState, useEffect } from "react"
import { Users, ArrowDownCircle, ArrowUpCircle, Percent, UserPlus, DollarSign } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AdminPanel() {
  const supabase = createClientComponentClient()
  const [stats, setStats] = useState([
    {
      title: "Usuários",
      value: 0,
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-500",
    },
    {
      title: "Depósitos",
      value: "$ 0.00",
      icon: <ArrowDownCircle className="w-8 h-8" />,
      color: "bg-green-500",
    },
    {
      title: "Saques",
      value: "$ 0.00",
      icon: <ArrowUpCircle className="w-8 h-8" />,
      color: "bg-red-500",
    },
    {
      title: "Rendimentos Pagos",
      value: "$ 0.00",
      icon: <Percent className="w-8 h-8" />,
      color: "bg-yellow-500",
    },
    {
      title: "Afiliados",
      value: 0,
      icon: <UserPlus className="w-8 h-8" />,
      color: "bg-purple-500",
    },
    {
      title: "Total de Saques",
      value: "$ 0.00",
      icon: <DollarSign className="w-8 h-8" />,
      color: "bg-orange-500",
    },
  ])

  const [loading, setLoading] = useState(true)
  const [recentDeposits, setRecentDeposits] = useState([])
  const [recentWithdrawals, setRecentWithdrawals] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Buscar total de usuários
        const { data: users, error: usersError } = await supabase.from("profiles").select("id")

        if (usersError) {
          console.error("Erro ao buscar usuários:", usersError)
        } else {
          // Atualizar o contador de usuários
          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[0] = {
              ...newStats[0],
              value: users.length,
            }
            return newStats
          })
        }

        // Buscar total de depósitos
        const { data: deposits, error: depositsError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "deposit")
          .eq("status", "approved")

        if (depositsError) {
          console.error("Erro ao buscar depósitos:", depositsError)
        } else {
          const totalDeposits = deposits.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)

          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[1] = {
              ...newStats[1],
              value: `$ ${totalDeposits.toFixed(2)}`,
            }
            return newStats
          })

          // Buscar depósitos recentes
          const { data: recentDepositsData, error: recentDepositsError } = await supabase
            .from("transactions")
            .select("id, user_id, amount, created_at, profiles(name, email)")
            .eq("type", "deposit")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(5)

          if (!recentDepositsError) {
            setRecentDeposits(recentDepositsData)
          }
        }

        // Buscar total de saques aprovados
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "withdrawal")
          .eq("status", "completed")

        if (withdrawalsError) {
          console.error("Erro ao buscar saques:", withdrawalsError)
        } else {
          const totalWithdrawals = withdrawals.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)

          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[2] = {
              ...newStats[2],
              value: `$ ${totalWithdrawals.toFixed(2)}`,
            }
            return newStats
          })

          // Buscar saques recentes
          const { data: recentWithdrawalsData, error: recentWithdrawalsError } = await supabase
            .from("transactions")
            .select("id, user_id, amount, created_at, profiles(name, email)")
            .eq("type", "withdrawal")
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(5)

          if (!recentWithdrawalsError) {
            setRecentWithdrawals(recentWithdrawalsData)
          }
        }

        // Buscar total de rendimentos pagos
        const { data: yields, error: yieldsError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "yield")

        if (yieldsError) {
          console.error("Erro ao buscar rendimentos:", yieldsError)
        } else {
          const totalYields = yields.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)

          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[3] = {
              ...newStats[3],
              value: `$ ${totalYields.toFixed(2)}`,
            }
            return newStats
          })
        }

        // Buscar total de afiliados (usando a tabela de comissões)
        const { data: affiliateCommissions, error: affiliateError } = await supabase
          .from("transactions")
          .select("user_id")
          .eq("type", "commission")
          .eq("status", "approved")

        if (affiliateError) {
          console.error("Erro ao buscar comissões de afiliados:", affiliateError)

          // Definir afiliados como 0 em caso de erro
          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[4] = {
              ...newStats[4],
              value: 0,
            }
            return newStats
          })
        } else {
          // Contar usuários únicos que receberam comissões
          const uniqueAffiliates = new Set(affiliateCommissions.map((item) => item.user_id))

          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[4] = {
              ...newStats[4],
              value: uniqueAffiliates.size,
            }
            return newStats
          })
        }

        // Buscar TOTAL de saques (todos os status)
        const { data: allWithdrawals, error: allWithdrawalsError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "withdrawal")

        if (allWithdrawalsError) {
          console.error("Erro ao buscar total de saques:", allWithdrawalsError)
        } else {
          const totalAllWithdrawals = allWithdrawals.reduce(
            (sum, item) => sum + (Number.parseFloat(item.amount) || 0),
            0,
          )

          setStats((prevStats) => {
            const newStats = [...prevStats]
            newStats[5] = {
              ...newStats[5],
              value: `$ ${totalAllWithdrawals.toFixed(2)}`,
            }
            return newStats
          })
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-6 shadow-lg flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">{stat.title}</h3>
              <div className="text-white opacity-80">{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-white">
              {loading ? <span className="inline-block w-16 h-8 bg-white/20 animate-pulse rounded"></span> : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">Últimos Depósitos</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 h-16 rounded animate-pulse"></div>
              ))}
            </div>
          ) : recentDeposits.length > 0 ? (
            <div className="space-y-4">
              {recentDeposits.map((deposit) => (
                <div key={deposit.id} className="bg-gray-700/50 p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-white">{deposit.profiles?.name || "Usuário"}</p>
                      <p className="text-sm text-gray-400">{deposit.profiles?.email || "Email não disponível"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">$ {Number.parseFloat(deposit.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-400">{formatDate(deposit.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum depósito encontrado.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-400">Últimos Saques</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 h-16 rounded animate-pulse"></div>
              ))}
            </div>
          ) : recentWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-gray-700/50 p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-white">{withdrawal.profiles?.name || "Usuário"}</p>
                      <p className="text-sm text-gray-400">{withdrawal.profiles?.email || "Email não disponível"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-400">$ {Number.parseFloat(withdrawal.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-400">{formatDate(withdrawal.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum saque encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
