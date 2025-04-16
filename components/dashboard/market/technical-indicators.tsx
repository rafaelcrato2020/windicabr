"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TrendingUp, Activity, BarChart2, LineChart } from "lucide-react"

export default function TechnicalIndicators() {
  const [activeTab, setActiveTab] = useState("oscillators")

  const oscillators = [
    { name: "RSI (14)", value: "32.45", signal: "Compra", color: "text-green-500" },
    { name: "MACD (12, 26, 9)", value: "245.78", signal: "Compra", color: "text-green-500" },
    { name: "Estocástico (14, 3, 3)", value: "28.56", signal: "Venda", color: "text-red-500" },
    { name: "CCI (14)", value: "-112.45", signal: "Venda", color: "text-red-500" },
    { name: "ADX (14)", value: "32.78", signal: "Neutro", color: "text-gray-400" },
  ]

  const trendIndicators = [
    { name: "Média Móvel (20)", value: "67,845.32", signal: "Compra", color: "text-green-500" },
    { name: "Média Móvel (50)", value: "66,234.56", signal: "Compra", color: "text-green-500" },
    { name: "Média Móvel (200)", value: "58,123.45", signal: "Compra", color: "text-green-500" },
    { name: "Bollinger Bands", value: "Médio", signal: "Neutro", color: "text-gray-400" },
    { name: "Ichimoku Cloud", value: "Acima", signal: "Compra", color: "text-green-500" },
  ]

  const volumeIndicators = [
    { name: "Volume", value: "12,456", signal: "Aumentando", color: "text-green-500" },
    { name: "OBV", value: "1,245,678", signal: "Positivo", color: "text-green-500" },
    { name: "Money Flow Index", value: "65.34", signal: "Neutro", color: "text-gray-400" },
    { name: "Chaikin Money Flow", value: "0.12", signal: "Positivo", color: "text-green-500" },
  ]

  const renderIndicatorList = (indicators: any[]) => {
    return (
      <div className="space-y-2">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex justify-between items-center p-2 border-b border-gray-800 last:border-0">
            <span className="text-gray-300">{indicator.name}</span>
            <div className="flex items-center">
              <span className="text-white mr-3">{indicator.value}</span>
              <span className={`${indicator.color}`}>{indicator.signal}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="futuristic-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Indicadores Técnicos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="oscillators" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 bg-black/50 border border-gray-700">
            <TabsTrigger
              value="oscillators"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-purple-600/20"
            >
              <Activity className="mr-2 h-4 w-4" />
              Osciladores
            </TabsTrigger>
            <TabsTrigger
              value="trend"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-purple-600/20"
            >
              <LineChart className="mr-2 h-4 w-4" />
              Tendência
            </TabsTrigger>
            <TabsTrigger
              value="volume"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-purple-600/20"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Volume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oscillators">{renderIndicatorList(oscillators)}</TabsContent>
          <TabsContent value="trend">{renderIndicatorList(trendIndicators)}</TabsContent>
          <TabsContent value="volume">{renderIndicatorList(volumeIndicators)}</TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-300">Sinal geral:</span>
          </div>
          <span className="text-green-500 font-medium">Compra</span>
        </div>
      </CardContent>
    </Card>
  )
}
