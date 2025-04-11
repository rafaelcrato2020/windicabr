"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Zap, Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/utils/supabase/client"

export default function CadastroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref")

  const [supabase, setSupabase] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    termos: false,
    referralCode: refCode || "",
  })

  useEffect(() => {
    // Inicializar o cliente Supabase após a montagem do componente
    const client = createBrowserClient()
    setSupabase(client)

    // Atualizar o código de referência se mudar na URL
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }))
    }
  }, [refCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termos: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar formulário
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem")
      setLoading(false)
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (!supabase) {
      setError("Erro de conexão com o servidor")
      setLoading(false)
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Iniciando cadastro...")

      // Registrar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            name: formData.nome,
            phone: formData.telefone,
            email_confirmed: true, // Marcar o e-mail como confirmado
          },
        },
      })

      if (authError) {
        console.error("Erro ao criar conta:", authError)
        setError(authError.message)
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      console.log("Usuário criado:", authData)

      if (authData.user) {
        // Gerar código de referência único baseado no ID do usuário
        const referralCode = generateReferralCode(authData.user.id)

        // Criar o perfil do usuário
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          name: formData.nome,
          email: formData.email,
          referral_code: referralCode,
        })

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError)
          toast({
            title: "Aviso",
            description: "Conta criada, mas houve um problema ao configurar seu perfil.",
            variant: "default",
          })
        }

        // Processar código de referência se existir
        if (formData.referralCode) {
          try {
            console.log("Processando referência:", formData.referralCode)
            const response = await fetch("/api/process-referral", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: authData.user.id,
                referralCode: formData.referralCode,
              }),
            })

            const referralResult = await response.json()

            if (!response.ok) {
              console.error("Erro ao processar referência:", referralResult)
              toast({
                title: "Aviso",
                description: "Conta criada, mas houve um problema ao processar a referência.",
                variant: "default",
              })
            } else {
              console.log("Referência processada com sucesso:", referralResult)
            }
          } catch (refError) {
            console.error("Erro ao processar referência:", refError)
          }
        }

        // Fazer login automaticamente após o cadastro
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.senha,
        })

        if (signInError) {
          console.error("Erro ao fazer login automático:", signInError)
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Sua conta foi criada. Redirecionando para o login...",
            variant: "default",
          })

          // Redirecionar para a página de login se o login automático falhar
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return
        }

        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta foi criada. Redirecionando para o dashboard...",
          variant: "default",
        })

        // Redirecionar para o dashboard após o login bem-sucedido
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error)
      setError(error.message || "Erro ao criar conta")
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para gerar código de referência único
  const generateReferralCode = (userId: string): string => {
    const timestamp = new Date().getTime().toString(36).slice(-4)
    const userIdPart = userId.replace(/-/g, "").slice(0, 6)
    return `${userIdPart}${timestamp}`.toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="w-full border-b bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
              WINDICABR
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-white hover:text-blue-500 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute top-1/4 left-0 h-1/2 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
          <div className="absolute top-1/4 right-0 h-1/2 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

          {/* Decorative circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="w-full max-w-md z-10">
          <div className="relative bg-black/40 backdrop-blur-xl border border-blue-900/50 rounded-lg p-1 overflow-hidden">
            {/* Border glow effects */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
                  Cadastre-se na WINDICABR
                </h1>
                <p className="text-gray-400 mt-2">Crie sua conta e comece a investir nos maiores mercados do mundo</p>

                {formData.referralCode && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <p className="text-blue-500 text-sm">
                      Você foi convidado por um afiliado! Código: {formData.referralCode}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <Input
                      id="nome"
                      name="nome"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-blue-900/50 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

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
                      className="bg-black/50 border-blue-900/50 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="relative">
                    <Input
                      id="telefone"
                      name="telefone"
                      placeholder="Digite seu telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-blue-900/50 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha forte"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-blue-900/50 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-blue-900/50 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termos"
                    checked={formData.termos}
                    onCheckedChange={handleCheckboxChange}
                    className="border-blue-900 data-[state=checked]:bg-blue-500 data-[state=checked]:text-black"
                  />
                  <label
                    htmlFor="termos"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Concordo com os{" "}
                    <Link href="#" className="text-blue-500 hover:underline">
                      termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link href="#" className="text-blue-500 hover:underline">
                      política de privacidade
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !formData.termos}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                    </>
                  ) : (
                    "Criar minha conta"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-blue-500 hover:underline">
                  Faça login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
