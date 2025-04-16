"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, Check, X } from "lucide-react"

export default function OrdersPanel() {
  const [activeTab, setActiveTab] = useState("open")

  const openOrders = [
    {
      id: "#12345",
      type: "buy",
      asset: "BTC/USDT",
      amount: "0.0045",
      entryPrice: "$67,245.32",
      currentPrice: "$68,245.32",
      profit: "+$45.00",
      time: "2h 15m",
    },
    {
      id: "#12346",
      type: "sell",
      asset: "ETH/USDT",
      amount: "0.25",
      entryPrice: "$3,945.12",
      currentPrice: "$3,845.12",
      profit: "+$25.00",
      time: "1h 30m",
    },
  ]

  const pendingOrders = [
    {
      id: "#12347",
      type: "buy",
      asset: "BTC/USDT",
      amount: "0.0035",
      targetPrice: "$66,500.00",
      currentPrice: "$68,245.32",
      status: "Aguardando",
      time: "Indefinido",
    },
    {
      id: "#12348",
      type: "sell",
      asset: "SOL/USDT",
      amount: "2.5",
      targetPrice: "$145.00",
      currentPrice: "$142.78",
      status: "Aguardando",
      time: "Indefinido",
    },
  ]

  const renderOpenOrders = () => {
    return (
      <div className="space-y-3">
        {openOrders.map((order, index) => (
          <div key={index} className="p-3 border border-gray-800 rounded-lg bg-black/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {order.type === "buy" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-white font-medium">
                  {order.type === "buy" ? "Compra" : "Venda"} {order.asset}
                </span>
              </div>
              <span className="text-xs text-gray-400">{order.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Quantidade:</div>
              <div className="text-white text-right">{order.amount}</div>
              <div className="text-gray-400">Preço de entrada:</div>
              <div className="text-white text-right">{order.entryPrice}</div>
              <div className="text-gray-400">Preço atual:</div>
              <div className="text-white text-right">{order.currentPrice}</div>
              <div className="text-gray-400">Lucro/Perda:</div>
              <div className="text-green-500 text-right font-medium">{order.profit}</div>
              <div className="text-gray-400">Tempo aberto:</div>
              <div className="text-white text-right">{order.time}</div>
            </div>
            <div className="flex justify-end mt-3 space-x-2">
              <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <X className="h-4 w-4 mr-1" /> Fechar
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
              >
                <Check className="h-4 w-4 mr-1" /> Realizar Lucro
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderPendingOrders = () => {
    return (
      <div className="space-y-3">
        {pendingOrders.map((order, index) => (
          <div key={index} className="p-3 border border-gray-800 rounded-lg bg-black/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {order.type === "buy" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-white font-medium">
                  {order.type === "buy" ? "Compra" : "Venda"} {order.asset}
                </span>
              </div>
              <span className="text-xs text-gray-400">{order.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Quantidade:</div>
              <div className="text-white text-right">{order.amount}</div>
              <div className="text-gray-400">Preço alvo:</div>
              <div className="text-white text-right">{order.targetPrice}</div>
              <div className="text-gray-400">Preço atual:</div>
              <div className="text-white text-right">{order.currentPrice}</div>
              <div className="text-gray-400">Status:</div>
              <div className="text-orange-500 text-right font-medium">{order.status}</div>
              <div className="text-gray-400">Tempo restante:</div>
              <div className="text-white text-right">{order.time}</div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="futuristic-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Ordens</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4 bg-black/50 border border-gray-700">
            <TabsTrigger
              value="open"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-blue-600/20"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Ordens Abertas
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-purple-600/20"
            >
              <Clock className="mr-2 h-4 w-4" />
              Ordens Pendentes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">{renderOpenOrders()}</TabsContent>
          <TabsContent value="pending">{renderPendingOrders()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
