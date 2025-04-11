"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowUpRight, Info, ChevronRight } from "lucide-react"
import { createBrowserClient } from "@/utils/supabase/client"
import Link from "next/link"

// Função para formatar números com separadores
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function MyInvestments() {
  const [investments, setInvestments] = useState<any[]>([])
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [dailyReturn, setDailyReturn] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchInvestments() {
      try {
        setLoading(true)

        // Obter a sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.error("Usuário não autenticado")
          return
        }

        // Buscar investimentos ativos
        const { data, error } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Erro ao buscar investimentos:", error)
          return
        }

        // Calcular totais
        let totalInv = 0
        let totalEarn = 0
        let dailyRet = 0

        data?.forEach((inv) => {
          totalInv += Number(inv.amount)
          dailyRet += Number(inv.amount) * (Number(inv.rate) / 100)

          // Calcular rendimento acumulado (dias desde a criação * taxa diária * valor)
          const createdAt = new Date(inv.created_at)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
          totalEarn += Number(inv.amount) * (Number(inv.rate) / 100) * daysDiff
        })

        setInvestments(data || [])
        setTotalInvested(totalInv)
        setTotalEarnings(totalEarn)
        setDailyReturn(dailyRet)
      } catch (err) {
        console.error("Erro ao buscar dados de investimentos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [supabase])

  return (
    <Card className="bg-black/40 border-blue-900/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900/30 to-blue-800/10 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Meus Investimentos</CardTitle>
            <CardDescription>Acompanhe seus investimentos ativos</CardDescription>
          </div>
          <Link href="/dashboard/investimentos">
            <Button variant="outline" size="sm" className="border-blue-900/50 text-blue-400 hover:bg-blue-900/20">
              Ver Todos
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">Total Investido</p>
                </div>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(totalInvested)}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <ArrowUpRight className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">Rendimento Acumulado</p>
                </div>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(totalEarnings)}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">Rendimento Diário</p>
                </div>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(dailyReturn)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300">Investimentos Ativos</h3>

              {investments.length > 0 ? (
                <div className="space-y-3">
                  {investments.slice(0, 3).map((inv, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-3 border border-blue-900/30">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-white">{formatCurrency(Number(inv.amount))}</p>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                          {inv.rate}% ao dia
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Rendimento: {formatCurrency(Number(inv.amount) * (Number(inv.rate) / 100))} / dia</span>
                        <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {investments.length > 3 && (
                    <Link href="/dashboard/investimentos">
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-blue-900/50 text-blue-400 hover:bg-blue-900/20"
                      >
                        Ver mais {investments.length - 3} investimentos
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="bg-black/30 rounded-lg p-6 border border-blue-900/30 text-center">
                  <p className="text-gray-400 mb-4">Você ainda não possui investimentos ativos.</p>
                  <Link href="/dashboard/investimentos">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">
                      Fazer Primeiro Investimento
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
