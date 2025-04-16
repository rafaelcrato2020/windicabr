"use client"

import { Percent, TrendingUp, Users, Shield } from "lucide-react"
import { useEffect, useState } from "react"

export default function Features() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add animation delay to each feature card
    const cards = document.querySelectorAll(".feature-card")
    cards.forEach((card, index) => {
      const element = card as HTMLElement
      element.style.animationDelay = `${index * 0.2}s`
    })
  }, [])

  const features = [
    {
      icon: <Percent className="h-10 w-10 text-orange-500" />,
      title: "4% de Rendimento Diário",
      description: "Ganhe 4% de rendimento fixo todos os dias sobre seu investimento inicial.",
      color: "from-orange-500/20 to-orange-500/5",
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-green-500" />,
      title: "Crescimento Exponencial",
      description: "Veja seu investimento crescer exponencialmente com nosso programa de rendimentos diários.",
      color: "from-green-500/20 to-green-500/5",
    },
    {
      icon: <Users className="h-10 w-10 text-purple-500" />,
      title: "Programa de Afiliados",
      description: "Ganhe comissões em 3 níveis: 10%, 5% e 3% dos investimentos de seus indicados.",
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-500" />,
      title: "Investimento Seguro",
      description: "Operamos com as principais criptomoedas do mercado: Bitcoin, Ethereum e Solana.",
      color: "from-blue-500/20 to-blue-500/5",
    },
  ]

  return (
    <div className="w-full bg-black py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 gradient-text">Por que escolher o Cash Fund?</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Nossa plataforma futurista oferece as melhores oportunidades de investimento do mercado
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card flex flex-col items-center text-center p-6 rounded-xl futuristic-card hover-float opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${feature.color}`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
