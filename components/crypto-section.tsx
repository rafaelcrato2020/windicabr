"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function CryptoSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add animation delay to each crypto card
    const cards = document.querySelectorAll(".crypto-card")
    cards.forEach((card, index) => {
      const element = card as HTMLElement
      element.style.animationDelay = `${index * 0.3}s`
    })
  }, [])

  const cryptos = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      description: "A principal criptomoeda do mercado, conhecida por sua segurança e valor.",
      color: "from-orange-500 to-orange-700",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      description: "Plataforma de contratos inteligentes que permite aplicações descentralizadas.",
      color: "from-purple-500 to-purple-700",
    },
    {
      name: "Solana",
      symbol: "SOL",
      description: "Blockchain de alta performance com transações rápidas e baixas taxas.",
      color: "from-green-500 to-green-700",
    },
  ]

  return (
    <div className="w-full bg-black py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">Negociações em Criptomoedas</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            O Cash Fund opera com as principais criptomoedas do mercado para maximizar seus rendimentos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cryptos.map((crypto, index) => (
            <Card
              key={index}
              className="crypto-card futuristic-card border-0 hover-float opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
            >
              <CardContent className="p-6 flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${crypto.color} flex items-center justify-center mb-4 glow`}
                >
                  <span className="text-2xl font-bold text-white">{crypto.symbol}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{crypto.name}</h3>
                <p className="text-gray-400 text-center">{crypto.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
