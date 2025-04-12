"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  DollarSign,
  Download,
  Filter,
  Grid,
  LineChart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Share2,
  Sliders,
  Zap,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Função para formatar números com separadores
function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
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

// Tipos para as operações do bot
interface BotTrade {
  id: string
  symbol: string
  type: "buy" | "sell"
  entryPrice: number
  currentPrice: number
  amount: number
  profit: number
  profitPercent: number
  time: string
  status: "open" | "closed" | "pending"
  closePrice?: number
  closeTime?: string
  lotSize: number
  stopLoss?: number
  takeProfit?: number
}

// Tipo para os dados de velas
interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Componente para o gráfico de velas
function CandlestickChart({
  data,
  currentPrice,
  trades,
  symbol,
  timeframe,
  onTimeframeChange,
  fullscreen,
}: {
  data: CandlestickData[]
  currentPrice: number
  trades: BotTrade[]
  symbol: string
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
  fullscreen: boolean
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
  }, [fullscreen])

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
    ctx.fillText(`${symbol} - ${timeframe}`, padding.left, padding.top - 5)
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
          <span className="font-bold">{trade.symbol}</span>
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
}: {
  isActive: boolean
  onToggle: () => void
  symbol: string
  onSymbolChange: (symbol: string) => void
  riskLevel: number
  onRiskChange: (level: number) => void
  strategy: string
  onStrategyChange: (strategy: string) => void
}) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Controle do Bot</h3>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 ${
            isActive
              ? "border-green-900/50 text-green-500 hover:bg-green-900/20"
              : "border-red-900/50 text-red-500 hover:bg-red-900/20"
          }`}
          onClick={onToggle}
        >
          {isActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {isActive ? "Pausar Bot" : "Ativar Bot"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Par de Trading</label>
            <Select value={symbol} onValueChange={onSymbolChange}>
              <SelectTrigger className="bg-black/50 border-green-900/50 focus:ring-green-500/30">
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
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Estratégia</label>
            <Select value={strategy} onValueChange={onStrategyChange}>
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
            >
              Conservador
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${riskLevel === 2 ? "bg-yellow-900/30 text-yellow-500" : "text-gray-400"}`}
              onClick={() => onRiskChange(2)}
            >
              Moderado
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${riskLevel === 3 ? "bg-red-900/30 text-red-500" : "text-gray-400"}`}
              onClick={() => onRiskChange(3)}
            >
              Agressivo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-black/50 rounded p-2 border border-green-900/30">
            <span className="text-gray-400">Stop Loss:</span>
            <span className="float-right">
              {riskLevel === 1 && "15 pips"}
              {riskLevel === 2 && "25 pips"}
              {riskLevel === 3 && "40 pips"}
            </span>
          </div>
          <div className="bg-black/50 rounded p-2 border border-green-900/30">
            <span className="text-gray-400">Take Profit:</span>
            <span className="float-right">
              {riskLevel === 1 && "30 pips"}
              {riskLevel === 2 && "50 pips"}
              {riskLevel === 3 && "80 pips"}
            </span>
          </div>
          <div className="bg-black/50 rounded p-2 border border-green-900/30">
            <span className="text-gray-400">Tamanho do Lote:</span>
            <span className="float-right">
              {riskLevel === 1 && "0.01-0.05"}
              {riskLevel === 2 && "0.05-0.1"}
              {riskLevel === 3 && "0.1-0.5"}
            </span>
          </div>
          <div className="bg-black/50 rounded p-2 border border-green-900/30">
            <span className="text-gray-400">Risco por Trade:</span>
            <span className="float-right">
              {riskLevel === 1 && "1%"}
              {riskLevel === 2 && "2%"}
              {riskLevel === 3 && "3%"}
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
  const marketData =
    {
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
    }[symbol] || marketData.EURUSD

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

// Componente para o painel de conta
function AccountPanel({
  balance,
  equity,
  margin,
  freeMargin,
  marginLevel,
  profit,
}: {
  balance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
  profit: number
}) {
  return (
    <div className="bg-black/30 rounded-lg p-3 border border-green-900/30">
      <h3 className="text-sm font-medium mb-2">Informações da Conta</h3>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Saldo:</span>
          <span className="font-medium">{formatCurrency(balance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Patrimônio:</span>
          <span className="font-medium">{formatCurrency(equity)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Margem:</span>
          <span className="font-medium">{formatCurrency(margin)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Margem Livre:</span>
          <span className="font-medium">{formatCurrency(freeMargin)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Nível de Margem:</span>
          <span className="font-medium">{marginLevel}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Lucro/Prejuízo:</span>
          <span className={`font-medium ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(profit)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Componente principal da página
export default function MetaTraderPage() {
  const [activeSymbol, setActiveSymbol] = useState("EURUSD")
  const [timeframe, setTimeframe] = useState("M15")
  const [botActive, setBotActive] = useState(true)
  const [riskLevel, setRiskLevel] = useState(2)
  const [strategy, setStrategy] = useState("smart_ai")
  const [fullscreen, setFullscreen] = useState(false)
  const [currentPrices, setCurrentPrices] = useState({
    EURUSD: 1.07845,
    XAUUSD: 2328.45,
    GBPUSD: 1.25432,
    USDJPY: 153.45,
    AUDUSD: 0.65432,
  })
  const [candlestickData, setCandlestickData] = useState<{
    [key: string]: CandlestickData[]
  }>({
    EURUSD: [],
    XAUUSD: [],
    GBPUSD: [],
    USDJPY: [],
    AUDUSD: [],
  })
  const [botTrades, setBotTrades] = useState<BotTrade[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [accountInfo, setAccountInfo] = useState({
    balance: 10000,
    equity: 10120,
    margin: 250,
    freeMargin: 9870,
    marginLevel: 4048,
    profit: 120,
  })
  const [botStats, setBotStats] = useState({
    winRate: 78,
    totalTrades: 143,
    avgProfit: 0.12,
    profitFactor: 2.35,
    dailyProfit: 4.2,
    weeklyProfit: 18.5,
    monthlyProfit: 42.3,
  })

  const { toast } = useToast()

  // Referências para os intervalos
  const chartUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const tradeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Gerar dados iniciais do gráfico de velas
  useEffect(() => {
    const now = new Date().getTime()
    const initialData: { [key: string]: CandlestickData[] } = {
      EURUSD: [],
      XAUUSD: [],
      GBPUSD: [],
      USDJPY: [],
      AUDUSD: [],
    }

    // Preços base para cada par
    const basePrices = {
      EURUSD: 1.07845,
      XAUUSD: 2328.45,
      GBPUSD: 1.25432,
      USDJPY: 153.45,
      AUDUSD: 0.65432,
    }

    // Volatilidade para cada par
    const volatility = {
      EURUSD: 0.0008,
      XAUUSD: 2.5,
      GBPUSD: 0.0012,
      USDJPY: 0.15,
      AUDUSD: 0.0006,
    }

    // Gerar 100 velas para cada par
    Object.keys(basePrices).forEach((symbol) => {
      const basePrice = basePrices[symbol as keyof typeof basePrices]
      const vol = volatility[symbol as keyof typeof volatility]

      for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 900000 // 15 minutos por vela (M15)
        const open = i === 0 ? basePrice : initialData[symbol][i - 1].close

        const change = (Math.random() * 2 - 1) * vol
        const close = open + change

        const upCandle = close > open
        const highAdd = upCandle ? Math.random() * vol * 0.5 : Math.random() * vol * 0.3
        const lowAdd = upCandle ? Math.random() * vol * 0.3 : Math.random() * vol * 0.5

        const high = Math.max(open, close) + highAdd
        const low = Math.min(open, close) - lowAdd
        const volume = Math.floor(Math.random() * 1000) + 500

        initialData[symbol].push({ time, open, high, low, close, volume })
      }
    })

    setCandlestickData(initialData)

    // Gerar operações iniciais
    const initialTrades: BotTrade[] = []

    // Operações fechadas (históricas)
    for (let i = 0; i < 5; i++) {
      const tradeTime = new Date(now - Math.random() * 86400000 * 5) // Últimos 5 dias
      const symbol = Object.keys(basePrices)[Math.floor(Math.random() * Object.keys(basePrices).length)]
      const isGold = symbol.includes("XAU")
      const basePrice = basePrices[symbol as keyof typeof basePrices]
      const vol = volatility[symbol as keyof typeof volatility]

      const type = Math.random() > 0.5 ? "buy" : "sell"
      const entryPrice = basePrice + (Math.random() * vol * 2 - vol)
      const lotSize = Math.random() > 0.7 ? 0.1 : 0.01

      // Calcular preço de fechamento e lucro
      const isWin = Math.random() > 0.3 // 70% de chance de ganhar
      const priceDiff = isWin
        ? (type === "buy" ? 1 : -1) * vol * (Math.random() * 3 + 1)
        : (type === "buy" ? -1 : 1) * vol * (Math.random() * 2 + 0.5)

      const closePrice = entryPrice + priceDiff

      // Calcular lucro
      const pipValue = isGold ? 0.01 : 0.0001
      const pips = Math.abs(closePrice - entryPrice) / pipValue
      const profit = (type === "buy" ? closePrice > entryPrice : closePrice < entryPrice)
        ? pips * lotSize * (isGold ? 10 : 10)
        : -pips * lotSize * (isGold ? 10 : 10)

      const profitPercent = (profit / (lotSize * 1000)) * 100

      const closeTime = new Date(tradeTime.getTime() + Math.random() * 3600000) // 1 hora depois

      initialTrades.push({
        id: `hist-${i}-${Date.now()}`,
        symbol,
        type,
        entryPrice,
        currentPrice: closePrice,
        amount: lotSize * 1000,
        profit,
        profitPercent,
        time: tradeTime.toLocaleTimeString(),
        status: "closed",
        closePrice,
        closeTime: closeTime.toLocaleTimeString(),
        lotSize,
      })
    }

    // Operações abertas
    for (let i = 0; i < 2; i++) {
      const tradeTime = new Date(now - Math.random() * 3600000) // Última hora
      const symbol = Object.keys(basePrices)[Math.floor(Math.random() * Object.keys(basePrices).length)]
      const isGold = symbol.includes("XAU")
      const basePrice = basePrices[symbol as keyof typeof basePrices]
      const vol = volatility[symbol as keyof typeof volatility]

      const type = Math.random() > 0.5 ? "buy" : "sell"
      const entryPrice = basePrice + (Math.random() * vol * 2 - vol)
      const currentPrice = basePrice
      const lotSize = Math.random() > 0.7 ? 0.1 : 0.01

      // Calcular lucro
      const pipValue = isGold ? 0.01 : 0.0001
      const pips = Math.abs(currentPrice - entryPrice) / pipValue
      const profit = (type === "buy" ? currentPrice > entryPrice : currentPrice < entryPrice)
        ? pips * lotSize * (isGold ? 10 : 10)
        : -pips * lotSize * (isGold ? 10 : 10)

      const profitPercent = (profit / (lotSize * 1000)) * 100

      // Calcular stop loss e take profit
      const stopPips = riskLevel === 1 ? 15 : riskLevel === 2 ? 25 : 40
      const tpPips = riskLevel === 1 ? 30 : riskLevel === 2 ? 50 : 80

      const stopLoss = type === "buy" ? entryPrice - stopPips * pipValue : entryPrice + stopPips * pipValue

      const takeProfit = type === "buy" ? entryPrice + tpPips * pipValue : entryPrice - tpPips * pipValue

      initialTrades.push({
        id: `open-${i}-${Date.now()}`,
        symbol,
        type,
        entryPrice,
        currentPrice,
        amount: lotSize * 1000,
        profit,
        profitPercent,
        time: tradeTime.toLocaleTimeString(),
        status: "open",
        lotSize,
        stopLoss,
        takeProfit,
      })
    }

    setBotTrades(initialTrades)
  }, [riskLevel])

  // Atualizar o gráfico de velas periodicamente
  useEffect(() => {
    if (!botActive) return

    // Atualizar o gráfico a cada 5 segundos
    chartUpdateIntervalRef.current = setInterval(() => {
      setCandlestickData((prevData) => {
        const updatedData = { ...prevData }

        // Atualizar cada par
        Object.keys(updatedData).forEach((symbol) => {
          const data = [...updatedData[symbol]]
          const lastCandle = data[data.length - 1]
          const now = new Date().getTime()

          // Volatilidade para cada par
          const volatility =
            {
              EURUSD: 0.0008,
              XAUUSD: 2.5,
              GBPUSD: 0.0012,
              USDJPY: 0.15,
              AUDUSD: 0.0006,
            }[symbol] || 0.0008

          // Se passaram mais de 15 minutos desde a última vela, criar uma nova
          if (now - lastCandle.time > 900000) {
            const newOpen = lastCandle.close
            const change = (Math.random() * 2 - 1) * volatility
            const newClose = newOpen + change

            const upCandle = newClose > newOpen
            const highAdd = upCandle ? Math.random() * volatility * 0.5 : Math.random() * volatility * 0.3
            const lowAdd = upCandle ? Math.random() * volatility * 0.3 : Math.random() * volatility * 0.5

            const newHigh = Math.max(newOpen, newClose) + highAdd
            const newLow = Math.min(newOpen, newClose) - lowAdd
            const volume = Math.floor(Math.random() * 1000) + 500

            const newCandle = {
              time: now,
              open: newOpen,
              high: newHigh,
              low: newLow,
              close: newClose,
              volume,
            }

            // Atualizar o preço atual
            setCurrentPrices((prev) => ({
              ...prev,
              [symbol]: newClose,
            }))

            updatedData[symbol] = [...data.slice(1), newCandle] // Manter apenas as últimas 100 velas
          } else {
            // Caso contrário, atualizar a vela atual
            const updatedLastCandle = { ...lastCandle }
            const change = (Math.random() * 2 - 1) * (volatility * 0.3)
            updatedLastCandle.close = lastCandle.close + change
            updatedLastCandle.high = Math.max(updatedLastCandle.high, updatedLastCandle.close)
            updatedLastCandle.low = Math.min(updatedLastCandle.low, updatedLastCandle.close)
            updatedLastCandle.volume += Math.floor(Math.random() * 50)

            // Atualizar o preço atual
            setCurrentPrices((prev) => ({
              ...prev,
              [symbol]: updatedLastCandle.close,
            }))

            updatedData[symbol] = [...data.slice(0, -1), updatedLastCandle]
          }
        })

        return updatedData
      })

      // Atualizar operações abertas
      setBotTrades((prevTrades) => {
        return prevTrades.map((trade) => {
          if (trade.status === "open") {
            const currentPrice = currentPrices[trade.symbol]
            const isGold = trade.symbol.includes("XAU")

            // Calcular lucro
            const pipValue = isGold ? 0.01 : 0.0001
            const pips = Math.abs(currentPrice - trade.entryPrice) / pipValue
            const profit = (trade.type === "buy" ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice)
              ? pips * trade.lotSize * (isGold ? 10 : 10)
              : -pips * trade.lotSize * (isGold ? 10 : 10)

            const profitPercent = (profit / trade.amount) * 100

            // Verificar se atingiu stop loss ou take profit
            let status = "open"
            let closePrice = undefined
            let closeTime = undefined

            if (
              trade.stopLoss &&
              ((trade.type === "buy" && currentPrice <= trade.stopLoss) ||
                (trade.type === "sell" && currentPrice >= trade.stopLoss))
            ) {
              status = "closed"
              closePrice = trade.stopLoss
              closeTime = new Date().toLocaleTimeString()

              toast({
                title: "Stop Loss Atingido",
                description: `${trade.symbol}: ${formatCurrency(profit)}`,
                variant: "destructive",
              })
            } else if (
              trade.takeProfit &&
              ((trade.type === "buy" && currentPrice >= trade.takeProfit) ||
                (trade.type === "sell" && currentPrice <= trade.takeProfit))
            ) {
              status = "closed"
              closePrice = trade.takeProfit
              closeTime = new Date().toLocaleTimeString()

              toast({
                title: "Take Profit Atingido",
                description: `${trade.symbol}: ${formatCurrency(profit)}`,
                variant: "success",
              })
            }

            return {
              ...trade,
              currentPrice,
              profit,
              profitPercent,
              status,
              closePrice,
              closeTime,
            }
          }
          return trade
        })
      })

      // Atualizar informações da conta
      setAccountInfo((prev) => {
        const openTrades = botTrades.filter((t) => t.status === "open")
        const totalProfit = openTrades.reduce((sum, t) => sum + t.profit, 0)
        const totalMargin = openTrades.reduce((sum, t) => sum + t.lotSize * 1000, 0) * 0.02

        return {
          ...prev,
          equity: prev.balance + totalProfit,
          margin: totalMargin,
          freeMargin: prev.balance + totalProfit - totalMargin,
          marginLevel: totalMargin > 0 ? ((prev.balance + totalProfit) / totalMargin) * 100 : 10000,
          profit: totalProfit,
        }
      })

      setLastUpdate(new Date())
    }, 5000)

    // Configurar intervalo para criar novas operações
    tradeIntervalRef.current = setInterval(() => {
      // Chance de criar uma nova operação
      if (Math.random() > 0.7) {
        const now = new Date()
        const symbol =
          Math.random() > 0.5
            ? activeSymbol
            : Object.keys(currentPrices)[Math.floor(Math.random() * Object.keys(currentPrices).length)]
        const isGold = symbol.includes("XAU")
        const currentPrice = currentPrices[symbol]

        const type = Math.random() > 0.5 ? "buy" : "sell"
        const lotSize =
          riskLevel === 1
            ? Math.random() > 0.5
              ? 0.01
              : 0.02
            : riskLevel === 2
              ? Math.random() > 0.5
                ? 0.05
                : 0.1
              : Math.random() > 0.5
                ? 0.1
                : 0.2

        // Calcular stop loss e take profit
        const pipValue = isGold ? 0.01 : 0.0001
        const stopPips = riskLevel === 1 ? 15 : riskLevel === 2 ? 25 : 40
        const tpPips = riskLevel === 1 ? 30 : riskLevel === 2 ? 50 : 80

        const stopLoss = type === "buy" ? currentPrice - stopPips * pipValue : currentPrice + stopPips * pipValue

        const takeProfit = type === "buy" ? currentPrice + tpPips * pipValue : currentPrice - tpPips * pipValue

        const newTrade: BotTrade = {
          id: `trade-${Date.now()}`,
          symbol,
          type,
          entryPrice: currentPrice,
          currentPrice,
          amount: lotSize * 1000,
          profit: 0,
          profitPercent: 0,
          time: now.toLocaleTimeString(),
          status: "open",
          lotSize,
          stopLoss,
          takeProfit,
        }

        setBotTrades((prev) => [...prev, newTrade])

        toast({
          title: "Nova Operação",
          description: `${symbol} ${type.toUpperCase()} ${lotSize} lotes`,
          variant: "default",
        })
      }

      // Atualizar estatísticas do bot
      setBotStats((prev) => {
        const closedTrades = botTrades.filter((t) => t.status === "closed")
        const winningTrades = closedTrades.filter((t) => t.profit > 0)
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : prev.winRate

        const totalProfit = closedTrades.reduce((sum, t) => sum + t.profit, 0)
        const totalLoss = closedTrades.reduce((sum, t) => (t.profit < 0 ? sum + Math.abs(t.profit) : sum), 0)
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : prev.profitFactor

        return {
          ...prev,
          winRate: Math.round(winRate),
          totalTrades: closedTrades.length,
          profitFactor,
          dailyProfit: 4.2 + (Math.random() * 0.4 - 0.2),
          weeklyProfit: 18.5 + (Math.random() * 1 - 0.5),
          monthlyProfit: 42.3 + (Math.random() * 2 - 1),
        }
      })
    }, 15000)

    // Limpar intervalos ao desmontar
    return () => {
      if (chartUpdateIntervalRef.current) {
        clearInterval(chartUpdateIntervalRef.current)
      }
      if (tradeIntervalRef.current) {
        clearInterval(tradeIntervalRef.current)
      }
    }
  }, [botActive, activeSymbol, currentPrices, botTrades, riskLevel])

  // Função para fechar uma operação manualmente
  const handleClosePosition = (id: string) => {
    setBotTrades((prev) => {
      return prev.map((trade) => {
        if (trade.id === id && trade.status === "open") {
          const profit = trade.profit

          toast({
            title: "Operação Fechada",
            description: `${trade.symbol}: ${formatCurrency(profit)}`,
            variant: profit >= 0 ? "success" : "destructive",
          })

          return {
            ...trade,
            status: "closed",
            closePrice: trade.currentPrice,
            closeTime: new Date().toLocaleTimeString(),
          }
        }
        return trade
      })
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Meta Trader 4</h1>
            <Badge className="bg-green-500/20 text-green-400">Conectado</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-green-900/50 text-green-500 hover:bg-green-900/20"
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4 mr-1" /> : <Maximize2 className="h-4 w-4 mr-1" />}
              {fullscreen ? "Minimizar" : "Tela Cheia"}
            </Button>
          </div>
        </div>
      </header>

      <div
        className={`container py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6 ${fullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}
      >
        {/* Layout principal com duas colunas em telas maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Coluna principal (3/4 da largura em desktop) */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Barra de ferramentas do gráfico */}
            <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 border border-green-900/30">
              <div className="flex items-center gap-2">
                <Select value={activeSymbol} onValueChange={setActiveSymbol}>
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
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                  >
                    <Sliders className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Gráfico principal */}
            <div className="h-[500px] md:h-[600px]">
              <CandlestickChart
                data={candlestickData[activeSymbol] || []}
                currentPrice={currentPrices[activeSymbol] || 0}
                trades={botTrades}
                symbol={activeSymbol}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                fullscreen={fullscreen}
              />
            </div>

            {/* Tabs para operações e histórico */}
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="bg-black/50 mb-4">
                <TabsTrigger value="positions">Posições Abertas</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {botTrades.filter((t) => t.status === "open").length} posições abertas
                    </span>
                    <span className="text-gray-400">Última atualização: {lastUpdate.toLocaleTimeString()}</span>
                  </div>

                  {botTrades.filter((t) => t.status === "open").length > 0 ? (
                    <div className="space-y-3">
                      {botTrades
                        .filter((t) => t.status === "open")
                        .map((trade) => (
                          <BotTradeItem key={trade.id} trade={trade} onClose={handleClosePosition} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">Nenhuma posição aberta no momento.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {botTrades.filter((t) => t.status === "closed").length} operações fechadas
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                      >
                        <Filter className="h-4 w-4 mr-1" />
                        Filtrar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Exportar
                      </Button>
                    </div>
                  </div>

                  {botTrades.filter((t) => t.status === "closed").length > 0 ? (
                    <div className="space-y-3">
                      {botTrades
                        .filter((t) => t.status === "closed")
                        .sort((a, b) => new Date(b.closeTime || "").getTime() - new Date(a.closeTime || "").getTime())
                        .map((trade) => (
                          <BotTradeItem key={trade.id} trade={trade} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">Nenhuma operação fechada no histórico.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <BotStats
                  winRate={botStats.winRate}
                  totalTrades={botStats.totalTrades}
                  avgProfit={botStats.avgProfit}
                  profitFactor={botStats.profitFactor}
                  dailyProfit={botStats.dailyProfit}
                  weeklyProfit={botStats.weeklyProfit}
                  monthlyProfit={botStats.monthlyProfit}
                  symbol={activeSymbol}
                />

                <div className="mt-4 bg-black/30 rounded-lg p-4 border border-green-900/30">
                  <h3 className="text-sm font-medium mb-2">Desempenho do Bot</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    O Forexity Trading Bot utiliza algoritmos avançados de inteligência artificial para analisar o
                    mercado Forex e executar operações com alta precisão. Com uma taxa de acerto de {botStats.winRate}%
                    e um fator de lucro de {botStats.profitFactor.toFixed(2)}, o bot garante um rendimento diário
                    consistente.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pares operados:</span>
                      <span>5 principais</span>
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

          {/* Coluna lateral (1/4 da largura em desktop) */}
          <div className="space-y-4 md:space-y-6">
            {/* Painel de controle do bot */}
            <BotControlPanel
              isActive={botActive}
              onToggle={() => setBotActive(!botActive)}
              symbol={activeSymbol}
              onSymbolChange={setActiveSymbol}
              riskLevel={riskLevel}
              onRiskChange={setRiskLevel}
              strategy={strategy}
              onStrategyChange={setStrategy}
            />

            {/* Informações do mercado */}
            <MarketInfoPanel symbol={activeSymbol} />

            {/* Informações da conta */}
            <AccountPanel
              balance={accountInfo.balance}
              equity={accountInfo.equity}
              margin={accountInfo.margin}
              freeMargin={accountInfo.freeMargin}
              marginLevel={accountInfo.marginLevel}
              profit={accountInfo.profit}
            />

            {/* Operações rápidas */}
            <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
              <h3 className="text-sm font-medium mb-3">Operação Rápida</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const lotSize = riskLevel === 1 ? 0.01 : riskLevel === 2 ? 0.05 : 0.1

                      const isGold = activeSymbol.includes("XAU")
                      const currentPrice = currentPrices[activeSymbol]

                      // Calcular stop loss e take profit
                      const pipValue = isGold ? 0.01 : 0.0001
                      const stopPips = riskLevel === 1 ? 15 : riskLevel === 2 ? 25 : 40
                      const tpPips = riskLevel === 1 ? 30 : riskLevel === 2 ? 50 : 80

                      const stopLoss = currentPrice - stopPips * pipValue
                      const takeProfit = currentPrice + tpPips * pipValue

                      const newTrade: BotTrade = {
                        id: `manual-${Date.now()}`,
                        symbol: activeSymbol,
                        type: "buy",
                        entryPrice: currentPrice,
                        currentPrice,
                        amount: lotSize * 1000,
                        profit: 0,
                        profitPercent: 0,
                        time: new Date().toLocaleTimeString(),
                        status: "open",
                        lotSize,
                        stopLoss,
                        takeProfit,
                      }

                      setBotTrades((prev) => [...prev, newTrade])

                      toast({
                        title: "Nova Operação",
                        description: `${activeSymbol} BUY ${lotSize} lotes`,
                        variant: "default",
                      })
                    }}
                  >
                    Comprar
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      const lotSize = riskLevel === 1 ? 0.01 : riskLevel === 2 ? 0.05 : 0.1

                      const isGold = activeSymbol.includes("XAU")
                      const currentPrice = currentPrices[activeSymbol]

                      // Calcular stop loss e take profit
                      const pipValue = isGold ? 0.01 : 0.0001
                      const stopPips = riskLevel === 1 ? 15 : riskLevel === 2 ? 25 : 40
                      const tpPips = riskLevel === 1 ? 30 : riskLevel === 2 ? 50 : 80

                      const stopLoss = currentPrice + stopPips * pipValue
                      const takeProfit = currentPrice - tpPips * pipValue

                      const newTrade: BotTrade = {
                        id: `manual-${Date.now()}`,
                        symbol: activeSymbol,
                        type: "sell",
                        entryPrice: currentPrice,
                        currentPrice,
                        amount: lotSize * 1000,
                        profit: 0,
                        profitPercent: 0,
                        time: new Date().toLocaleTimeString(),
                        status: "open",
                        lotSize,
                        stopLoss,
                        takeProfit,
                      }

                      setBotTrades((prev) => [...prev, newTrade])

                      toast({
                        title: "Nova Operação",
                        description: `${activeSymbol} SELL ${lotSize} lotes`,
                        variant: "default",
                      })
                    }}
                  >
                    Vender
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Volume</label>
                    <Select defaultValue="0.01">
                      <SelectTrigger className="bg-black/50 border-green-900/50 focus:ring-green-500/30">
                        <SelectValue placeholder="Volume" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-900/50">
                        <SelectItem value="0.01">0.01</SelectItem>
                        <SelectItem value="0.05">0.05</SelectItem>
                        <SelectItem value="0.1">0.1</SelectItem>
                        <SelectItem value="0.2">0.2</SelectItem>
                        <SelectItem value="0.5">0.5</SelectItem>
                        <SelectItem value="1.0">1.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tipo de Ordem</label>
                    <Select defaultValue="market">
                      <SelectTrigger className="bg-black/50 border-green-900/50 focus:ring-green-500/30">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-900/50">
                        <SelectItem value="market">Mercado</SelectItem>
                        <SelectItem value="limit">Limite</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Stop Loss (pips)</label>
                    <Select defaultValue="25">
                      <SelectTrigger className="bg-black/50 border-green-900/50 focus:ring-green-500/30">
                        <SelectValue placeholder="Stop Loss" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-900/50">
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Take Profit (pips)</label>
                    <Select defaultValue="50">
                      <SelectTrigger className="bg-black/50 border-green-900/50 focus:ring-green-500/30">
                        <SelectValue placeholder="Take Profit" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-900/50">
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="80">80</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Watchlist */}
            <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Watchlist</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-green-500 hover:bg-green-900/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(currentPrices).map(([symbol, price]) => {
                  const isActive = symbol === activeSymbol
                  const isGold = symbol.includes("XAU")

                  // Simular variação
                  const change = (Math.random() * 0.4 - 0.2) * (isGold ? 5 : 0.001)
                  const changePercent = isGold ? (change / price) * 100 : (change / price) * 100

                  return (
                    <div
                      key={symbol}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        isActive ? "bg-green-900/20 border border-green-900/50" : "hover:bg-black/50"
                      }`}
                      onClick={() => setActiveSymbol(symbol)}
                    >
                      <div>
                        <div className="font-medium">{symbol.replace("XAU", "XAU/")}</div>
                        <div className={`text-xs ${changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {changePercent >= 0 ? "+" : ""}
                          {changePercent.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{isGold ? formatGold(price) : formatForex(price)}</div>
                        <div className={`text-xs ${changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {changePercent >= 0 ? "+" : ""}
                          {isGold ? formatGold(change) : formatForex(change)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
