"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, EclipseIcon as Ethereum, DollarSign, Calculator } from "lucide-react"

export default function InvestPage() {
  const [investmentAmount, setInvestmentAmount] = useState(1000)
  const [selectedCrypto, setSelectedCrypto] = useState("btc")

  // Cálculo do rendimento diário (4%)
  const dailyReturn = investmentAmount * 0.04

  // Cálculo do rendimento para diferentes períodos
  const calculateReturn = (days: number) => {
    return investmentAmount * Math.pow(1.04, days)
  }

  const cryptoOptions = [
    { id: "btc", name: "Bitcoin", icon: Bitcoin, color: "from-orange-500 to-orange-700" },
    { id: "eth", name: "Ethereum", icon: Ethereum, color: "from-purple-500 to-purple-700" },
    { id: "usdt", name: "USDT", icon: DollarSign, color: "from-green-500 to-green-700" },
  ]

  // Renderizar o conteúdo da tab selecionada
  const renderCryptoContent = (crypto: (typeof cryptoOptions)[0]) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${crypto.id}-amount`} className="text-gray-300">
            Valor do Investimento
          </Label>
          <div className="flex items-center gap-4">
            <span className="text-orange-500">$</span>
            <Input
              id={`${crypto.id}-amount`}
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              min={100}
              step={100}
              className="bg-black/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="p-4 bg-black/30 border border-gray-800 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Rendimento Diário (4%):</span>
            <span className="text-green-500 font-medium">${dailyReturn.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Rendimento em 7 dias:</span>
            <span className="text-green-500 font-medium">${(calculateReturn(7) - investmentAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rendimento em 30 dias:</span>
            <span className="text-green-500 font-medium">${(calculateReturn(30) - investmentAmount).toFixed(2)}</span>
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0 hover-float">
          Investir Agora
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Investir</h1>
        <p className="text-gray-400">Comece a investir e obtenha 4% de rendimento diário</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="futuristic-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Fazer um Investimento</CardTitle>
            <CardDescription>Escolha a criptomoeda e o valor para investir</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="btc" onValueChange={setSelectedCrypto}>
              <TabsList className="grid grid-cols-3 mb-6 bg-black/50 border border-gray-700">
                {cryptoOptions.map((crypto) => (
                  <TabsTrigger
                    key={crypto.id}
                    value={crypto.id}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-purple-600/20"
                  >
                    <crypto.icon className="mr-2 h-4 w-4" />
                    {crypto.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {cryptoOptions.map((crypto) => (
                <TabsContent key={crypto.id} value={crypto.id}>
                  {renderCryptoContent(crypto)}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="futuristic-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <Calculator className="mr-2 h-5 w-5 text-orange-500" />
              Simulador de Rendimentos
            </CardTitle>
            <CardDescription>Calcule seus ganhos com rendimento fixo de 4% ao dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="simulation-amount" className="text-gray-300">
                  Valor do Investimento
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-orange-500">$</span>
                  <Input
                    id="simulation-amount"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    min={100}
                    step={100}
                    className="bg-black/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Investimento Inicial:</span>
                  <span className="font-semibold text-white">${investmentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rendimento Diário (4%):</span>
                  <span className="font-semibold text-green-500">${dailyReturn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Após 7 dias:</span>
                  <span className="font-semibold text-blue-500">${calculateReturn(7).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Após 15 dias:</span>
                  <span className="font-semibold text-blue-500">${calculateReturn(15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Após 30 dias:</span>
                  <span className="font-semibold text-blue-500">${calculateReturn(30).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-800">
                  <span className="text-white">Lucro em 30 dias:</span>
                  <span className="gradient-text">${(calculateReturn(30) - investmentAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Rendimento calculado com juros compostos de 4% ao dia.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
