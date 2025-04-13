"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/utils/supabase/client"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogin: () => void
}

export default function RegisterModal({ isOpen, onClose, onOpenLogin }: RegisterModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [supabase, setSupabase] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    termos: false,
  })

  // Obter código de referência da URL, se existir
  const referralCode = searchParams.get("ref") || ""

  useEffect(() => {
    // Inicializar o cliente Supabase após a montagem do componente
    const client = createBrowserClient()
    setSupabase(client)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    if (!formData.termos) {
      setError("Você precisa aceitar os termos de uso")
      setLoading(false)
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
      // Criar usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome,
            referral_code: referralCode,
          },
        },
      })

      if (signUpError) {
        console.error("Erro no cadastro:", signUpError)

        // Mensagens mais amigáveis para erros comuns
        let errorMessage = signUpError.message
        if (errorMessage.includes("already registered")) {
          errorMessage = "Este e-mail já está cadastrado."
        }

        setError(errorMessage)
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Processar código de referência, se existir
      if (referralCode) {
        try {
          await fetch("/api/process-referral", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              referralCode,
              userId: data.user?.id,
              userEmail: formData.email,
            }),
          })
        } catch (refError) {
          console.error("Erro ao processar referência:", refError)
          // Não interromper o fluxo se houver erro no processamento da referência
        }
      }

      // Cadastro bem-sucedido
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
        variant: "default",
      })

      // Tentar confirmar o e-mail automaticamente
      try {
        await fetch("/api/auto-confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        })

        // Tentar fazer login automaticamente
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.senha,
        })

        if (!loginError && loginData?.session) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Redirecionando para o dashboard...",
            variant: "default",
          })

          setTimeout(() => {
            router.push("/dashboard")
          }, 1000)
        } else {
          // Se não conseguir fazer login automático, redirecionar para a página de login
          setTimeout(() => {
            onClose()
            onOpenLogin()
          }, 1500)
        }
      } catch (confirmError) {
        console.error("Erro ao confirmar e-mail:", confirmError)
        // Se não conseguir confirmar o e-mail, redirecionar para a página de login
        setTimeout(() => {
          onClose()
          onOpenLogin()
        }, 1500)
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error)
      setError(error.message || "Erro ao realizar cadastro")
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao realizar o cadastro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="relative bg-black/40 backdrop-blur-xl border border-green-900/50 rounded-lg p-1 overflow-hidden">
          {/* Border glow effects */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent" />

          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white z-10">
            <X size={20} />
          </button>

          <div className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                Cadastre-se na FOREXITY
              </h1>
              <p className="text-gray-400 mt-2">Crie sua conta para começar a investir</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
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

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
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
                    className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20 pr-10"
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

              {referralCode && (
                <div className="space-y-2">
                  <Label>Código de referência</Label>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-md p-2 text-sm text-gray-300">
                    Você foi convidado com o código: <span className="text-green-500 font-medium">{referralCode}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termos"
                  name="termos"
                  checked={formData.termos}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, termos: checked as boolean }))}
                  className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <Label htmlFor="termos" className="text-sm text-gray-400 font-normal">
                  Eu concordo com os{" "}
                  <a href="#" className="text-green-500 hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-green-500 hover:underline">
                    Política de Privacidade
                  </a>
                </Label>
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
                  "Criar conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Já tem uma conta?{" "}
              <button
                onClick={() => {
                  onClose()
                  onOpenLogin()
                }}
                className="text-green-500 hover:underline"
              >
                Faça login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
