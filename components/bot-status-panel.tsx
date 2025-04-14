"use client"
import { Progress } from "@/components/ui/progress"

export function BotStatusPanel() {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium">Status do Bot</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-green-500">Ativo</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Meta diária:</span>
          <span className="text-sm font-medium text-green-500">6%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Progresso hoje:</span>
          <span className="text-sm font-medium text-yellow-500">4.2%</span>
        </div>
        <Progress value={70} className="h-1.5 bg-gray-800" indicatorClassName="bg-green-500" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Próxima operação:</span>
          <span className="text-sm font-medium text-blue-500">~2 min</span>
        </div>
      </div>
    </div>
  )
}
