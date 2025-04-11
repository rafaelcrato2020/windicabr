"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [initStatus, setInitStatus] = useState<{
    message: string
    type: "info" | "success" | "error"
  } | null>(null)
  const { toast } = useToast()

  const handleInitTables = async () => {
    try {
      setLoading(true)
      setInitStatus({ message: "Inicializando tabelas...", type: "info" })

      const response = await fetch("/api/init-tables")
      const data = await response.json()

      if (data.success) {
        setInitStatus({ message: "Tabelas inicializadas com sucesso!", type: "success" })
        toast({
          title: "Sucesso",
          description: "Tabelas inicializadas com sucesso",
        })
      } else {
        setInitStatus({ message: `Erro: ${data.error}`, type: "error" })
        throw new Error(data.error || "Erro ao inicializar tabelas")
      }
    } catch (error: any) {
      console.error("Erro ao inicializar tabelas:", error)
      setInitStatus({ message: `Erro: ${error.message}`, type: "error" })
      toast({
        title: "Erro",
        description: error.message || "Não foi possível inicializar as tabelas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Configurações do Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Banco de Dados</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Inicialize as tabelas do banco de dados necessárias para o funcionamento do sistema.
            </p>
            {initStatus && (
              <div
                className={`p-3 rounded-md mb-4 ${
                  initStatus.type === "info"
                    ? "bg-blue-900 text-blue-200"
                    : initStatus.type === "success"
                      ? "bg-green-900 text-green-200"
                      : "bg-red-900 text-red-200"
                }`}
              >
                {initStatus.message}
              </div>
            )}
            <button
              onClick={handleInitTables}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white disabled:opacity-50"
            >
              {loading ? "Inicializando..." : "Inicializar Tabelas"}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">Configure as opções gerais do sistema.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300  mb-1">Nome da Plataforma</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  defaultValue="WindicaBR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email de Contato</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  defaultValue="contato@windicabr.com"
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="maintenance" className="mr-2" />
                <label htmlFor="maintenance" className="text-sm font-medium text-gray-300">
                  Modo de Manutenção
                </label>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white">
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
