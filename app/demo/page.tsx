import BalanceCards from "@/components/dashboard/balance-cards"
import ChartContainer from "@/components/dashboard/market/chart-container"
import TradingBot from "@/components/dashboard/trading-bot"
import AffiliateDashboard from "@/components/dashboard/affiliate-program"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Demonstração do Painel de Usuário</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Saldos</h2>
          <BalanceCards />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Gráficos de Mercado</h2>
          <ChartContainer />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Bot de Trading</h2>
          <TradingBot />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Programa de Afiliados</h2>
          <AffiliateDashboard />
        </section>
      </div>
    </div>
  )
}
