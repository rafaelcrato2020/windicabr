"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, EclipseIcon as Ethereum, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function WithdrawPage() {
  const [withdrawAmount, setWithdrawAmount] = useState(500)
  const [selectedCrypto, setSelectedCrypto] = useState("btc")

  const availableBalance = 10500

  const cryptoOptions = [
    { id: "btc", name: "Bitcoin", icon: Bitcoin, address: "bc1q84jn....7xwvs" },
    { id: "eth", name: "Ethereum", icon: Ethereum, address: "0x71C7656E...C7A2f" },
    { id: "usdt", name: "USDT", icon: DollarSign, address: "TXk82jn....9pQvs" },
  ]

  const withdrawHistory = [
    {
      id: "W12345",
      date: "15/05/2024",
      amount: "$1,200.00",
      status: "completed",
      crypto: "BTC",
      address: "bc1q84...7xwvs",
    },
    {
      id: "W12344",
      date: "02/05/2024",
      amount: "$800.00",
      status: "completed",
      crypto: "ETH",
      address: "0x71C7...2f",
    },
    {
      id: "W12343",
      date: "28/04/2024",
      amount: "$300.00",
      status: "completed",
      crypto: "USDT",
      address: "TXk82...Qvs",
    },
  ]

  // Renderizar o conteúdo da tab selecionada
  const renderCryptoContent = (crypto: (typeof cryptoOptions)[0]) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor={`${crypto.id}-amount`} className="text-gray-300">
              Valor do Saque
            </Label>
            <span className="text-sm text-gray-400">
              Disponível: <span className="text-green-500">${availableBalance.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-orange-500">$</span>
            <Input
              id={`${crypto.id}-amount`}
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              min={100}
              max={availableBalance}
              step={100}
              className="bg-black/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${crypto.id}-address`} className="text-gray-300">
            Endereço da Carteira
          </Label>
          <Input
            id={`${crypto.id}-address`}
            type="text"
            placeholder={`Seu endereço de ${crypto.name}`}
            className="bg-black/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20"
          />
        </div>

        <div className="p-4 bg-black/30 border border-gray-800 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Valor do Saque:</span>
            <span className="text-white font-medium">${withdrawAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Taxa de Processamento:</span>
            <span className="text-orange-500 font-medium">$0.00</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-800">
            <span className="text-gray-400">Total a Receber:</span>
            <span className="text-green-500 font-medium">${withdrawAmount.toFixed(2)}</span>
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0 hover-float">
          Solicitar Saque
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Saque</h1>
        <p className="text-gray-400">Retire seus rendimentos para sua carteira</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="futuristic-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Solicitar Saque</CardTitle>
            <CardDescription>Escolha a criptomoeda e o valor para sacar</CardDescription>
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
            <CardTitle className="text-xl font-bold">Histórico de Saques</CardTitle>
            <CardDescription>Acompanhe o status dos seus saques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawHistory.map((withdraw, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="flex items-center">
                      {withdraw.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : withdraw.status === "pending" ? (
                        <Clock className="h-4 w-4 text-orange-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <p className="text-white font-medium">{withdraw.amount}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">ID: {withdraw.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      {withdraw.crypto} • {withdraw.address}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{withdraw.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="link" size="sm" className="text-orange-500 mt-4 p-0">
              Ver histórico completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
