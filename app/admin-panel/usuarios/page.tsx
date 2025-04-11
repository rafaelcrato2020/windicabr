"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Ban, ArrowUpDown, Edit } from "lucide-react"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        setError(null)

        // Verificar se a tabela profiles existe
        const { error: checkError } = await supabase.from("profiles").select("count").limit(1)

        if (checkError && checkError.message.includes("does not exist")) {
          setError("A tabela de perfis não existe. Por favor, inicialize o banco de dados nas configurações.")
          setLoading(false)
          return
        }

        // Buscar todos os perfis
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (profilesError) {
          throw profilesError
        }

        setUsers(profiles || [])
      } catch (err: any) {
        console.error("Erro ao buscar usuários:", err)
        setError(`Erro ao buscar usuários: ${err.message}`)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os usuários: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [supabase, toast])

  // Função para buscar usuários novamente
  const refreshUsers = async () => {
    setLoading(true)
    try {
      // Buscar todos os perfis
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) {
        throw profilesError
      }

      setUsers(profiles || [])
      toast({
        title: "Sucesso",
        description: "Lista de usuários atualizada",
      })
    } catch (err: any) {
      console.error("Erro ao atualizar usuários:", err)
      toast({
        title: "Erro",
        description: `Não foi possível atualizar os usuários: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          {!loading && users.length > 0 && (
            <p className="text-green-500 mt-2 font-medium">
              Total de usuários cadastrados:{" "}
              <span className="text-white bg-green-600 px-3 py-1 rounded-full ml-2">{users.length}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshUsers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </button>
          <Link
            href="/admin-panel/configuracoes/sync-users"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
          >
            Sincronizar Usuários
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-900/50 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
          <div className="flex gap-4 mt-4">
            <Link
              href="/admin-panel/configuracoes/init-database"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm"
            >
              Inicializar Banco de Dados
            </Link>
            <Link
              href="/admin-panel/configuracoes/sync-users"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm"
            >
              Sincronizar Usuários
            </Link>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="px-6 py-3 text-gray-300">Nome</th>
                  <th className="px-6 py-3 text-gray-300">Email</th>
                  <th className="px-6 py-3 text-gray-300">Saldo</th>
                  <th className="px-6 py-3 text-gray-300">Investimentos</th>
                  <th className="px-6 py-3 text-gray-300">Status</th>
                  <th className="px-6 py-3 text-gray-300">Cadastro</th>
                  <th className="px-6 py-3 text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">{user.name || "Usuário"}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 font-medium">R$ {(user.balance || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium">R$ {(user.investments || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active !== false ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.is_active !== false ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin-panel/usuarios/${user.id}`)}
                          className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5 text-blue-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin-panel/usuarios/${user.id}/editar`)}
                          className="p-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30"
                          title="Editar usuário"
                        >
                          <Edit className="w-5 h-5 text-yellow-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin-panel/usuarios/${user.id}/bloquear`)}
                          className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                          title="Bloquear usuário"
                        >
                          <Ban className="w-5 h-5 text-red-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin-panel/usuarios/${user.id}/transacoes`)}
                          className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30"
                          title="Ver transações"
                        >
                          <ArrowUpDown className="w-5 h-5 text-purple-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum usuário encontrado</p>
            <p className="text-gray-500 mt-2">
              Você precisa sincronizar os usuários existentes com a tabela de perfis.
            </p>
            <div className="mt-4">
              <Link
                href="/admin-panel/configuracoes/sync-users"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white inline-block"
              >
                Sincronizar Usuários
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
