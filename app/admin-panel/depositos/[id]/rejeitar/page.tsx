"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function RejectDeposit({ params }: { params: { id: string } }) {
  const [deposit, setDeposit] = useState<any>(null)
  const [reason, setReason] = useState("")
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

    // Atualizar o status do depósito
    const { error } = await supabase
      .from("deposits")
      .update({
        status: "rejected",
        notes: reason,
      })
      .eq("id", params.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o depósito",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    toast({
      title: "Sucesso",
      description: "Depósito rejeitado com sucesso",
      variant: "default",
    })

    router.push("/admin-panel/depositos")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
      <h1 className="text-3xl font-bold mb-8">Rejeitar Depósito</h1>

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
            <p className="font-medium text-red-400">R$ {deposit.amount.toFixed(2)}</p>
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
              disabled={processing}
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
