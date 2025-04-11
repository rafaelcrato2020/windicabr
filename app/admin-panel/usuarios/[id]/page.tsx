"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)

        // Buscar o perfil do usuário pelo ID
        const { data, error } = await supabase.from("profiles").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (!data) {
          toast({
            title: "Erro",
            description: "Usuário não encontrado",
            variant: "destructive",
          })
          router.push("/admin-panel/usuarios")
          return
        }

        setUser(data)
      } catch (error: any) {
        console.error("Erro ao buscar detalhes do usuário:", error)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os detalhes do usuário: ${error.message}`,
          variant: "destructive",
        })
        router.push("/admin-panel/usuarios")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.id, router, supabase, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Usuário não encontrado</h2>
        <button
          onClick={() => router.push("/admin-panel/usuarios")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Detalhes do Usuário</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm text-gray-400">ID do Usuário</span>
            <p className="text-lg font-medium">{user.id}</p>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                user.is_active !== false ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {user.is_active !== false ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Nome</p>
            <p className="font-medium">{user.name || "Usuário"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-medium">{user.email || "Não disponível"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Saldo</p>
            <p className="font-medium text-green-400">$ {(user.balance || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Investimentos</p>
            <p className="font-medium text-yellow-400">$ {(user.investments || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data de Cadastro</p>
            <p className="font-medium">
              {user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Última Atualização</p>
            <p className="font-medium">
              {user.updated_at ? new Date(user.updated_at).toLocaleDateString("pt-BR") : "-"}
            </p>
          </div>
        </div>

        {user.referral_code && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-gray-400 text-sm mb-2">Código de Afiliado</p>
            <div className="bg-gray-700 p-3 rounded-md">
              <p className="font-mono text-sm">{user.referral_code}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          <Link
            href={`/admin-panel/usuarios/${user.id}/editar`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Editar Usuário
          </Link>
          <Link
            href={`/admin-panel/usuarios/${user.id}/bloquear`}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
          >
            {user.is_active !== false ? "Bloquear Usuário" : "Desbloquear Usuário"}
          </Link>
          <Link href="/admin-panel/usuarios" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}
