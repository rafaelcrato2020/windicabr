"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EmailConfirmationSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { success: boolean; message: string }>(null)
  const { toast } = useToast()

  const handleDisableEmailConfirmation = async () => {
    if (loading) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/disable-email-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao desativar confirmação de email")
      }

      setResult({
        success: true,
        message: data.message || "Confirmação de email desativada com sucesso para todos os usuários",
      })

      toast({
        title: "Operação concluída",
        description: "Confirmação de email desativada com sucesso",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Erro:", error)
      setResult({
        success: false,
        message: error.message || "Ocorreu um erro ao desativar a confirmação de email",
      })

      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao desativar a confirmação de email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configurações de Confirmação de Email</h1>

      <Card className="bg-black/40 border-green-900/50">
        <CardHeader>
          <CardTitle>Desativar Confirmação de Email</CardTitle>
          <CardDescription>
            Esta opção desativa a necessidade de confirmação de email para todos os usuários existentes no sistema.
            Novos usuários já são registrados com email confirmado automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-500 mb-4">
            <AlertCircle className="inline-block mr-2" size={16} />
            Atenção: Esta ação afetará todos os usuários do sistema e não pode ser desfeita.
          </p>

          {result && (
            <div
              className={`p-4 rounded-md mb-4 ${result.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
            >
              {result.success ? (
                <p className="flex items-center text-green-500">
                  <CheckCircle className="mr-2" size={16} />
                  {result.message}
                </p>
              ) : (
                <p className="flex items-center text-red-500">
                  <AlertCircle className="mr-2" size={16} />
                  {result.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleDisableEmailConfirmation}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
              </>
            ) : (
              "Desativar Confirmação de Email para Todos os Usuários"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
