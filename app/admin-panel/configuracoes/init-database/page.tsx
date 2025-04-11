"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function InitDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [sqlCode, setSqlCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  // Inicializar tabelas diretamente
  const initializeTables = async () => {
    try {
      setLoading(true)
      setError(null)
      setSqlCode(null)

      // Tentar inicializar tabelas diretamente
      const response = await fetch("/api/init-tables")
      const data = await response.json()

      if (!data.success) {
        // Se falhar, pode ser porque a função SQL não existe
        // Tentar configurar a função SQL primeiro
        const setupResponse = await fetch("/api/setup-sql-function")
        const setupData = await setupResponse.json()

        if (!setupData.success) {
          // Se não conseguir configurar automaticamente, mostrar o SQL para execução manual
          if (setupData.sqlToExecute) {
            setSqlCode(setupData.sqlToExecute)
            setError("É necessário executar o SQL manualmente no console do Supabase antes de continuar.")
            return
          }

          throw new Error(setupData.error || "Erro ao configurar função SQL")
        }

        // Tentar inicializar tabelas novamente
        const retryResponse = await fetch("/api/init-tables")
        const retryData = await retryResponse.json()

        if (!retryData.success) {
          throw new Error(retryData.error || "Erro ao inicializar tabelas")
        }
      }

      setSuccess(true)
      toast({
        title: "Sucesso",
        description: "Banco de dados inicializado com sucesso",
        variant: "default",
      })

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/admin-panel/configuracoes")
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao inicializar banco de dados:", err)
      setError(`Erro ao inicializar banco de dados: ${err.message}`)
      toast({
        title: "Erro",
        description: `Erro ao inicializar banco de dados: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Inicializar Banco de Dados</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Configuração do Banco de Dados</h2>
        <p className="text-gray-300 mb-6">
          Este processo irá criar todas as tabelas necessárias para o funcionamento do sistema. Isso inclui tabelas para
          usuários, depósitos, saques, investimentos e configurações.
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md mb-6">
            <p className="font-medium mb-2">Erro</p>
            <p>{error}</p>
          </div>
        )}

        {sqlCode && (
          <div className="bg-blue-900/20 border border-blue-800 text-blue-200 p-4 rounded-md mb-6">
            <p className="font-medium mb-2">Execute este SQL no console do Supabase:</p>
            <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-sm">{sqlCode}</pre>
            <p className="mt-2 text-sm">Após executar o SQL, clique novamente no botão "Inicializar Banco de Dados".</p>
          </div>
        )}

        {success ? (
          <div className="bg-green-900/20 border border-green-800 text-green-200 p-4 rounded-md mb-6">
            <p className="font-medium mb-2">Sucesso!</p>
            <p>Banco de dados inicializado com sucesso. Redirecionando...</p>
          </div>
        ) : (
          <button
            onClick={initializeTables}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Inicializando banco de dados...
              </>
            ) : (
              "Inicializar Banco de Dados"
            )}
          </button>
        )}
      </div>

      <div className="flex justify-between">
        <Link href="/admin-panel/configuracoes" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
          Voltar para Configurações
        </Link>
      </div>
    </div>
  )
}
