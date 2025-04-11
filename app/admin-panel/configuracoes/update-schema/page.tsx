"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function UpdateSchemaPage() {
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateSchema = async () => {
    setUpdating(true)

    try {
      const response = await fetch("/api/update-schema")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sucesso",
          description: data.message,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro",
          description: data.error || "Ocorreu um erro ao atualizar o esquema",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o esquema",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Atualizar Esquema do Banco de Dados</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-2xl">
        <h2 className="text-xl font-bold mb-6 text-yellow-400">Adicionar Colunas Necessárias</h2>

        <p className="mb-6 text-gray-300">
          Esta operação irá adicionar as colunas necessárias à tabela de perfis para rastrear os rendimentos dos
          usuários. Execute esta operação se estiver enfrentando erros relacionados a colunas ausentes.
        </p>

        <div className="p-4 bg-gray-700 rounded-md mb-6">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">Colunas a serem adicionadas:</h3>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>last_yield_date (Data do último rendimento)</li>
            <li>last_yield_rate (Taxa do último rendimento)</li>
          </ul>
        </div>

        <button
          onClick={handleUpdateSchema}
          disabled={updating}
          className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Atualizando Esquema...
            </>
          ) : (
            "Atualizar Esquema Agora"
          )}
        </button>
      </div>
    </div>
  )
}
