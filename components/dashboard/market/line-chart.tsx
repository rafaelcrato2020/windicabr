"use client"

import { useEffect, useState, useRef } from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts"

interface LineChartProps {
  timeframe: string
  showGrid?: boolean
  showCrosshair?: boolean
  symbol: string
}

// Reutilizamos a mesma função de geração de dados do gráfico de velas
const generateLineData = (count: number, timeframe: string, symbol: string) => {
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

  let lastPrice = basePrice + Math.random() * (basePrice * 0.05)
  let trend = 0 // 0 = neutro, 1 = alta, -1 = baixa
  let trendStrength = Math.random() * 0.6 + 0.2 // 0.2 a 0.8
  let trendDuration = Math.floor(Math.random() * 10) + 5 // 5 a 15 pontos
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

    const price = lastPrice * (1 + combinedEffect)
    const volume = Math.floor(Math.random() * 100) + 50

    // Calcular alguns indicadores técnicos simples
    const sma20 = i < count - 20 ? basePrice * (1 + (Math.random() * 0.1 - 0.05)) : null
    const ema50 = i < count - 50 ? basePrice * (1 + (Math.random() * 0.15 - 0.075)) : null
    const bollingerUpper = price * 1.02 + Math.random() * 50
    const bollingerLower = price * 0.98 - Math.random() * 50

    data.push({
      date: date.toLocaleString(),
      timestamp: date.getTime(),
      price,
      volume,
      sma20,
      ema50,
      bollingerUpper,
      bollingerLower,
      rsi: Math.min(100, Math.max(0, 50 + trend * 20 + (Math.random() * 30 - 15))),
    })

    lastPrice = price
  }

  return data
}

export default function LineChart({
  timeframe,
  showGrid = true,
  showCrosshair = true,
  symbol = "BTC/USDT",
}: LineChartProps) {
  const [data, setData] = useState<any[]>([])
  const [nextUpdateTime, setNextUpdateTime] = useState<number>(0)
  const [countdown, setCountdown] = useState<string>("")
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [showBollingerBands, setShowBollingerBands] = useState(true)

  useEffect(() => {
    // Gerar dados iniciais
    setData(generateLineData(200, timeframe, symbol))

    // Configurar o temporizador para a próxima atualização
    const calculateNextUpdateTime = () => {
      const now = new Date()
      const next = new Date(now)
      next.setSeconds(now.getSeconds() + 10) // Atualizar a cada 10 segundos para simulação
      return next.getTime()
    }

    const nextTime = calculateNextUpdateTime()
    setNextUpdateTime(nextTime)

    // Atualizar o countdown a cada segundo
    const countdownInterval = setInterval(() => {
      const now = new Date().getTime()
      const distance = nextTime - now

      if (distance <= 0) {
        // Adicionar novo ponto e recalcular
        const newData = [...data]
        const lastPoint = newData[newData.length - 1]

        // Simular alguma volatilidade para o novo ponto
        const volatility = 0.005
        const change = (Math.random() - 0.5) * volatility
        const price = lastPoint.price * (1 + change)

        newData.push({
          date: new Date().toLocaleString(),
          timestamp: new Date().getTime(),
          price,
          volume: Math.floor(Math.random() * 100) + 50,
          sma20: lastPoint.sma20 ? lastPoint.sma20 * (1 + (Math.random() * 0.005 - 0.0025)) : null,
          ema50: lastPoint.ema50 ? lastPoint.ema50 * (1 + (Math.random() * 0.005 - 0.0025)) : null,
          bollingerUpper: price * 1.02 + Math.random() * 50,
          bollingerLower: price * 0.98 - Math.random() * 50,
          rsi: Math.min(100, Math.max(0, lastPoint.rsi + (Math.random() * 10 - 5))),
        })

        // Remover o ponto mais antigo se tivermos mais de 200
        if (newData.length > 200) {
          newData.shift()
        }

        setData(newData)
        const newNextTime = calculateNextUpdateTime()
        setNextUpdateTime(newNextTime)
      } else {
        // Atualizar o countdown
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setCountdown(`00:${seconds.toString().padStart(2, "0")}`)
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
          <div className="grid grid-cols-1 gap-y-1 mt-1">
            <p className="text-white">
              <span className="text-gray-400">Preço: </span>
              <span className="text-blue-400">${data.price.toFixed(2)}</span>
            </p>
            <p className="text-white">
              <span className="text-gray-400">Volume: </span>
              <span className="text-purple-400">{data.volume}</span>
            </p>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-700">
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
            <p className="text-white">
              <span className="text-gray-400">RSI: </span>
              <span className={data.rsi > 70 ? "text-red-400" : data.rsi < 30 ? "text-green-400" : "text-gray-300"}>
                {data.rsi.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full relative" ref={chartRef}>
      <div className="absolute top-2 right-2 z-10 bg-black/70 border border-gray-700 px-3 py-1 rounded-md flex items-center">
        <span className="text-gray-400 mr-2">Próxima atualização:</span>
        <span className="text-blue-500 font-mono">{countdown}</span>
      </div>

      {/* Informações de preço no canto superior esquerdo */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 border border-gray-700 px-3 py-1 rounded-md">
        <div className="flex flex-col">
          <span className="text-white font-bold">{symbol}</span>
          <span className="text-blue-500">{data.length > 0 ? `$${data[data.length - 1].price.toFixed(2)}` : ""}</span>
        </div>
      </div>

      {/* Crosshair vertical e horizontal */}
      {showCrosshair && mousePosition && (
        <>
          <div
            className="absolute border-l border-blue-500/50 h-full"
            style={{ left: `${mousePosition.x}px`, top: 0 }}
          />
          <div
            className="absolute border-t border-blue-500/50 w-full"
            style={{ top: `${mousePosition.y}px`, left: 0 }}
          />
        </>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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

          {/* Área sob a linha de preço */}
          <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" />

          {/* Bandas de Bollinger */}
          {showBollingerBands && (
            <>
              <Line type="monotone" dataKey="bollingerUpper" stroke="#9333ea" strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="bollingerLower" stroke="#9333ea" strokeDasharray="3 3" dot={false} />
            </>
          )}

          {/* Indicadores técnicos */}
          <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1} />
          <Line type="monotone" dataKey="ema50" stroke="#3b82f6" dot={false} strokeWidth={1} />

          <ReferenceLine y={data[data.length - 1]?.price} stroke="#f97316" strokeDasharray="3 3" />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
