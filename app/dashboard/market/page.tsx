"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

// Componentes de fallback para carregamento
const LoadingChart = () => (
  <div className="w-full h-[600px] bg-black/30 border border-gray-800 rounded-xl flex items-center justify-center">
    <p className="text-gray-400">Carregando gráfico...</p>
  </div>
)

const LoadingCard = () => (
  <div className="w-full h-64 bg-black/30 border border-gray-800 rounded-xl animate-pulse"></div>
)

// Importação dinâmica dos componentes com SSR desativado
const ChartContainer = dynamic(() => import("@/components/dashboard/market/chart-container"), {
  ssr: false,
  loading: () => <LoadingChart />,
})

const TechnicalIndicators = dynamic(() => import("@/components/dashboard/market/technical-indicators"), {
  ssr: false,
  loading: () => <LoadingCard />,
})

const OrdersPanel = dynamic(() => import("@/components/dashboard/market/orders-panel"), {
  ssr: false,
  loading: () => <LoadingCard />,
})

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState("chart")
  const [orderType, setOrderType] = useState("buy")
  const [amount, setAmount] = useState(0.001)
  const [price, setPrice] = useState(68245.32)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cryptoPairs = [
    { symbol: "BTC/USDT", price: "$68,245.32", change: "+2.34%", color: "text-green-500" },
    { symbol: "ETH/USDT", price: "$3,845.12", change: "+1.56%", color: "text-green-500" },
    { symbol: "SOL/USDT", price: "$142.78", change: "-0.45%", color: "text-red-500" },
    { symbol: "BNB/USDT", price: "$567.23", change: "+0.78%", color: "text-green-500" },
    { symbol: "XRP/USDT", price: "$0.5678", change: "-1.23%", color: "text-red-500" },
  ]

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Mercado</h1>
          <p className="text-gray-400">Carregando...</p>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-black/30 border border-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>

        <LoadingChart />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Mercado</h1>
        <p className="text-gray-400">Acompanhe as cotações em tempo real</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {cryptoPairs.map((pair, index) => (
          <Card key={index} className="futuristic-card border-0 hover-float">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-white">{pair.symbol}</div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm text-gray-400">{pair.price}</div>
                <div className={`text-sm ${pair.color}`}>{pair.change}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="chart" onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-black/50 border border-gray-700">
                <TabsTrigger value="chart" className="data-[state=active]:bg-orange-500/20">
                  Gráfico
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-blue-500/20">
                  Ordens
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-green-500/20">
                  Histórico
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chart">
              <ChartContainer />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersPanel />
            </TabsContent>

            <TabsContent value="history">
              <Card className="futuristic-card border-0">
                <CardHeader>
                  <CardTitle>Histórico de Operações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">Histórico de operações será exibido aqui</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="futuristic-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Nova Ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderType === "buy" ? "default" : "outline"}
                    className={
                      orderType === "buy"
                        ? "bg-green-500 hover:bg-green-600"
                        : "border-green-500/50 text-green-400 hover:bg-green-500/10"
                    }
                    onClick={() => setOrderType("buy")}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Comprar
                  </Button>
                  <Button
                    variant={orderType === "sell" ? "default" : "outline"}
                    className={
                      orderType === "sell"
                        ? "bg-red-500 hover:bg-red-600"
                        : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                    }
                    onClick={() => setOrderType("sell")}
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Vender
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Par</label>
                  <select className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md text-white">
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                    <option value="BNB/USDT">BNB/USDT</option>
                    <option value="XRP/USDT">XRP/USDT</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Quantidade</label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      step="0.001"
                      min="0.001"
                      className="bg-black/50 border-gray-700 text-white"
                    />
                    <span className="ml-2 text-gray-400">BTC</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Preço</label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white">${(amount * price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Taxa:</span>
                    <span className="text-white">$0.00</span>
                  </div>
                </div>

                <Button
                  className={
                    orderType === "buy"
                      ? "w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 border-0"
                      : "w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-0"
                  }
                >
                  {orderType === "buy" ? "Comprar BTC" : "Vender BTC"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <TechnicalIndicators />
        </div>
      </div>
    </div>
  )
}
