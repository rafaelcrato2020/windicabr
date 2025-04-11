"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, DollarSign, Download, Search, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@/utils/supabase/client"

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    investments: 0,
    yields: 0,
    withdrawals: 0,
    commissions: 0,
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Processar transações para exibição
        const processedTransactions = data.map((transaction: any) => {
          let typeLabel = ""
          let statusColor = ""
          let amountPrefix = ""

          switch (transaction.type) {
            case "investment":
              typeLabel = "Investimento"
              amountPrefix = "-"
              break
            case "yield":
              typeLabel = "Rendimento"
              amountPrefix = "+"
              break
            case "withdrawal":
              typeLabel = "Saque"
              amountPrefix = "-"
              break
            case "commission":
              typeLabel = "Comissão"
              amountPrefix = "+"
              break
            case "deposit":
              typeLabel = "Depósito"
              amountPrefix = "+"
              break
            default:
              typeLabel = transaction.type
          }

          switch (transaction.status) {
            case "completed":
              statusColor = "text-green-500"
              break
            case "pending":
              statusColor = "text-yellow-500"
              break
            case "rejected":
              statusColor = "text-red-500"
              break
            default:
              statusColor = "text-gray-400"
          }

          return {
            ...transaction,
            typeLabel,
            statusColor,
            amountDisplay: `${amountPrefix}R$ ${transaction.amount.toFixed(2)}`,
            dateFormatted: new Date(transaction.created_at).toLocaleDateString("pt-BR"),
            timeFormatted: new Date(transaction.created_at).toLocaleTimeString("pt-BR"),
          }
        })

        setTransactions(processedTransactions)

        // Calcular estatísticas
        const stats = processedTransactions.reduce(
          (acc: any, transaction: any) => {
            if (transaction.status !== "completed") return acc

            switch (transaction.type) {
              case "investment":
                acc.investments += transaction.amount
                break
              case "yield":
                acc.yields += transaction.amount
                break
              case "withdrawal":
                acc.withdrawals += transaction.amount
                break
              case "commission":
                acc.commissions += transaction.amount
                break
            }

            return acc
          },
          { investments: 0, yields: 0, withdrawals: 0, commissions: 0 },
        )

        setStats(stats)
      } catch (error) {
        console.error("Erro ao buscar transações:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase])

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction) => {
    // Filtrar por tipo
    if (typeFilter !== "all" && transaction.typeLabel !== typeFilter) {
      return false
    }

    // Filtrar por termo de busca
    if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowDetails(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-green-900/30 bg-black/80 backdrop-blur-xl md:flex hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Transações</h1>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        <Card className="bg-black/40 border-green-900/50">
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Visualize todas as suas transações na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Filtros e busca */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar transações..."
                    className="pl-8 bg-black/50 border-green-900/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-black/50 border-green-900/50">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-900/50">
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="Investimento">Investimento</SelectItem>
                    <SelectItem value="Rendimento">Rendimento</SelectItem>
                    <SelectItem value="Saque">Saque</SelectItem>
                    <SelectItem value="Comissão">Comissão</SelectItem>
                    <SelectItem value="Depósito">Depósito</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-green-900/50 text-green-500 hover:bg-green-900/20">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Lista de transações */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-400 border-b border-green-900/30">
                          <th className="pb-3 pl-4">Tipo</th>
                          <th className="pb-3">Data</th>
                          <th className="pb-3">Descrição</th>
                          <th className="pb-3">Valor</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 pr-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-green-900/30 hover:bg-green-900/10 cursor-pointer"
                            onClick={() => handleTransactionClick(transaction)}
                          >
                            <td className="py-4 pl-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    transaction.type === "investment"
                                      ? "bg-green-500/20"
                                      : transaction.type === "yield"
                                        ? "bg-green-500/20"
                                        : transaction.type === "withdrawal"
                                          ? "bg-red-500/20"
                                          : transaction.type === "commission"
                                            ? "bg-yellow-500/20"
                                            : "bg-blue-500/20"
                                  }`}
                                >
                                  {transaction.type === "investment" ? (
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                  ) : transaction.type === "yield" ? (
                                    <ArrowUp className="h-4 w-4 text-green-500" />
                                  ) : transaction.type === "withdrawal" ? (
                                    <ArrowDown className="h-4 w-4 text-red-500" />
                                  ) : transaction.type === "commission" ? (
                                    <Users className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <DollarSign className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                                <span>{transaction.typeLabel}</span>
                              </div>
                            </td>
                            <td className="py-4">{transaction.dateFormatted}</td>
                            <td className="py-4 max-w-[200px] truncate">{transaction.description}</td>
                            <td
                              className={`py-4 ${
                                transaction.type === "yield" ||
                                transaction.type === "commission" ||
                                transaction.type === "deposit"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {transaction.amountDisplay}
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.status === "completed"
                                    ? "bg-green-500/20 text-green-500"
                                    : transaction.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-500"
                                      : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                {transaction.status === "completed"
                                  ? "Concluído"
                                  : transaction.status === "pending"
                                    ? "Pendente"
                                    : "Rejeitado"}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
                              >
                                Detalhes
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Nenhuma transação encontrada.</p>
                  </div>
                )}
              </div>

              {/* Paginação */}
              {filteredTransactions.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Mostrando {filteredTransactions.length} de {transactions.length} transações
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                      disabled={true}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-900/50 text-green-500 hover:bg-green-900/20"
                      disabled={true}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo de transações */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-500/10 border-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Investimentos</h3>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-500">R$ {stats.investments.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">Total investido</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Rendimentos</h3>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ArrowUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-500">R$ {stats.yields.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">Total de rendimentos</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Saques</h3>
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <ArrowDown className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-500">R$ {stats.withdrawals.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">Total de saques</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500/10 border-yellow-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Comissões</h3>
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-500">R$ {stats.commissions.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">Total de comissões</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de detalhes da transação */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-black/90 border-green-900/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>Informações completas sobre a transação selecionada.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedTransaction.type === "investment" || selectedTransaction.type === "yield"
                      ? "bg-green-500/20"
                      : selectedTransaction.type === "withdrawal"
                        ? "bg-red-500/20"
                        : "bg-yellow-500/20"
                  }`}
                >
                  {selectedTransaction.type === "investment" ? (
                    <DollarSign className="h-6 w-6 text-green-500" />
                  ) : selectedTransaction.type === "yield" ? (
                    <ArrowUp className="h-6 w-6 text-green-500" />
                  ) : selectedTransaction.type === "withdrawal" ? (
                    <ArrowDown className="h-6 w-6 text-red-500" />
                  ) : (
                    <Users className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTransaction.typeLabel}</h3>
                  <p className={`text-sm ${selectedTransaction.statusColor}`}>
                    {selectedTransaction.status === "completed"
                      ? "Concluído"
                      : selectedTransaction.status === "pending"
                        ? "Pendente"
                        : "Rejeitado"}
                  </p>
                </div>
              </div>

              <div className="bg-black/50 border border-green-900/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">ID da Transação:</span>
                  <span className="text-sm font-medium text-white">{selectedTransaction.id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Valor:</span>
                  <span
                    className={`text-sm font-medium ${
                      selectedTransaction.type === "yield" ||
                      selectedTransaction.type === "commission" ||
                      selectedTransaction.type === "deposit"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedTransaction.amountDisplay}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Data:</span>
                  <span className="text-sm font-medium text-white">{selectedTransaction.dateFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Hora:</span>
                  <span className="text-sm font-medium text-white">{selectedTransaction.timeFormatted}</span>
                </div>
                {selectedTransaction.description && (
                  <div className="pt-2 border-t border-green-900/30">
                    <span className="text-sm text-gray-400">Descrição:</span>
                    <p className="text-sm text-white break-all mt-1">{selectedTransaction.description}</p>
                  </div>
                )}
                {selectedTransaction.type === "withdrawal" && selectedTransaction.pix_key && (
                  <div className="pt-2 border-t border-green-900/30">
                    <span className="text-sm text-gray-400">Chave PIX:</span>
                    <p className="text-sm text-white break-all mt-1">{selectedTransaction.pix_key}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-medium"
              onClick={() => setShowDetails(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
