import { createServerClient } from "@/utils/supabase/server"
import Link from "next/link"

export default async function AffiliatesPage() {
  const supabase = createServerClient()

  // Buscar usuários com afiliados
  const { data: users } = await supabase
    .from("profiles")
    .select("id, name, email, affiliate_code, affiliate_earnings")
    .order("affiliate_earnings", { ascending: false })

  // Buscar estatísticas de afiliados
  const { data: affiliateStats } = await supabase.from("affiliate_stats").select("*").single()

  const stats = [
    {
      title: "Total de Afiliados",
      value: users?.length || 0,
      color: "bg-purple-500",
    },
    {
      title: "Comissões Pagas",
      value: `R$ ${affiliateStats?.total_commissions?.toFixed(2) || "0.00"}`,
      color: "bg-green-500",
    },
    {
      title: "Usuários Indicados",
      value: affiliateStats?.total_referrals || 0,
      color: "bg-blue-500",
    },
    {
      title: "Média por Afiliado",
      value: `R$ ${users && users.length > 0 ? (users.reduce((sum, user) => sum + (user.affiliate_earnings || 0), 0) / users.length).toFixed(2) : "0.00"}`,
      color: "bg-yellow-500",
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Programa de Afiliados</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-6 shadow-lg`}>
            <h3 className="text-lg font-medium text-white mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Configurações do Programa</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Níveis de Comissão</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                  <span>Nível 1</span>
                  <span className="font-bold text-green-400">10%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                  <span>Nível 2</span>
                  <span className="font-bold text-green-400">5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                  <span>Nível 3</span>
                  <span className="font-bold text-green-400">3%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                  <span>Nível 4</span>
                  <span className="font-bold text-green-400">2%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Regras do Programa</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Comissões são pagas sobre os rendimentos dos afiliados
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Pagamentos são processados automaticamente
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Afiliados podem sacar suas comissões a qualquer momento
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Não há limite máximo de ganhos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Top Afiliados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-6 py-3 text-gray-300">Nome</th>
                <th className="px-6 py-3 text-gray-300">Email</th>
                <th className="px-6 py-3 text-gray-300">Código</th>
                <th className="px-6 py-3 text-gray-300">Ganhos</th>
                <th className="px-6 py-3 text-gray-300">Indicados</th>
                <th className="px-6 py-3 text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">{user.name || "Usuário"}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.affiliate_code || "-"}</td>
                  <td className="px-6 py-4 font-medium text-green-400">
                    R$ {(user.affiliate_earnings || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">0</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin-panel/afiliados/${user.id}`}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Nenhum afiliado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
