"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se a tabela deposits existe
      const { error: tableCheckError } = await supabase.from("deposits").select("id").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        setDeposits([])
        setError(
          "A tabela de depósitos ainda não foi inicializada. Por favor, acesse as configurações para inicializar o banco de dados.",
        )
        return
      }

      // Buscar depósitos
      const { data: depositsData, error: depositsError } = await supabase
        .from("deposits")
        .select("*")
        .order("created_at", { ascending: false })

      if (depositsError) throw depositsError

      // Buscar informações dos usuários
      const userIds = depositsData.map((deposit) => deposit.user_id)

      // Verificar se a tabela profiles existe
      const { error: profilesCheckError } = await supabase.from("profiles").select("id").limit(1)

      let profilesData: any[] = []
      if (!profilesCheckError) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds)

        if (!profilesError) {
          profilesData = profiles || []
        }
      }

      // Combinar dados
      const depositsWithUserInfo = depositsData.map((deposit) => {
        const userProfile = profilesData.find((profile) => profile.id === deposit.user_id)
        return {
          ...deposit,
          user_name: userProfile?.name || "Usuário",
          user_email: userProfile?.email || "Email não disponível",
        }
      })

      setDeposits(depositsWithUserInfo)
    } catch (error: any) {
      console.error("Erro ao buscar depósitos:", error)
      setError(`Erro ao buscar depósitos: ${error.message}`)
      toast({
        title: "Erro",
        description: `Erro ao buscar depósitos: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-yellow-100"
      case "approved":
        return "bg-green-500 text-green-100"
      case "rejected":
        return "bg-red-500 text-red-100"
      default:
        return "bg-gray-500 text-gray-100"
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Depósitos</h1>
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md mb-6">{error}</div>
        <Link
          href="/admin-panel/configuracoes"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
        >
          Ir para Configurações
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Depósitos</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : deposits.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">Nenhum depósito encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deposit.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div>{deposit.user_name}</div>
                    <div className="text-gray-400 text-xs">{deposit.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    R$ {Number(deposit.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(deposit.status)}`}>
                      {deposit.status === "pending" && "Pendente"}
                      {deposit.status === "approved" && "Aprovado"}
                      {deposit.status === "rejected" && "Rejeitado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(deposit.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {deposit.status === "pending" && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin-panel/depositos/${deposit.id}/aprovar`}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
                        >
                          Aprovar
                        </Link>
                        <Link
                          href={`/admin-panel/depositos/${deposit.id}/rejeitar`}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                        >
                          Rejeitar
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
