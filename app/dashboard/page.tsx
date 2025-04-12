"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Target,
  Filter,
  Grid,
  LineChart,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getAutoTradingBot, type BotTrade, type CandlestickData } from "@/utils/auto-trading-bot"

// Importe o componente BotStatusPanel no topo do arquivo
import { BotStatusPanel } from "@/components/bot-status-panel"

// Função para formatar números com separadores
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Função para formatar números com 5 casas decimais (para pares forex)
function formatForex(value: number): string {
  return value.toFixed(5)
}

// Função para formatar números com 2 casas decimais (para ouro)
function formatGold(value: number): string {
  return value.toFixed(2)
}

// Função para verificar se é um dia útil (segunda a sexta)
function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6 // 0 = domingo, 6 = sábado
}

// Componente de card de saldo com efeito flutuante
function BalanceCard({
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
interface FinancialSummary {
  totalInvestment: number
  totalEarnings: number
  totalWithdrawals: number
  totalCommissions: number
  balance: number
  investedBalance: number
  dailyEarnings: number
  totalReturnPercentage: number
}

// Componente para o gráfico de velas
function CandlestickChart({
  data,
  currentPrice,
  trades,
  symbol,
  timeframe,
  onTimeframeChange,
}: {
  data: CandlestickData[]
  currentPrice: number
  trades: BotTrade[]
  symbol: string
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [isGold, setIsGold] = useState(symbol.includes("XAU"))

  // Configurar o canvas e redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const container = canvas.parentElement
        if (container) {
          const { width, height } = container.getBoundingClientRect()
          setDimensions({ width, height })
          canvas.width = width
          canvas.height = height
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Atualizar o estado isGold quando o símbolo mudar
  useEffect(() => {
    setIsGold(symbol.includes("XAU"))
  }, [symbol])

  // Manipulador de movimento do mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })
  }

  // Manipulador de saída do mouse
  const handleMouseLeave = () => {
    setMousePosition(null)
  }

  // Desenhar o gráfico
  useEffect(() => {
    if (!canvasRef.current || !data.length || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações do gráfico
    const padding = { top: 20, right: 80, bottom: 30, left: 80 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Encontrar valores mínimos e máximos
    const prices = data.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices) * 0.9998
    const maxPrice = Math.max(...prices) * 1.0002

    // Função para converter preço para coordenada Y
    const priceToY = (price: number) => {
      return padding.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight
    }

    // Função para converter tempo para coordenada X
    const timeToX = (time: number, index: number) => {
      return padding.left + (index / (data.length - 1)) * chartWidth
    }

    // Desenhar fundo do gráfico
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight)

    // Desenhar grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)"
    ctx.lineWidth = 1

    // Linhas horizontais
    const priceStep = (maxPrice - minPrice) / 8
    for (let i = 0; i <= 8; i++) {
      const price = minPrice + priceStep * i
      const y = priceToY(price)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)
      ctx.stroke()

      // Rótulos de preço
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "10px Arial"
      ctx.textAlign = "right"
      ctx.fillText(isGold ? formatGold(price) : formatForex(price), canvas.width - padding.right + 5, y + 4)
    }

    // Linhas verticais (tempo)
    const timeStep = Math.max(1, Math.floor(data.length / 8))
    for (let i = 0; i < data.length; i += timeStep) {
      const x = timeToX(data[i].time, i)
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()

      // Rótulos de tempo
      const date = new Date(data[i].time)
      const timeLabel = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(timeLabel, x, canvas.height - padding.bottom + 15)
    }

    // Desenhar velas
    const candleWidth = Math.max(4, Math.min(20, chartWidth / data.length - 2))

    data.forEach((candle, i) => {
      const x = timeToX(candle.time, i)
      const open = priceToY(candle.open)
      const close = priceToY(candle.close)
      const high = priceToY(candle.high)
      const low = priceToY(candle.low)

      // Desenhar linha de alta/baixa
      ctx.strokeStyle = candle.close >= candle.open ? "#22c55e" : "#ef4444"
      ctx.beginPath()
      ctx.moveTo(x, high)
      ctx.lineTo(x, low)
      ctx.stroke()

      // Desenhar corpo da vela
      ctx.fillStyle = candle.close >= candle.open ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"
      const candleHeight = Math.abs(close - open)
      ctx.fillRect(x - candleWidth / 2, Math.min(open, close), candleWidth, Math.max(1, candleHeight))
    })

    // Desenhar linha de preço atual
    const currentY = priceToY(currentPrice)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
    ctx.setLineDash([5, 3])
    ctx.beginPath()
    ctx.moveTo(padding.left, currentY)
    ctx.lineTo(canvas.width - padding.right, currentY)
    ctx.stroke()
    ctx.setLineDash([])

    // Mostrar preço atual
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(canvas.width - padding.right + 1, currentY - 10, 58, 20)
    ctx.strokeStyle = "#22c55e"
    ctx.strokeRect(canvas.width - padding.right + 1, currentY - 10, 58, 20)
    ctx.fillStyle = "#22c55e"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.fillText(
      isGold ? formatGold(currentPrice) : formatForex(currentPrice),
      canvas.width - padding.right + 30,
      currentY + 4,
    )

    // Desenhar pontos de entrada/saída das operações
    trades
      .filter((trade) => trade.symbol === symbol && trade.status !== "pending")
      .forEach((trade) => {
        // Encontrar o índice de tempo mais próximo
        const tradeTime = new Date(trade.time).getTime()
        let closestIndex = 0
        let minDiff = Number.POSITIVE_INFINITY

        data.forEach((candle, i) => {
          const diff = Math.abs(candle.time - tradeTime)
          if (diff < minDiff) {
            minDiff = diff
            closestIndex = i
          }
        })

        const x = timeToX(data[closestIndex].time, closestIndex)
        const entryY = priceToY(trade.entryPrice)

        // Desenhar ponto de entrada
        ctx.fillStyle = trade.type === "buy" ? "#22c55e" : "#ef4444"
        ctx.beginPath()
        ctx.arc(x, entryY, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1
        ctx.stroke()

        // Desenhar texto de entrada
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(x + 6, entryY - 10, 70, 20)
        ctx.strokeStyle = trade.type === "buy" ? "#22c55e" : "#ef4444"
        ctx.strokeRect(x + 6, entryY - 10, 70, 20)
        ctx.fillStyle = trade.type === "buy" ? "#22c55e" : "#ef4444"
        ctx.font = "bold 10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`${trade.type.toUpperCase()} ${trade.lotSize}`, x + 40, entryY + 4)

        // Desenhar linhas de stop loss e take profit se existirem
        if (trade.stopLoss) {
          const stopY = priceToY(trade.stopLoss)
          ctx.strokeStyle = "rgba(239, 68, 68, 0.7)"
          ctx.setLineDash([2, 2])
          ctx.beginPath()
          ctx.moveTo(padding.left, stopY)
          ctx.lineTo(canvas.width - padding.right, stopY)
          ctx.stroke()
          ctx.setLineDash([])

          // Label de stop loss
          ctx.fillStyle = "rgba(239, 68, 68, 0.7)"
          ctx.fillRect(padding.left - 60, stopY - 10, 55, 20)
          ctx.fillStyle = "white"
          ctx.font = "10px Arial"
          ctx.textAlign = "center"
          ctx.fillText("STOP", padding.left - 32, stopY + 4)
        }

        if (trade.takeProfit) {
          const tpY = priceToY(trade.takeProfit)
          ctx.strokeStyle = "rgba(34, 197, 94, 0.7)"
          ctx.setLineDash([2, 2])
          ctx.beginPath()
          ctx.moveTo(padding.left, tpY)
          ctx.lineTo(canvas.width - padding.right, tpY)
          ctx.stroke()
          ctx.setLineDash([])

          // Label de take profit
          ctx.fillStyle = "rgba(34, 197, 94, 0.7)"
          ctx.fillRect(padding.left - 60, tpY - 10, 55, 20)
          ctx.fillStyle = "white"
          ctx.font = "10px Arial"
          ctx.textAlign = "center"
          ctx.fillText("TP", padding.left - 32, tpY + 4)
        }

        // Desenhar ponto de saída para operações fechadas
        if (trade.status === "closed" && trade.closePrice) {
          const closeY = priceToY(trade.closePrice)
          const closeX = x + 30 // Deslocamento para a direita

          ctx.fillStyle = trade.profit >= 0 ? "#22c55e" : "#ef4444"
          ctx.beginPath()
          ctx.arc(closeX, closeY, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = "white"
          ctx.lineWidth = 1
          ctx.stroke()

          // Desenhar linha conectando entrada e saída
          ctx.strokeStyle = trade.profit >= 0 ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
          ctx.lineWidth = 1
          ctx.setLineDash([2, 2])
          ctx.beginPath()
          ctx.moveTo(x, entryY)
          ctx.lineTo(closeX, closeY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

    // Desenhar crosshair se o mouse estiver sobre o gráfico
    if (mousePosition) {
      const { x, y } = mousePosition

      // Verificar se o mouse está dentro da área do gráfico
      if (
        x >= padding.left &&
        x <= canvas.width - padding.right &&
        y >= padding.top &&
        y <= padding.top + chartHeight
      ) {
        // Linhas do crosshair
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.setLineDash([2, 2])
        ctx.lineWidth = 1

        // Linha vertical
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartHeight)
        ctx.stroke()

        // Linha horizontal
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(canvas.width - padding.right, y)
        ctx.stroke()

        ctx.setLineDash([])

        // Calcular e mostrar o preço no ponto do crosshair
        const price = minPrice + ((padding.top + chartHeight - y) / chartHeight) * (maxPrice - minPrice)

        // Mostrar preço no eixo Y
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(padding.left - 65, y - 10, 60, 20)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.strokeRect(padding.left - 65, y - 10, 60, 20)
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.font = "bold 10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(isGold ? formatGold(price) : formatForex(price), padding.left - 35, y + 4)

        // Encontrar a vela mais próxima do cursor
        const xRatio = (x - padding.left) / chartWidth
        const dataIndex = Math.min(data.length - 1, Math.max(0, Math.floor(xRatio * data.length)))
        const candle = data[dataIndex]

        if (candle) {
          const date = new Date(candle.time)
          const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`

          // Mostrar tempo no eixo X
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
          ctx.fillRect(x - 30, padding.top + chartHeight + 5, 60, 20)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
          ctx.strokeRect(x - 30, padding.top + chartHeight + 5, 60, 20)
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
          ctx.font = "bold 10px Arial"
          ctx.textAlign = "center"
          ctx.fillText(timeStr, x, padding.top + chartHeight + 18)

          // Mostrar detalhes da vela
          const isUp = candle.close >= candle.open
          const color = isUp ? "#22c55e" : "#ef4444"

          ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
          ctx.fillRect(x + 15, y - 50, 120, 90)
          ctx.strokeStyle = color
          ctx.strokeRect(x + 15, y - 50, 120, 90)

          ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
          ctx.font = "bold 10px Arial"
          ctx.textAlign = "left"

          ctx.fillText(`O: ${isGold ? formatGold(candle.open) : formatForex(candle.open)}`, x + 25, y - 30)
          ctx.fillText(`H: ${isGold ? formatGold(candle.high) : formatForex(candle.high)}`, x + 25, y - 15)
          ctx.fillText(`L: ${isGold ? formatGold(candle.low) : formatForex(candle.low)}`, x + 25, y)
          ctx.fillText(`C: ${isGold ? formatGold(candle.close) : formatForex(candle.close)}`, x + 25, y + 15)

          // Calcular e mostrar a variação percentual
          const change = ((candle.close - candle.open) / candle.open) * 100
          ctx.fillStyle = change >= 0 ? "#22c55e" : "#ef4444"
          ctx.fillText(`${change >= 0 ? "+" : ""}${change.toFixed(2)}%`, x + 25, y + 30)
        }
      }
    }

    // Título do gráfico
    ctx.fillStyle = "white"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`${symbol.replace("XAU", "XAU/")} - ${timeframe}`, padding.left, padding.top - 5)
  }, [data, dimensions, currentPrice, trades, mousePosition, symbol, timeframe, isGold])

  return (
    <div className="relative w-full h-full bg-black/30 rounded-lg border border-green-900/30 overflow-hidden">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((tf) => (
          <Button
            key={tf}
            variant="ghost"
            size="sm"
            className={`h-6 px-2 py-0 text-xs ${
              timeframe === tf
                ? "bg-green-900/30 text-green-500"
                : "text-gray-400 hover:bg-green-900/20 hover:text-green-500"
            }`}
            onClick={() => onTimeframeChange(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>
      <canvas ref={canvasRef} className="w-full h-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
    </div>
  )
}

// Componente para exibir uma operação do bot
function BotTradeItem({ trade, onClose }: { trade: BotTrade; onClose?: (id: string) => void }) {
  const isProfit = trade.profit >= 0
  const statusColors = {
    open: "bg-blue-500/20 text-blue-400",
    closed: isProfit ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  }

  const typeColors = {
    buy: "bg-green-500/20 text-green-400",
    sell: "bg-red-500/20 text-red-400",
  }

  const isGold = trade.symbol.includes("XAU")

  return (
    <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{trade.symbol.replace("XAU", "XAU/")}</span>
          <Badge className={typeColors[trade.type]}>{trade.type.toUpperCase()}</Badge>
          <Badge className={statusColors[trade.status]}>
            {trade.status === "open" && <Clock className="h-3 w-3 mr-1" />}
            {trade.status === "closed" &&
              (isProfit ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />)}
            {trade.status === "pending" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isProfit ? "text-green-500" : "text-red-500"}`}>
            {isProfit ? "+" : ""}
            {formatCurrency(trade.profit)}
          </span>
          {trade.status === "open" && onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-900/20"
              onClick={() => onClose(trade.id)}
            >
              <span className="sr-only">Fechar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
        <div>Entrada: {isGold ? formatGold(trade.entryPrice) : formatForex(trade.entryPrice)}</div>
        {trade.status === "closed" ? (
          <div>Saída: {isGold ? formatGold(trade.closePrice || 0) : formatForex(trade.closePrice || 0)}</div>
        ) : (
          <div>Atual: {isGold ? formatGold(trade.currentPrice) : formatForex(trade.currentPrice)}</div>
        )}
        <div>
          Volume: {trade.lotSize} {trade.lotSize === 1 ? "lote" : "lotes"}
        </div>
        <div>Horário: {trade.time}</div>
      </div>
      {trade.status === "open" && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Resultado</span>
            <span className={isProfit ? "text-green-500" : "text-red-500"}>
              {isProfit ? "+" : ""}
              {trade.profitPercent.toFixed(2)}%
            </span>
          </div>
          <Progress
            value={50 + trade.profitPercent * 5}
            className="h-1.5 bg-gray-800"
            indicatorClassName={isProfit ? "bg-green-500" : "bg-red-500"}
          />
        </div>
      )}
    </div>
  )
}

// Componente para exibir estatísticas do bot
function BotStats({
  winRate,
  totalTrades,
  avgProfit,
  profitFactor,
  dailyProfit,
  weeklyProfit,
  monthlyProfit,
  symbol,
}: {
  winRate: number
  totalTrades: number
  avgProfit: number
  profitFactor: number
  dailyProfit: number
  weeklyProfit: number
  monthlyProfit: number
  symbol: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Taxa de Acerto</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-green-500">{winRate}%</span>
          <span className="text-xs text-gray-400">{totalTrades} operações</span>
        </div>
        <Progress value={winRate} className="h-1.5 mt-2 bg-gray-800" indicatorClassName="bg-green-500" />
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
        <div className="flex items-center gap-2 mb-1">
          <LineChart className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Lucro Médio</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-yellow-500">{avgProfit}%</span>
          <span className="text-xs text-gray-400">por operação</span>
        </div>
        <Progress value={avgProfit * 10} className="h-1.5 mt-2 bg-gray-800" indicatorClassName="bg-yellow-500" />
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Fator de Lucro</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-blue-500">{profitFactor.toFixed(2)}</span>
          <span className="text-xs text-gray-400">ganhos/perdas</span>
        </div>
        <Progress
          value={Math.min(100, profitFactor * 25)}
          className="h-1.5 mt-2 bg-gray-800"
          indicatorClassName="bg-blue-500"
        />
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Rentabilidade</span>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Diária</span>
            <span className={`text-sm font-bold ${dailyProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {dailyProfit >= 0 ? "+" : ""}
              {dailyProfit}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Semanal</span>
            <span className={`text-sm font-bold ${weeklyProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {weeklyProfit >= 0 ? "+" : ""}
              {weeklyProfit}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Mensal</span>
            <span className={`text-sm font-bold ${monthlyProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {monthlyProfit >= 0 ? "+" : ""}
              {monthlyProfit}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para o painel de informações do mercado
function MarketInfoPanel({ symbol }: { symbol: string }) {
  const isGold = symbol.includes("XAU")

  // Dados simulados
  const marketData = {
    EURUSD: {
      bid: 1.07845,
      ask: 1.07853,
      spread: 0.8,
      high: 1.08123,
      low: 1.07612,
      change: 0.12,
      volume: 98432,
    },
    XAUUSD: {
      bid: 2328.45,
      ask: 2328.95,
      spread: 0.5,
      high: 2335.67,
      low: 2318.23,
      change: -0.32,
      volume: 42156,
    },
    GBPUSD: {
      bid: 1.25432,
      ask: 1.25446,
      spread: 1.4,
      high: 1.25789,
      low: 1.25123,
      change: 0.08,
      volume: 65234,
    },
    USDJPY: {
      bid: 153.45,
      ask: 153.48,
      spread: 3.0,
      high: 153.92,
      low: 152.87,
      change: 0.23,
      volume: 78543,
    },
    AUDUSD: {
      bid: 0.65432,
      ask: 0.65445,
      spread: 1.3,
      high: 0.65567,
      low: 0.65234,
      change: -0.15,
      volume: 45678,
    },
  }[symbol] || {
    bid: 1.07845,
    ask: 1.07853,
    spread: 0.8,
    high: 1.08123,
    low: 1.07612,
    change: 0.12,
    volume: 98432,
  }

  return (
    <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{symbol.replace("XAU", "XAU/")}</span>
          <Badge className={marketData.change >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
            {marketData.change >= 0 ? "+" : ""}
            {marketData.change}%
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">Atualizado agora</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Bid:</span>
          <span className="font-medium">{isGold ? formatGold(marketData.bid) : formatForex(marketData.bid)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Ask:</span>
          <span className="font-medium">{isGold ? formatGold(marketData.ask) : formatForex(marketData.ask)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Spread:</span>
          <span className="font-medium">{marketData.spread} pips</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Volume:</span>
          <span className="font-medium">{marketData.volume.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Máxima:</span>
          <span className="font-medium">{isGold ? formatGold(marketData.high) : formatForex(marketData.high)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Mínima:</span>
          <span className="font-medium">{isGold ? formatGold(marketData.low) : formatForex(marketData.low)}</span>
        </div>
      </div>
    </div>
  )
}

// Componente para o painel de controle do bot
function BotControlPanel({
  isActive,
  onToggle,
  symbol,
  onSymbolChange,
  riskLevel,
  onRiskChange,
  strategy,
  onStrategyChange,
  isAutoMode,
  onAutoModeChange,
  botData,
}: {
  isActive: boolean
  onToggle: () => void
  symbol: string
  onSymbolChange: (symbol: string) => void
  riskLevel: number
  onRiskChange: (level: number) => void
  strategy: string
  onStrategyChange: (strategy: string) => void
  isAutoMode: boolean
  onAutoModeChange: (isAuto: boolean) => void
  botData: any
}) {
  // Referência para o bot
  const botRef = useRef<any>(null)

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Controle do Bot</h3>
        <div className="flex items-center gap-2">
          <Badge className={isAutoMode ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
            {isAutoMode ? "AUTOMÁTICO" : "MANUAL"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 ${
              isActive
                ? "border-green-900/50 text-green-500 hover:bg-green-900/20"
                : "border-red-900/50 text-red-500 hover:bg-red-900/20"
            }`}
            onClick={onToggle}
            disabled={isAutoMode}
          >
            {isActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isActive ? "Pausar Bot" : "Ativar Bot"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Modo Automático 24/5</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={isAutoMode}
              onChange={() => onAutoModeChange(!isAutoMode)}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-3 border border-green-900/20 mb-3">
          <p className="text-xs text-gray-400">
            No modo automático, o bot opera 24 horas por dia, 5 dias por semana (segunda a sexta), realizando micro
            operações até atingir a meta diária de 6%. Após atingir a meta, o bot pausa automaticamente e reinicia no
            próximo dia útil.
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Pares de Trading</label>
          <div className="grid grid-cols-2 gap-2">
            {["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"].map((pair) => (
              <div key={pair} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`pair-${pair}`}
                  checked={botData.tradingPairs?.includes(pair) || pair === symbol}
                  onChange={(e) => {
                    if (isAutoMode) return

                    const newPairs = e.target.checked
                      ? [...(botData.tradingPairs || []), pair]
                      : (botData.tradingPairs || []).filter((p) => p !== pair)

                    if (botRef.current) {
                      botRef.current.updateConfig({
                        tradingPairs: newPairs.length > 0 ? newPairs : [symbol],
                      })
                    }

                    // Se o par ativo for desmarcado, selecione outro
                    if (!e.target.checked && pair === symbol && newPairs.length > 0) {
                      onSymbolChange(newPairs[0])
                    } else if (e.target.checked && newPairs.length === 1) {
                      onSymbolChange(pair)
                    }
                  }}
                  className="rounded border-green-900/50 text-green-500 focus:ring-green-500/30"
                  disabled={isAutoMode}
                />
                <label htmlFor={`pair-${pair}`} className="text-sm">
                  {pair.replace("XAU", "XAU/")}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Estratégia</label>
          <Select value={strategy} onValueChange={onStrategyChange} disabled={isAutoMode}>
            <SelectTrigger className="bg-black/50 border-green-900/50 focus:ring-green-500/30">
              <SelectValue placeholder="Selecione uma estratégia" />
            </SelectTrigger>
            <SelectContent className="bg-black border-green-900/50">
              <SelectItem value="trend_following">Trend Following</SelectItem>
              <SelectItem value="breakout">Breakout</SelectItem>
              <SelectItem value="scalping">Scalping</SelectItem>
              <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
              <SelectItem value="smart_ai">Smart AI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Nível de Risco</label>
            <span className="text-xs font-medium">
              {riskLevel === 1 && "Conservador"}
              {riskLevel === 2 && "Moderado"}
              {riskLevel === 3 && "Agressivo"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${riskLevel === 1 ? "bg-green-900/30 text-green-500" : "text-gray-400"}`}
              onClick={() => onRiskChange(1)}
              disabled={isAutoMode}
            >
              Conservador
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${riskLevel === 2 ? "bg-yellow-900/30 text-yellow-500" : "text-gray-400"}`}
              onClick={() => onRiskChange(2)}
              disabled={isAutoMode}
            >
              Moderado
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${riskLevel === 3 ? "bg-red-900/30 text-red-500" : "text-gray-400"}`}
              onClick={() => onRiskChange(3)}
              disabled={isAutoMode}
            >
              Agressivo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para exibir o progresso até 120% em 20 dias
function InvestmentDoubleProgress({ percentage, daysCompleted = 0 }: { percentage: number; daysCompleted?: number }) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium">Progresso do ciclo de 20 dias úteis</span>
        </div>
        <span className="text-yellow-500 font-bold">{percentage.toFixed(2)}%</span>
      </div>
      <Progress
        value={percentage}
        className="h-2.5 bg-gray-800"
        indicatorClassName="bg-gradient-to-r from-green-500 to-yellow-500"
      />
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0%</span>
        <span>60%</span>
        <span>120%</span>
      </div>
      <div className="mt-3 text-xs text-gray-400">
        <p>
          {percentage < 120
            ? `Faltam ${(120 - percentage).toFixed(2)}% para completar o ciclo de 120%.`
            : "Parabéns! Você completou o ciclo de 120% em 20 dias úteis."}
        </p>
        <p className="mt-1">
          {percentage < 120
            ? `Estimativa: ${Math.ceil((120 - percentage) / 6)} dias úteis restantes com rendimento de 6% ao dia.`
            : "Você pode sacar o valor ou iniciar um novo ciclo de investimento."}
        </p>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-gray-400">Dias úteis completados:</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < daysCompleted ? "bg-green-500" : "bg-gray-700"
              } transition-colors duration-300`}
              title={`Dia útil ${i + 1}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Modifique o componente DashboardPage para buscar o saldo do usuário
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("chart")
  const isMobile = useMobile()
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalInvestment: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    totalCommissions: 0,
    balance: 0,
    investedBalance: 0,
    dailyEarnings: 0,
    totalReturnPercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()
  const [profileData, setProfileData] = useState<any>(null)
  const { toast } = useToast()

  // Estado para o Meta Trader
  const [activeSymbol, setActiveSymbol] = useState("EURUSD")
  const [timeframe, setTimeframe] = useState("M15")
  const [botActive, setBotActive] = useState(true)
  const [riskLevel, setRiskLevel] = useState(2)
  const [strategy, setStrategy] = useState("smart_ai")
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [botState, setBotState] = useState<any>(null)
  const [botInitialized, setBotInitialized] = useState(false)

  // Estados para o progresso do ciclo de 20 dias úteis
  const [cycleProgress, setCycleProgress] = useState(0)
  const [daysCompleted, setDaysCompleted] = useState(0)
  const [lastGoalDate, setLastGoalDate] = useState<string | null>(null)
  const [completedBusinessDays, setCompletedBusinessDays] = useState<string[]>([])

  // Referência para o bot
  const botRef = useRef<any>(null)

  // Inicializar tabelas do bot
  useEffect(() => {
    const initBotTables = async () => {
      try {
        const response = await fetch("/api/init-bot-tables")
        const data = await response.json()

        if (data.success) {
          console.log("Tabelas do bot inicializadas com sucesso")
        } else {
          console.error("Erro ao inicializar tabelas do bot:", data.error)
        }
      } catch (error) {
        console.error("Erro ao inicializar tabelas do bot:", error)
      }
    }

    initBotTables()
  }, [])

  // Inicializar o bot
  useEffect(() => {
    if (!botInitialized) {
      const bot = getAutoTradingBot()
      botRef.current = bot

      // Configurar para operar em todos os pares principais
      bot.updateConfig({
        tradingPairs: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"],
      })

      // Adicionar ouvinte para mudanças de estado
      bot.addListener((state) => {
        setBotState(state)

        // Atualizar estados locais com base no estado do bot
        setActiveSymbol(state.activeSymbol)
        setTimeframe(state.timeframe)
        setBotActive(state.isActive)

        // Verificar se a meta diária foi atingida
        if (state.targetReached && state.status === "target_reached") {
          const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD
          const currentDate = new Date()

          // Verificar se é um dia útil
          if (isBusinessDay(currentDate)) {
            // Verificar se já atingimos a meta hoje
            if (!completedBusinessDays.includes(today)) {
              // Atualizar o rendimento diário com o valor atingido
              setFinancialData((prev) => ({
                ...prev,
                dailyEarnings: state.dailyProfit || prev.dailyEarnings,
              }))

              // Incrementar o progresso do ciclo (6% por dia)
              setCycleProgress((prev) => {
                const newProgress = Math.min(prev + 6, 120)
                return newProgress
              })

              // Incrementar os dias úteis completados
              setDaysCompleted((prev) => {
                const newDays = Math.min(prev + 1, 20)
                return newDays
              })

              // Adicionar este dia útil à lista de dias completados
              setCompletedBusinessDays((prev) => [...prev, today])

              // Atualizar a data da última meta atingida
              setLastGoalDate(today)

              // Notificar o usuário
              toast({
                title: "Meta Diária Atingida!",
                description: "O bot atingiu a meta de 6% para hoje e pausará até o próximo dia útil.",
                variant: "success",
              })
            }
          }
        }
      })

      // Iniciar o bot
      bot.start().then(() => {
        setBotInitialized(true)
        toast({
          title: "Bot Iniciado",
          description: "O bot de trading automático foi iniciado com sucesso",
          variant: "default",
        })
      })
    }
  }, [botInitialized, toast, completedBusinessDays])

  // Buscar todos os dados financeiros do usuário
  useEffect(() => {
    async function fetchFinancialData() {
      try {
        setLoading(true)

        // Obter a sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.error("Usuário não autenticado")
          setLoading(false)
          return
        }

        const userId = session.user.id

        // 1. Buscar o perfil do usuário com o saldo e dados pessoais
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("balance, name, email")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError)
        } else {
          setProfileData(profileData)
        }

        // 2. Buscar o total investido
        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select("amount, total_earnings")
          .eq("user_id", userId)

        if (investmentsError) {
          console.error("Erro ao buscar investimentos:", investmentsError)
        }

        // 3. Buscar o total de saques
        const { data: withdrawalsData, error: withdrawalsError } = await supabase
          .from("withdrawals")
          .select("amount")
          .eq("user_id", userId)
          .eq("status", "approved")

        if (withdrawalsError) {
          console.error("Erro ao buscar saques:", withdrawalsError)
        }

        // 4. Verificar se a tabela de comissões existe e buscar dados
        let totalCommissions = 0

        // Primeiro, tente buscar da tabela commissions
        const { data: commissionsData, error: commissionsError } = await supabase
          .from("commissions")
          .select("amount")
          .eq("user_id", userId)

        if (!commissionsError) {
          totalCommissions = commissionsData
            ? commissionsData.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)
            : 0
        } else {
          console.log("Tabela commissions não encontrada ou erro:", commissionsError.message)

          // Se falhar, tente buscar da tabela referral_commissions
          try {
            const { data: referralData, error: referralError } = await supabase
              .from("referral_commissions")
              .select("amount")
              .eq("user_id", userId)

            if (!referralError && referralData) {
              totalCommissions = referralData.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)
            } else if (referralError) {
              console.log("Erro ao buscar referral_commissions:", referralError.message)
            }
          } catch (err) {
            console.log("Erro ao tentar buscar comissões:", err)
          }
        }

        // Buscar rendimentos de forma mais abrangente
        const { data: earningsData, error: earningsError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .in("type", ["earning", "yield"]) // Buscar tanto "earning" quanto "yield"
          .eq("status", "completed")

        // 5. Calcular rendimento diário (último rendimento registrado)
        let dailyEarnings = 0
        try {
          const today = new Date()
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          // Buscar transações de rendimento mais recentes
          const { data: dailyEarningsData, error: dailyEarningsError } = await supabase
            .from("transactions")
            .select("amount, created_at")
            .eq("user_id", userId)
            .in("type", ["yield", "earning"])
            .eq("status", "completed")
            .gte("created_at", yesterday.toISOString())
            .order("created_at", { ascending: false })
            .limit(1)

          if (!dailyEarningsError && dailyEarningsData && dailyEarningsData.length > 0) {
            dailyEarnings = Number.parseFloat(dailyEarningsData[0].amount) || 0
          }
        } catch (err) {
          console.log("Erro ao processar rendimento diário:", err)
        }

        // Calcular os totais
        const totalInvestment = investmentsData
          ? investmentsData.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)
          : 0

        const totalEarnings = investmentsData
          ? investmentsData.reduce((sum, item) => sum + (Number.parseFloat(item.total_earnings) || 0), 0)
          : 0

        const totalWithdrawals = withdrawalsData
          ? withdrawalsData.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0)
          : 0

        // Calcular o percentual de retorno total (para mostrar progresso até dobrar)
        const totalReturnPercentage = totalInvestment > 0 ? (totalEarnings / totalInvestment) * 100 : 0

        // Atualizar o estado com todos os dados financeiros
        setFinancialData({
          totalInvestment,
          totalEarnings,
          totalWithdrawals,
          totalCommissions,
          balance: profileData?.balance || 0,
          investedBalance: totalInvestment,
          dailyEarnings,
          totalReturnPercentage,
        })
      } catch (err) {
        console.error("Erro ao buscar dados financeiros:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [supabase, activeSymbol])

  // Manipuladores de eventos para o bot
  const handleToggleBot = () => {
    if (isAutoMode) return

    if (botActive) {
      botRef.current?.stop()
    } else {
      botRef.current?.start()
    }

    setBotActive(!botActive)
  }

  const handleSymbolChange = (symbol: string) => {
    if (isAutoMode) return
    setActiveSymbol(symbol)

    if (botRef.current) {
      botRef.current.updateConfig({
        tradingPairs: [symbol],
      })
    }
  }

  const handleTimeframeChange = (tf: string) => {
    if (isAutoMode) return
    setTimeframe(tf)
  }

  const handleRiskChange = (level: number) => {
    if (isAutoMode) return
    setRiskLevel(level)

    if (botRef.current) {
      botRef.current.updateConfig({
        riskLevel: level,
      })
    }
  }

  const handleStrategyChange = (strat: string) => {
    if (isAutoMode) return
    setStrategy(strat)

    if (botRef.current) {
      botRef.current.updateConfig({
        strategy: strat,
      })
    }
  }

  const handleAutoModeChange = (isAuto: boolean) => {
    setIsAutoMode(isAuto)

    if (botRef.current) {
      botRef.current.updateConfig({
        active: isAuto,
        autoRestart: isAuto,
      })

      if (isAuto) {
        botRef.current.start()
      }
    }

    toast({
      title: isAuto ? "Modo Automático Ativado" : "Modo Manual Ativado",
      description: isAuto
        ? "O bot agora opera 24/5 (segunda a sexta) até atingir a meta diária de 6%"
        : "Você agora tem controle manual sobre o bot",
      variant: "default",
    })
  }

  // Calcular tendências (para mostrar setas para cima/baixo)
  const getTrend = (value: number) => {
    if (value > 0) return "up"
    if (value < 0) return "down"
    return "neutral"
  }

  // Obter dados do estado do bot
  const getBotData = () => {
    if (!botState) {
      return {
        trades: [],
        candlestickData: {},
        currentPrices: {},
        lastUpdate: new Date(),
        status: "analyzing",
        dailyProfitPercentage: 0,
        tradingPairs: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"],
        stats: {
          winRate: 78,
          totalTrades: 0,
          avgProfit: 0.12,
          profitFactor: 2.35,
          dailyProfit: 0,
          weeklyProfit: 18.5,
          monthlyProfit: 42.3,
        },
      }
    }

    return botState
  }

  const botData = getBotData()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Painel de Controle</h1>
          <div className="flex items-center gap-4">
            {profileData ? (
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{profileData.name || "Usuário"}</span>
                <span className="text-xs text-gray-400">{profileData.email}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Carregando...</span>
            )}
          </div>
        </div>
      </header>

      <div className="container py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
        {/* Layout principal com duas colunas em telas maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Coluna principal (2/3 da largura em desktop) */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Saldos principais em uma linha */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <BalanceCard
                title="Saldo Disponível"
                value={formatCurrency(financialData.balance)}
                icon={Wallet}
                trend={getTrend(financialData.balance)}
                trendValue={financialData.balance > 0 ? "+100%" : "0%"}
                color="green"
              />
              <BalanceCard
                title="Saldo Investido"
                value={formatCurrency(financialData.investedBalance)}
                icon={DollarSign}
                trend={getTrend(financialData.investedBalance)}
                trendValue={financialData.investedBalance > 0 ? "+100%" : "0%"}
                color="yellow"
              />
              <BalanceCard
                title="Rendimento Diário"
                value={formatCurrency(financialData.dailyEarnings)}
                icon={TrendingUp}
                trend={getTrend(financialData.dailyEarnings)}
                trendValue={financialData.dailyEarnings > 0 ? "+6%" : "0%"}
                color="green"
              />
              <BalanceCard
                title="Total de Saques"
                value={formatCurrency(financialData.totalWithdrawals)}
                icon={BarChart3}
                trend={getTrend(financialData.totalWithdrawals)}
                trendValue={financialData.totalWithdrawals > 0 ? "+100%" : "0%"}
                color="red"
              />
              <BalanceCard
                title="Comissões de Indicação"
                value={formatCurrency(financialData.totalCommissions)}
                icon={Users}
                trend={getTrend(financialData.totalCommissions)}
                trendValue={financialData.totalCommissions > 0 ? "+100%" : "0%"}
                color="green"
              />
            </div>

            {/* Meta Trader 4 */}
            <Card className="bg-black/40 border-green-900/50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-green-900/30">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${botData.status === "target_reached" ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`}
                  ></div>
                  <h2 className="text-base font-semibold text-white">Forexity Trading Bot</h2>
                  <Badge
                    className={
                      botData.status === "target_reached"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }
                  >
                    {botData.status === "target_reached" ? "META ATINGIDA" : "ATIVO"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      botData.status === "analyzing"
                        ? "bg-blue-500/20 text-blue-400"
                        : botData.status === "trading"
                          ? "bg-green-500/20 text-green-400"
                          : botData.status === "waiting"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                    }
                  >
                    {botData.status === "analyzing" && "Analisando Mercado"}
                    {botData.status === "trading" && "Operando"}
                    {botData.status === "waiting" && "Aguardando Oportunidade"}
                    {botData.status === "target_reached" && "Meta Diária Atingida"}
                    {botData.status === "paused" && "Operações Pausadas"}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-black/50 mb-4">
                    <TabsTrigger value="chart">Gráfico</TabsTrigger>
                    <TabsTrigger value="trades">Operações</TabsTrigger>
                    <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chart" className="mt-0">
                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 border border-green-900/30 mb-2">
                      <div className="flex items-center gap-2">
                        <Select value={activeSymbol} onValueChange={handleSymbolChange} disabled={isAutoMode}>
                          <SelectTrigger className="w-[140px] h-8 bg-black/50 border-green-900/50 focus:ring-green-500/30">
                            <SelectValue placeholder="Selecione um par" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-900/50">
                            <SelectItem value="EURUSD">EUR/USD</SelectItem>
                            <SelectItem value="XAUUSD">XAU/USD (Ouro)</SelectItem>
                            <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                            <SelectItem value="USDJPY">USD/JPY</SelectItem>
                            <SelectItem value="AUDUSD">AUD/USD</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                            disabled={isAutoMode}
                          >
                            <LineChart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                            disabled={isAutoMode}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                            disabled={isAutoMode}
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                          disabled={isAutoMode}
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                          disabled={isAutoMode}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-[400px]">
                      <CandlestickChart
                        data={botData.candlestickData[activeSymbol] || []}
                        currentPrice={botData.currentPrices[activeSymbol] || 0}
                        trades={botData.trades}
                        symbol={activeSymbol}
                        timeframe={timeframe}
                        onTimeframeChange={handleTimeframeChange}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <span>Última atualização: {botData.lastUpdate.toLocaleTimeString()}</span>
                      <span>
                        {botData.status === "target_reached" ? (
                          <span className="text-yellow-500">Meta diária de 6% atingida</span>
                        ) : (
                          `Progresso: ${botData.dailyProfitPercentage.toFixed(2)}% de 6%`
                        )}
                      </span>
                    </div>
                  </TabsContent>

                  <TabsContent value="trades" className="mt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>Última atualização: {botData.lastUpdate.toLocaleTimeString()}</span>
                        <span>
                          {botData.trades.filter((t: BotTrade) => t.status === "open").length} operações ativas
                        </span>
                      </div>

                      {/* Agrupamento por pares */}
                      {botData.tradingPairs && botData.tradingPairs.length > 0 ? (
                        <div className="space-y-4">
                          {botData.tradingPairs.map((pair: string) => {
                            const pairTrades = botData.trades.filter((t: BotTrade) => t.symbol === pair)
                            if (pairTrades.length === 0) return null

                            return (
                              <div key={pair} className="space-y-2">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  {pair.replace("XAU", "XAU/")}
                                  <Badge className="bg-green-500/20 text-green-400">
                                    {pairTrades.filter((t: BotTrade) => t.status === "open").length} ativas
                                  </Badge>
                                </h3>

                                {pairTrades.map((trade: BotTrade) => (
                                  <BotTradeItem
                                    key={trade.id}
                                    trade={trade}
                                    onClose={isAutoMode ? undefined : (id) => botRef.current?.closePosition(id)}
                                  />
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">Nenhuma operação encontrada.</div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="stats" className="mt-0">
                    <BotStats
                      winRate={botData.stats.winRate}
                      totalTrades={botData.stats.totalTrades}
                      avgProfit={botData.stats.avgProfit}
                      profitFactor={botData.stats.profitFactor}
                      dailyProfit={botData.stats.dailyProfit}
                      weeklyProfit={botData.stats.weeklyProfit}
                      monthlyProfit={botData.stats.monthlyProfit}
                      symbol={activeSymbol}
                    />

                    {/* Nova seção de desempenho por par */}
                    <div className="mt-4 bg-black/30 rounded-lg p-4 border border-green-900/30">
                      <h3 className="text-sm font-medium mb-3">Desempenho por Par</h3>
                      <div className="space-y-3">
                        {botData.tradingPairs &&
                          botData.tradingPairs.map((pair: string) => {
                            const pairTrades = botData.trades.filter((t: BotTrade) => t.symbol === pair)
                            const closedTrades = pairTrades.filter((t: BotTrade) => t.status === "closed")
                            const winningTrades = closedTrades.filter((t: BotTrade) => t.profit > 0)
                            const winRate =
                              closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
                            const totalProfit = closedTrades.reduce((sum: number, t: BotTrade) => sum + t.profit, 0)

                            return (
                              <div key={pair} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${winRate > 50 ? "bg-green-500" : "bg-red-500"}`}
                                  ></div>
                                  <span>{pair.replace("XAU", "XAU/")}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span>{closedTrades.length} operações</span>
                                  <span>{winRate.toFixed(0)}% acerto</span>
                                  <span className={totalProfit >= 0 ? "text-green-500" : "text-red-500"}>
                                    {totalProfit >= 0 ? "+" : ""}
                                    {formatCurrency(totalProfit)}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    <div className="mt-4 bg-black/30 rounded-lg p-4 border border-green-900/30">
                      <h3 className="text-sm font-medium mb-2">Desempenho do Bot</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        O Forexity Trading Bot utiliza algoritmos avançados de inteligência artificial para analisar o
                        mercado Forex e executar micro-operações com alta precisão. Com uma taxa de acerto de{" "}
                        {botData.stats.winRate}%, o bot garante um rendimento diário fixo de 6%.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pares operados:</span>
                          <span>{botData.tradingPairs?.length || 5} principais</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Estratégia:</span>
                          <span>
                            {strategy === "trend_following" && "Trend Following"}
                            {strategy === "breakout" && "Breakout"}
                            {strategy === "scalping" && "Scalping"}
                            {strategy === "mean_reversion" && "Mean Reversion"}
                            {strategy === "smart_ai" && "Smart AI"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nível de Risco:</span>
                          <span>
                            {riskLevel === 1 && "Conservador"}
                            {riskLevel === 2 && "Moderado"}
                            {riskLevel === 3 && "Agressivo"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Operações/dia:</span>
                          <span>10-30</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Progresso até 120% em 20 dias */}
            <InvestmentDoubleProgress percentage={cycleProgress} daysCompleted={daysCompleted} />
          </div>

          {/* Coluna lateral (1/3 da largura em desktop) */}
          <div className="space-y-4 md:space-y-6">
            {/* Painel de status do bot */}
            <BotStatusPanel />

            {/* Painel de controle do bot */}
            <BotControlPanel
              isActive={botActive}
              onToggle={handleToggleBot}
              symbol={activeSymbol}
              onSymbolChange={handleSymbolChange}
              riskLevel={riskLevel}
              onRiskChange={handleRiskChange}
              strategy={strategy}
              onStrategyChange={handleStrategyChange}
              isAutoMode={isAutoMode}
              onAutoModeChange={handleAutoModeChange}
              botData={botData}
            />

            {/* Informações do mercado */}
            <MarketInfoPanel symbol={activeSymbol} />

            {/* Card de resumo */}
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-green-900/30 pb-2">
                    <span className="text-sm text-gray-400">Investimento Total</span>
                    <span className="text-sm font-medium text-yellow-500">
                      {formatCurrency(financialData.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-900/30 pb-2">
                    <span className="text-sm text-gray-400">Rendimento Total</span>
                    <span className="text-sm font-medium text-green-500">
                      {formatCurrency(financialData.totalEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-900/30 pb-2">
                    <span className="text-sm text-gray-400">Saques Realizados</span>
                    <span className="text-sm font-medium text-red-500">
                      {formatCurrency(financialData.totalWithdrawals)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Comissões Recebidas</span>
                    <span className="text-sm font-medium text-green-500">
                      {formatCurrency(financialData.totalCommissions)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de informações do bot */}
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Rendimento Garantido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-500">6%</p>
                        <p className="text-xs text-gray-400">ao dia</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">120%</p>
                        <p className="text-xs text-gray-400">em 20 dias</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
                    onClick={() => (window.location.href = "/dashboard/investimentos")}
                  >
                    Investir Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
