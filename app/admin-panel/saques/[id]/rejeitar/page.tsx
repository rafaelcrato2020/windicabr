"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function RejectWithdrawal({ params }: { params: { id: string } }) {
  const [withdrawal, setWithdrawal] = useState<any>(null)
  const [reason, setReason] = useState("")
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

  const handleReject = async () => {
    if (!reason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o motivo da rejeição",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      // 1. Atualizar o status do saque
      const { error: withdrawalError } = await supabase
        .from("withdrawals")
        .update({
          status: "rejected",
          notes: reason,
        })
        .eq("id", params.id)

      if (withdrawalError) {
        throw new Error("Não foi possível rejeitar o saque: " + withdrawalError.message)
      }

      // 2. Devolver o valor para o saldo do usuário
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", withdrawal.user_id)
        .single()

      if (userError) {
        throw new Error("Não foi possível obter o saldo do usuário: " + userError.message)
      }

      const newBalance = (userData.balance || 0) + withdrawal.amount
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", withdrawal.user_id)

      if (updateError) {
        throw new Error("Não foi possível atualizar o saldo do usuário: " + updateError.message)
      }

      // 3. Atualizar a transação relacionada ou criar uma nova
      const { data: transactionData, error: transactionFetchError } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", withdrawal.user_id)
        .eq("type", "withdrawal")
        .eq("amount", withdrawal.amount)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)

      if (!transactionFetchError && transactionData && transactionData.length > 0) {
        // Atualizar a transação para "rejected"
        await supabase
          .from("transactions")
          .update({
            status: "rejected",
            description: `Saque rejeitado: ${reason}`,
          })
          .eq("id", transactionData[0].id)
      }

      // 4. Criar registro de transação para o estorno
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
        type: "withdrawal_rejected",
        description: `Saque rejeitado: ${reason}`,
        status: "completed",
      })

      toast({
        title: "Sucesso",
        description: "Saque rejeitado com sucesso e valor devolvido ao usuário",
        variant: "default",
      })

      router.push("/admin-panel/saques")
    } catch (error: any) {
      console.error("Erro ao rejeitar saque:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível rejeitar o saque",
        variant: "destructive",
      })
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
      <h1 className="text-3xl font-bold mb-8">Rejeitar Saque</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Usuário</p>
            <p className="font-medium">{withdrawal.profiles?.name || "Usuário"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-medium">{withdrawal.profiles?.email || "Não disponível"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Valor</p>
            <p className="font-medium text-red-400">R$ {withdrawal.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data</p>
            <p className="font-medium">{new Date(withdrawal.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-sm">Carteira USDT (TRC20)</p>
            <p className="font-medium font-mono break-all">{withdrawal.pix_key || "Não informado"}</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Motivo da Rejeição</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Informe o motivo da rejeição..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white mb-6"
            rows={4}
          />

          <div className="flex space-x-4">
            <button
              onClick={handleReject}
              disabled={processing || !reason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processando...
                </>
              ) : (
                "Confirmar Rejeição"
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
