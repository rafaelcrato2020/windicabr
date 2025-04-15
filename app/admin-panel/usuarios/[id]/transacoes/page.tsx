"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ArrowDown, ArrowUp, DollarSign, Percent, Users } from "lucide-react"

export default function UserTransactionsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Buscar o perfil do usuário
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .single()

        if (userError) {
          throw userError
        }

        setUser(userData)

        // Verificar se a tabela transactions existe
        try {
          // Buscar transações do usuário
          const { data: transactionsData, error: transactionsError } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", params.id)
            .order("created_at", { ascending: false })

          if (transactionsError && !transactionsError.message.includes("does not exist")) {
            throw transactionsError
          }

          setTransactions(transactionsData || [])
        } catch (transErr) {
          console.error("Erro ao buscar transações:", transErr)
          setTransactions([])
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os dados: ${error.message}`,
          variant: "destructive",
        })
        router.push("/admin-panel/usuarios")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, supabase, toast])

  // Função para obter ícone com base no tipo de transação
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDown className="h-5 w-5 text-green-400" />
      case "withdrawal":
        return <ArrowUp className="h-5 w-5 text-red-400" />
      case "investment":
        return <DollarSign className="h-5 w-5 text-yellow-400" />
      case "yield":
        return <Percent className="h-5 w-5 text-green-400" />
      case "commission":
        return <Users className="h-5 w-5 text-blue-400" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-400" />
    }
  }

  // Função para obter cor com base no tipo de transação
  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "yield":
        return "text-green-400"
      case "withdrawal":
        return "text-red-400"
      case "investment":
        return "text-yellow-400"
      case "commission":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  // Função para obter texto com base no tipo de transação
  const getTransactionText = (type: string) => {
    switch (type) {
      case "deposit":
        return "Depósito"
      case "withdrawal":
        return "Saque"
      case "investment":
        return "Investimento"
      case "yield":
        return "Rendimento"
      case "commission":
        return "Comissão"
      case "withdrawal_rejected":
        return "Saque Rejeitado"
      default:
        return type
    }
  }

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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Transações do Usuário</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold">{user.name || "Usuário"}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-green-500/10 border border-green-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Saldo</p>
              <p className="text-lg font-bold text-green-400">$ {(user.balance || 0).toFixed(2)}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Investimentos</p>
              <p className="text-lg font-bold text-yellow-400">$ {(user.investments || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Histórico de Transações</h3>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="px-4 py-3 text-gray-300">Tipo</th>
                    <th className="px-4 py-3 text-gray-300">Valor</th>
                    <th className="px-4 py-3 text-gray-300">Status</th>
                    <th className="px-4 py-3 text-gray-300">Descrição</th>
                    <th className="px-4 py-3 text-gray-300">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className={getTransactionColor(transaction.type)}>
                            {getTransactionText(transaction.type)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-medium ${getTransactionColor(transaction.type)}`}>
                        $ {transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : transaction.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transaction.status === "completed"
                            ? "Concluído"
                            : transaction.status === "pending"
                              ? "Pendente"
                              : "Cancelado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{transaction.description || "-"}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {transaction.created_at
                          ? new Date(transaction.created_at).toLocaleDateString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma transação encontrada para este usuário.</p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Link
            href={`/admin-panel/usuarios/${user.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Ver Detalhes do Usuário
          </Link>
          <Link href="/admin-panel/usuarios" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
            Voltar para Lista
          </Link>
        </div>
      </div>
    </div>
  )
}
