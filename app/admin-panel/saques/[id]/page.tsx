"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function WithdrawalDetailsPage({ params }: { params: { id: string } }) {
  const [withdrawal, setWithdrawal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchWithdrawal() {
      try {
        setLoading(true)

        // Buscar o saque pelo ID
        const { data, error } = await supabase.from("withdrawals").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (!data) {
          toast({
            title: "Erro",
            description: "Saque não encontrado",
            variant: "destructive",
          })
          router.push("/admin-panel/saques")
          return
        }

        // Buscar informações do usuário
        if (data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", data.user_id)
            .single()

          if (!userError && userData) {
            setWithdrawal({
              ...data,
              user_name: userData.name,
              user_email: userData.email,
            })
          } else {
            setWithdrawal(data)
          }
        } else {
          setWithdrawal(data)
        }
      } catch (error: any) {
        console.error("Erro ao buscar detalhes do saque:", error)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os detalhes do saque: ${error.message}`,
          variant: "destructive",
        })
        router.push("/admin-panel/saques")
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawal()
  }, [params.id, router, supabase, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!withdrawal) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Saque não encontrado</h2>
        <button
          onClick={() => router.push("/admin-panel/saques")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Detalhes do Saque</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm text-gray-400">ID do Saque</span>
            <p className="text-lg font-medium">{withdrawal.id}</p>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Usuário</p>
            <p className="font-medium">{withdrawal.user_name || "Usuário"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-medium">{withdrawal.user_email || "Não disponível"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Valor</p>
            <p className="font-medium text-red-400">$ {Number.parseFloat(withdrawal.amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data</p>
            <p className="font-medium">{new Date(withdrawal.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm mb-2">Carteira USDT (TRC20)</p>
          <div className="bg-gray-700 p-3 rounded-md break-all">
            <p className="font-mono text-sm">{withdrawal.pix_key || "Não informado"}</p>
          </div>
        </div>

        {withdrawal.notes && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-gray-400 text-sm mb-2">Observações</p>
            <div className="bg-gray-700 p-3 rounded-md">
              <p className="text-sm">{withdrawal.notes}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          {withdrawal.status === "pending" && (
            <>
              <Link
                href={`/admin-panel/saques/${withdrawal.id}/aprovar`}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
              >
                Aprovar Saque
              </Link>
              <Link
                href={`/admin-panel/saques/${withdrawal.id}/rejeitar`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
              >
                Rejeitar Saque
              </Link>
            </>
          )}
          <Link href="/admin-panel/saques" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}
