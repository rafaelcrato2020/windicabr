"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ApproveDeposit({ params }: { params: { id: string } }) {
  const [deposit, setDeposit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDeposit = async () => {
      const { data, error } = await supabase
        .from("deposits")
        .select("*, profiles(name, email)")
        .eq("id", params.id)
        .single()

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do depósito",
          variant: "destructive",
        })
        router.push("/admin-panel/depositos")
        return
      }

      setDeposit(data)
      setLoading(false)
    }

    fetchDeposit()
  }, [params.id, router, supabase, toast])

  const processReferralCommission = async (userId: string, depositAmount: number) => {
    try {
      // Verificar se o usuário foi indicado por alguém
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", userId)
        .single()

      if (userError || !userData.referred_by) {
        console.log("Usuário não possui indicador ou erro ao buscar:", userError)
        return
      }

      // Buscar informações sobre a estrutura de níveis de indicação
      const referrerId = userData.referred_by

      // Processar comissão de nível 1 (10%)
      const level1Commission = depositAmount * 0.1

      // Atualizar saldo do indicador
      const { data: referrerData, error: referrerError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", referrerId)
        .single()

      if (referrerError) {
        console.error("Erro ao buscar dados do indicador:", referrerError)
        return
      }

      const newReferrerBalance = (referrerData.balance || 0) + level1Commission

      // Atualizar saldo do indicador
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newReferrerBalance })
        .eq("id", referrerId)

      if (updateError) {
        console.error("Erro ao atualizar saldo do indicador:", updateError)
        return
      }

      // Registrar a comissão como transação
      await supabase.from("transactions").insert({
        user_id: referrerId,
        amount: level1Commission,
        type: "referral_commission",
        description: `Comissão de indicação (10%) - Depósito de R$ ${depositAmount.toFixed(2)}`,
        status: "completed",
      })

      // Buscar indicador de nível 2 (se existir)
      const { data: level2Data, error: level2Error } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", referrerId)
        .single()

      if (!level2Error && level2Data.referred_by) {
        // Processar comissão de nível 2 (5%)
        const level2ReferrerId = level2Data.referred_by
        const level2Commission = depositAmount * 0.05

        // Atualizar saldo do indicador nível 2
        const { data: level2ReferrerData, error: level2ReferrerError } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", level2ReferrerId)
          .single()

        if (!level2ReferrerError) {
          const newLevel2Balance = (level2ReferrerData.balance || 0) + level2Commission

          await supabase.from("profiles").update({ balance: newLevel2Balance }).eq("id", level2ReferrerId)

          // Registrar a comissão como transação
          await supabase.from("transactions").insert({
            user_id: level2ReferrerId,
            amount: level2Commission,
            type: "referral_commission",
            description: `Comissão de indicação nível 2 (5%) - Depósito de R$ ${depositAmount.toFixed(2)}`,
            status: "completed",
          })
        }
      }

      console.log("Comissões de indicação processadas com sucesso")
    } catch (error) {
      console.error("Erro ao processar comissões de indicação:", error)
    }
  }

  const handleApprove = async () => {
    setProcessing(true)

    // 1. Atualizar o status do depósito
    const { error: depositError } = await supabase.from("deposits").update({ status: "approved" }).eq("id", params.id)

    if (depositError) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o depósito",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    // 2. Atualizar o saldo do usuário
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", deposit.user_id)
      .single()

    if (userError) {
      toast({
        title: "Erro",
        description: "Não foi possível obter o saldo do usuário",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    const newBalance = (userData.balance || 0) + deposit.amount

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", deposit.user_id)

    if (updateError) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o saldo do usuário",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    // 3. Criar registro de transação
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: deposit.user_id,
      amount: deposit.amount,
      type: "deposit",
      description: "Depósito aprovado",
      status: "completed",
    })

    if (transactionError) {
      toast({
        title: "Aviso",
        description: "Depósito aprovado, mas houve um erro ao registrar a transação",
        variant: "default",
      })
    }

    // 4. Processar comissões de indicação
    await processReferralCommission(deposit.user_id, deposit.amount)

    toast({
      title: "Sucesso",
      description: "Depósito aprovado com sucesso",
      variant: "default",
    })

    router.push("/admin-panel/depositos")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!deposit) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Depósito não encontrado</h2>
        <button
          onClick={() => router.push("/admin-panel/depositos")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Voltar
        </button>
      </div>
    )
  }

  if (deposit.status !== "pending") {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Este depósito já foi processado</h2>
        <p className="mb-6">Status atual: {deposit.status === "approved" ? "Aprovado" : "Rejeitado"}</p>
        <button
          onClick={() => router.push("/admin-panel/depositos")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Aprovar Depósito</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Usuário</p>
            <p className="font-medium">{deposit.profiles?.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-medium">{deposit.profiles?.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Valor</p>
            <p className="font-medium text-green-400">R$ {deposit.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Método</p>
            <p className="font-medium">{deposit.payment_method || "Pix"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data</p>
            <p className="font-medium">{new Date(deposit.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <p className="font-medium">
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">Pendente</span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Confirmação</h3>
          <p className="text-gray-300 mb-6">
            Você está prestes a aprovar um depósito de{" "}
            <span className="font-bold text-green-400">R$ {deposit.amount.toFixed(2)}</span> para o usuário{" "}
            <span className="font-bold">{deposit.profiles?.name}</span>. Esta ação irá adicionar o valor ao saldo do
            usuário e não pode ser desfeita.
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
              onClick={() => router.push("/admin-panel/depositos")}
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
