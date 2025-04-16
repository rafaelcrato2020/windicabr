"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react'

export default function TradingBot() {
  const [mounted, setMounted] = useState(false)
  const [botActive, setBotActive] = useState(true)
  const [lastOperation, setLastOperation] = useState<{
    type: "buy" | "sell"
    asset: string
    amount: string
    price: string
    profit: string
    time: string
  }>({
    type: "buy",
    asset: "BTC/USDT",
    amount: "0.0045",
    price: "$68,245.32",
    profit: "+$120.45",
    time: "2 min atrás",
  })
  const [operationHistory, setOperationHistory] = useState<
    {
      type: "buy" | "sell"
      asset: string
      amount: string
      price: string
      profit: string
      time: string
    }[]
  >([
    {
      type: "sell",
      asset: "ETH/USDT",
      amount: "0.25",
      price: "$3,845.12",
      profit: "+$45.32",
      time: "15 min atrás",
    },
    {
      type: "buy",
      asset: "SOL/USDT",
      amount: "2.5",
      price: "$142.78",
      profit: "+$28.75",
      time: "32 min atrás",
    },
    {
      type: "sell",
      asset: "BTC/USDT",
      amount: "0.0032",
      price: "$67,998.45",
      profit: "+$98.65",
      time: "1h atrás",
    },
  ])
  const [nextOperationTime, setNextOperationTime] = useState(0)
  const [countdown, setCountdown] = useState("")

  // Use refs to avoid dependencies that change with every render
  const lastOperationRef = useRef(lastOperation)
  const operationHistoryRef = useRef(operationHistory)
  const nextOperationTimeRef = useRef(nextOperationTime)
  const botActiveRef = useRef(botActive)

  // Ensure client-side only execution
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update refs when states change
  useEffect(() => {
    if (!mounted) return
    
    lastOperationRef.current = lastOperation
    operationHistoryRef.current = operationHistory
    nextOperationTimeRef.current = nextOperationTime
    botActiveRef.current = botActive
  }, [lastOperation, operationHistory, nextOperationTime, botActive, mounted])

  // Function to simulate a bot operation
  const simulateOperation = useCallback(() => {
    if (!mounted) return

    const assets = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"]
    const types: ("buy" | "sell")[] = ["buy", "sell"]

    const randomAsset = assets[Math.floor(Math.random() * assets.length)]
    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomAmount = (Math.random() * 0.01).toFixed(4)
    const randomPrice = `${(60000 + Math.random() * 10000).toFixed(2)}`
    const randomProfit = `+${(Math.random() * 200).toFixed(2)}`

    const newOperation = {
      type: randomType,
      asset: randomAsset,
      amount: randomAmount,
      price: randomPrice,
      profit: randomProfit,
      time: "Agora",
    }

    // Update history
    const updatedHistory = [
      { ...lastOperationRef.current, time: "2 min atrás" },
      ...operationHistoryRef.current.slice(0, 2),
    ]

    setLastOperation(newOperation)
    setOperationHistory(updatedHistory)

    // Set next operation time (between 30s and 2min for simulation)
    const nextTime = Date.now() + Math.floor(Math.random() * 90000) + 30000
    setNextOperationTime(nextTime)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    // Start timer for next operation
    const initialNextTime = Date.now() + Math.floor(Math.random() * 90000) + 30000
    setNextOperationTime(initialNextTime)

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      if (!mounted) return
      
      const now = Date.now()
      const distance = nextOperationTimeRef.current - now

      if (distance <= 0 && botActiveRef.current) {
        simulateOperation()
      } else {
        // Update countdown
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setCountdown(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [simulateOperation, mounted])

  if (!mounted) {
    return (
      <Card className="futuristic-card border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Cash Fund Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-400">Loading bot data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="futuristic-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-xl font-bold flex items-center">
            <Bot className="mr-2 h-5 w-5 text-orange-500" />
            Cash Fund Bot
          </CardTitle>
          <CardDescription>Bot de trading automatizado com 4% de retorno diário</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${botActive ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
          <span className={`text-sm ${botActive ? "text-green-500" : "text-red-500"}`}>
            {botActive ? "Ativo" : "Inativo"}
          </span>
          <Button
            variant={botActive ? "outline" : "default"}
            size="sm"
            onClick={() => setBotActive(!botActive)}
            className={
              botActive ? "border-red-500/50 text-red-400 hover:bg-red-500/10" : "bg-green-500 hover:bg-green-600"
            }
          >
            {botActive ? "Pausar" : "Ativar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Próxima operação em:</span>
            </div>
            <span className="text-sm font-mono text-orange-500">{countdown}</span>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Última Operação</h3>
              <span className="text-xs text-gray-500">{lastOperation.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {lastOperation.type === "buy" ? (
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                )}
                <div>
                  <p className="text-white font-medium">{lastOperation.asset}</p>
                  <p className="text-sm text-gray-400">
                    {lastOperation.type === "buy" ? "Compra" : "Venda"} de {lastOperation.amount} a{" "}
                    {lastOperation.price}
                  </p>
                </div>
              </div>
              <span className="text-green-500 font-medium">{lastOperation.profit}</span>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-300 mt-4">Histórico de Operações</h3>
          <div className="space-y-3">
            {operationHistory.map((op, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center">
                  {op.type === "buy" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <div>
                    <p className="text-sm text-white">{op.asset}</p>
                    <p className="text-xs text-gray-400">
                      {op.type === "buy" ? "Compra" : "Venda"} de {op.amount}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-500">{op.profit}</p>
                  <p className="text-xs text-gray-500">{op.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-gray-400">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-xs">Rendimento diário de 4% sobre o investimento</span>
            </div>
            <Button variant="link" size="sm" className="text-orange-500 p-0">
              Ver tudo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
