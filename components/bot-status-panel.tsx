import { Clock, Target, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function BotStatusPanel() {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-green-900/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Status do Bot</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-green-500">Ativo</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm">Meta Diária</span>
            </div>
            <span className="text-sm font-medium text-green-500">6%</span>
          </div>
          <Progress value={75} className="h-1.5 bg-gray-800" indicatorClassName="bg-green-500" />
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>0%</span>
            <span>6%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Ciclo de 20 dias</span>
            </div>
            <span className="text-sm font-medium text-yellow-500">120%</span>
          </div>
          <Progress value={30} className="h-1.5 bg-gray-800" indicatorClassName="bg-yellow-500" />
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>0%</span>
            <span>120%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Próximo Rendimento</span>
            </div>
            <span className="text-sm font-medium text-blue-500">Em breve</span>
          </div>
          <div className="bg-black/20 rounded-lg p-2 mt-2">
            <p className="text-xs text-gray-400">
              O bot opera 24/5 (segunda a sexta) e distribui rendimentos diários de 6% até completar o ciclo de 20 dias
              úteis, totalizando 120% de rendimento.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"].map((pair) => (
          <div
            key={pair}
            className="flex flex-col items-center justify-center bg-black/20 rounded p-1 border border-green-900/20"
          >
            <span className="text-xs">{pair.replace("XAU", "XAU/")}</span>
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
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
  )
}
