"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Zap } from "lucide-react"

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    termos: false,
  })
  const [loading, setLoading] = useState(false)

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

    // Simulação de envio de dados
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Redirecionar para o dashboard após o cadastro
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="w-full border-b bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
              WINDICABR
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
                  Cadastre-se na WINDICABR
                </h1>
                <p className="text-gray-400 mt-2">Crie sua conta e comece a investir nos maiores mercados do mundo</p>
              </div>

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
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
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
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
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
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      placeholder="Crie uma senha forte"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      required
                      className="bg-black/50 border-green-900/50 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termos"
                    checked={formData.termos}
                    onCheckedChange={handleCheckboxChange}
                    className="border-green-900 data-[state=checked]:bg-green-500 data-[state=checked]:text-black"
                  />
                  <label
                    htmlFor="termos"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Concordo com os{" "}
                    <Link href="#" className="text-green-500 hover:underline">
                      termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link href="#" className="text-green-500 hover:underline">
                      política de privacidade
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !formData.termos}
                  className="w-full bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-bold"
                >
                  {loading ? "Processando..." : "Criar minha conta"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-green-500 hover:underline">
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
