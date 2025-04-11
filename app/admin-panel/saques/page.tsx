"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Eye } from "lucide-react"

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    async function checkTableExists() {
      try {
        // Verificar se a tabela withdrawals existe
        const { error } = await supabase.from("withdrawals").select("count").limit(1)

        if (error && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("A tabela de saques não existe. Por favor, inicialize o banco de dados nas configurações.")
          setLoading(false)
          return false
        }

        return true
      } catch (err) {
        console.error("Erro ao verificar tabela:", err)
        return false
      }
    }

    async function fetchWithdrawals() {
      try {
        const tableCheck = await checkTableExists()
        if (!tableCheck) return

        setLoading(true)
        setError(null)

        // Buscar saques sem usar relações
        const { data, error } = await supabase
          .from("withdrawals")
          .select("id, user_id, amount, status, pix_key, created_at")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Se não há saques, retornar array vazio
        if (!data || data.length === 0) {
          setWithdrawals([])
          setLoading(false)
          return
        }

        // Extrair IDs de usuário únicos
        const userIds = [...new Set(data.map((withdrawal) => withdrawal.user_id))].filter(Boolean)

        // Se não há IDs de usuário, retornar os saques sem info de usuário
        if (userIds.length === 0) {
          setWithdrawals(
            data.map((withdrawal) => ({
              ...withdrawal,
              user_name: "Usuário",
              user_email: "Não disponível",
            })),
          )
          setLoading(false)
          return
        }

        try {
          // Tentar buscar perfis de usuário separadamente
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", userIds)

          // Se houver erro ao buscar perfis, usar saques sem info de usuário
          if (profilesError) {
            console.warn("Erro ao buscar perfis:", profilesError)
            setWithdrawals(
              data.map((withdrawal) => ({
                ...withdrawal,
                user_name: "Usuário",
                user_email: withdrawal.user_id || "Não disponível",
              })),
            )
            setLoading(false)
            return
          }

          // Criar mapa de perfis por ID
          const profilesMap = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile
            return acc
          }, {})

          // Combinar saques com informações de perfil
          const withdrawalsWithProfiles = data.map((withdrawal) => {
            const profile = profilesMap[withdrawal.user_id]
            return {
              ...withdrawal,
              user_name: profile ? profile.name : "Usuário",
              user_email: profile ? profile.email : withdrawal.user_id || "Não disponível",
            }
          })

          setWithdrawals(withdrawalsWithProfiles)
        } catch (profileErr) {
          // Em caso de erro ao buscar perfis, usar saques sem info de usuário
          console.error("Erro ao processar perfis:", profileErr)
          setWithdrawals(
            data.map((withdrawal) => ({
              ...withdrawal,
              user_name: "Usuário",
              user_email: withdrawal.user_id || "Não disponível",
            })),
          )
        }
      } catch (err: any) {
        console.error("Erro ao buscar saques:", err)
        setError(`Erro ao buscar saques: ${err.message}`)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os saques: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()
  }, [supabase, toast])

  if (!tableExists) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Saques</h1>
        </div>

        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md mb-6">
          <p className="font-medium mb-2">Tabela de saques não encontrada</p>
          <p>É necessário inicializar o banco de dados antes de usar esta funcionalidade.</p>
        </div>

        <Link
          href="/admin-panel/configuracoes"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white inline-flex items-center"
        >
          Ir para Configurações
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Saques</h1>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
        >
          Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-900/50 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="px-6 py-3 text-gray-300">ID</th>
                  <th className="px-6 py-3 text-gray-300">Usuário</th>
                  <th className="px-6 py-3 text-gray-300">Valor</th>
                  <th className="px-6 py-3 text-gray-300">Carteira</th>
                  <th className="px-6 py-3 text-gray-300">Status</th>
                  <th className="px-6 py-3 text-gray-300">Data</th>
                  <th className="px-6 py-3 text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 font-mono text-xs">
                      {typeof withdrawal.id === "string" ? withdrawal.id.substring(0, 8) + "..." : withdrawal.id}
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.user_name || "Usuário"}
                      <br />
                      <span className="text-xs text-gray-400">{withdrawal.user_email || "Email não disponível"}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-red-400">
                      ${" "}
                      {typeof withdrawal.amount === "number"
                        ? withdrawal.amount.toFixed(2)
                        : Number.parseFloat(withdrawal.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {withdrawal.pix_key
                        ? withdrawal.pix_key.length > 15
                          ? `${withdrawal.pix_key.substring(0, 15)}...`
                          : withdrawal.pix_key
                        : "Não informado"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          withdrawal.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : withdrawal.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {withdrawal.status === "approved"
                          ? "Aprovado"
                          : withdrawal.status === "pending"
                            ? "Pendente"
                            : "Rejeitado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin-panel/saques/${withdrawal.id}`}
                          className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5 text-blue-400" />
                        </Link>
                        {withdrawal.status === "pending" && (
                          <>
                            <Link
                              href={`/admin-panel/saques/${withdrawal.id}/aprovar`}
                              className="p-1 rounded bg-green-500/20 hover:bg-green-500/30"
                              title="Aprovar"
                            >
                              <Check className="w-5 h-5 text-green-400" />
                            </Link>
                            <Link
                              href={`/admin-panel/saques/${withdrawal.id}/rejeitar`}
                              className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                              title="Rejeitar"
                            >
                              <X className="w-5 h-5 text-red-400" />
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum saque encontrado.</p>
            <p className="text-gray-500 text-sm mt-2">
              Os saques aparecerão aqui quando os usuários realizarem solicitações de saque na plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
