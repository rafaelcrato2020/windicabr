"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simular login bem-sucedido
    setIsLoggedIn(true)

    // Tentar redirecionamento programático (pode não funcionar no preview)
    try {
      router.push("/dashboard")
    } catch (error) {
      console.log("Redirecionamento falhou, use o botão para acessar o dashboard")
    }
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center glow">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white">Login realizado com sucesso!</h1>
          <p className="text-center text-gray-400">Você está autenticado. Agora você pode acessar o dashboard.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/dashboard" passHref>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0 hover-float">
              Acessar Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="text-sm text-gray-400">
            Se o botão acima não funcionar, acesse diretamente:
            <a href="/dashboard" className="block mt-2 text-orange-500 hover:text-orange-400 underline">
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center glow">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-white">Bem-vindo de volta</h1>
        <p className="text-center text-gray-400">Entre na sua conta para acessar o Cash Fund</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10 bg-black/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 bg-black/50 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500/20"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 bg-black/50 text-purple-600 focus:ring-purple-500/20"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
              Lembrar-me
            </label>
          </div>

          <a href="#" className="text-sm text-purple-500 hover:text-purple-400">
            Esqueceu a senha?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0 hover-float"
        >
          Entrar
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Não tem uma conta?{" "}
          <button onClick={onSwitchToRegister} className="text-blue-500 hover:text-blue-400 font-medium">
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  )
}
