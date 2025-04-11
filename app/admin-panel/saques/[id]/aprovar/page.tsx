"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ApproveWithdrawal({ params }: { params: { id: string } }) {
  const [withdrawal, setWithdrawal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchWithdrawal = async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*, profiles(name, email)")
        .eq("id", params.id)
        .single()

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do saque",
          variant: "destructive",
        })
        router.push("/admin-panel/saques")
        return
      }

      setWithdrawal(data)
      setLoading(false)
    }

    fetchWithdrawal()
  }, [params.id, router, supabase, toast])

  const handleApprove = async () => {
    setProcessing(true)

    // Atualizar o status do saque
    const { error } = await supabase.from("withdrawals").update({ status: "approved" }).eq("id", params.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o saque",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    // Criar registro de transação
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: withdrawal.user_id,
      amount: -withdrawal.amount,
      type: "withdrawal",
      description: "Saque aprovado",
      status: "completed",
    })

    if (transactionError) {
      toast({
        title: "Aviso",
        description: "Saque aprovado, mas houve um erro ao registrar a transação",
        variant: "default",
      })
    }

    toast({
      title: "Sucesso",
      description: "Saque aprovado com sucesso",
      variant: "default",
    })

    router.push("/admin-panel/saques")
  }

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

  if (withdrawal.status !== "pending") {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Este saque já foi processado</h2>
        <p className="mb-6">Status atual: {withdrawal.status === "approved" ? "Aprovado" : "Rejeitado"}</p>
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
      <h1 className="text-3xl font-bold mb-8">Aprovar Saque</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Usuário</p>
            <p className="font-medium">{withdrawal.profiles?.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-medium">{withdrawal.profiles?.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Valor</p>
            <p className="font-medium text-red-400">R$ {withdrawal.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Método</p>
            <p className="font-medium">{withdrawal.payment_method || "Pix"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data</p>
            <p className="font-medium">{new Date(withdrawal.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <p className="font-medium">
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">Pendente</span>
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-sm">Carteira USDT (TRC20)</p>
            <div className="bg-gray-700 p-3 rounded-lg break-all text-yellow-400 font-mono text-sm mt-1">
              {withdrawal.pix_key || withdrawal.wallet}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Confirmação</h3>
          <p className="text-gray-300 mb-6">
            Você está prestes a aprovar um saque de{" "}
            <span className="font-bold text-red-400">R$ {withdrawal.amount.toFixed(2)}</span> para o usuário{" "}
            <span className="font-bold">{withdrawal.profiles?.name}</span>. Certifique-se de que o pagamento foi
            realizado antes de confirmar esta ação.
          </p>

          <div className="flex space-x-4">
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processando...
                </>
              ) : (
                "Confirmar Aprovação"
              )}
            </button>
            <button
              onClick={() => router.push("/admin-panel/saques")}
              disabled={processing}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
