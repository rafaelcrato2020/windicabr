"use client"

import { Users, UserPlus, Coins } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function AffiliateProgram() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const affiliateCards = [
    {
      icon: <Users className="h-12 w-12 text-orange-500" />,
      title: "Nível 1",
      description: "Indicações diretas",
      percentage: "10%",
      details: "Ganhe 10% do valor investido por cada pessoa que você indicar diretamente",
      color: "from-orange-600/20 to-transparent",
    },
    {
      icon: <UserPlus className="h-12 w-12 text-green-500" />,
      title: "Nível 2",
      description: "Indicações indiretas",
      percentage: "5%",
      details: "Ganhe 5% do valor investido pelas pessoas indicadas pelos seus afiliados diretos",
      color: "from-green-600/20 to-transparent",
    },
    {
      icon: <Coins className="h-12 w-12 text-blue-500" />,
      title: "Nível 3",
      description: "Rede expandida",
      percentage: "3%",
      details: "Ganhe 3% do valor investido pelas pessoas indicadas pelos seus afiliados de nível 2",
      color: "from-blue-600/20 to-transparent",
    },
  ]

  return (
    <div className="w-full bg-black py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">Programa de Afiliados</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ganhe comissões generosas indicando novos investidores para o Cash Fund
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {affiliateCards.map((card, index) => (
            <Card key={index} className="futuristic-card hover-float border-0">
              <div className={`h-2 w-full rounded-t-lg bg-gradient-to-r ${card.color}`}></div>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-black/50 p-4 rounded-full mb-2">{card.icon}</div>
                <CardTitle className="text-2xl text-white">{card.title}</CardTitle>
                <CardDescription className="text-gray-400">{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold mb-2 gradient-text">{card.percentage}</div>
                <p className="text-gray-400">{card.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
