"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function YieldCalculator() {
  const [investment, setInvestment] = useState(1000)
  const [days, setDays] = useState(15)

  // Cálculo do rendimento composto com 4% ao dia
  const calculateCompoundYield = (principal: number, rate: number, days: number) => {
    return principal * Math.pow(1 + rate, days)
  }

  const dailyRate = 0.04 // 4% ao dia
  const finalAmount = calculateCompoundYield(investment, dailyRate, days)
  const profit = finalAmount - investment
  const dailyProfit = investment * dailyRate

  return (
    <Card className="h-full futuristic-card border-0 hover-float">
      <div className="h-2 w-full rounded-t-lg bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>
      <CardHeader>
        <CardTitle className="text-white text-2xl">Calculadora de Rendimentos</CardTitle>
        <CardDescription className="text-gray-400">Simule seus ganhos com rendimento fixo de 4% ao dia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="investment-amount" className="text-gray-300">
              Valor do Investimento
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-purple-500">$</span>
              <Input
                id="investment-amount"
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                min={100}
                step={100}
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="days" className="text-gray-300">
                Período (dias)
              </Label>
              <span className="text-sm text-gray-400">{days} dias</span>
            </div>
            <Slider
              id="days"
              min={1}
              max={30}
              step={1}
              value={[days]}
              onValueChange={(value) => setDays(value[0])}
              className="py-4"
            />
          </div>

          <div className="mt-8 space-y-4 pt-4 border-t border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-400">Investimento Inicial:</span>
              <span className="font-semibold text-white">${investment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rendimento Diário (4%):</span>
              <span className="font-semibold text-green-500">${dailyProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lucro Total ({days} dias):</span>
              <span className="font-semibold text-blue-500">${profit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-800">
              <span className="text-white">Valor Final:</span>
              <span className="gradient-text">${finalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>Rendimento calculado com juros compostos de 4% ao dia.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
