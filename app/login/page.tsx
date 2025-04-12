"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Zap, Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [supabase, setSupabase] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })

  useEffect(() => {
    // Inicializar o cliente Supabase após a montagem do componente
    const client = createBrowserClient()
    setSupabase(client)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("Erro de conexão com o servidor")
      setLoading(false)
      toast({
        title: "Erro no login",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Tentando login com:", formData.email)

      // Tentar fazer login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      })

      if (loginError) {
        console.error("Erro no login:", loginError)

        // Verificar se o erro é de e-mail não confirmado
        if (loginError.message.includes("Email not confirmed")) {
          // Tentar confirmar o e-mail automaticamente via API
          try {
            const response = await fetch("/api/auto-confirm-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: formData.email }),
            })

            if (response.ok) {
              // Tentar login novamente após confirmar o e-mail
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.senha,
              })

              if (retryError) {
                throw retryError
              }

              // Login bem-sucedido após confirmação automática
              toast({
                title: "Login realizado com sucesso!",
                description: "Redirecionando para o dashboard...",
                variant: "default",
              })

              setTimeout(() => {
                router.push("/dashboard")
              }, 1000)
              return
            } else {
              // Se a API retornar erro, mostrar mensagem amigável
              setError("Não foi possível confirmar seu e-mail automaticamente. Entre em contato com o suporte.")
              toast({
                title: "Erro na confirmação de e-mail",
                description: "Por favor, entre em contato com o suporte para ativar sua conta.",
                variant: "destructive",
              })
            }
          } catch (apiError) {
            console.error("Erro ao chamar API de confirmação:", apiError)
            setError("Erro ao tentar confirmar seu e-mail. Entre em contato com o suporte.")
          }
        } else {
          // Para outros erros de login
          let errorMessage = loginError.message

          // Mensagens mais amigáveis para erros comuns
          if (errorMessage.includes("Invalid login credentials")) {
            errorMessage = "E-mail ou senha incorretos."
          }

          setError(errorMessage)
          toast({
            title: "Erro no login",
            description: errorMessage,
            variant: "destructive",
          })
        }

        setLoading(false)
        return
      }

      if (data?.session) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
          variant: "default",
        })

        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      }
    } catch (error: any) {
      console.error("Erro no login:", error)
      setError(error.message || "Erro ao fazer login")
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="w-full border-b bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
              FOREXITY
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-white hover:text-yellow-500 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="absolute top-1/4 left-0 h-1/2 w-px bg-gradient-to-b from-transparent via-yellow-500 to-transparent" />
          <div className="absolute top-1/4 right-0 h-1/2 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent" />

          {/* Decorative circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-red-500/5 blur-3xl" />
        </div>

        <div className="w-full max-w-md z-10">
          <div className="relative bg-black/40 backdrop-blur-xl border border-green-900/50 rounded-lg p-1 overflow-hidden">
            {/* Border glow effects */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent" />

            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                  Login FOREXITY
                </h1>
                <p className="text-gray-400 mt-2">Entre na sua conta para acessar o dashboard</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Digite seu e-mail"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="senha">Senha</Label>
                    <Link href="/recuperar-senha" className="text-xs text-green-500 hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-green-500 hover:underline">
                  Cadastre-se
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
