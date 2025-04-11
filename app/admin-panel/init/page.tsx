"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function InitAdminPanel() {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInit = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/init-admin-tables")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      toast({
        title: "Sucesso",
        description: "Painel administrativo inicializado com sucesso",
        variant: "default",
      })

      setInitialized(true)

      // Redirecionar para o painel após 2 segundos
      setTimeout(() => {
        router.push("/admin-panel")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível inicializar o painel administrativo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-500">
          WINDICABR <span className="text-yellow-500">Admin</span>
        </h1>

        <p className="text-gray-300 mb-8 text-center">
          Inicialize o painel administrativo para gerenciar depósitos, saques, rendimentos e o programa de afiliados.
        </p>

        {initialized ? (
          <div className="text-center">
            <div className="mb-4 text-green-400 text-xl">✓ Inicializado com sucesso!</div>
            <p className="text-gray-300 mb-4">Redirecionando para o painel administrativo...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : (
          <button
            onClick={handleInit}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Inicializando...
              </>
            ) : (
              "Inicializar Painel Administrativo"
            )}
          </button>
        )}

        <div className="mt-6 p-4 bg-gray-700 rounded-md">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">Importante</h3>
          <p className="text-sm text-gray-300">
            Esta ação irá criar as tabelas necessárias para o funcionamento do painel administrativo e definir seu
            usuário como administrador. Execute apenas uma vez.
          </p>
        </div>
      </div>
    </div>
  )
}
