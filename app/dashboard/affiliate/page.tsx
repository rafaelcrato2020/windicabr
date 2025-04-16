import AffiliateDashboard from "@/components/dashboard/affiliate-program"

export default function AffiliatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Programa de Afiliados</h1>
        <p className="text-gray-400">Ganhe comissões indicando novos investidores</p>
      </div>

      <AffiliateDashboard />
    </div>
  )
}
