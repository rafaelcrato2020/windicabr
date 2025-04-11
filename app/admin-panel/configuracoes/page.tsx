"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [initStatus, setInitStatus] = useState<{
    message: string
    type: "info" | "success" | "error"
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Atualizar a função handleInitTables para redirecionar para a nova página
  const handleInitTables = () => {
    router.push("/admin-panel/configuracoes/init-database")
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
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white disabled:opacity-50 mb-4"
            >
              {loading ? "Inicializando..." : "Inicializar Tabelas"}
            </button>

            <Link
              href="/admin-panel/configuracoes/sync-users"
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-center block"
            >
              Sincronizar Usuários
            </Link>
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
