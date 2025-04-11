"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { processReferralCommission } from "@/utils/process-referral-commission"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [balance, setBalance] = useState("")
  const [originalBalance, setOriginalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        setName(data.name || "")
        setEmail(data.email || "")
        setBalance(data.balance ? data.balance.toString() : "0")
        setOriginalBalance(data.balance || 0)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validar os dados
      if (!name.trim()) {
        throw new Error("O nome é obrigatório")
      }

      // Converter o saldo para número
      const numericBalance = Number.parseFloat(balance)
      if (isNaN(numericBalance)) {
        throw new Error("O saldo deve ser um número válido")
      }

      // Atualizar o perfil do usuário
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          balance: numericBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      // Verificar se houve adição de saldo
      const balanceDifference = numericBalance - originalBalance
      if (balanceDifference > 0) {
        // Registrar a transação de adição de saldo
        await supabase.from("transactions").insert({
          user_id: params.id,
          amount: balanceDifference,
          type: "admin_adjustment",
          description: "Ajuste de saldo pelo administrador",
          status: "completed",
        })

        // Processar comissões de indicação para a adição de saldo
        await processReferralCommission(
          params.id,
          balanceDifference,
          `Ajuste de saldo de ${balanceDifference.toFixed(2)}`,
          supabase,
        )
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      })

      router.push(`/admin-panel/usuarios/${params.id}`)
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error)
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o usuário: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Editar Usuário</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium mb-2">
              Saldo (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                id="balance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 pl-8 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Saldo atual: ${originalBalance.toFixed(2)}. Se você aumentar o saldo, comissões de indicação serão
              processadas automaticamente.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin-panel/usuarios/${params.id}`)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
