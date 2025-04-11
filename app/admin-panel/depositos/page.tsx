"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Eye } from "lucide-react"

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    async function checkTableExists() {
      try {
        // Verificar se a tabela deposits existe
        const { error } = await supabase.from("deposits").select("count").limit(1)

        if (error && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("A tabela de depósitos não existe. Por favor, inicialize o banco de dados nas configurações.")
          setLoading(false)
          return false
        }

        return true
      } catch (err) {
        console.error("Erro ao verificar tabela:", err)
        return false
      }
    }

    async function fetchDeposits() {
      try {
        const tableCheck = await checkTableExists()
        if (!tableCheck) return

        setLoading(true)
        setError(null)

        // Buscar depósitos sem usar relações
        const { data, error } = await supabase
          .from("deposits")
          .select("id, user_id, amount, status, payment_method, created_at")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Se não há depósitos, retornar array vazio
        if (!data || data.length === 0) {
          setDeposits([])
          setLoading(false)
          return
        }

        // Extrair IDs de usuário únicos
        const userIds = [...new Set(data.map((deposit) => deposit.user_id))].filter(Boolean)

        // Se não há IDs de usuário, retornar os depósitos sem info de usuário
        if (userIds.length === 0) {
          setDeposits(
            data.map((deposit) => ({
              ...deposit,
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

          // Se houver erro ao buscar perfis, usar depósitos sem info de usuário
          if (profilesError) {
            console.warn("Erro ao buscar perfis:", profilesError)
            setDeposits(
              data.map((deposit) => ({
                ...deposit,
                user_name: "Usuário",
                user_email: deposit.user_id || "Não disponível",
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

          // Combinar depósitos com informações de perfil
          const depositsWithProfiles = data.map((deposit) => {
            const profile = profilesMap[deposit.user_id]
            return {
              ...deposit,
              user_name: profile ? profile.name : "Usuário",
              user_email: profile ? profile.email : deposit.user_id || "Não disponível",
            }
          })

          setDeposits(depositsWithProfiles)
        } catch (profileErr) {
          // Em caso de erro ao buscar perfis, usar depósitos sem info de usuário
          console.error("Erro ao processar perfis:", profileErr)
          setDeposits(
            data.map((deposit) => ({
              ...deposit,
              user_name: "Usuário",
              user_email: deposit.user_id || "Não disponível",
            })),
          )
        }
      } catch (err: any) {
        console.error("Erro ao buscar depósitos:", err)
        setError(`Erro ao buscar depósitos: ${err.message}`)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os depósitos: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDeposits()
  }, [supabase, toast])

  if (!tableExists) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Depósitos</h1>
        </div>

        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md mb-6">
          <p className="font-medium mb-2">Tabela de depósitos não encontrada</p>
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
        <h1 className="text-3xl font-bold">Gerenciar Depósitos</h1>
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
        ) : deposits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="px-6 py-3 text-gray-300">ID</th>
                  <th className="px-6 py-3 text-gray-300">Usuário</th>
                  <th className="px-6 py-3 text-gray-300">Valor</th>
                  <th className="px-6 py-3 text-gray-300">Método</th>
                  <th className="px-6 py-3 text-gray-300">Status</th>
                  <th className="px-6 py-3 text-gray-300">Data</th>
                  <th className="px-6 py-3 text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 font-mono text-xs">
                      {typeof deposit.id === "string" ? deposit.id.substring(0, 8) + "..." : deposit.id}
                    </td>
                    <td className="px-6 py-4">
                      {deposit.user_name || "Usuário"}
                      <br />
                      <span className="text-xs text-gray-400">{deposit.user_email || "Email não disponível"}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-400">
                      R$ {typeof deposit.amount === "number" ? deposit.amount.toFixed(2) : "0.00"}
                    </td>
                    <td className="px-6 py-4">{deposit.payment_method || "Pix"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          deposit.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : deposit.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {deposit.status === "approved"
                          ? "Aprovado"
                          : deposit.status === "pending"
                            ? "Pendente"
                            : "Rejeitado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {deposit.created_at ? new Date(deposit.created_at).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin-panel/depositos/${deposit.id}`}
                          className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5 text-blue-400" />
                        </Link>
                        {deposit.status === "pending" && (
                          <>
                            <Link
                              href={`/admin-panel/depositos/${deposit.id}/aprovar`}
                              className="p-1 rounded bg-green-500/20 hover:bg-green-500/30"
                              title="Aprovar"
                            >
                              <Check className="w-5 h-5 text-green-400" />
                            </Link>
                            <Link
                              href={`/admin-panel/depositos/${deposit.id}/rejeitar`}
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
            <p className="text-gray-400">Nenhum depósito encontrado.</p>
            <p className="text-gray-500 text-sm mt-2">
              Os depósitos aparecerão aqui quando os usuários realizarem depósitos na plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
