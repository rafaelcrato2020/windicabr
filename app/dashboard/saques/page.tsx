"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Info, Lock, Unlock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { createBrowserClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

// Função para formatar números com separadores
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Função para formatar números sem o símbolo de moeda
function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Interface para investimentos
interface Investment {
  id: string
  amount: number
  total_earnings: number
  created_at: string
  status: string
  is_withdrawable: boolean
}

export default function SaquesPage() {
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [withdrawAmountFormatted, setWithdrawAmountFormatted] = useState("0,00")
  const [walletAddress, setWalletAddress] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [activeTab, setActiveTab] = useState("withdraw")
  const [showMinimumAlert, setShowMinimumAlert] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [commissionBalance, setCommissionBalance] = useState(0)
  const [earningsBalance, setEarningsBalance] = useState(0)
  const [withdrawableBalance, setWithdrawableBalance] = useState(0)
  const [withdrawablePrincipal, setWithdrawablePrincipal] = useState(0)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [selectedWithdrawalType, setSelectedWithdrawalType] = useState("earnings_commissions")
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const supabase = createBrowserClient()
  const { toast } = useToast()

  // Verificar e atualizar a estrutura da tabela withdrawals
  useEffect(() => {
    async function checkAndUpdateWithdrawalsTable() {
      try {
        // Verificar se a tabela withdrawals existe
        const { error: tableCheckError } = await supabase.from("withdrawals").select("id").limit(1)

        if (tableCheckError) {
          if (tableCheckError.message.includes("does not exist")) {
            console.log("Tabela withdrawals não existe, criando...")

            // Criar a tabela withdrawals com todas as colunas necessárias
            await supabase.rpc("exec_sql", {
              sql_query: `
                CREATE TABLE IF NOT EXISTS public.withdrawals (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  user_id UUID REFERENCES auth.users(id),
                  amount DECIMAL(15, 2) NOT NULL,
                  status TEXT DEFAULT 'pending',
                  pix_key TEXT,
                  notes TEXT,
                  withdrawal_type TEXT,
                  investment_id UUID,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
              `,
            })
            console.log("Tabela withdrawals criada com sucesso")
          }
        } else {
          // A tabela existe, verificar se a coluna withdrawal_type existe
          try {
            const { error: columnCheckError } = await supabase.from("withdrawals").select("withdrawal_type").limit(1)

            if (columnCheckError && columnCheckError.message.includes("column")) {
              console.log("Coluna withdrawal_type não existe, adicionando...")

              // Adicionar a coluna withdrawal_type
              await supabase.rpc("exec_sql", {
                sql_query: `
                  ALTER TABLE public.withdrawals 
                  ADD COLUMN IF NOT EXISTS withdrawal_type TEXT;
                `,
              })
              console.log("Coluna withdrawal_type adicionada com sucesso")
            }
          } catch (err) {
            console.error("Erro ao verificar coluna withdrawal_type:", err)
          }

          // Verificar se a coluna investment_id existe
          try {
            const { error: columnCheckError } = await supabase.from("withdrawals").select("investment_id").limit(1)

            if (columnCheckError && columnCheckError.message.includes("column")) {
              console.log("Coluna investment_id não existe, adicionando...")

              // Adicionar a coluna investment_id
              await supabase.rpc("exec_sql", {
                sql_query: `
                  ALTER TABLE public.withdrawals 
                  ADD COLUMN IF NOT EXISTS investment_id UUID;
                `,
              })
              console.log("Coluna investment_id adicionada com sucesso")
            }
          } catch (err) {
            console.error("Erro ao verificar coluna investment_id:", err)
          }
        }
      } catch (err) {
        console.error("Erro ao verificar/atualizar tabela withdrawals:", err)
      }
    }

    checkAndUpdateWithdrawalsTable()
  }, [supabase])

  // Buscar dados do usuário, incluindo saldo, comissões, rendimentos e investimentos
  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true)

        // Obter a sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.error("Usuário não autenticado")
          setLoading(false)
          return
        }

        // Buscar o perfil do usuário com o saldo
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError)
        } else if (profileData) {
          setUserBalance(profileData.balance || 0)

          // Buscar comissões de indicações e rendimentos de forma mais abrangente
          const { data: commissionsData, error: commissionsError } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", session.user.id)
            .in("type", ["commission", "referral"])
            .eq("status", "completed")

          if (commissionsError) {
            console.error("Erro ao buscar comissões:", commissionsError)
          } else {
            const totalCommissions = commissionsData
              .filter((item) => item.type === "commission" || item.type === "referral")
              .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
            setCommissionBalance(totalCommissions)
          }

          // Buscar rendimentos incluindo yields
          const { data: earningsData, error: earningsError } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", session.user.id)
            .in("type", ["earning", "yield"])
            .eq("status", "completed")

          if (earningsError) {
            console.error("Erro ao buscar rendimentos:", earningsError)
          } else {
            const totalEarnings = earningsData
              .filter((item) => item.type === "earning" || item.type === "yield")
              .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
            setEarningsBalance(totalEarnings)
          }

          // Calcular saldo disponível para saque (comissões + rendimentos)
          const totalWithdrawable =
            (commissionsData ? commissionsData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0) +
            (earningsData ? earningsData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0)
          setWithdrawableBalance(totalWithdrawable)

          // Buscar investimentos
          const { data: investmentsData, error: investmentsError } = await supabase
            .from("investments")
            .select("id, amount, total_earnings, created_at, status")
            .eq("user_id", session.user.id)
            .eq("status", "active")

          if (investmentsError) {
            console.error("Erro ao buscar investimentos:", investmentsError)
          } else if (investmentsData) {
            // Processar investimentos para determinar quais podem ser sacados
            const processedInvestments = investmentsData.map((investment) => {
              // Um investimento pode ser sacado quando o total de rendimentos é >= 100% do valor investido
              const isWithdrawable = (investment.total_earnings || 0) >= investment.amount
              return {
                ...investment,
                is_withdrawable: isWithdrawable,
              }
            })

            setInvestments(processedInvestments)

            // Calcular o total de principal que pode ser sacado
            const totalWithdrawablePrincipal = processedInvestments
              .filter((inv) => inv.is_withdrawable)
              .reduce((sum, inv) => sum + inv.amount, 0)

            setWithdrawablePrincipal(totalWithdrawablePrincipal)
          }
        }

        // Buscar histórico de saques
        try {
          const { data: withdrawalsData, error: withdrawalsError } = await supabase
            .from("withdrawals")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

          if (!withdrawalsError && withdrawalsData) {
            setWithdrawals(withdrawalsData)
          } else if (withdrawalsError && !withdrawalsError.message.includes("does not exist")) {
            console.error("Erro ao buscar histórico de saques:", withdrawalsError)
          }
        } catch (err) {
          console.log("Tabela de saques pode não existir ainda:", err)
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  // Inicializa o valor formatado
  useEffect(() => {
    setWithdrawAmountFormatted(formatNumber(withdrawAmount))
  }, [])

  // Atualizar o valor máximo quando o tipo de saque muda
  useEffect(() => {
    if (selectedWithdrawalType === "earnings_commissions") {
      if (withdrawAmount > withdrawableBalance) {
        setWithdrawAmount(withdrawableBalance)
        setWithdrawAmountFormatted(formatNumber(withdrawableBalance))
      }
    } else if (selectedWithdrawalType === "principal" && selectedInvestment) {
      const investment = investments.find((inv) => inv.id === selectedInvestment)
      if (investment && withdrawAmount > investment.amount) {
        setWithdrawAmount(investment.amount)
        setWithdrawAmountFormatted(formatNumber(investment.amount))
      }
    }
  }, [selectedWithdrawalType, selectedInvestment, withdrawableBalance, investments, withdrawAmount])

  const handleWithdraw = () => {
    if (withdrawAmount < 2.2) {
      setShowMinimumAlert(true)
      return
    }

    if (selectedWithdrawalType === "earnings_commissions" && withdrawAmount > withdrawableBalance) {
      toast({
        title: "Erro",
        description:
          "Saldo insuficiente para realizar este saque. Você só pode sacar comissões e rendimentos disponíveis.",
        variant: "destructive",
      })
      return
    }

    if (selectedWithdrawalType === "principal") {
      if (!selectedInvestment) {
        toast({
          title: "Erro",
          description: "Selecione um investimento para sacar o valor principal.",
          variant: "destructive",
        })
        return
      }

      const investment = investments.find((inv) => inv.id === selectedInvestment)
      if (!investment) {
        toast({
          title: "Erro",
          description: "Investimento não encontrado.",
          variant: "destructive",
        })
        return
      }

      if (!investment.is_withdrawable) {
        toast({
          title: "Erro",
          description:
            "Este investimento ainda não pode ser sacado. É necessário que ele gere 100% de retorno primeiro.",
          variant: "destructive",
        })
        return
      }

      if (withdrawAmount > investment.amount) {
        toast({
          title: "Erro",
          description: "O valor do saque não pode exceder o valor do investimento.",
          variant: "destructive",
        })
        return
      }
    }

    if (withdrawAmount >= 2.2 && walletAddress) {
      setShowMinimumAlert(false)
      setShowConfirmation(true)
    }
  }

  // Manipulador para o input de saque
  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Se o valor estiver vazio, define como zero
    if (!value) {
      setWithdrawAmount(0)
      setWithdrawAmountFormatted("0,00")
      return
    }

    // Remove formatação para obter apenas os números
    const numericValue = value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")

    // Converte para número
    const numberValue = Number.parseFloat(numericValue)

    if (isNaN(numberValue)) {
      return // Se não for um número válido, não atualiza
    }

    // Atualiza o estado com o valor numérico
    setWithdrawAmount(numberValue)

    // Formata o valor para exibição
    setWithdrawAmountFormatted(formatNumber(numberValue))

    // Esconde o alerta se o valor for válido
    if (numberValue >= 2.2) {
      setShowMinimumAlert(false)
    }
  }

  // Função para confirmar o saque
  const confirmWithdrawal = async () => {
    if (withdrawAmount < 2.2 || !walletAddress) {
      return
    }

    setSubmitting(true)

    try {
      // Obter a sessão atual
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Usuário não autenticado")
      }

      // Verificar saldo novamente
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", session.user.id)
        .single()

      if (userError) {
        throw new Error("Erro ao verificar saldo")
      }

      // Verificar tipo de saque e validar
      if (selectedWithdrawalType === "earnings_commissions") {
        // Verificar se o valor do saque não excede o saldo disponível para saque
        if (withdrawAmount > withdrawableBalance) {
          throw new Error(
            "Saldo insuficiente para realizar este saque. Você só pode sacar comissões e rendimentos disponíveis.",
          )
        }

        // Usar SQL direto para inserir o registro de saque
        const { error: insertError } = await supabase.rpc("exec_sql", {
          sql_query: `
            INSERT INTO public.withdrawals 
            (id, user_id, amount, pix_key, status, withdrawal_type, created_at, updated_at)
            VALUES 
            (gen_random_uuid(), '${session.user.id}', ${withdrawAmount}, '${walletAddress.replace(/'/g, "''")}', 'pending', 'commission_and_earnings', NOW(), NOW())
          `,
        })

        if (insertError) {
          console.error("Erro detalhado ao registrar saque:", insertError)
          throw new Error(`Erro ao registrar solicitação de saque: ${insertError.message}`)
        }
      } else if (selectedWithdrawalType === "principal") {
        if (!selectedInvestment) {
          throw new Error("Selecione um investimento para sacar o valor principal.")
        }

        // Verificar se o investimento existe e pode ser sacado
        const { data: investmentData, error: investmentError } = await supabase
          .from("investments")
          .select("id, amount, total_earnings, status")
          .eq("id", selectedInvestment)
          .eq("user_id", session.user.id)
          .single()

        if (investmentError || !investmentData) {
          throw new Error("Investimento não encontrado ou não pertence a este usuário.")
        }

        // Verificar se o investimento já rendeu 100%
        if ((investmentData.total_earnings || 0) < investmentData.amount) {
          throw new Error(
            "Este investimento ainda não pode ser sacado. É necessário que ele gere 100% de retorno primeiro.",
          )
        }

        // Verificar se o valor do saque não excede o valor do investimento
        if (withdrawAmount > investmentData.amount) {
          throw new Error("O valor do saque não pode exceder o valor do investimento.")
        }

        // Usar SQL direto para inserir o registro de saque
        const { error: insertError } = await supabase.rpc("exec_sql", {
          sql_query: `
            INSERT INTO public.withdrawals 
            (id, user_id, amount, pix_key, status, withdrawal_type, investment_id, created_at, updated_at)
            VALUES 
            (gen_random_uuid(), '${session.user.id}', ${withdrawAmount}, '${walletAddress.replace(/'/g, "''")}', 'pending', 'principal', '${selectedInvestment}', NOW(), NOW())
          `,
        })

        if (insertError) {
          console.error("Erro detalhado ao registrar saque:", insertError)
          throw new Error(`Erro ao registrar solicitação de saque: ${insertError.message}`)
        }

        // 2. Atualizar status do investimento se o valor sacado for igual ao valor do investimento
        if (withdrawAmount === investmentData.amount) {
          const { error: updateInvestmentError } = await supabase
            .from("investments")
            .update({ status: "closed" })
            .eq("id", selectedInvestment)

          if (updateInvestmentError) {
            console.error("Erro ao atualizar status do investimento:", updateInvestmentError)
          }
        }
      }

      // 3. Atualizar saldo do usuário
      const newBalance = userData.balance - withdrawAmount
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", session.user.id)

      if (updateError) {
        throw new Error("Erro ao atualizar saldo")
      }

      // 4. Criar registro de transação
      await supabase.from("transactions").insert({
        user_id: session.user.id,
        amount: withdrawAmount,
        type: "withdrawal",
        description:
          selectedWithdrawalType === "earnings_commissions"
            ? "Solicitação de saque (comissões e rendimentos)"
            : "Solicitação de saque (valor principal)",
        status: "pending",
      })

      // Atualizar saldo local
      setUserBalance(newBalance)

      if (selectedWithdrawalType === "earnings_commissions") {
        setWithdrawableBalance(withdrawableBalance - withdrawAmount)
      } else if (selectedWithdrawalType === "principal" && selectedInvestment) {
        // Atualizar a lista de investimentos
        setInvestments((prevInvestments) =>
          prevInvestments.map((inv) =>
            inv.id === selectedInvestment
              ? {
                  ...inv,
                  amount: withdrawAmount === inv.amount ? 0 : inv.amount - withdrawAmount,
                  status: withdrawAmount === inv.amount ? "closed" : "active",
                }
              : inv,
          ),
        )

        // Recalcular o total de principal que pode ser sacado
        setWithdrawablePrincipal((prev) => prev - withdrawAmount)
      }

      // Atualizar lista de saques
      try {
        const { data: updatedWithdrawals } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (updatedWithdrawals) {
          setWithdrawals(updatedWithdrawals)
        }
      } catch (err) {
        console.log("Erro ao atualizar lista de saques, mas o saque foi registrado:", err)
      }

      // Mostrar mensagem de sucesso
      toast({
        title: "Solicitação enviada",
        description: "Seu saque foi solicitado com sucesso e será processado em até 24 horas.",
        variant: "success",
      })

      // Limpar formulário
      setWithdrawAmount(0)
      setWithdrawAmountFormatted("0,00")
      setWalletAddress("")
      setShowConfirmation(false)
      setActiveTab("history")
      setSelectedInvestment(null)
    } catch (error: any) {
      console.error("Erro ao processar saque:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar seu saque",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Função para formatar status do saque
  const formatStatus = (status: string) => {
    switch (status) {
      case "approved":
        return { text: "Aprovado", class: "bg-green-500/20 text-green-500" }
      case "rejected":
        return { text: "Rejeitado", class: "bg-red-500/20 text-red-500" }
      case "pending":
      default:
        return { text: "Pendente", class: "bg-yellow-500/20 text-yellow-500" }
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  // Função para calcular o percentual de rendimento
  const calculateReturnPercentage = (investment: Investment) => {
    if (!investment.amount) return 0
    return ((investment.total_earnings || 0) / investment.amount) * 100
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Saques</h1>
        </div>
      </header>

      <div className="container py-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-green-900/50">
              <CardHeader>
                <CardTitle>Solicitar Saque</CardTitle>
                <CardDescription>Saque suas comissões, rendimentos ou valor principal quando elegível.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="withdraw" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-black/50">
                    <TabsTrigger value="withdraw">Solicitar Saque</TabsTrigger>
                    <TabsTrigger value="history">Histórico de Saques</TabsTrigger>
                  </TabsList>
                  <TabsContent value="withdraw" className="space-y-6 mt-6">
                    <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Informação</AlertTitle>
                      <AlertDescription>
                        Você pode sacar comissões e rendimentos a qualquer momento. O valor principal investido só pode
                        ser sacado quando o investimento render 100% do valor investido. Saque mínimo: $2,20 USDT.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo de Saque</Label>
                        <RadioGroup
                          value={selectedWithdrawalType}
                          onValueChange={setSelectedWithdrawalType}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          <div
                            className={`flex items-center space-x-2 rounded-md border ${selectedWithdrawalType === "earnings_commissions" ? "border-green-500" : "border-green-900/50"} p-3 bg-black/30`}
                          >
                            <RadioGroupItem value="earnings_commissions" id="earnings_commissions" />
                            <Label htmlFor="earnings_commissions" className="flex-1 cursor-pointer">
                              <div className="font-medium">Comissões e Rendimentos</div>
                              <div className="text-sm text-gray-400">
                                Disponível: {formatCurrency(withdrawableBalance)}
                              </div>
                            </Label>
                          </div>
                          <div
                            className={`flex items-center space-x-2 rounded-md border ${selectedWithdrawalType === "principal" ? "border-green-500" : "border-green-900/50"} p-3 bg-black/30`}
                          >
                            <RadioGroupItem value="principal" id="principal" />
                            <Label htmlFor="principal" className="flex-1 cursor-pointer">
                              <div className="font-medium">Valor Principal</div>
                              <div className="text-sm text-gray-400">
                                Disponível: {formatCurrency(withdrawablePrincipal)}
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {selectedWithdrawalType === "principal" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selecione o Investimento</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {investments.length > 0 ? (
                              investments.map((investment) => (
                                <div
                                  key={investment.id}
                                  className={`flex items-center justify-between rounded-md border ${selectedInvestment === investment.id ? "border-green-500" : "border-green-900/50"} p-3 bg-black/30 cursor-pointer ${!investment.is_withdrawable ? "opacity-70" : ""}`}
                                  onClick={() => investment.is_withdrawable && setSelectedInvestment(investment.id)}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">{formatCurrency(investment.amount)}</div>
                                      <div className="text-xs text-gray-400">{formatDate(investment.created_at)}</div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="text-sm text-gray-400">
                                        Rendimento: {formatCurrency(investment.total_earnings || 0)}
                                        <span className="ml-1 text-xs">
                                          ({calculateReturnPercentage(investment).toFixed(0)}%)
                                        </span>
                                      </div>
                                      {investment.is_withdrawable ? (
                                        <span className="flex items-center text-xs text-green-500">
                                          <Unlock className="h-3 w-3 mr-1" /> Disponível
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-xs text-yellow-500">
                                          <Lock className="h-3 w-3 mr-1" /> Bloqueado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-400">Nenhum investimento encontrado</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="amount" className="text-sm font-medium">
                            Valor do Saque (USDT)
                          </Label>
                          <span className="text-sm text-gray-400">
                            Disponível:{" "}
                            {selectedWithdrawalType === "earnings_commissions"
                              ? formatCurrency(withdrawableBalance)
                              : selectedInvestment
                                ? formatCurrency(investments.find((inv) => inv.id === selectedInvestment)?.amount || 0)
                                : "Selecione um investimento"}
                          </span>
                        </div>
                        {/* Campo de entrada com formatação */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <Input
                              id="amount"
                              type="text"
                              value={withdrawAmountFormatted}
                              onChange={handleWithdrawAmountChange}
                              className="bg-black/50 border-green-900/50 pl-8"
                            />
                          </div>
                          <Button
                            variant="outline"
                            className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                            onClick={() => {
                              if (selectedWithdrawalType === "earnings_commissions") {
                                setWithdrawAmount(withdrawableBalance)
                                setWithdrawAmountFormatted(formatNumber(withdrawableBalance))
                              } else if (selectedWithdrawalType === "principal" && selectedInvestment) {
                                const investment = investments.find((inv) => inv.id === selectedInvestment)
                                if (investment) {
                                  setWithdrawAmount(investment.amount)
                                  setWithdrawAmountFormatted(formatNumber(investment.amount))
                                }
                              }
                              setShowMinimumAlert(false)
                            }}
                          >
                            Máx
                          </Button>
                        </div>
                      </div>

                      {/* Alerta de valor mínimo */}
                      {showMinimumAlert && (
                        <Alert className="bg-red-500/10 border-red-900/50 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Valor mínimo</AlertTitle>
                          <AlertDescription>O valor mínimo para saque é $2,20 USDT.</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="pixKey" className="text-sm font-medium">
                          Carteira de USDT (Rede TRC20)
                        </Label>
                        <Input
                          id="pixKey"
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="Insira o endereço da sua carteira USDT"
                          className="bg-black/50 border-green-900/50"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-black font-medium"
                          onClick={handleWithdraw}
                          disabled={
                            !walletAddress ||
                            (selectedWithdrawalType === "earnings_commissions" && withdrawableBalance <= 0) ||
                            (selectedWithdrawalType === "principal" &&
                              (!selectedInvestment || withdrawablePrincipal <= 0))
                          }
                        >
                          Solicitar Saque
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="space-y-6 mt-6">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                      </div>
                    ) : withdrawals.length > 0 ? (
                      <div className="space-y-4">
                        {withdrawals.map((withdrawal) => {
                          const status = formatStatus(withdrawal.status)
                          return (
                            <div key={withdrawal.id} className="bg-black/50 border border-green-900/50 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-red-500 font-bold">{formatCurrency(withdrawal.amount)}</p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {new Date(withdrawal.created_at).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                <div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                                    {status.text}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs text-gray-400">Tipo</p>
                                <p className="text-sm text-gray-300">
                                  {withdrawal.withdrawal_type === "principal"
                                    ? "Valor Principal"
                                    : "Comissões e Rendimentos"}
                                </p>
                              </div>
                              <div className="mt-3 pt-3 border-t border-green-900/30">
                                <p className="text-xs text-gray-400">Carteira USDT (TRC20)</p>
                                <p className="text-sm text-gray-300 break-all">{withdrawal.pix_key}</p>
                              </div>
                              {withdrawal.notes && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-400">Observações</p>
                                  <p className="text-sm text-gray-300">{withdrawal.notes}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                          <Info className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Nenhum saque encontrado</h3>
                        <p className="text-gray-400 max-w-md">
                          Você ainda não realizou nenhum saque. Quando você solicitar um saque, ele aparecerá aqui.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-black/40 border-green-900/50 sticky top-24">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>Visão geral dos seus fundos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Saldo Total</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(userBalance)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Comissões e Rendimentos</p>
                    <p className="text-2xl font-bold text-yellow-500">{formatCurrency(withdrawableBalance)}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-black/30 p-2 rounded-md">
                        <p className="text-xs text-gray-400">Comissões</p>
                        <p className="text-sm font-medium text-green-500">{formatCurrency(commissionBalance)}</p>
                      </div>
                      <div className="bg-black/30 p-2 rounded-md">
                        <p className="text-xs text-gray-400">Rendimentos</p>
                        <p className="text-sm font-medium text-green-500">{formatCurrency(earningsBalance)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Principal Disponível para Saque</p>
                    <p className="text-2xl font-bold text-blue-500">{formatCurrency(withdrawablePrincipal)}</p>
                    <p className="text-xs text-gray-400">
                      Investimentos que já renderam 100% do valor investido podem ter o principal sacado.
                    </p>
                  </div>

                  <div className="border-t border-green-900/30 pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Informações de Saque</p>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>• Saque mínimo: $2,20 USDT</p>
                      <p>• Rede suportada: TRC20</p>
                      <p>• Tempo de processamento: até 24h</p>
                      <p>• Taxa de saque: 0%</p>
                      <p>• Principal só pode ser sacado após 100% de rendimento</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de saque */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Saque</DialogTitle>
            <DialogDescription>Revise os detalhes do seu saque antes de confirmar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-black/50 border border-green-900/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Tipo de Saque:</span>
                <span className="text-sm font-medium text-white">
                  {selectedWithdrawalType === "earnings_commissions" ? "Comissões e Rendimentos" : "Valor Principal"}
                </span>
              </div>
              {selectedWithdrawalType === "principal" && selectedInvestment && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Investimento:</span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(investments.find((inv) => inv.id === selectedInvestment)?.amount || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Valor do Saque:</span>
                <span className="text-sm font-medium text-white">{formatCurrency(withdrawAmount)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Taxa de Saque:</span>
                <span className="text-sm font-medium text-green-500">{formatCurrency(0)} USDT (0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total a Receber:</span>
                <span className="text-sm font-medium text-white">{formatCurrency(withdrawAmount)} USDT</span>
              </div>
              <div className="pt-2 border-t border-green-900/30">
                <span className="text-sm text-gray-400">Carteira de USDT:</span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-white break-all">{walletAddress}</p>
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-500/10 border-yellow-900/50 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Verifique se o endereço da carteira está correto. Saques enviados para endereços incorretos não podem
                ser recuperados.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-green-900/50 text-green-500 hover:bg-green-900/20"
              onClick={() => setShowConfirmation(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-black font-medium"
              onClick={confirmWithdrawal}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processando...
                </>
              ) : (
                "Confirmar Saque"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
