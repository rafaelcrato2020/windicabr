"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { AlertCircle, Check, Copy, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { processReferralCommission } from "@/utils/process-referral-commission"

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

export default function InvestimentosPage() {
  // Alterar o estado inicial de investmentAmount para 0
  const [investmentAmount, setInvestmentAmount] = useState(0)
  const [investmentAmountFormatted, setInvestmentAmountFormatted] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [totalInvested, setTotalInvested] = useState(0)
  const [activeInvestments, setActiveInvestments] = useState<any[]>([])
  const [dailyReturn, setDailyReturn] = useState(0)
  const [totalReturn, setTotalReturn] = useState(0)
  const supabase = createBrowserClient()
  const { toast } = useToast()
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  // Alterando o valor inicial da calculadora para $10
  const [calculatorAmount, setCalculatorAmount] = useState(1000)
  const [calculatorAmountFormatted, setCalculatorAmountFormatted] = useState("")
  const [calculatorDays, setCalculatorDays] = useState(20)
  const calculatorRate = 6 // Taxa atualizada para 6%

  const walletAddress = "0xda217f2fe75F93AD36bA361193a8540a731ddAb6"
  const isMobile = useMobile()

  // Adicione este useEffect para buscar o saldo do usuário e investimentos
  useEffect(() => {
    async function fetchUserData() {
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

        // Buscar investimentos ativos
        const { data: investments, error: investmentsError } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (investmentsError) {
          console.error("Erro ao buscar investimentos:", investmentsError)
        } else {
          setActiveInvestments(investments || [])

          // Calcular total investido e rendimento diário
          let total = 0
          let dailyReturnTotal = 0
          let totalReturnAccumulated = 0

          investments?.forEach((inv) => {
            total += inv.amount
            // Usar a taxa do investimento ou o valor padrão de 6%
            const rate = inv.rate || 6
            dailyReturnTotal += inv.amount * (rate / 100)

            // Calcular rendimento acumulado (dias desde a criação * taxa diária * valor)
            const createdAt = new Date(inv.created_at)
            const now = new Date()
            const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
            // Garantir que daysDiff seja pelo menos 0 para evitar NaN
            const safeDaysDiff = Math.max(0, daysDiff)
            totalReturnAccumulated += inv.amount * (rate / 100) * safeDaysDiff
          })

          setTotalInvested(total)
          setDailyReturn(dailyReturnTotal || 0) // Garantir que não seja NaN
          setTotalReturn(totalReturnAccumulated || 0) // Garantir que não seja NaN
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  // Inicializa os valores formatados
  useEffect(() => {
    setInvestmentAmountFormatted(investmentAmount === 0 ? "0,00" : formatCurrency(investmentAmount).replace("$", ""))
    setCalculatorAmountFormatted(formatCurrency(calculatorAmount).replace("$", ""))
  }, [])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Modifique o manipulador para o input de investimento
  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Se o valor estiver vazio, define como zero
    if (!value) {
      setInvestmentAmount(0)
      setInvestmentAmountFormatted("")
      return
    }

    // Remove formatação para obter apenas os números
    const numericValue = value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")

    // Converte para número
    const numberValue = Number(numericValue)

    // Atualiza o estado com o valor numérico (permitindo zero)
    setInvestmentAmount(numberValue)

    // Formata o valor para exibição
    setInvestmentAmountFormatted(formatNumber(numberValue))
  }

  // Modifique o manipulador para o input da calculadora
  const handleCalculatorAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Se o valor estiver vazio, define como zero
    if (!value) {
      setCalculatorAmount(10)
      setCalculatorAmountFormatted("")
      return
    }

    // Remove formatação para obter apenas os números
    const numericValue = value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")

    // Converte para número
    const numberValue = Number(numericValue)

    // Garante que o valor não seja menor que 10
    const finalValue = Math.max(10, numberValue)

    // Atualiza o estado com o valor numérico
    setCalculatorAmount(finalValue)

    // Formata o valor para exibição
    setCalculatorAmountFormatted(formatNumber(finalValue))
  }

  // Atualiza o valor formatado quando o slider muda
  const handleSliderChange = (value: number[]) => {
    setInvestmentAmount(value[0])
    setInvestmentAmountFormatted(formatNumber(value[0]))
  }

  const calculateReturns = () => {
    // Garantir que calculatorDays seja pelo menos 1
    const days = Math.max(1, calculatorDays)
    const returns = []

    // Cálculo do rendimento diário fixo (sempre sobre o valor inicial)
    const dailyReturn = calculatorAmount * 0.06 // 6% fixo

    for (let day = 1; day <= days; day++) {
      // O valor total é o valor inicial + (rendimento diário * número de dias)
      const totalReturn = dailyReturn * day
      const amount = calculatorAmount + totalReturn
      const percentReturn = (totalReturn / calculatorAmount) * 100

      returns.push({
        day,
        amount,
        dailyReturn,
        totalReturn,
        percentReturn,
      })
    }

    return returns
  }

  // Função para processar o investimento
  const handleInvestment = async () => {
    try {
      setProcessing(true)

      // Verificar se o valor é válido
      if (investmentAmount < 10) {
        toast({
          title: "Erro",
          description: "O valor mínimo de investimento é $10 USDT",
          variant: "destructive",
        })
        return
      }

      // Verificar se o usuário tem saldo suficiente
      if (userBalance < investmentAmount) {
        // Se não tiver saldo suficiente, mostrar o QR code para depósito
        setShowConfirmation(false)
        setShowQRCode(true)
        return
      }

      // Obter a sessão atual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        })
        return
      }

      // Determinar a taxa de rendimento (6%)
      const rate = 6

      try {
        // 1. Criar o registro de investimento
        const { data: investment, error: investmentError } = await supabase
          .from("investments")
          .insert({
            user_id: session.user.id,
            amount: investmentAmount,
            rate: rate,
            status: "active",
          })
          .select()
          .single()

        if (investmentError) {
          console.error("Erro ao criar investimento:", investmentError)
          throw new Error(`Erro ao criar investimento: ${investmentError.message}`)
        }

        // 2. Atualizar o saldo do usuário
        const newBalance = userBalance - investmentAmount
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", session.user.id)

        if (updateError) {
          console.error("Erro ao atualizar saldo:", updateError)
          throw new Error(`Erro ao atualizar saldo: ${updateError.message}`)
        }

        // 3. Registrar a transação
        const { error: transactionError } = await supabase.from("transactions").insert({
          user_id: session.user.id,
          amount: investmentAmount,
          type: "investment",
          description: `Investimento de ${formatCurrency(investmentAmount)} com rendimento de ${rate}% ao dia`,
          status: "completed",
        })

        if (transactionError) {
          console.error("Erro ao registrar transação:", transactionError)
        }

        // 4. Processar comissões de indicação
        await processReferralCommission(
          session.user.id,
          investmentAmount,
          `Investimento de ${formatCurrency(investmentAmount)}`,
          supabase,
        )

        // Atualizar os estados
        setUserBalance(newBalance)
        setTotalInvested(totalInvested + investmentAmount)
        setDailyReturn(dailyReturn + investmentAmount * (rate / 100))
        setActiveInvestments([investment, ...activeInvestments])

        // Mostrar mensagem de sucesso
        toast({
          title: "Sucesso",
          description: `Investimento de ${formatCurrency(investmentAmount)} realizado com sucesso!`,
        })

        // Fechar o modal e resetar o valor
        setShowConfirmation(false)
        setInvestmentAmount(0)
        setInvestmentAmountFormatted("0,00")
      } catch (error: any) {
        console.error("Erro na operação de investimento:", error)

        // Verificar se o erro está relacionado à coluna 'rate'
        if (error.message && error.message.includes("rate")) {
          // Tentar criar o investimento sem a coluna rate
          const { data: investment, error: investmentError } = await supabase
            .from("investments")
            .insert({
              user_id: session.user.id,
              amount: investmentAmount,
              status: "active",
            })
            .select()
            .single()

          if (investmentError) {
            throw new Error(`Erro ao criar investimento (tentativa alternativa): ${investmentError.message}`)
          }

          // Continuar com o fluxo normal se a inserção sem a coluna rate funcionar
          const newBalance = userBalance - investmentAmount
          await supabase.from("profiles").update({ balance: newBalance }).eq("id", session.user.id)

          // Atualizar os estados
          setUserBalance(newBalance)
          setTotalInvested(totalInvested + investmentAmount)
          setDailyReturn(dailyReturn + investmentAmount * 0.06)
          setActiveInvestments([investment, ...activeInvestments])

          // Mostrar mensagem de sucesso
          toast({
            title: "Sucesso",
            description: `Investimento de ${formatCurrency(investmentAmount)} realizado com sucesso!`,
          })

          // Fechar o modal e resetar o valor
          setShowConfirmation(false)
          setInvestmentAmount(0)
          setInvestmentAmountFormatted("0,00")
        } else {
          throw error // Re-lançar o erro se não for relacionado à coluna rate
        }
      }
    } catch (error: any) {
      console.error("Erro ao processar investimento:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar o investimento",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Função para verificar se pode prosseguir com o investimento
  const handleConfirmInvestment = () => {
    if (investmentAmount < 10) {
      toast({
        title: "Erro",
        description: "O valor mínimo de investimento é $10 USDT",
        variant: "destructive",
      })
      return
    }

    // Verificar se o usuário tem saldo suficiente
    if (userBalance < investmentAmount) {
      // Se não tiver saldo suficiente, mostrar o QR code para depósito
      setShowQRCode(true)
    } else {
      // Se tiver saldo suficiente, mostrar a confirmação
      setShowConfirmation(true)
    }
  }

  const returns = calculateReturns()
  // Garantir que finalReturn sempre exista, mesmo se returns estiver vazio
  const finalReturn =
    returns.length > 0
      ? returns[returns.length - 1]
      : {
          amount: calculatorAmount,
          dailyReturn: 0,
          totalReturn: 0,
          percentReturn: 0,
        }

  const handlePaymentConfirmed = () => {
    setPaymentConfirmed(true)
    // Fechar o modal após 3 segundos
    setTimeout(() => {
      setShowQRCode(false)
      setPaymentConfirmed(false)
      toast({
        title: "Depósito em processamento",
        description: "Seu depósito está sendo processado e será creditado em breve.",
      })
    }, 3000)
  }

  // Modifique a parte que exibe o saldo disponível
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden h-16 items-center">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Investimentos</h1>
        </div>
      </header>

      <div className="container py-4 md:py-6 px-4 md:px-6 space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Realizar Investimento</CardTitle>
                <CardDescription>Invista a partir de $10 USDT e obtenha retornos diários de 6%.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-4 md:space-y-6">
                  <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Informação</AlertTitle>
                    <AlertDescription>
                      Investimento mínimo: $10 USDT. Investimento máximo: $20.000 USDT.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <label htmlFor="amount" className="text-sm font-medium">
                          Valor do Investimento (USDT)
                        </label>
                        <span className="text-sm text-gray-400">Saldo disponível: {formatCurrency(userBalance)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <Input
                            id="amount"
                            value={investmentAmountFormatted}
                            onChange={handleInvestmentAmountChange}
                            className="bg-black/50 border-green-900/50 pl-8"
                            placeholder="0,00"
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                          onClick={() => {
                            setInvestmentAmount(userBalance)
                            setInvestmentAmountFormatted(formatNumber(userBalance))
                          }}
                        >
                          Máx
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ajuste o valor</label>
                      <Slider
                        value={[investmentAmount]}
                        min={10}
                        max={20000}
                        step={10}
                        onValueChange={handleSliderChange}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>$10</span>
                        <span className="hidden sm:inline">$5.000</span>
                        <span className="hidden sm:inline">$10.000</span>
                        <span>$20.000</span>
                      </div>
                    </div>

                    {investmentAmount > 0 && investmentAmount < 10 && (
                      <Alert className="bg-red-500/10 border-red-900/50 text-red-500 mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Atenção</AlertTitle>
                        <AlertDescription>O valor mínimo de investimento é $10 USDT.</AlertDescription>
                      </Alert>
                    )}

                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400">Rendimento Diário Estimado</p>
                          <p className="text-xl font-bold text-green-500">{formatCurrency(investmentAmount * 0.06)}</p>
                          <p className="text-xs text-gray-400">6% ao dia</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-900/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400">Rendimento em 20 dias úteis</p>
                          <p className="text-xl font-bold text-yellow-500">
                            {formatCurrency(investmentAmount * 0.06 * 20)}
                          </p>
                          <p className="text-xs text-gray-400">120% em 20 dias úteis</p>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
                        onClick={handleConfirmInvestment}
                      >
                        Confirmar Investimento
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Calculadora de Rendimentos</CardTitle>
                <CardDescription>Simule seus rendimentos diários por até 20 dias.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Inicial (USDT)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          value={calculatorAmountFormatted}
                          onChange={handleCalculatorAmountChange}
                          className="bg-black/50 border-green-900/50 pl-8"
                          placeholder="Mínimo $10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Taxa Diária</label>
                      <div className="relative">
                        <Input
                          type="text"
                          value="6,00"
                          readOnly
                          className="bg-black/50 border-green-900/50 opacity-80"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-400">Taxa fixa de 6% ao dia</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período (Dias)</label>
                      <Input
                        type="number"
                        value={calculatorDays}
                        onChange={(e) => setCalculatorDays(Math.max(1, Number(e.target.value)))}
                        min={1}
                        max={20}
                        className="bg-black/50 border-green-900/50"
                      />
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Valor Final Estimado</p>
                      <p className="text-2xl font-bold text-green-500">
                        {formatCurrency(calculatorAmount)} + {formatCurrency(finalReturn.totalReturn)} ={" "}
                        {formatCurrency(finalReturn.amount)}
                      </p>
                      <p className="text-xs text-gray-400">Valor Inicial + Lucro Total = Valor Final</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Lucro Total</p>
                      <p className="text-2xl font-bold text-green-500">
                        {formatCurrency(finalReturn.totalReturn)}{" "}
                        <span className="text-sm">(+{finalReturn.percentReturn.toFixed(2)}%)</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-green-900/50 text-green-500 hover:bg-green-900/20"
                    onClick={() => setShowCalculator(true)}
                  >
                    Ver Detalhes Diários
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className={`bg-black/40 border-green-900/50 ${!isMobile ? "sticky top-24" : ""}`}>
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Meus Investimentos</CardTitle>
                <CardDescription>Resumo dos seus investimentos ativos.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Total Investido</p>
                    <p className="text-2xl font-bold text-yellow-500">{formatCurrency(totalInvested)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Rendimento Acumulado</p>
                    <p className="text-2xl font-bold text-green-500">
                      {isNaN(totalReturn) ? formatCurrency(0) : formatCurrency(totalReturn)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Rendimento Diário Atual</p>
                    <p className="text-2xl font-bold text-green-500">
                      {isNaN(dailyReturn) ? formatCurrency(0) : formatCurrency(dailyReturn)}
                    </p>
                  </div>

                  <div className="border-t border-green-900/30 pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Investimentos Ativos</p>
                    {activeInvestments.length > 0 ? (
                      <div className="space-y-3">
                        {activeInvestments.map((inv, index) => (
                          <div key={index} className="bg-black/30 rounded-lg p-3 border border-green-900/30">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium">{formatCurrency(inv.amount)}</p>
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                {inv.rate || 6}% ao dia
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>
                                Rendimento:{" "}
                                {isNaN(inv.amount * ((inv.rate || 6) / 100))
                                  ? formatCurrency(0)
                                  : formatCurrency(inv.amount * ((inv.rate || 6) / 100))}{" "}
                                / dia
                              </span>
                              <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">Nenhum investimento ativo no momento.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de QR Code para pagamento */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-md p-4 md:p-6 relative">
          <DialogHeader>
            <DialogTitle>Realizar Depósito</DialogTitle>
            <DialogDescription>
              {userBalance < investmentAmount
                ? `Saldo insuficiente. Você precisa depositar pelo menos ${formatCurrency(investmentAmount - userBalance)} USDT.`
                : `Envie exatamente ${formatCurrency(investmentAmount)} USDT para o endereço abaixo.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-2 rounded-lg">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mNGHOFNr2rejeiIVQW1ZuKRoUQTCFR.png"
                alt="QR Code para pagamento"
                width={200}
                height={200}
                className="w-48 h-48"
              />
            </div>
            <div className="w-full">
              <p className="text-sm text-gray-400 mb-1">Endereço da Carteira (USDT - Rede TRC20)</p>
              <div className="flex items-center gap-2">
                <div className="bg-black/50 border border-green-900/50 rounded-lg p-2 text-sm text-gray-300 flex-1 overflow-hidden">
                  <p className="truncate">{walletAddress}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                  onClick={handleCopyAddress}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Após realizar o depósito, seu investimento será ativado em até 24 horas.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="border-green-900/50 text-green-500 hover:bg-green-900/20 w-full sm:w-auto"
              onClick={() => setShowQRCode(false)}
            >
              Fechar
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium w-full sm:w-auto"
              onClick={handlePaymentConfirmed}
              disabled={paymentConfirmed}
            >
              {paymentConfirmed ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Pagamento Confirmado!
                </>
              ) : (
                "Já Realizei o Pagamento"
              )}
            </Button>
          </DialogFooter>
          {paymentConfirmed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg z-10">
              <div className="bg-green-500 rounded-full p-4 animate-pulse">
                <Check className="h-16 w-16 text-black" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de investimento */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-md p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Confirmar Investimento</DialogTitle>
            <DialogDescription>
              Você está prestes a investir {formatCurrency(investmentAmount)} do seu saldo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-green-500/10 border-green-900/50 text-green-500">
              <Info className="h-4 w-4" />
              <AlertTitle>Informação</AlertTitle>
              <AlertDescription>
                Seu investimento começará a gerar rendimentos diários de 6% imediatamente.
              </AlertDescription>
            </Alert>

            <div className="bg-black/50 border border-green-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Detalhes do Investimento</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Valor</p>
                  <p className="font-medium">{formatCurrency(investmentAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Taxa</p>
                  <p className="font-medium">6% ao dia</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Rendimento Diário</p>
                  <p className="font-medium text-green-500">{formatCurrency(investmentAmount * 0.06)} / dia</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total em 20 dias úteis</p>
                  <p className="font-medium text-green-500">
                    {formatCurrency(investmentAmount)} + {formatCurrency(investmentAmount * 0.06 * 20)} ={" "}
                    {formatCurrency(investmentAmount + investmentAmount * 0.06 * 20)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="border-green-900/50 text-green-500 hover:bg-green-900/20 w-full sm:w-auto"
              onClick={() => setShowConfirmation(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium w-full sm:w-auto"
              onClick={handleInvestment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></span>
                  Processando...
                </>
              ) : (
                "Confirmar Investimento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal da calculadora detalhada */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-3xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Detalhes de Rendimento Diário</DialogTitle>
            <DialogDescription>
              Simulação de rendimento para {formatCurrency(calculatorAmount)} USDT a 6% ao dia por {calculatorDays}{" "}
              dias.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-900/30">
                    <th className="py-2 px-2 md:px-4 text-left text-sm font-medium text-gray-400">Dia</th>
                    <th className="py-2 px-2 md:px-4 text-left text-sm font-medium text-gray-400">Saldo</th>
                    <th className="py-2 px-2 md:px-4 text-left text-sm font-medium text-gray-400">Rendimento</th>
                    <th className="py-2 px-2 md:px-4 text-left text-sm font-medium text-gray-400">Lucro Total</th>
                    <th className="py-2 px-2 md:px-4 text-left text-sm font-medium text-gray-400">%</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((item) => (
                    <tr key={item.day} className="border-b border-green-900/30 last:border-0">
                      <td className="py-2 px-2 md:px-4 text-sm">{item.day}</td>
                      <td className="py-2 px-2 md:px-4 text-sm text-yellow-500">
                        {formatCurrency(calculatorAmount)} + {formatCurrency(item.totalReturn)} ={" "}
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 px-2 md:px-4 text-sm text-green-500">+{formatCurrency(item.dailyReturn)}</td>
                      <td className="py-2 px-2 md:px-4 text-sm text-green-500">{formatCurrency(item.totalReturn)}</td>
                      <td className="py-2 px-2 md:px-4 text-sm text-green-500">+{item.percentReturn.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
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
