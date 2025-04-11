"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Verificar credenciais específicas
    if (email === "tybeltrader@gmail.com" && password === "@rafael12R") {
      // Login bem-sucedido - redirecionamento imediato
      toast({
        title: "Login bem-sucedido",
        description: "Redirecionando para o painel administrativo...",
        variant: "success",
      })

      // Redirecionamento imediato sem timeout
      router.push("/admin-panel")
    } else {
      // Credenciais inválidas
      setError("Email ou senha incorretos. Por favor, verifique suas credenciais.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-red-500/10 rounded-2xl p-8 backdrop-blur-sm border border-green-500/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text mb-2">
              Acesso Administrativo
            </h1>
            <p className="text-gray-400">Faça login com seu Gmail para acessar o painel</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-900/50 text-red-500">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Gmail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-green-500/20 focus:border-green-500/50 rounded-md text-white"
                placeholder="seu@gmail.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-green-500/20 focus:border-green-500/50 rounded-md text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-red-500 hover:from-green-700 hover:to-red-600 text-black font-bold rounded-md disabled:opacity-50"
            >
              {loading ? "Autenticando..." : "Acessar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
