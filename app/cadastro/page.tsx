"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { generateReferralCode } from "@/utils/referral-utils"

export default function Cadastro() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Recuperar o código de referência do localStorage
    const storedReferralCode = localStorage.getItem("referralCode")
    if (storedReferralCode) {
      setReferralCode(storedReferralCode)
      console.log("Código de referência encontrado:", storedReferralCode)
    }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Cadastrar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        const userId = authData.user.id
        const newReferralCode = generateReferralCode()

        // Criar perfil do usuário
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          name,
          email,
          referral_code: newReferralCode,
        })

        if (profileError) throw profileError

        // Se tiver um código de referência, processar a indicação
        if (referralCode) {
          const response = await fetch("/api/process-referral", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              referralCode,
            }),
          })

          const result = await response.json()
          if (!result.success) {
            console.warn("Erro ao processar referência:", result.error)
          } else {
            console.log("Referência processada com sucesso:", result)
          }
        }

        setSuccess(true)

        // Limpar o código de referência do localStorage após o uso
        localStorage.removeItem("referralCode")

        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error)
      setError(error.message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-black border-green-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-green-500 hover:text-green-400 flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </div>
          <CardTitle className="text-2xl text-white mt-4">Criar conta</CardTitle>
          <CardDescription className="text-gray-400">Preencha os dados abaixo para criar sua conta</CardDescription>
          {referralCode && (
            <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-md">
              <p className="text-sm text-green-400 flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Você foi indicado por um usuário. Código: {referralCode}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {success ? (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-md text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <h3 className="text-xl font-bold text-white mb-2">Cadastro realizado com sucesso!</h3>
              <p className="text-gray-300 mb-4">
                Verifique seu e-mail para confirmar sua conta. Você será redirecionado para a página de login em
                instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-black border-green-900 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black border-green-900 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black border-green-900 text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold"
                disabled={loading}
              >
                {loading ? "Processando..." : "Criar conta"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400 text-center">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-green-500 hover:text-green-400">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
