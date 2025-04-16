"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import {
  CandlestickChartIcon as CandleIcon,
  LineChartIcon as LineIcon,
  BarChartIcon as BarIcon,
  Crosshair,
  Maximize2,
  Grid,
} from "lucide-react"

// Componentes de fallback para carregamento
const LoadingChart = () => (
  <div className="w-full h-[400px] bg-black/30 border border-gray-800 rounded-xl flex items-center justify-center">
    <p className="text-gray-400">Carregando gráfico...</p>
  </div>
)

// Importação dinâmica dos componentes com SSR desativado
const CandlestickChart = dynamic(() => import("@/components/dashboard/market/candlestick-chart"), {
  ssr: false,
  loading: () => <LoadingChart />,
})

const LineChart = dynamic(() => import("@/components/dashboard/market/line-chart"), {
  ssr: false,
  loading: () => <LoadingChart />,
})

const BarChart = dynamic(() => import("@/components/dashboard/market/bar-chart"), {
  ssr: false,
  loading: () => <LoadingChart />,
})

const ChartControls = dynamic(() => import("@/components/dashboard/market/chart-controls"), {
  ssr: false,
})

export default function ChartContainer() {
  const [mounted, setMounted] = useState(false)
  const [timeframe, setTimeframe] = useState("1h")
  const [chartType, setChartType] = useState("candle")
  const [showGrid, setShowGrid] = useState(true)
  const [showCrosshair, setShowCrosshair] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted before using browser APIs
  useEffect(() => {
    setMounted(true)
  }, [])

  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "30m", label: "30m" },
    { value: "1h", label: "1h" },
    { value: "4h", label: "4h" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1M", label: "1M" },
  ]

  const pairs = [
    { symbol: "BTC/USDT", price: "$68,245.32", change: "+2.34%" },
    { symbol: "ETH/USDT", price: "$3,845.12", change: "+1.87%" },
    { symbol: "SOL/USDT", price: "$142.78", change: "+3.21%" },
    { symbol: "BNB/USDT", price: "$598.45", change: "-0.54%" },
    { symbol: "XRP/USDT", price: "$0.5432", change: "+0.78%" },
  ]

  const [selectedPair, setSelectedPair] = useState(pairs[0])

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!mounted || !chartContainerRef.current) return

    if (!document.fullscreenElement) {
      chartContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`)
      })
      setIsFullscreen(false)
    }
  }

  // Monitor fullscreen state changes
  useEffect(() => {
    if (!mounted) return

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div className="w-full h-[600px] futuristic-card p-4 rounded-xl relative flex items-center justify-center">
        <p className="text-gray-400">Carregando gráfico...</p>
      </div>
    )
  }

  return (
    <div
      ref={chartContainerRef}
      className={`w-full ${isFullscreen ? "h-screen" : "h-[600px]"} futuristic-card p-4 rounded-xl relative`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            {/* Pair selector */}
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-black/30 border border-gray-700 rounded-md px-3 py-1.5 hover:bg-black/50">
                <span className="font-bold text-white">{selectedPair.symbol}</span>
                <span className={selectedPair.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                  {selectedPair.price}
                </span>
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 bg-black/90 border border-gray-700 rounded-md shadow-lg z-20 hidden group-hover:block">
                {pairs.map((pair) => (
                  <button
                    key={pair.symbol}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800 text-left"
                    onClick={() => setSelectedPair(pair)}
                  >
                    <span className="text-white">{pair.symbol}</span>
                    <span className={pair.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                      {pair.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <span className={selectedPair.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
              {selectedPair.change}
            </span>
          </div>

          {/* Chart type controls */}
          <div className="flex items-center space-x-2">
            <Tabs defaultValue={chartType} onValueChange={setChartType} className="w-auto">
              <TabsList className="bg-black/50 border border-gray-700">
                <TabsTrigger value="candle" className="data-[state=active]:bg-orange-500/20 px-3 py-1.5">
                  <CandleIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Velas</span>
                </TabsTrigger>
                <TabsTrigger value="line" className="data-[state=active]:bg-blue-500/20 px-3 py-1.5">
                  <LineIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Linha</span>
                </TabsTrigger>
                <TabsTrigger value="bar" className="data-[state=active]:bg-green-500/20 px-3 py-1.5">
                  <BarIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Barras</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Tool buttons */}
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className={`h-8 w-8 border-gray-700 ${showGrid ? "bg-gray-700/50" : ""}`}
                onClick={() => setShowGrid(!showGrid)}
                title="Mostrar/Ocultar Grade"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-8 w-8 border-gray-700 ${showCrosshair ? "bg-gray-700/50" : ""}`}
                onClick={() => setShowCrosshair(!showCrosshair)}
                title="Mostrar/Ocultar Crosshair"
              >
                <Crosshair className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-700"
                onClick={toggleFullscreen}
                title="Tela Cheia"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Indicator sidebar */}
        <div className="flex flex-1 relative">
          <div className="hidden lg:block w-48 border-r border-gray-800 pr-4 mr-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Indicadores</h3>
            <div className="space-y-2">
              <div className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Médias Móveis</span>
                  <span className="text-xs text-green-500">+</span>
                </div>
              </div>
              <div className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">RSI</span>
                  <span className="text-xs text-green-500">+</span>
                </div>
              </div>
              <div className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">MACD</span>
                  <span className="text-xs text-green-500">+</span>
                </div>
              </div>
              <div className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Bollinger Bands</span>
                  <span className="text-xs text-green-500">+</span>
                </div>
              </div>
              <div className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Volume</span>
                  <span className="text-xs text-green-500">+</span>
                </div>
              </div>
              <div className="p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Fibonacci</span>
                  <span className="text-xs text-green-500">+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main chart area */}
          <div className="flex-1 relative">
            <Tabs defaultValue={chartType} className="h-full">
              <TabsContent value="candle" className="h-full m-0">
                <CandlestickChart
                  timeframe={timeframe}
                  showGrid={showGrid}
                  showCrosshair={showCrosshair}
                  symbol={selectedPair.symbol}
                />
              </TabsContent>
              <TabsContent value="line" className="h-full m-0">
                <LineChart
                  timeframe={timeframe}
                  showGrid={showGrid}
                  showCrosshair={showCrosshair}
                  symbol={selectedPair.symbol}
                />
              </TabsContent>
              <TabsContent value="bar" className="h-full m-0">
                <BarChart
                  timeframe={timeframe}
                  showGrid={showGrid}
                  showCrosshair={showCrosshair}
                  symbol={selectedPair.symbol}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Timeframe and navigation controls */}
        <ChartControls timeframes={timeframes} activeTimeframe={timeframe} onTimeframeChange={setTimeframe} />
      </div>
    </div>
  )
}
