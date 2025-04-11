"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, ArrowDown, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Função para formatar números com separadores
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Função para formatar números sem o símbolo de moeda
function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function SaquesPage() {
  // Alterar o valor inicial para 0
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [withdrawAmountFormatted, setWithdrawAmountFormatted] = useState("0,00")
  const [walletAddress, setWalletAddress] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [activeTab, setActiveTab] = useState("withdraw")
  const [showMinimumAlert, setShowMinimumAlert] = useState(false)

  // Inicializa o valor formatado
  useEffect(() => {
    setWithdrawAmountFormatted(formatNumber(withdrawAmount))
  }, [])

  const handleWithdraw = () => {
    if (withdrawAmount < 2.2) {
      setShowMinimumAlert(true)
      return
    }

    if (withdrawAmount >= 2.2 && walletAddress) {
      setShowMinimumAlert(false)
      setShowConfirmation(true)
    }
  }

  // Manipulador para o input de saque
  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Se o valor estiver vazio, define como zero
    if (!value) {
      setWithdrawAmount(0)
      setWithdrawAmountFormatted("0,00")
      return
    }

    // Remove formatação para obter apenas os números
    const numericValue = value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")

    // Converte para número
    const numberValue = Number(numericValue)

    // Atualiza o estado com o valor numérico
    setWithdrawAmount(numberValue)

    // Formata o valor para exibição
    setWithdrawAmountFormatted(formatNumber(numberValue))

    // Esconde o alerta se o valor for válido
    if (numberValue >= 2.2) {
      setShowMinimumAlert(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Saques</h1>
        </div>
      </header>

      <div className="container py-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader>
                <CardTitle>Solicitar Saque</CardTitle>
                <CardDescription>Saque seus rendimentos em USDT para sua carteira.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="withdraw" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-black/50">
                    <TabsTrigger value="withdraw">Solicitar Saque</TabsTrigger>
                    <TabsTrigger value="history">Histórico de Saques</TabsTrigger>
                  </TabsList>
                  <TabsContent value="withdraw" className="space-y-6 mt-6">
                    <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Informação</AlertTitle>
                      <AlertDescription>
                        Saque mínimo: $2,20 USDT. Os saques são processados em até 24 horas.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="amount" className="text-sm font-medium">
                            Valor do Saque (USDT)
                          </Label>
                          <span className="text-sm text-gray-400">Saldo disponível: {formatCurrency(0)}</span>
                        </div>
                        {/* Campo de entrada com formatação */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <Input
                              id="amount"
                              type="text"
                              value={withdrawAmountFormatted}
                              onChange={handleWithdrawAmountChange}
                              className="bg-black/50 border-green-900/50 pl-8"
                            />
                          </div>
                          <Button
                            variant="outline"
                            className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                            onClick={() => {
                              setWithdrawAmount(2540)
                              setWithdrawAmountFormatted(formatNumber(2540))
                              setShowMinimumAlert(false)
                            }}
                          >
                            Máx
                          </Button>
                        </div>
                      </div>

                      {/* Alerta de valor mínimo */}
                      {showMinimumAlert && (
                        <Alert className="bg-red-500/10 border-red-900/50 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Valor mínimo</AlertTitle>
                          <AlertDescription>O valor mínimo para saque é $2,20 USDT.</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="wallet" className="text-sm font-medium">
                          Endereço da Carteira USDT (Rede TRC20)
                        </Label>
                        <Input
                          id="wallet"
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="Insira o endereço da sua carteira USDT"
                          className="bg-black/50 border-green-900/50"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-black font-medium"
                          onClick={handleWithdraw}
                          disabled={!walletAddress}
                        >
                          Solicitar Saque
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      {[
                        { amount: 500, date: "14 Mai 2023", status: "Processando", statusColor: "text-yellow-500" },
                        { amount: 1000, date: "10 Mai 2023", status: "Concluído", statusColor: "text-green-500" },
                        { amount: 750, date: "05 Mai 2023", status: "Concluído", statusColor: "text-green-500" },
                        { amount: 300, date: "01 Mai 2023", status: "Concluído", statusColor: "text-green-500" },
                      ].map((withdrawal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-green-900/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                              <ArrowDown className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{formatCurrency(withdrawal.amount)}</p>
                              <p className="text-xs text-gray-400">{withdrawal.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${withdrawal.statusColor}`}>{withdrawal.status}</p>
                            {withdrawal.status === "Processando" && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Estimado: 24h
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-black/40 border-green-900/50 sticky top-24">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>Visão geral dos seus fundos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(0)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Total de Saques</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(0)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Saldo Investido</p>
                    <p className="text-2xl font-bold text-yellow-500">{formatCurrency(0)}</p>
                  </div>

                  <div className="border-t border-green-900/30 pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Informações de Saque</p>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Saque mínimo: $2,20 USDT</p>
                      <p>• Rede suportada: TRC20</p>
                      <p>• Tempo de processamento: até 24h</p>
                      <p>• Taxa de saque: 0%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de saque */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Saque</DialogTitle>
            <DialogDescription>Revise os detalhes do seu saque antes de confirmar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-black/50 border border-green-900/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Valor do Saque:</span>
                <span className="text-sm font-medium text-white">{formatCurrency(withdrawAmount)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Taxa de Saque:</span>
                <span className="text-sm font-medium text-green-500">{formatCurrency(0)} USDT (0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total a Receber:</span>
                <span className="text-sm font-medium text-white">{formatCurrency(withdrawAmount)} USDT</span>
              </div>
              <div className="pt-2 border-t border-green-900/30">
                <span className="text-sm text-gray-400">Endereço da Carteira:</span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-white break-all">{walletAddress}</p>
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Verifique se o endereço da carteira está correto. Saques enviados para endereços incorretos não podem
                ser recuperados.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-green-900/50 text-green-500 hover:bg-green-900/20"
              onClick={() => setShowConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-black font-medium"
              onClick={() => {
                setShowConfirmation(false)
                setActiveTab("history")
              }}
            >
              Confirmar Saque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
