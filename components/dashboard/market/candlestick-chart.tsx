"use client"

import { useEffect, useState, useRef } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
  Line,
} from "recharts"

interface CandlestickChartProps {
  timeframe: string
  showGrid?: boolean
  showCrosshair?: boolean
  symbol: string
}

// Função para gerar dados de velas aleatórios
const generateCandlestickData = (count: number, timeframe: string, symbol: string) => {
  const now = new Date()
  const data = []

  // Definir preço base dependendo do símbolo
  let basePrice = 0
  switch (symbol.split("/")[0]) {
    case "BTC":
      basePrice = 68000
      break
    case "ETH":
      basePrice = 3800
      break
    case "SOL":
      basePrice = 140
      break
    case "BNB":
      basePrice = 600
      break
    case "XRP":
      basePrice = 0.55
      break
    default:
      basePrice = 1000
  }

  let lastClose = basePrice + Math.random() * (basePrice * 0.05)
  let trend = 0 // 0 = neutro, 1 = alta, -1 = baixa
  let trendStrength = Math.random() * 0.6 + 0.2 // 0.2 a 0.8
  let trendDuration = Math.floor(Math.random() * 10) + 5 // 5 a 15 velas
  let currentTrendDuration = 0

  for (let i = count; i >= 0; i--) {
    const date = new Date(now)

    // Ajustar a data com base no timeframe
    switch (timeframe) {
      case "1m":
        date.setMinutes(date.getMinutes() - i)
        break
      case "5m":
        date.setMinutes(date.getMinutes() - i * 5)
        break
      case "15m":
        date.setMinutes(date.getMinutes() - i * 15)
        break
      case "30m":
        date.setMinutes(date.getMinutes() - i * 30)
        break
      case "1h":
        date.setHours(date.getHours() - i)
        break
      case "4h":
        date.setHours(date.getHours() - i * 4)
        break
      case "1d":
        date.setDate(date.getDate() - i)
        break
      case "1w":
        date.setDate(date.getDate() - i * 7)
        break
      case "1M":
        date.setMonth(date.getMonth() - i)
        break
      default:
        date.setHours(date.getHours() - i)
    }

    // Gerenciar tendências para criar padrões mais realistas
    currentTrendDuration++
    if (currentTrendDuration >= trendDuration) {
      // Mudar tendência
      trend = Math.random() > 0.5 ? 1 : -1
      if (Math.random() > 0.7) trend = -trend // Chance de reverter a tendência
      trendStrength = Math.random() * 0.6 + 0.2
      trendDuration = Math.floor(Math.random() * 10) + 5
      currentTrendDuration = 0
    }

    // Calcular volatilidade baseada no timeframe
    let volatility = 0.01 // Padrão
    switch (timeframe) {
      case "1m":
        volatility = 0.003
        break
      case "5m":
        volatility = 0.005
        break
      case "15m":
        volatility = 0.008
        break
      case "30m":
        volatility = 0.01
        break
      case "1h":
        volatility = 0.015
        break
      case "4h":
        volatility = 0.02
        break
      case "1d":
        volatility = 0.03
        break
      case "1w":
        volatility = 0.05
        break
      case "1M":
        volatility = 0.08
        break
    }

    // Aplicar tendência ao preço
    const trendEffect = trend * trendStrength * volatility
    const randomFactor = (Math.random() - 0.5) * volatility
    const combinedEffect = trendEffect + randomFactor

    const open = lastClose
    const close = open * (1 + combinedEffect)

    // Calcular high e low com base na volatilidade e direção da vela
    const isUp = close >= open
    const range = Math.abs(close - open) * (1 + Math.random() * 1.5)
    const high = Math.max(open, close) + range * Math.random() * 0.8
    const low = Math.min(open, close) - range * Math.random() * 0.8

    // Volume correlacionado com o movimento de preço
    const volumeFactor = (Math.abs(close - open) / open) * 10
    const volume = Math.floor((50 + Math.random() * 100) * (1 + volumeFactor))

    // Calcular alguns indicadores técnicos simples
    const sma20 = i < count - 20 ? basePrice * (1 + (Math.random() * 0.1 - 0.05)) : null
    const ema50 = i < count - 50 ? basePrice * (1 + (Math.random() * 0.15 - 0.075)) : null

    data.push({
      date: date.toLocaleString(),
      timestamp: date.getTime(),
      open,
      high,
      low,
      close,
      volume,
      color: close >= open ? "#22c55e" : "#ef4444",
      sma20,
      ema50,
      // Adicionar dados para o indicador MACD
      macd: i < count - 26 ? (Math.random() - 0.5) * 100 : null,
      signal: i < count - 26 ? (Math.random() - 0.5) * 100 : null,
      histogram: i < count - 26 ? (Math.random() - 0.5) * 50 : null,
    })

    lastClose = close
  }

  return data
}

export default function CandlestickChart({
  timeframe,
  showGrid = true,
  showCrosshair = true,
  symbol = "BTC/USDT",
}: CandlestickChartProps) {
  const [data, setData] = useState<any[]>([])
  const [nextCandleTime, setNextCandleTime] = useState<number>(0)
  const [countdown, setCountdown] = useState<string>("")
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipData, setTooltipData] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Gerar dados iniciais
    setData(generateCandlestickData(100, timeframe, symbol))

    // Configurar o temporizador para a próxima vela
    const calculateNextCandleTime = () => {
      const now = new Date()
      const next = new Date(now)

      switch (timeframe) {
        case "1m":
          next.setMinutes(now.getMinutes() + 1, 0, 0)
          break
        case "5m":
          next.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0)
          break
        case "15m":
          next.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0)
          break
        case "30m":
          next.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0)
          break
        case "1h":
          next.setHours(now.getHours() + 1, 0, 0, 0)
          break
        case "4h":
          next.setHours(Math.ceil(now.getHours() / 4) * 4, 0, 0, 0)
          break
        case "1d":
          next.setDate(now.getDate() + 1)
          next.setHours(0, 0, 0, 0)
          break
        case "1w":
          const dayOfWeek = now.getDay()
          const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
          next.setDate(now.getDate() + daysUntilMonday)
          next.setHours(0, 0, 0, 0)
          break
        case "1M":
          next.setMonth(now.getMonth() + 1)
          next.setDate(1)
          next.setHours(0, 0, 0, 0)
          break
        default:
          next.setHours(now.getHours() + 1, 0, 0, 0)
      }

      return next.getTime()
    }

    const nextTime = calculateNextCandleTime()
    setNextCandleTime(nextTime)

    // Atualizar o countdown a cada segundo
    const countdownInterval = setInterval(() => {
      const now = new Date().getTime()
      const distance = nextTime - now

      if (distance <= 0) {
        // Adicionar nova vela e recalcular
        const newData = [...data]
        const lastCandle = newData[newData.length - 1]
        const open = lastCandle.close

        // Simular alguma volatilidade para a nova vela
        const volatility = 0.01
        const change = (Math.random() - 0.5) * volatility
        const close = open * (1 + change)

        const isUp = close >= open
        const range = Math.abs(close - open) * (1 + Math.random() * 1.5)
        const high = Math.max(open, close) + range * Math.random() * 0.8
        const low = Math.min(open, close) - range * Math.random() * 0.8

        const volume = Math.floor(Math.random() * 100) + 50

        newData.push({
          date: new Date().toLocaleString(),
          timestamp: new Date().getTime(),
          open,
          high,
          low,
          close,
          volume,
          color: close >= open ? "#22c55e" : "#ef4444",
          sma20: lastCandle.sma20 ? lastCandle.sma20 * (1 + (Math.random() * 0.01 - 0.005)) : null,
          ema50: lastCandle.ema50 ? lastCandle.ema50 * (1 + (Math.random() * 0.01 - 0.005)) : null,
          macd: lastCandle.macd ? lastCandle.macd + (Math.random() - 0.5) * 5 : null,
          signal: lastCandle.signal ? lastCandle.signal + (Math.random() - 0.5) * 3 : null,
          histogram: lastCandle.histogram ? lastCandle.histogram + (Math.random() - 0.5) * 8 : null,
        })

        // Remover a vela mais antiga se tivermos mais de 100
        if (newData.length > 100) {
          newData.shift()
        }

        setData(newData)
        const newNextTime = calculateNextCandleTime()
        setNextCandleTime(newNextTime)
      } else {
        // Atualizar o countdown
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setCountdown(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [timeframe, symbol])

  // Gerenciar movimento do mouse para crosshair
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!chartRef.current) return

      const rect = chartRef.current.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      } else {
        setMousePosition(null)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Customizar o tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black/90 border border-gray-700 p-3 rounded-md">
          <p className="text-gray-300">{data.date}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <p className="text-white">
              <span className="text-gray-400">O: </span>
              <span className="text-blue-400">${data.open.toFixed(2)}</span>
            </p>
            <p className="text-white">
              <span className="text-gray-400">H: </span>
              <span className="text-green-400">${data.high.toFixed(2)}</span>
            </p>
            <p className="text-white">
              <span className="text-gray-400">L: </span>
              <span className="text-red-400">${data.low.toFixed(2)}</span>
            </p>
            <p className="text-white">
              <span className="text-gray-400">C: </span>
              <span style={{ color: data.color }}>${data.close.toFixed(2)}</span>
            </p>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-700">
            <p className="text-white">
              <span className="text-gray-400">Vol: </span>
              <span className="text-purple-400">{data.volume}</span>
            </p>
            {data.sma20 && (
              <p className="text-white">
                <span className="text-gray-400">SMA20: </span>
                <span className="text-yellow-400">${data.sma20.toFixed(2)}</span>
              </p>
            )}
            {data.ema50 && (
              <p className="text-white">
                <span className="text-gray-400">EMA50: </span>
                <span className="text-blue-400">${data.ema50.toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Renderizar barras de velas personalizadas
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, open, close } = props
    const fill = open > close ? "#ef4444" : "#22c55e"

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} />
      </g>
    )
  }

  return (
    <div className="h-full relative" ref={chartRef}>
      <div className="absolute top-2 right-2 z-10 bg-black/70 border border-gray-700 px-3 py-1 rounded-md flex items-center">
        <span className="text-gray-400 mr-2">Próxima vela:</span>
        <span className="text-orange-500 font-mono">{countdown}</span>
      </div>

      {/* Informações de preço no canto superior esquerdo */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 border border-gray-700 px-3 py-1 rounded-md">
        <div className="flex flex-col">
          <span className="text-white font-bold">{symbol}</span>
          <span className="text-green-500">{data.length > 0 ? `$${data[data.length - 1].close.toFixed(2)}` : ""}</span>
        </div>
      </div>

      {/* Crosshair vertical e horizontal */}
      {showCrosshair && mousePosition && (
        <>
          <div
            className="absolute border-l border-orange-500/50 h-full"
            style={{ left: `${mousePosition.x}px`, top: 0 }}
          />
          <div
            className="absolute border-t border-orange-500/50 w-full"
            style={{ top: `${mousePosition.y}px`, left: 0 }}
          />
        </>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => {
              const date = new Date(tick)
              switch (timeframe) {
                case "1m":
                case "5m":
                case "15m":
                case "30m":
                  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
                case "1h":
                case "4h":
                  return `${date.getHours()}:00`
                case "1d":
                  return `${date.getDate()}/${date.getMonth() + 1}`
                case "1w":
                  return `${date.getDate()}/${date.getMonth() + 1}`
                case "1M":
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`
                default:
                  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
              }
            }}
            stroke="#666"
          />
          <YAxis domain={["auto", "auto"]} stroke="#666" />
          <Tooltip content={<CustomTooltip />} />

          {/* Barras de volume na parte inferior */}
          <Bar
            dataKey="volume"
            fill="url(#colorVolume)"
            opacity={0.3}
            barSize={3}
            yAxisId={1}
            domain={[0, "dataMax"]}
          />

          {/* Linhas para high e low */}
          <Bar dataKey="low" fill="transparent" stroke={(data) => data.color} barSize={1} yAxisId={0} />
          <Bar dataKey="high" fill="transparent" stroke={(data) => data.color} barSize={1} yAxisId={0} />

          {/* Barras para open e close */}
          <Bar dataKey="open" fill={(data) => data.color} stroke={(data) => data.color} barSize={6} yAxisId={0} />
          <Bar dataKey="close" fill={(data) => data.color} stroke={(data) => data.color} barSize={6} yAxisId={0} />

          {/* Indicadores técnicos */}
          <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1} yAxisId={0} />
          <Line type="monotone" dataKey="ema50" stroke="#3b82f6" dot={false} strokeWidth={1} yAxisId={0} />

          <ReferenceLine y={data[data.length - 1]?.close} stroke="#f97316" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
