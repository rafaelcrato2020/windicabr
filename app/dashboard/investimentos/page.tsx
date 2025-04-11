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

  const [calculatorAmount, setCalculatorAmount] = useState(1000)
  const [calculatorAmountFormatted, setCalculatorAmountFormatted] = useState("")
  const [calculatorDays, setCalculatorDays] = useState(30)
  const [calculatorRate, setCalculatorRate] = useState(4)
  const [calculatorRateFormatted, setCalculatorRateFormatted] = useState("4,00")

  const walletAddress = "0xda217f2fe75F93AD36bA361193a8540a731ddAb6"
  const isMobile = useMobile()

  // Inicializa os valores formatados
  useEffect(() => {
    setInvestmentAmountFormatted(investmentAmount === 0 ? "0,00" : formatCurrency(investmentAmount).replace("$", ""))
    setCalculatorAmountFormatted(formatCurrency(calculatorAmount).replace("$", ""))
    setCalculatorRateFormatted(formatNumber(calculatorRate))
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

    // Garante que o valor não seja menor que 1
    const finalValue = Math.max(1, numberValue)

    // Atualiza o estado com o valor numérico
    setCalculatorAmount(finalValue)

    // Formata o valor para exibição
    setCalculatorAmountFormatted(formatNumber(finalValue))
  }

  // Adicione um manipulador para o input da taxa de rendimento
  const handleCalculatorRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Se o valor estiver vazio, define como 4 (mínimo)
    if (!value) {
      setCalculatorRate(4)
      setCalculatorRateFormatted("")
      return
    }

    // Remove formatação para obter apenas os números
    const numericValue = value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")

    // Converte para número
    const numberValue = Number(numericValue)

    // Garante que o valor esteja entre 4 e 10
    const finalValue = Math.min(10, Math.max(4, numberValue))

    // Atualiza o estado com o valor numérico
    setCalculatorRate(finalValue)

    // Formata o valor para exibição
    setCalculatorRateFormatted(formatNumber(finalValue))
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
    const dailyReturn = calculatorAmount * (calculatorRate / 100)

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
                <CardDescription>Invista a partir de $1 USDT e obtenha retornos diários de 4% a 10%.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-4 md:space-y-6">
                  <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Informação</AlertTitle>
                    <AlertDescription>
                      Investimento mínimo: $1 USDT. Investimento máximo: $20.000 USDT.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <label htmlFor="amount" className="text-sm font-medium">
                          Valor do Investimento (USDT)
                        </label>
                        <span className="text-sm text-gray-400">Saldo disponível: {formatCurrency(0)}</span>
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
                            setInvestmentAmount(2540)
                            setInvestmentAmountFormatted(formatNumber(2540))
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
                        min={1}
                        max={20000}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>$1</span>
                        <span className="hidden sm:inline">$5.000</span>
                        <span className="hidden sm:inline">$10.000</span>
                        <span>$20.000</span>
                      </div>
                    </div>

                    {investmentAmount > 0 && investmentAmount < 1 && (
                      <Alert className="bg-red-500/10 border-red-900/50 text-red-500 mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Atenção</AlertTitle>
                        <AlertDescription>O valor mínimo de investimento é $1 USDT.</AlertDescription>
                      </Alert>
                    )}

                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400">Rendimento Diário Estimado</p>
                          <p className="text-xl font-bold text-green-500">{formatCurrency(investmentAmount * 0.04)}</p>
                          <p className="text-xs text-gray-400">4% ao dia</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-900/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400">Rendimento Mensal Estimado</p>
                          <p className="text-xl font-bold text-yellow-500">
                            {formatCurrency(investmentAmount * 0.04 * 30)}
                          </p>
                          <p className="text-xs text-gray-400">120% ao mês</p>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
                        onClick={() => {
                          if (investmentAmount < 1) {
                            alert("O valor mínimo de investimento é $1 USDT")
                            return
                          }
                          setShowQRCode(true)
                        }}
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
                <CardDescription>Simule seus rendimentos diários por até 30 dias.</CardDescription>
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
                      <label className="text-sm font-medium">Taxa Diária (%)</label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={calculatorRateFormatted}
                          onChange={handleCalculatorRateChange}
                          className="bg-black/50 border-green-900/50"
                          placeholder="4,00 - 10,00"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-400">Taxa entre 4% e 10%</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período (Dias)</label>
                      <Input
                        type="number"
                        value={calculatorDays}
                        onChange={(e) => setCalculatorDays(Math.max(1, Number(e.target.value)))}
                        min={1}
                        max={30}
                        className="bg-black/50 border-green-900/50"
                      />
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Valor Final Estimado</p>
                      <p className="text-2xl font-bold text-green-500">{formatCurrency(finalReturn.amount)}</p>
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
                    <p className="text-2xl font-bold text-yellow-500">{formatCurrency(0)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Rendimento Acumulado</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(0)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Rendimento Diário Atual</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(0)}</p>
                  </div>

                  <div className="border-t border-green-900/30 pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Investimentos Ativos</p>
                    <div className="text-center py-4 text-gray-400">Nenhum investimento ativo no momento.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de QR Code para pagamento */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-md p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Realizar Depósito</DialogTitle>
            <DialogDescription>
              Envie exatamente {formatCurrency(investmentAmount)} USDT para o endereço abaixo.
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
            <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium w-full sm:w-auto">
              Já Realizei o Pagamento
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
              Simulação de rendimento para {formatCurrency(calculatorAmount)} USDT a {calculatorRate}% ao dia por{" "}
              {calculatorDays} dias.
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
                      <td className="py-2 px-2 md:px-4 text-sm text-yellow-500">{formatCurrency(item.amount)}</td>
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
