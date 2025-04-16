"use client"

import { useState } from "react"
import { Cpu, Clock, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function TradingBot() {
  const [activeTab, setActiveTab] = useState("features")

  const features = [
    {
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      title: "Operação 24/7",
      description:
        "Nosso bot opera ininterruptamente, aproveitando oportunidades de mercado a qualquer hora do dia ou da noite.",
    },
    {
      icon: <Cpu className="h-8 w-8 text-green-500" />,
      title: "Estratégia Exclusiva",
      description: "Algoritmos avançados desenvolvidos por especialistas em trading e inteligência artificial.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
      title: "Rentabilidade Diária",
      description: "Rendimentos fixos de 4% ao dia, depositados automaticamente na sua carteira.",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: "Segurança Garantida",
      description: "Protocolos de segurança avançados e operações transparentes com registro em blockchain.",
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-500" />,
      title: "Negociações Automáticas",
      description: "Execução instantânea de ordens baseadas em análises técnicas e fundamentalistas.",
    },
  ]

  return (
    <div className="w-full bg-black py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">Bot de Trading Automatizado</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Nossa tecnologia exclusiva opera 24 horas por dia para garantir os melhores rendimentos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl floating-orb-slow"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-xl floating-orb"></div>

            <div className="relative z-10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              <Image
                src="/images/robot-bitcoin.png"
                alt="Bot de Trading Cash Fund"
                width={600}
                height={600}
                className="w-full h-auto hover-float"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={() => setActiveTab("features")}
                className={`${
                  activeTab === "features"
                    ? "bg-gradient-to-r from-orange-500 to-purple-600"
                    : "bg-black border border-gray-700"
                } hover-float`}
              >
                Características
              </Button>
              <Button
                onClick={() => setActiveTab("tech")}
                className={`${
                  activeTab === "tech"
                    ? "bg-gradient-to-r from-blue-500 to-green-500"
                    : "bg-black border border-gray-700"
                } hover-float`}
              >
                Tecnologia
              </Button>
            </div>

            {activeTab === "features" ? (
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start p-4 futuristic-card rounded-lg hover-float">
                    <div className="mr-4 p-2 bg-black/50 rounded-full">{feature.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 p-6 futuristic-card rounded-lg">
                <h3 className="text-xl font-bold gradient-text">Tecnologia de Ponta</h3>
                <p className="text-gray-400">
                  Nosso bot utiliza algoritmos de aprendizado de máquina e inteligência artificial para analisar padrões
                  de mercado e executar operações com precisão milimétrica.
                </p>
                <p className="text-gray-400">
                  A estratégia exclusiva do Cash Fund combina análise técnica avançada, indicadores proprietários e
                  monitoramento em tempo real das condições de mercado para identificar as melhores oportunidades de
                  negociação.
                </p>
                <p className="text-gray-400">
                  Todas as operações são registradas em blockchain, garantindo total transparência e segurança para
                  nossos investidores.
                </p>
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover-float">
                    Conheça Nossa Tecnologia
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
