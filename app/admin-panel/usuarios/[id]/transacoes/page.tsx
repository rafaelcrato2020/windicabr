"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500\
