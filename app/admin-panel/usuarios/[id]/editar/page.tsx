"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    balance: 0,
    referral_code: "",
  })

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
        setFormData({
          name: data.name || "",
          email: data.email || "",
          balance: data.balance || 0,
          referral_code: data.referral_code || "",
        })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === "balance") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          email: formData.email,
          balance: formData.balance,
          referral_code: formData.referral_code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) throw error

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
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-400 mb-1">
              Saldo (R$)
            </label>
            <input
              type="number"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="referral_code" className="block text-sm font-medium text-gray-400 mb-1">
              Código de Afiliado
            </label>
            <input
              type="text"
              id="referral_code"
              name="referral_code"
              value={formData.referral_code}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white flex-1"
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
