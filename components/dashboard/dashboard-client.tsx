"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  wallet_balance: number
  created_at: string
  updated_at: string
}

type Investment = {
  id: string
  user_id: string
  amount: number
  status: "active" | "completed" | "cancelled"
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

type Transaction = {
  id: string
  user_id: string
  type: "deposit" | "withdrawal" | "yield" | "commission"
  amount: number
  status: "pending" | "completed" | "failed"
  description: string | null
  investment_id: string | null
  referral_id: string | null
  created_at: string
  updated_at: string
}

interface DashboardClientProps {
  profile: Profile | null
  activeInvestments: Investment[] | null
  recentTransactions: Transaction[] | null
}

export default function DashboardClient({ profile, activeInvestments, recentTransactions }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://cashfund.com/ref/${profile?.username || ""}`)
    alert("Link copiado!")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo na Carteira</CardDescription>
            <CardTitle className="text-3xl">R$ {profile?.wallet_balance.toFixed(2) || "0.00"}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Investimentos Ativos</CardDescription>
            <CardTitle className="text-3xl">{activeInvestments?.length || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rendimento Diário</CardDescription>
            <CardTitle className="text-3xl">4%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Programa de Afiliados</CardDescription>
            <CardTitle className="text-3xl">10% / 5% / 3%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="investments">Investimentos</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="referrals">Afiliados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Conta</CardTitle>
              <CardDescription>Visão geral dos seus investimentos e rendimentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Bem-vindo ao seu dashboard do Cash Fund!</p>
              <p>
                Aqui você pode acompanhar seus investimentos, rendimentos diários e comissões do programa de afiliados.
              </p>
              <p className="mt-4">
                <a href="/dashboard/calculadoras" className="text-primary hover:underline">
                  Acesse nossas calculadoras de rendimentos e afiliados →
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seus Investimentos</CardTitle>
              <CardDescription>Acompanhe seus investimentos ativos</CardDescription>
            </CardHeader>
            <CardContent>
              {activeInvestments && activeInvestments.length > 0 ? (
                <div className="space-y-4">
                  {activeInvestments.map((investment) => (
                    <div key={investment.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">R$ {investment.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Iniciado em: {new Date(investment.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Ativo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Você não possui investimentos ativos. Comece a investir agora para aproveitar nosso rendimento diário
                  de 4%.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Histórico das suas últimas transações</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {transaction.type === "deposit" && "Depósito"}
                          {transaction.type === "withdrawal" && "Saque"}
                          {transaction.type === "yield" && "Rendimento"}
                          {transaction.type === "commission" && "Comissão"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"}`}
                        >
                          {transaction.type === "withdrawal" ? "-" : "+"} R$ {transaction.amount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status === "completed" && "Concluído"}
                          {transaction.status === "pending" && "Pendente"}
                          {transaction.status === "failed" && "Falhou"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Você não possui transações recentes. Suas transações aparecerão aqui quando você fizer depósitos ou
                  receber rendimentos.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Afiliados</CardTitle>
              <CardDescription>Ganhe comissões indicando novos usuários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-700">10%</p>
                  <p className="text-sm text-green-600">Nível 1</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-700">5%</p>
                  <p className="text-sm text-green-600">Nível 2</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-700">3%</p>
                  <p className="text-sm text-green-600">Nível 3</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="font-medium">Seu link de afiliado:</p>
                <div className="flex mt-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://cashfund.com/ref/${profile?.username || ""}`}
                    className="flex-1 rounded-l-md border border-r-0 px-3 py-2 text-sm"
                  />
                  <button
                    className="rounded-r-md border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    onClick={copyReferralLink}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
