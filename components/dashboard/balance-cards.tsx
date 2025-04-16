"use client"

import { useState, useEffect } from "react"
import { Wallet, TrendingUp, Users, DollarSign, ArrowUpRight } from "lucide-react"

export default function BalanceCards() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const balances = [
    {
      title: "Saldo Disponível",
      value: "$10,500.00",
      change: "+$500.00 (5%)",
      icon: Wallet,
      color: "from-orange-500 to-orange-700",
      positive: true,
    },
    {
      title: "Rendimentos",
      value: "$420.00",
      change: "Hoje: +$120.00",
      icon: TrendingUp,
      color: "from-green-500 to-green-700",
      positive: true,
    },
    {
      title: "Comissão de Indicações",
      value: "$850.00",
      change: "3 novos indicados",
      icon: Users,
      color: "from-blue-500 to-blue-700",
      positive: true,
    },
    {
      title: "Total de Saques",
      value: "$2,300.00",
      change: "Último: 3 dias atrás",
      icon: DollarSign,
      color: "from-purple-500 to-purple-700",
      positive: true,
    },
  ]

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="futuristic-card rounded-xl p-4 hover-float border-0">
            <div className="h-16 flex items-center justify-center">
              <p className="text-gray-400">Carregando...</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {balances.map((balance, index) => (
        <div key={index} className="futuristic-card rounded-xl p-4 hover-float border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">{balance.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{balance.value}</p>
              <div className={`flex items-center mt-2 ${balance.positive ? "text-green-500" : "text-red-500"}`}>
                <span className="text-sm">{balance.change}</span>
                {balance.positive && <ArrowUpRight className="h-3 w-3 ml-1" />}
              </div>
            </div>
            <div className={`p-2 rounded-full bg-gradient-to-br ${balance.color}`}>
              <balance.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
