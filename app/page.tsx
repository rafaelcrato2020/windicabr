"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  LineChart,
  CandlestickChart,
  Globe,
  TrendingUp,
  Clock,
} from "lucide-react"
import LoginModal from "@/components/login-modal"
import RegisterModal from "@/components/register-modal"

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const openLoginModal = () => {
    setIsLoginModalOpen(true)
    setIsRegisterModalOpen(false)
  }

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true)
    setIsLoginModalOpen(false)
  }

  const closeModals = () => {
    setIsLoginModalOpen(false)
    setIsRegisterModalOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} onOpenRegister={openRegisterModal} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={closeModals} onOpenLogin={openLoginModal} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
              Forexity
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#forex" className="text-sm font-medium text-white hover:text-green-500">
              Forex Trading
            </Link>
            <Link href="#returns" className="text-sm font-medium text-white hover:text-green-500">
              Retornos
            </Link>
            <Link href="#affiliate" className="text-sm font-medium text-white hover:text-green-500">
              Programa de Afiliados
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500/10"
              onClick={openLoginModal}
            >
              Login
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold"
              onClick={openRegisterModal}
            >
              Cadastre-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-black to-green-900/40" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        </div>
        <div className="container relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-green-500/10 px-3 py-1 text-sm text-green-500 mb-4">
                Trading Forex
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-transparent bg-clip-text">
                Lucre 6% ao dia no mercado Forex
              </h1>
              <p className="text-xl text-gray-300 max-w-[600px]">
                A Forexity é uma plataforma especializada em trading de Forex, oferecendo retornos diários de 6% nos
                principais pares de moedas do mundo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold"
                  onClick={openRegisterModal}
                >
                  Comece a investir agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                  Saiba mais
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-lg bg-gradient-to-br from-green-500/20 via-black to-green-500/20 p-1 animate-float overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pares%20de%20moedas%20do%20mercado%20forex.png-AxspROdLoeAohNP8CIHNGmuWDxBnb5.jpeg"
                alt="Pares de Moedas do Mercado Forex"
                fill
                quality={100}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Investment Highlight Box - NOVA SEÇÃO */}
      <section className="py-8 bg-black">
        <div className="container">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-green-900/30 via-black to-red-900/30 border border-yellow-500/30 rounded-xl p-6 md:p-8 shadow-lg shadow-green-500/10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-yellow-500 mb-4">
                <DollarSign className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                Informações de Investimento
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
                <div className="bg-black/70 border border-green-500/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-sm text-gray-400">Investimento Mínimo</span>
                  <span className="text-xl md:text-2xl font-bold text-green-500">$10 USDT</span>
                </div>

                <div className="bg-black/70 border border-green-500/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-sm text-gray-400">Investimento Máximo</span>
                  <span className="text-xl md:text-2xl font-bold text-green-500">$20.000 USDT</span>
                </div>

                <div className="bg-black/70 border border-green-500/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-sm text-gray-400">Rendimento Diário</span>
                  <span className="text-xl md:text-2xl font-bold text-green-500">6% ao dia</span>
                </div>

                <div className="bg-black/70 border border-green-500/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-sm text-gray-400">Retorno Total</span>
                  <span className="text-xl md:text-2xl font-bold text-green-500">120%</span>
                  <span className="text-xs text-gray-400">em 20 dias úteis</span>
                </div>
              </div>

              <div className="mt-6 bg-black/70 border border-yellow-500/30 rounded-lg p-4 max-w-2xl">
                <p className="text-gray-300">
                  Invista entre <span className="text-green-500 font-bold">$10</span> e{" "}
                  <span className="text-green-500 font-bold">$20.000 USDT</span> e receba{" "}
                  <span className="text-green-500 font-bold">6% de rendimento diário</span> durante{" "}
                  <span className="text-yellow-500 font-bold">20 dias úteis</span>, totalizando{" "}
                  <span className="text-red-500 font-bold">120% de retorno</span> sobre seu investimento inicial.
                </p>
              </div>

              <Button
                size="lg"
                className="mt-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold px-8"
                onClick={openRegisterModal}
              >
                Comece a investir agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Forexity Section */}
      <section className="py-16 bg-gradient-to-b from-black to-black">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-green-900/20 border border-green-500/30 rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <LineChart className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 to-green-400 text-transparent bg-clip-text">
                  Sobre a Forexity
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  A FOREXITY rentabiliza capital de terceiros com retorno diário de 6% fixo para seus investidores. A
                  FOREXITY atua nos pares de moedas do mercado forex. O mercado forex movimenta trilhões de dólares
                  todos os dias e a FOREXITY consegue ter uma pequena fatia dessas movimentações diárias com margens
                  altíssimas de retorno diário.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Analysis Section - NOVA SEÇÃO */}
      <section className="py-16 bg-gradient-to-b from-black to-black">
        <div className="container">
          <div className="relative rounded-xl overflow-hidden">
            <div className="relative h-[500px] w-full">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mercado%20forex%20com%20gra%CC%81fico%20de%20vela.png-2TSRkHqBChFE4JEycb8nM3htDdjzdp.jpeg"
                alt="Análise Profissional de Mercado Forex"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                  Análise Técnica Avançada
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Nossa equipe de traders profissionais utiliza tecnologia de ponta e análise técnica avançada para
                  identificar as melhores oportunidades no mercado Forex, garantindo retornos consistentes de 6% ao dia.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                    Gráficos de Candlestick
                  </span>
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                    Indicadores Técnicos
                  </span>
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                    Análise Fundamentalista
                  </span>
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
                    Algoritmos Proprietários
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principais Pares de Moedas - Destaque */}
      <section className="py-12 bg-gradient-to-b from-black to-black">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-900/30 to-black border border-green-500/30 rounded-xl p-6 md:p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
                Operamos nos Principais Pares de Moedas
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Nossa plataforma oferece acesso aos mais importantes pares de moedas do mercado Forex, com tecnologia
                avançada para maximizar seus lucros.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {["EUR/USD", "GBP/JPY", "USD/CAD", "AUD/USD", "USD/CHF", "XAU/USD"].map((pair) => (
                  <span
                    key={pair}
                    className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm"
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 24/5 Market Section */}
      <section className="py-16 bg-gradient-to-b from-black to-green-950/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/relacionado%20ao%20forex.png-senMB3UJQYOhHjrPYWCu10VXDqg2bX.jpeg"
                  alt="Sala de Trading Forex"
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-green-400 text-transparent bg-clip-text">
                  Mercado 24/5
                </h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                A Forexity opera 24 horas por dia, 5 dias por semana. O mercado abre na noite de domingo (horário EST)
                com a sessão asiática e fecha na noite de sexta-feira com o encerramento da sessão americana. Isso
                acontece porque o Forex funciona em diferentes fusos horários ao redor do mundo, permitindo uma
                negociação contínua durante os dias úteis.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <h4 className="text-green-500 font-bold mb-1">Sessão Asiática</h4>
                  <p className="text-sm text-gray-400">19:00 - 04:00 EST</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <h4 className="text-green-500 font-bold mb-1">Sessão Europeia</h4>
                  <p className="text-sm text-gray-400">03:00 - 12:00 EST</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <h4 className="text-green-500 font-bold mb-1">Sessão Americana</h4>
                  <p className="text-sm text-gray-400">08:00 - 17:00 EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forex Trading Section */}
      <section id="forex" className="py-20 bg-gradient-to-b from-green-950/50 to-green-950">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-green-600 text-transparent bg-clip-text">
              Operamos nos Principais Pares de Moedas
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Nossa plataforma oferece acesso aos mais importantes pares de moedas do mercado Forex, com tecnologia
              avançada para maximizar seus lucros.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { name: "EUR/USD", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Euro/Dólar" },
              { name: "GBP/JPY", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Libra/Iene" },
              { name: "USD/CAD", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Dólar/Canadá" },
              { name: "AUD/USD", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Austrália/Dólar" },
              { name: "USD/CHF", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Dólar/Franco Suíço" },
              { name: "NZD/USD", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Nova Zelândia/Dólar" },
              { name: "XAU/USD", icon: <DollarSign className="h-6 w-6 text-yellow-500" />, desc: "Ouro/Dólar" },
              { name: "EUR/GBP", icon: <Globe className="h-6 w-6 text-green-500" />, desc: "Euro/Libra" },
            ].map((pair, index) => (
              <Card
                key={pair.name}
                className="bg-black/50 border-green-900 overflow-hidden animate-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 mb-3">
                    {pair.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{pair.name}</h3>
                  <p className="text-sm text-gray-400">{pair.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <CandlestickChart className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Análise Técnica Avançada</h3>
                <p className="text-gray-400">
                  Nossa equipe de traders utiliza análise técnica avançada para identificar as melhores oportunidades de
                  entrada e saída no mercado Forex.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Algoritmos Proprietários</h3>
                <p className="text-gray-400">
                  Algoritmos exclusivos desenvolvidos por nossa equipe monitoram o mercado 24/7 para capturar as
                  melhores oportunidades de lucro.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Gestão de Risco</h3>
                <p className="text-gray-400">
                  Sistema avançado de gestão de risco que protege seu capital e maximiza os ganhos em diferentes
                  condições de mercado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section id="returns" className="py-20 bg-gradient-to-b from-green-950 to-black">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-transparent bg-clip-text">
              Retornos consistentes no mercado Forex
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Nossa estratégia de trading proporciona retornos diários{" "}
              <span className="text-green-500 font-bold">fixos de 6%</span>, superando qualquer investimento tradicional
              com consistência e segurança garantida durante 20 dias úteis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Retorno Diário</h3>
                <p className="text-4xl font-bold text-green-500 mb-4">6%</p>
                <p className="text-gray-400">
                  Retorno diário <span className="text-green-500 font-bold">fixo</span> e garantido em nossa plataforma,
                  com operações nos principais pares de moedas durante 20 dias úteis.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Retorno Mensal</h3>
                <p className="text-4xl font-bold text-green-500 mb-4">120%</p>
                <p className="text-gray-400">
                  Com 6% ao dia durante 20 dias úteis, seu investimento rende 120% de retorno total, um resultado
                  extraordinário para o mercado financeiro.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Investimento</h3>
                <p className="text-xl font-bold text-green-500 mb-4">$10 - $20.000 USDT</p>
                <p className="text-gray-400">
                  Invista entre $10 e $20.000 USDT e receba 6% ao dia durante 20 dias úteis, totalizando 120% de
                  retorno.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-black/50 border border-green-900 rounded-lg p-6 animate-float">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Política de Saques</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Saque mínimo:</span> $50 USDT
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Frequência:</span> 1 saque a cada 48 horas
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Processamento:</span> Até 24 horas úteis
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Taxa:</span> 0% (sem taxas de saque)
                    </p>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Vantagens Exclusivas</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Operações 24/5:</span> Mercado Forex ativo durante
                      toda a semana
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Suporte especializado:</span> Equipe de traders
                      profissionais
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Transparência:</span> Acompanhe suas operações em
                      tempo real
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-gray-300">
                      <span className="text-green-500 font-medium">Segurança:</span> Proteção avançada para seus
                      investimentos
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Program Section */}
      <section id="affiliate" className="py-20 bg-gradient-to-b from-black to-green-950">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-transparent bg-clip-text">
              Programa de Afiliados
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Multiplique seus ganhos indicando novos investidores para nossa plataforma e receba comissões em até 4
              níveis.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 1</h3>
                <p className="text-4xl font-bold text-green-500 mb-4">10%</p>
                <p className="text-gray-400">
                  Comissão sobre os ganhos de todos os investidores que você indicar diretamente.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 2</h3>
                <p className="text-4xl font-bold text-green-500 mb-4">5%</p>
                <p className="text-gray-400">
                  Comissão sobre os ganhos dos investidores indicados pelos seus afiliados diretos.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 3</h3>
                <p className="text-4xl font-bold text-green-500 mb-4">3%</p>
                <p className="text-gray-400">
                  Comissão sobre os ganhos dos investidores do terceiro nível da sua rede.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-green-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.6s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 4</h3>
                <p className="text-4xl font-bold text-green-500 mb-4">2%</p>
                <p className="text-gray-400">Comissão sobre os ganhos dos investidores do quarto nível da sua rede.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-black/50 border border-green-900 rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">Exemplo de Ganhos com Afiliados</h3>
              <p className="text-gray-400">Veja quanto você pode ganhar com sua rede de afiliados</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-500/10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-500 mb-2">Cenário Básico</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">• 5 afiliados diretos (Nível 1)</li>
                  <li className="text-gray-300">• Cada um investindo $100 USDT</li>
                  <li className="text-gray-300">• Rendimento diário: $30 USDT</li>
                  <li className="text-gray-300">• Rendimento mensal: $900 USDT</li>
                </ul>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-500 mb-2">Cenário Intermediário</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">• 10 afiliados diretos (Nível 1)</li>
                  <li className="text-gray-300">• 20 afiliados no Nível 2</li>
                  <li className="text-gray-300">• Rendimento diário: $90 USDT</li>
                  <li className="text-gray-300">• Rendimento mensal: $2.700 USDT</li>
                </ul>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-500 mb-2">Cenário Avançado</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">• Rede completa nos 4 níveis</li>
                  <li className="text-gray-300">• Mais de 100 afiliados na rede</li>
                  <li className="text-gray-300">• Rendimento diário: $300+ USDT</li>
                  <li className="text-gray-300">• Rendimento mensal: $9.000+ USDT</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Market Section */}
      <section className="py-16 bg-gradient-to-b from-green-950 to-black">
        <div className="container">
          <div className="relative rounded-xl overflow-hidden">
            <div className="relative h-[500px] w-full">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pares%20de%20moedas%20do%20mercado%20forex%20%281%29.png-2wE2GxaJLaDpMfmK8HmpFKLmDsYXPU.jpeg"
                alt="Mercado Global Forex"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-transparent bg-clip-text">
                  Mercado Global de Forex
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Conecte-se ao maior mercado financeiro do mundo, com volume diário de trilhões de dólares e
                  oportunidades ilimitadas.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold px-8"
                  onClick={openRegisterModal}
                >
                  Comece a investir agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-black to-green-950/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-transparent bg-clip-text">
              Comece a lucrar no mercado Forex hoje
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Cadastre-se agora e comece a investir com apenas $10 USDT. Obtenha retornos diários de 6% e construa sua
              rede de afiliados.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold px-8 animate-pulse"
              onClick={openRegisterModal}
            >
              Comece a investir agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-green-900/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <LineChart className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-transparent bg-clip-text">
                Forexity
              </span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()}{" "}
              <span className="relative">
                <span className="cursor-pointer" onClick={() => (window.location.href = "/admin-login")}>
                  Forexity
                </span>
              </span>
              . Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
