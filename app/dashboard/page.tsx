"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ArrowDown, ArrowUp, BarChart3, DollarSign, TrendingUp, Users, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useMobile } from "@/hooks/use-mobile"

// Vamos modificar a parte que exibe o saldo disponível para buscar os dados atualizados do banco de dados

// Adicione estas importações no topo do arquivo, após as importações existentes
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/utils/supabase/client"

// Função para formatar números com separadores
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Dados vazios para o gráfico
const emptyChartData = [
  { name: "01/05", investido: 0, rendimento: 0 },
  { name: "02/05", investido: 0, rendimento: 0 },
  { name: "03/05", investido: 0, rendimento: 0 },
  { name: "04/05", investido: 0, rendimento: 0 },
  { name: "05/05", investido: 0, rendimento: 0 },
  { name: "06/05", investido: 0, rendimento: 0 },
  { name: "07/05", investido: 0, rendimento: 0 },
]

// Componente de card de saldo com efeito flutuante
function BalanceCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string
  value: string
  icon: any
  trend: "up" | "down" | "neutral"
  trendValue: string
  color: "green" | "yellow" | "red"
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-500/10",
      border: "border-green-900/50",
      text: "text-green-500",
      icon: "text-green-500",
      glow: "before:bg-green-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-900/50",
      text: "text-yellow-500",
      icon: "text-yellow-500",
      glow: "before:bg-yellow-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-900/50",
      text: "text-red-500",
      icon: "text-red-500",
      glow: "before:bg-red-500/20",
    },
  }

  const trendIcons = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-red-500" />,
    neutral: null,
  }

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-400",
  }

  const classes = colorClasses[color]

  return (
    <Card className={`relative overflow-hidden ${classes.bg} ${classes.border} animate-float`}>
      <div className="absolute inset-0 before:absolute before:inset-0 before:blur-3xl before:opacity-40 before:animate-pulse before:-z-10 before:rounded-full before:translate-x-1/2 before:translate-y-1/2 before:scale-150 ${classes.glow}"></div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm">
            <Icon className={`h-5 w-5 ${classes.icon}`} />
          </div>
          <div className="flex items-center gap-1">
            {trendIcons[trend]}
            <span className={`${trendColors[trend]} text-xs`}>{trendValue}</span>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs text-gray-400">{title}</p>
          <p className={`text-lg font-bold mt-0.5 ${classes.text}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Modifique o componente DashboardPage para buscar o saldo do usuário
export default function DashboardPage() {
  const [period, setPeriod] = useState("week")
  const isMobile = useMobile()
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  // Adicione este useEffect para buscar o saldo do usuário
  useEffect(() => {
    async function fetchUserBalance() {
      try {
        setLoading(true)

        // Obter a sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.error("Usuário não autenticado")
          setLoading(false)
          return
        }

        // Buscar o perfil do usuário com o saldo
        const { data, error } = await supabase.from("profiles").select("balance").eq("id", session.user.id).single()

        if (error) {
          console.error("Erro ao buscar saldo:", error)
        } else if (data) {
          setUserBalance(data.balance || 0)
        }
      } catch (err) {
        console.error("Erro ao buscar saldo:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserBalance()
  }, [supabase])

  // Resto do código permanece o mesmo...

  // Modifique o BalanceCard para o saldo disponível para usar o valor buscado do banco
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Painel de Controle</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Bem-vindo, Investidor</span>
          </div>
        </div>
      </header>

      <div className="container py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
        {/* Layout principal com duas colunas em telas maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Coluna principal (2/3 da largura em desktop) */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Saldos principais em uma linha */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <BalanceCard
                title="Saldo Disponível"
                value={formatCurrency(userBalance)}
                icon={Wallet}
                trend="neutral"
                trendValue="0%"
                color="green"
              />
              <BalanceCard
                title="Saldo Investido"
                value={formatCurrency(0)}
                icon={DollarSign}
                trend="neutral"
                trendValue="0%"
                color="yellow"
              />
              <BalanceCard
                title="Rendimento Diário"
                value={formatCurrency(0)}
                icon={TrendingUp}
                trend="neutral"
                trendValue="0%"
                color="green"
              />
            </div>

            {/* Gráfico */}
            <Card className="bg-black/40 border-green-900/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h2 className="text-base font-semibold text-white">Desempenho do Investimento</h2>
                  <Tabs defaultValue="week" value={period} onValueChange={setPeriod}>
                    <TabsList className="bg-black/50 h-8">
                      <TabsTrigger value="day" className="text-xs px-2">
                        Dia
                      </TabsTrigger>
                      <TabsTrigger value="week" className="text-xs px-2">
                        Semana
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs px-2">
                        Mês
                      </TabsTrigger>
                      <TabsTrigger value="year" className="text-xs px-2">
                        Ano
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="h-[180px] md:h-[220px]">
                  <ChartContainer
                    config={{
                      investido: {
                        label: "Valor Investido",
                        color: "hsl(var(--chart-1))",
                      },
                      rendimento: {
                        label: "Rendimento",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={emptyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-investido)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-investido)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRendimento" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-rendimento)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-rendimento)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          tick={{ fontSize: 10 }}
                          tickMargin={5}
                          tickCount={isMobile ? 5 : 7}
                        />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickMargin={5} width={30} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="investido"
                          stroke="var(--color-investido)"
                          fillOpacity={1}
                          fill="url(#colorInvestido)"
                        />
                        <Area
                          type="monotone"
                          dataKey="rendimento"
                          stroke="var(--color-rendimento)"
                          fillOpacity={1}
                          fill="url(#colorRendimento)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Últimas transações */}
            <Card className="bg-black/40 border-green-900/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h2 className="text-base font-semibold text-white">Últimas Transações</h2>
                  <a
                    href="/dashboard/transacoes"
                    className="text-green-500 hover:text-green-400 text-xs font-medium transition-colors"
                  >
                    Ver Todas
                  </a>
                </div>
                <div className="text-center py-8 text-gray-400">Nenhuma transação encontrada.</div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral (1/3 da largura em desktop) */}
          <div className="space-y-4 md:space-y-6">
            {/* Cards de saldo adicionais em coluna */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <BalanceCard
                title="Total de Saques"
                value={formatCurrency(0)}
                icon={BarChart3}
                trend="neutral"
                trendValue="0%"
                color="red"
              />
              <BalanceCard
                title="Comissões de Indicação"
                value={formatCurrency(0)}
                icon={Users}
                trend="neutral"
                trendValue="0%"
                color="green"
              />
            </div>

            {/* Card de resumo */}
            <Card className="bg-black/40 border-green-900/50">
              <CardContent className="p-3 md:p-4">
                <h2 className="text-base font-semibold text-white mb-3">Resumo Financeiro</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-green-900/30 pb-2">
                    <span className="text-sm text-gray-400">Investimento Total</span>
                    <span className="text-sm font-medium text-yellow-500">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-900/30 pb-2">
                    <span className="text-sm text-gray-400">Rendimento Total</span>
                    <span className="text-sm font-medium text-green-500">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-900/30 pb-2">
                    <span className="text-sm text-gray-400">Saques Realizados</span>
                    <span className="text-sm font-medium text-red-500">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Comissões Recebidas</span>
                    <span className="text-sm font-medium text-green-500">{formatCurrency(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
