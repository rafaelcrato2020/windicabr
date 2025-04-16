"use client"

import { useEffect, useState, useRef } from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
} from "recharts"

interface BarChartProps {
  timeframe: string
  showGrid?: boolean
  showCrosshair?: boolean
  symbol: string
}

// Function to generate random bar data
const generateBarData = (count: number, timeframe: string, symbol: string) => {
  const now = new Date()
  const data = []

  // Define base price depending on symbol
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
  let trend = 0 // 0 = neutral, 1 = up, -1 = down
  let trendStrength = Math.random() * 0.6 + 0.2 // 0.2 to 0.8
  let trendDuration = Math.floor(Math.random() * 10) + 5 // 5 to 15 bars
  let currentTrendDuration = 0

  for (let i = count; i >= 0; i--) {
    const date = new Date(now)

    // Adjust date based on timeframe
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

    // Manage trends for more realistic patterns
    currentTrendDuration++
    if (currentTrendDuration >= trendDuration) {
      // Change trend
      trend = Math.random() > 0.5 ? 1 : -1
      if (Math.random() > 0.7) trend = -trend // Chance to reverse trend
      trendStrength = Math.random() * 0.6 + 0.2
      trendDuration = Math.floor(Math.random() * 10) + 5
      currentTrendDuration = 0
    }

    // Calculate volatility based on timeframe
    let volatility = 0.01 // Default
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

    // Apply trend effect to price
    const trendEffect = trend * trendStrength * volatility
    const randomFactor = (Math.random() - 0.5) * volatility
    const combinedEffect = trendEffect + randomFactor

    const open = lastClose
    const close = open * (1 + combinedEffect)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    const volume = Math.floor(Math.random() * 100) + 50

    // Calculate simple technical indicators
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
      change: close - open,
      percentChange: ((close - open) / open) * 100,
      color: close >= open ? "#22c55e" : "#ef4444",
      sma20,
      ema50,
    })

    lastClose = close
  }

  return data
}

export default function BarChart({
  timeframe,
  showGrid = true,
  showCrosshair = true,
  symbol = "BTC/USDT",
}: BarChartProps) {
  const [data, setData] = useState<any[]>([])
  const [nextUpdateTime, setNextUpdateTime] = useState<number>(0)
  const [countdown, setCountdown] = useState<string>("")
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [showPercentage, setShowPercentage] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Define base price here to be accessible within the component's scope
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

  useEffect(() => {
    setMounted(true)

    // Generate initial data
    setData(generateBarData(100, timeframe, symbol))

    // Set up timer for next update
    const calculateNextUpdateTime = () => {
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
          next.setMinutes(Math.ceil(now.getMinutes() / 15 / 5) * 5, 0, 0)
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

    if (!mounted) return

    const nextTime = calculateNextUpdateTime()
    setNextUpdateTime(nextTime)

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      if (!mounted) return

      const now = new Date().getTime()
      const distance = nextTime - now

      if (distance <= 0) {
        // Add new bar and recalculate
        const newData = [...data]
        const lastBar = newData[newData.length - 1]
        const open = lastBar?.close || basePrice

        // Simulate some volatility for the new bar
        const volatility = 0.01
        const change = (Math.random() - 0.5) * volatility
        const close = open * (1 + change)
        const high = Math.max(open, close) * (1 + Math.random() * 0.01)
        const low = Math.min(open, close) * (1 - Math.random() * 0.01)

        newData.push({
          date: new Date().toLocaleString(),
          timestamp: new Date().getTime(),
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 100) + 50,
          change: close - open,
          percentChange: ((close - open) / open) * 100,
          color: close >= open ? "#22c55e" : "#ef4444",
          sma20: lastBar?.sma20 ? lastBar.sma20 * (1 + (Math.random() * 0.01 - 0.005)) : null,
          ema50: lastBar?.ema50 ? lastBar.ema50 * (1 + (Math.random() * 0.01 - 0.005)) : null,
        })

        // Remove oldest bar if we have more than 100
        if (newData.length > 100) {
          newData.shift()
        }

        setData(newData)
        const newNextTime = calculateNextUpdateTime()
        setNextUpdateTime(newNextTime)
      } else {
        // Update countdown
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setCountdown(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [timeframe, symbol, mounted])

  // Handle mouse movement for crosshair
  useEffect(() => {
    if (!mounted || !chartRef.current) return

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
  }, [mounted])

  // Customize tooltip
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
            <p className="text-white">
              <span className="text-gray-400">Change: </span>
              <span style={{ color: data.change >= 0 ? "#22c55e" : "#ef4444" }}>
                {showPercentage ? `${data.percentChange.toFixed(2)}%` : `${data.change.toFixed(2)}`}
              </span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (!mounted || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">Carregando dados do gráfico...</p>
      </div>
    )
  }

  return (
    <div className="h-full relative" ref={chartRef}>
      <div className="absolute top-2 right-2 z-10 bg-black/70 border border-gray-700 px-3 py-1 rounded-md flex items-center">
        <span className="text-gray-400 mr-2">Próxima atualização:</span>
        <span className="text-green-500 font-mono">{countdown}</span>
      </div>

      {/* Price info in top left corner */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 border border-gray-700 px-3 py-1 rounded-md">
        <div className="flex flex-col">
          <span className="text-white font-bold">{symbol}</span>
          <span className="text-green-500">{data.length > 0 ? `${data[data.length - 1].close.toFixed(2)}` : ""}</span>
        </div>
      </div>

      {/* Vertical and horizontal crosshair */}
      {showCrosshair && mousePosition && (
        <>
          <div
            className="absolute border-l border-green-500/50 h-full"
            style={{ left: `${mousePosition.x}px`, top: 0 }}
          />
          <div
            className="absolute border-t border-green-500/50 w-full"
            style={{ top: `${mousePosition.y}px`, left: 0 }}
          />
        </>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

          {/* Volume bars */}
          <Bar dataKey="volume" fill="url(#colorVolume)" opacity={0.3} />

          {/* Price change bars */}
          <Bar dataKey="change" fill={(data) => (data.change >= 0 ? "#22c55e" : "#ef4444")} />

          {/* Price line */}
          <ReferenceLine y={data[data.length - 1]?.close} stroke="#f97316" strokeDasharray="3 3" />

          {/* Technical indicators */}
          <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1} />
          <Line type="monotone" dataKey="ema50" stroke="#3b82f6" dot={false} strokeWidth={1} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
