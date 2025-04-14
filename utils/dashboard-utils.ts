"\"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Mock implementation for CandlestickChart
export const CandlestickChart = () => <div>CandlestickChart</div>

// Mock implementation for InvestmentDoubleProgress
export const InvestmentDoubleProgress = () => <div>InvestmentDoubleProgress</div>

// Mock implementation for getTrend
export const getTrend = (value: number): "up" | "down" | "neutral" => {
  if (value > 0) return "up"
  if (value < 0) return "down"
  return "neutral"
}

// Mock implementation for getBotData
export const getBotData = () => {
  return {
    tradingPairs: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"],
  }
}

// Function to format numbers with separators
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Function to format numbers with 5 casas decimais (para pares forex)
export function formatForex(value: number): string {
  return value.toFixed(5)
}

// Function to format numbers with 2 casas decimais (para ouro)
export function formatGold(value: number): string {
  return value.toFixed(2)
}

// Componente de card de saldo com efeito flutuante
export function BalanceCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string
  value: string
  icon: any
  trend: "up" | "down" | "neutral"
  trendValue: string
  color: "green" | "yellow" | "red"
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-500/10",
      border: "border-green-900/50",
      text: "text-green-500",
      icon: "text-green-500",
      glow: "before:bg-green-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-900/50",
      text: "text-yellow-500",
      icon: "text-yellow-500",
      glow: "before:bg-yellow-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-900/50",
      text: "text-red-500",
      icon: "text-red-500",
      glow: "before:bg-red-500/20",
    },
  }

  const trendIcons = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-red-500" />,
    neutral: null,
  }

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-400",
  }

  const classes = colorClasses[color]

  return (
    <Card className={`relative overflow-hidden ${classes.bg} ${classes.border} animate-float`}>
      <div
        className={`absolute inset-0 before:absolute before:inset-0 before:blur-3xl before:opacity-40 before:animate-pulse before:-z-10 before:rounded-full before:translate-x-1/2 before:translate-y-1/2 before:scale-150 ${classes.glow}`}
      ></div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm">
            <Icon className={`h-5 w-5 ${classes.icon}`} />
          </div>
          <div className="flex items-center gap-1">
            {trendIcons[trend]}
            <span className={`${trendColors[trend]} text-xs`}>{trendValue}</span>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs text-gray-400">{title}</p>
          <p className={`text-lg font-bold mt-0.5 ${classes.text}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Interface para os dados financeiros
export interface FinancialSummary {
  totalInvestment: number
  totalEarnings: number
  totalWithdrawals: number
  totalCommissions: number
  balance: number
  investedBalance: number
  dailyEarnings: number
  totalReturnPercentage: number
}
