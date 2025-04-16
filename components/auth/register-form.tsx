"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isRegistered, setIsRegistered] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simular registro bem-sucedido
    setIsRegistered(true)

    // Tentar redirecionamento programático (pode não funcionar no preview)
    try {
      router.push("/dashboard")
    } catch (error) {
      console.log("Redirecionamento falhou, use o botão para acessar o dashboard")
    }
  }

  if (isRegistered) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center glow">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white">Cadastro realizado com sucesso!</h1>
          <p className="text-center text-gray-400">Sua conta foi criada. Agora você pode acessar o dashboard.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/dashboard" passHref>
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0 hover-float">
              Acessar Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="text-sm text-gray-400">
            Se o botão acima não funcionar, acesse diretamente:
            <a href="/dashboard" className="block mt-2 text-blue-500 hover:text-blue-400 underline">
              /dashboard
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center glow">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-white">Crie sua conta</h1>
        <p className="text-center text-gray-400">Comece a investir e obter rendimentos diários</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">
            Nome completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              className="pl-10 bg-black/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-gray-300">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10 bg-black/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-gray-300">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 bg-black/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-300">
            Confirmar senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 bg-black/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-700 bg-black/50 text-green-600 focus:ring-green-500/20"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
            Eu concordo com os{" "}
            <a href="#" className="text-blue-500 hover:text-blue-400">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-blue-500 hover:text-blue-400">
              Política de Privacidade
            </a>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0 hover-float"
        >
          Criar Conta
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Já tem uma conta?{" "}
          <button onClick={onSwitchToLogin} className="text-orange-500 hover:text-orange-400 font-medium">
            Entrar
          </button>
        </p>
      </div>
    </div>
  )
}
