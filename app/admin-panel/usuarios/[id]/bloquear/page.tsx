"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function BlockUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", params.id).single()

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do usuário",
          variant: "destructive",
        })
        router.push("/admin-panel/usuarios")
        return
      }

      setUser(data)
      setLoading(false)
    }

    fetchUser()
  }, [params.id, router, supabase, toast])

  const handleToggleBlock = async () => {
    if (!user.is_active && !reason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o motivo do bloqueio",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    // Atualizar o status do usuário
    const newStatus = user.is_active === false
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: !user.is_active,
        notes: !user.is_active ? null : reason,
      })
      .eq("id", params.id)

    if (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ${newStatus ? "desbloquear" : "bloquear"} o usuário`,
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    toast({
      title: "Sucesso",
      description: `Usuário ${newStatus ? "desbloqueado" : "bloqueado"} com sucesso`,
      variant: "default",
    })

    router.push("/admin-panel/usuarios")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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

  const isBlocking = user.is_active !== false

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{isBlocking ? "Bloquear" : "Desbloquear"} Usuário</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
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
            <p className="text-gray-400 text-sm">Status Atual</p>
            <p className="font-medium">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  user.is_active !== false ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {user.is_active !== false ? "Ativo" : "Bloqueado"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Data de Cadastro</p>
            <p className="font-medium">
              {user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "-"}
            </p>
          </div>
        </div>

        {isBlocking && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">Motivo do Bloqueio</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Informe o motivo do bloqueio..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white mb-6"
              rows={4}
              required={isBlocking}
            />
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleToggleBlock}
            disabled={processing || (isBlocking && !reason.trim())}
            className={`px-4 py-2 rounded-md text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
              isBlocking ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {processing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Processando...
              </>
            ) : isBlocking ? (
              "Confirmar Bloqueio"
            ) : (
              "Confirmar Desbloqueio"
            )}
          </button>
          <button
            onClick={() => router.push("/admin-panel/usuarios")}
            disabled={processing}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
