"use client"

import { useState, useEffect } from "react"
import { BarChart2, ArrowUpRight, DollarSign, Clock } from "lucide-react"
import { createBrowserClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Investment {
  id: string
  user_id: string
  amount: number
  yield_rate: number
  start_date: string
  end_date: string | null
  status: string
  total_yield: number
  created_at: string
}

export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalYield: 0,
    activeInvestments: 0,
    averageYieldRate: 0,
  })

  useEffect(() => {
    async function fetchInvestments() {
      try {
        setLoading(true)
        const supabase = createBrowserClient()

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Buscar todos os investimentos do usuário
        const { data, error } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Erro ao buscar investimentos:", error)
          return
        }

        if (data) {
          setInvestments(data)

          // Calcular estatísticas
          let totalInvested = 0
          let totalYield = 0
          let activeCount = 0
          let totalRate = 0

          data.forEach((inv) => {
            totalInvested += Number(inv.amount)
            totalYield += Number(inv.total_yield || 0)

            if (inv.status === "active") {
              activeCount++
              totalRate += Number(inv.yield_rate || 0)
            }
          })

          setStats({
            totalInvested,
            totalYield,
            activeInvestments: activeCount,
            averageYieldRate: activeCount > 0 ? totalRate / activeCount : 0,
          })
        }
      } catch (err) {
        console.error("Erro ao buscar dados de investimentos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [])

  // Função para formatar números com separadores
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Função para formatar porcentagem
  function formatPercent(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  // Função para formatar data
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Meus Investimentos</h1>
          </div>
          <Link href="/dashboard/investimentos">
            <Button className="bg-blue-600 hover:bg-blue-700">Novo Investimento</Button>
          </Link>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black border-blue-900/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Investido</CardDescription>
              <CardTitle className="text-2xl text-white">
                {loading ? "Carregando..." : formatCurrency(stats.totalInvested)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-500">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="text-sm">Capital Total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-blue-900/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Rendimento Total</CardDescription>
              <CardTitle className="text-2xl text-white">
                {loading ? "Carregando..." : formatCurrency(stats.totalYield)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">Lucro Acumulado</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-blue-900/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Investimentos Ativos</CardDescription>
              <CardTitle className="text-2xl text-white">
                {loading ? "Carregando..." : stats.activeInvestments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-blue-500">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Em Andamento</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-blue-900/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Taxa Média de Rendimento</CardDescription>
              <CardTitle className="text-2xl text-white">
                {loading ? "Carregando..." : formatPercent(stats.averageYieldRate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">Rendimento Diário</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de investimentos */}
        <Card className="bg-black border-blue-900/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Histórico de Investimentos</CardTitle>
            <CardDescription className="text-gray-400">
              Todos os seus investimentos, ativos e encerrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-400">Carregando seus investimentos...</p>
              </div>
            ) : investments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Você ainda não possui investimentos.</p>
                <Link href="/dashboard/investimentos" className="mt-4 inline-block">
                  <Button className="bg-blue-600 hover:bg-blue-700">Fazer Primeiro Investimento</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-900/30">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Taxa</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Rendimento</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr key={investment.id} className="border-b border-blue-900/10 hover:bg-blue-900/5">
                        <td className="py-3 px-4 text-white">{formatDate(investment.created_at)}</td>
                        <td className="py-3 px-4 text-white">{formatCurrency(Number(investment.amount))}</td>
                        <td className="py-3 px-4 text-green-500">{formatPercent(Number(investment.yield_rate))}</td>
                        <td className="py-3 px-4 text-white">{formatCurrency(Number(investment.total_yield || 0))}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              investment.status === "active"
                                ? "bg-green-900/20 text-green-500"
                                : investment.status === "completed"
                                  ? "bg-blue-900/20 text-blue-500"
                                  : "bg-gray-900/20 text-gray-500"
                            }`}
                          >
                            {investment.status === "active"
                              ? "Ativo"
                              : investment.status === "completed"
                                ? "Concluído"
                                : "Cancelado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
