"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Copy, LinkIcon, Share2, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Vamos modificar a parte que exibe o saldo disponível para buscar os dados atualizados do banco de dados

// Adicione estas importações no topo do arquivo, após as importações existentes
import { createBrowserClient } from "@/utils/supabase/client"

// Modifique a função formatCurrency para garantir o formato brasileiro
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Adicione uma função para formatar números sem o símbolo de moeda
function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Componente de card de nível de afiliado
function AffiliateCard({
  level,
  percentage,
  count,
  earnings,
  color,
}: {
  level: number
  percentage: number
  count: number
  earnings: string
  color: "green" | "yellow" | "red" | "purple"
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-500/10",
      border: "border-green-900/50",
      text: "text-green-500",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-900/50",
      text: "text-yellow-500",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-900/50",
      text: "text-red-500",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-900/50",
      text: "text-purple-500",
    },
  }

  const classes = colorClasses[color]

  return (
    <Card className={`${classes.bg} ${classes.border}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${classes.bg}`}>
              <span className={`text-sm font-bold ${classes.text}`}>{level}</span>
            </div>
            <h3 className="font-semibold text-white">Nível {level}</h3>
          </div>
          <span className={`text-lg font-bold ${classes.text}`}>{percentage}%</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Afiliados</span>
            <span className="text-sm font-medium text-white">{count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Ganhos</span>
            <span className={`text-sm font-medium ${classes.text}`}>{earnings}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AfiliadosPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showCalculator, setShowCalculator] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()
  const [error, setError] = useState<string | null>(null)

  // Verificar se o cliente Supabase está disponível
  useEffect(() => {
    if (!supabase) {
      setError("Erro de conexão com o banco de dados. Por favor, tente novamente mais tarde.")
      setLoading(false)
    }
  }, [supabase])

  // Estados para a calculadora
  const [level1Count, setLevel1Count] = useState(0)
  const [level1Amount, setLevel1Amount] = useState(0)
  const [level2Count, setLevel2Count] = useState(0)
  const [level2Amount, setLevel2Amount] = useState(0)
  const [level3Count, setLevel3Count] = useState(0)
  const [level3Amount, setLevel3Amount] = useState(0)
  const [level4Count, setLevel4Count] = useState(0)
  const [level4Amount, setLevel4Amount] = useState(0)

  // Modifique a parte que define o referralLink para buscar o código de referência real do usuário
  // Substitua esta linha:
  //const referralLink = "https://windicabr.com/ref/usuario123"

  // Por este código que busca o código de referência do usuário:
  const [referralLink, setReferralLink] = useState("Carregando...")
  const [referralCode, setReferralCode] = useState("")

  // Adicione este useEffect para buscar o código de referência do usuário
  useEffect(() => {
    async function fetchReferralCode() {
      try {
        if (!supabase) {
          console.error("Cliente Supabase não disponível")
          return
        }
        // Obter a sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.error("Usuário não autenticado")
          return
        }

        // Verificar se o usuário já tem um código de referência
        const { data, error } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Erro ao buscar código de referência:", error)
          return
        }

        // Se o usuário não tiver um código de referência, gerar um novo
        if (!data.referral_code) {
          // Gerar um código de referência único baseado no ID do usuário
          const newReferralCode = session.user.id.substring(0, 8)

          // Atualizar o perfil do usuário com o novo código
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ referral_code: newReferralCode })
            .eq("id", session.user.id)

          if (updateError) {
            console.error("Erro ao atualizar código de referência:", updateError)
            return
          }

          setReferralCode(newReferralCode)
          setReferralLink(`${window.location.origin}/cadastro?ref=${newReferralCode}`)
        } else {
          setReferralCode(data.referral_code)
          setReferralLink(`${window.location.origin}/cadastro?ref=${data.referral_code}`)
        }
      } catch (err) {
        console.error("Erro ao processar código de referência:", err)
      }
    }

    if (supabase) {
      fetchReferralCode()
    }
  }, [supabase])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Modifique os manipuladores de eventos para os inputs da calculadora
  const handleLevel1CountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel1Count(Math.max(0, Number(value) || 0))
  }

  const handleLevel1AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel1Amount(Math.max(0, Number(value) || 0))
  }

  const handleLevel2CountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel2Count(Math.max(0, Number(value) || 0))
  }

  const handleLevel2AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel2Amount(Math.max(0, Number(value) || 0))
  }

  const handleLevel3CountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel3Count(Math.max(0, Number(value) || 0))
  }

  const handleLevel3AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel3Amount(Math.max(0, Number(value) || 0))
  }

  const handleLevel4CountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel4Count(Math.max(0, Number(value) || 0))
  }

  const handleLevel4AmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
    setLevel4Amount(Math.max(0, Number(value) || 0))
  }

  // Cálculo dos ganhos de afiliados
  const calculateEarnings = () => {
    // Garantir que os valores não sejam negativos
    const safeLevel1Count = Math.max(0, level1Count)
    const safeLevel1Amount = Math.max(0, level1Amount)
    const safeLevel2Count = Math.max(0, level2Count)
    const safeLevel2Amount = Math.max(0, level2Amount)
    const safeLevel3Count = Math.max(0, level3Count)
    const safeLevel3Amount = Math.max(0, level3Amount)
    const safeLevel4Count = Math.max(0, level4Count)
    const safeLevel4Amount = Math.max(0, level4Amount)

    // Calcular os ganhos para cada nível
    const level1Earnings = safeLevel1Count * safeLevel1Amount * 0.1
    const level2Earnings = safeLevel2Count * safeLevel2Amount * 0.05
    const level3Earnings = safeLevel3Count * safeLevel3Amount * 0.03
    const level4Earnings = safeLevel4Count * safeLevel4Amount * 0.02

    const totalEarnings = level1Earnings + level2Earnings + level3Earnings + level4Earnings

    return {
      level1: level1Earnings.toFixed(2),
      level2: level2Earnings.toFixed(2),
      level3: level3Earnings.toFixed(2),
      level4: level4Earnings.toFixed(2),
      total: totalEarnings.toFixed(2),
    }
  }

  const earnings = calculateEarnings()

  // Adicione esta verificação no início do useEffect para buscar o saldo do usuário
  useEffect(() => {
    async function fetchUserBalance() {
      try {
        if (!supabase) {
          console.error("Cliente Supabase não disponível")
          return
        }

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

    if (supabase) {
      fetchUserBalance()
    }
  }, [supabase])

  // Adicione esta renderização condicional para mostrar o erro, se houver
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container py-6">
          <Card className="bg-black/40 border-red-900/50">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-medium"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Programa de Afiliados</h1>
        </div>
      </header>

      <div className="container py-6 space-y-8">
        {/* Visão geral */}
        <Card className="bg-black/40 border-green-900/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Seu Link de Afiliado</h2>
                <p className="text-gray-400 mb-4">
                  Compartilhe seu link e ganhe comissões em até 4 níveis de indicação.
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-black/50 border border-green-900/50 rounded-lg p-2 text-sm text-gray-300 flex-1 overflow-hidden">
                    <p className="truncate">{referralLink}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Material Promocional
                  </Button>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Comissões Totais</h2>
                <p className="text-gray-400 mb-4">Resumo dos seus ganhos com o programa de afiliados.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Ganhos Totais</p>
                    <p className="text-2xl font-bold text-green-500">$0.00</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Afiliados Totais</p>
                    <p className="text-2xl font-bold text-yellow-500">0</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Níveis de afiliados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AffiliateCard level={1} percentage={10} count={0} earnings="$0.00" color="green" />
          <AffiliateCard level={2} percentage={5} count={0} earnings="$0.00" color="yellow" />
          <AffiliateCard level={3} percentage={3} count={0} earnings="$0.00" color="red" />
          <AffiliateCard level={4} percentage={2} count={0} earnings="$0.00" color="purple" />
        </div>

        {/* Calculadora de ganhos */}
        <Card className="bg-black/40 border-green-900/50">
          <CardHeader>
            <CardTitle>Calculadora de Ganhos</CardTitle>
            <CardDescription>Simule seus ganhos com o programa de afiliados em todos os níveis.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Nível 1 (10%)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número de Afiliados</label>
                      <Input
                        type="text"
                        value={formatNumber(level1Count)}
                        onChange={handleLevel1CountChange}
                        className="bg-black/50 border-green-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Médio Investido ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          type="text"
                          value={formatNumber(level1Amount)}
                          onChange={handleLevel1AmountChange}
                          className="bg-black/50 border-green-900/50 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Ganhos Estimados (Nível 1)</p>
                    <p className="text-xl font-bold text-green-500">${earnings.level1}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Nível 2 (5%)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número de Afiliados</label>
                      <Input
                        type="text"
                        value={formatNumber(level2Count)}
                        onChange={handleLevel2CountChange}
                        className="bg-black/50 border-green-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Médio Investido ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          type="text"
                          value={formatNumber(level2Amount)}
                          onChange={handleLevel2AmountChange}
                          className="bg-black/50 border-green-900/50 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Ganhos Estimados (Nível 2)</p>
                    <p className="text-xl font-bold text-yellow-500">${earnings.level2}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Nível 3 (3%)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número de Afiliados</label>
                      <Input
                        type="text"
                        value={formatNumber(level3Count)}
                        onChange={handleLevel3CountChange}
                        className="bg-black/50 border-green-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Médio Investido ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          type="text"
                          value={formatNumber(level3Amount)}
                          onChange={handleLevel3AmountChange}
                          className="bg-black/50 border-green-900/50 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Ganhos Estimados (Nível 3)</p>
                    <p className="text-xl font-bold text-red-500">${earnings.level3}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Nível 4 (2%)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número de Afiliados</label>
                      <Input
                        type="text"
                        value={formatNumber(level4Count)}
                        onChange={handleLevel4CountChange}
                        className="bg-black/50 border-green-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Médio Investido ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          type="text"
                          value={formatNumber(level4Amount)}
                          onChange={handleLevel4AmountChange}
                          className="bg-black/50 border-green-900/50 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Ganhos Estimados (Nível 4)</p>
                    <p className="text-xl font-bold text-purple-500">${earnings.level4}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-green-900/50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-white">Ganhos Totais Estimados</p>
                    <p className="text-sm text-gray-400">
                      Com {level1Count + level2Count + level3Count + level4Count} afiliados em todos os níveis
                    </p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                    ${earnings.total}
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-medium"
                onClick={() => setShowCalculator(true)}
              >
                Ver Detalhes Completos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de afiliados */}
        <Card className="bg-black/40 border-green-900/50">
          <CardHeader>
            <CardTitle>Minha Equipe</CardTitle>
            <CardDescription>Visualize todos os seus afiliados em cada nível.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="level1" className="w-full">
              <TabsList className="grid grid-cols-4 bg-black/50">
                <TabsTrigger value="level1">Nível 1</TabsTrigger>
                <TabsTrigger value="level2">Nível 2</TabsTrigger>
                <TabsTrigger value="level3">Nível 3</TabsTrigger>
                <TabsTrigger value="level4">Nível 4</TabsTrigger>
              </TabsList>
              <TabsContent value="level1" className="mt-4">
                <div className="text-center py-8 text-gray-400">Nenhum afiliado encontrado neste nível.</div>
              </TabsContent>
              <TabsContent value="level2" className="mt-4">
                <div className="text-center py-8 text-gray-400">Nenhum afiliado encontrado neste nível.</div>
              </TabsContent>
              <TabsContent value="level3" className="mt-4">
                <div className="text-center py-8 text-gray-400">Nenhum afiliado encontrado neste nível.</div>
              </TabsContent>
              <TabsContent value="level4" className="mt-4">
                <div className="text-center py-8 text-gray-400">Nenhum afiliado encontrado neste nível.</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal da calculadora detalhada */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes de Ganhos de Afiliados</DialogTitle>
            <DialogDescription>
              Simulação completa de ganhos com o programa de afiliados em todos os níveis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Nível 1 (10%)</h3>
                <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Afiliados</p>
                      <p className="text-lg font-bold text-white">{level1Count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Médio</p>
                      <p className="text-lg font-bold text-yellow-500">${level1Amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Total</p>
                      <p className="text-lg font-bold text-yellow-500">${(level1Count * level1Amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Comissão (10%)</p>
                      <p className="text-lg font-bold text-green-500">${earnings.level1}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">Nível 2 (5%)</h3>
                <div className="bg-yellow-500/10 border border-yellow-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Afiliados</p>
                      <p className="text-lg font-bold text-white">{level2Count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Médio</p>
                      <p className="text-lg font-bold text-yellow-500">${level2Amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Total</p>
                      <p className="text-lg font-bold text-yellow-500">${(level2Count * level2Amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Comissão (5%)</p>
                      <p className="text-lg font-bold text-yellow-500">${earnings.level2}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Nível 3 (3%)</h3>
                <div className="bg-red-500/10 border border-red-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Afiliados</p>
                      <p className="text-lg font-bold text-white">{level3Count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Médio</p>
                      <p className="text-lg font-bold text-yellow-500">${level3Amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Total</p>
                      <p className="text-lg font-bold text-yellow-500">${(level3Count * level3Amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Comissão (3%)</p>
                      <p className="text-lg font-bold text-red-500">${earnings.level3}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">Nível 4 (2%)</h3>
                <div className="bg-purple-500/10 border border-purple-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Afiliados</p>
                      <p className="text-lg font-bold text-white">{level4Count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Médio</p>
                      <p className="text-lg font-bold text-yellow-500">${level4Amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investimento Total</p>
                      <p className="text-lg font-bold text-yellow-500">${(level4Count * level4Amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Comissão (2%)</p>
                      <p className="text-lg font-bold text-purple-500">${earnings.level4}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-green-900/50 rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-lg font-medium text-white">Resumo Total</p>
                  <p className="text-sm text-gray-400">
                    Total de {level1Count + level2Count + level3Count + level4Count} afiliados em 4 níveis
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Investimento total: $
                    {(
                      level1Count * level1Amount +
                      level2Count * level2Amount +
                      level3Count * level3Amount +
                      level4Count * level4Amount
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-400">Ganhos Totais Estimados</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                    ${earnings.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-medium"
              onClick={() => setShowCalculator(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
