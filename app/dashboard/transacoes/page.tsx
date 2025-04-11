"use client"

import { useState } from "react"
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

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Array vazio para transações
  const transactions: any[] = []

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
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-green-900/50 text-green-500 hover:bg-green-900/20">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Lista de transações */}
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma transação encontrada.</p>
                </div>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Mostrando 0 de 0 transações</p>
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
              <p className="text-2xl font-bold text-green-500">$0.00</p>
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
              <p className="text-2xl font-bold text-green-500">$0.00</p>
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
              <p className="text-2xl font-bold text-red-500">$0.00</p>
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
              <p className="text-2xl font-bold text-yellow-500">$0.00</p>
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
                    selectedTransaction.type === "Investimento" || selectedTransaction.type === "Rendimento"
                      ? "bg-green-500/20"
                      : selectedTransaction.type === "Saque"
                        ? "bg-red-500/20"
                        : "bg-yellow-500/20"
                  }`}
                >
                  {selectedTransaction.type === "Investimento" ? (
                    <DollarSign className="h-6 w-6 text-green-500" />
                  ) : selectedTransaction.type === "Rendimento" ? (
                    <ArrowUp className="h-6 w-6 text-green-500" />
                  ) : selectedTransaction.type === "Saque" ? (
                    <ArrowDown className="h-6 w-6 text-red-500" />
                  ) : (
                    <Users className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTransaction.type}</h3>
                  <p className={`text-sm ${selectedTransaction.statusColor}`}>{selectedTransaction.status}</p>
                </div>
              </div>

              <div className="bg-black/50 border border-green-900/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">ID da Transação:</span>
                  <span className="text-sm font-medium text-white">
                    #{selectedTransaction.id.toString().padStart(8, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Valor:</span>
                  <span
                    className={`text-sm font-medium ${
                      selectedTransaction.amount.startsWith("+") ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {selectedTransaction.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Data:</span>
                  <span className="text-sm font-medium text-white">{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Hora:</span>
                  <span className="text-sm font-medium text-white">14:32:45</span>
                </div>
                {selectedTransaction.type === "Saque" && (
                  <div className="pt-2 border-t border-green-900/30">
                    <span className="text-sm text-gray-400">Endereço da Carteira:</span>
                    <p className="text-sm text-white break-all mt-1">TXzcD8GsH7LKhPUVT9KyXMVuMU4wYUMfxR</p>
                  </div>
                )}
                {selectedTransaction.type === "Comissão" && (
                  <div className="pt-2 border-t border-green-900/30">
                    <span className="text-sm text-gray-400">Afiliado:</span>
                    <p className="text-sm text-white mt-1">João Silva (Nível 1)</p>
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
