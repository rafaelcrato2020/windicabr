"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function ReferralCalculator() {
  const [investment, setInvestment] = useState(1000)
  const [referrals, setReferrals] = useState(10)

  // Cálculos para os ganhos de afiliados
  const level1Earnings = investment * referrals * 0.1
  const level2Earnings = investment * referrals * referrals * 0.05
  const level3Earnings = investment * referrals * referrals * referrals * 0.03
  const totalEarnings = level1Earnings + level2Earnings + level3Earnings

  return (
    <Card className="h-full futuristic-card border-0 hover-float">
      <div className="h-2 w-full rounded-t-lg bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500"></div>
      <CardHeader>
        <CardTitle className="text-white text-2xl">Calculadora de Bônus de Indicação</CardTitle>
        <CardDescription className="text-gray-400">
          Simule seus ganhos com o programa de afiliados usando uma matriz de 10 pessoas por nível
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="investment" className="text-gray-300">
              Valor do Investimento (por pessoa)
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-orange-500">$</span>
              <Input
                id="investment"
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
              <Label htmlFor="referrals" className="text-gray-300">
                Pessoas por Nível
              </Label>
              <span className="text-sm text-gray-400">{referrals} pessoas</span>
            </div>
            <Slider
              id="referrals"
              min={1}
              max={20}
              step={1}
              value={[referrals]}
              onValueChange={(value) => setReferrals(value[0])}
              className="py-4"
            />
          </div>

          <div className="mt-8 space-y-4 pt-4 border-t border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-400">Nível 1 (10%):</span>
              <span className="font-semibold text-orange-500">${level1Earnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nível 2 (5%):</span>
              <span className="font-semibold text-green-500">${level2Earnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nível 3 (3%):</span>
              <span className="font-semibold text-blue-500">${level3Earnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-800">
              <span className="text-white">Total de Ganhos:</span>
              <span className="gradient-text">${totalEarnings.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>Estrutura da matriz:</p>
            <ul className="list-disc list-inside">
              <li>Nível 1: {referrals} pessoas</li>
              <li>Nível 2: {referrals * referrals} pessoas</li>
              <li>Nível 3: {referrals * referrals * referrals} pessoas</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
