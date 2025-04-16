"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  LineChart,
  BarChart2,
  TrendingUp,
  Crosshair,
  Grid,
  Layers,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChartControlsProps {
  timeframes: { value: string; label: string }[]
  activeTimeframe: string
  onTimeframeChange: (timeframe: string) => void
}

export default function ChartControls({ timeframes, activeTimeframe, onTimeframeChange }: ChartControlsProps) {
  const [showGrid, setShowGrid] = useState(true)
  const [showCrosshair, setShowCrosshair] = useState(true)

  const indicators = [
    { name: "Médias Móveis", icon: LineChart },
    { name: "Bollinger Bands", icon: LineChart },
    { name: "RSI", icon: TrendingUp },
    { name: "MACD", icon: BarChart2 },
    { name: "Estocástico", icon: LineChart },
  ]

  return (
    <div className="flex justify-between items-center mt-4 border-t border-gray-800 pt-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 border-gray-700 ${showGrid ? "bg-orange-500/20" : ""}`}
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 border-gray-700 ${showCrosshair ? "bg-orange-500/20" : ""}`}
          onClick={() => setShowCrosshair(!showCrosshair)}
        >
          <Crosshair className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700">
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black/90 border border-gray-700">
            <DropdownMenuLabel>Indicadores</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            {indicators.map((indicator, index) => (
              <DropdownMenuItem key={index} className="flex items-center cursor-pointer">
                <indicator.icon className="h-4 w-4 mr-2 text-orange-500" />
                <span>{indicator.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-1">
        {timeframes.map((tf) => (
          <Button
            key={tf.value}
            variant="ghost"
            size="sm"
            className={`px-2 py-1 h-8 ${
              activeTimeframe === tf.value
                ? "bg-gradient-to-r from-orange-500/20 to-purple-600/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => onTimeframeChange(tf.value)}
          >
            {tf.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
