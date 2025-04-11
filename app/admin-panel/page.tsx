"use client"

import { useState } from "react"
import { Users, ArrowDownCircle, ArrowUpCircle, Percent, UserPlus } from "lucide-react"

export default function AdminPanel() {
  const [stats] = useState([
    {
      title: "Usuários",
      value: 0,
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-500",
    },
    {
      title: "Depósitos",
      value: "R$ 0,00",
      icon: <ArrowDownCircle className="w-8 h-8" />,
      color: "bg-green-500",
    },
    {
      title: "Saques",
      value: "R$ 0,00",
      icon: <ArrowUpCircle className="w-8 h-8" />,
      color: "bg-red-500",
    },
    {
      title: "Rendimentos Pagos",
      value: "R$ 0,00",
      icon: <Percent className="w-8 h-8" />,
      color: "bg-yellow-500",
    },
    {
      title: "Afiliados",
      value: 0,
      icon: <UserPlus className="w-8 h-8" />,
      color: "bg-purple-500",
    },
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-6 shadow-lg flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">{stat.title}</h3>
              <div className="text-white opacity-80">{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">Últimos Depósitos</h2>
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum depósito encontrado.</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-red-400">Últimos Saques</h2>
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum saque encontrado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
