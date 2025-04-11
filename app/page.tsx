"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BarChart3, DollarSign, Users, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
              WINDICABR
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#markets" className="text-sm font-medium text-white hover:text-blue-500">
              Mercados
            </Link>
            <Link href="#returns" className="text-sm font-medium text-white hover:text-blue-500">
              Retornos
            </Link>
            <Link href="#affiliate" className="text-sm font-medium text-white hover:text-blue-500">
              Programa de Afiliados
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold"
              asChild
            >
              <Link href="/cadastro">Cadastre-se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-black to-blue-900/40" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="container relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-500 mb-4">
                Pré-lançamento
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
                Invista nos maiores mercados do mundo
              </h1>
              <p className="text-xl text-gray-300 max-w-[600px]">
                A WINDICABR é uma mesa proprietária que atua nos maiores mercados globais com retornos diários de 4% a
                10%.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold"
                  asChild
                >
                  <Link href="/cadastro">
                    Cadastre-se no pré-lançamento
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10">
                  Saiba mais
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] w-full rounded-lg bg-gradient-to-br from-blue-500/20 via-black to-blue-500/20 p-1 animate-float overflow-hidden">
              <Image
                src="/images/trading-background-hq.png"
                alt="Trading Background"
                fill
                quality={100}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="py-20 bg-gradient-to-b from-black to-blue-950">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-transparent bg-clip-text">
              Atuamos nos maiores mercados do mundo
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Nossa plataforma proprietária opera com as maiores empresas globais, garantindo diversificação e segurança
              para seus investimentos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Tesla", logo: "/logos/tesla.png", delay: "0s" },
              { name: "Amazon", logo: "/logos/amazon.png", delay: "0.1s" },
              { name: "McDonald's", logo: "/logos/mcdonalds.png", delay: "0.2s" },
              { name: "Nike", logo: "/logos/nike.png", delay: "0.3s" },
              { name: "Coca-Cola", logo: "/logos/cocacola.png", delay: "0.4s" },
              { name: "Meta", logo: "/logos/meta.png", delay: "0.5s" },
              { name: "Google", logo: "/logos/google.png", delay: "0.6s" },
              { name: "Apple", logo: "/logos/apple.png", delay: "0.7s" },
            ].map((company, index) => (
              <Card
                key={company.name}
                className={`bg-black/50 border-${index % 2 === 0 ? "blue" : "blue"}-900 overflow-hidden group animate-float`}
                style={{ animationDelay: company.delay }}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 relative mb-4 logo-container">
                    <Image
                      src={company.logo || "/placeholder.svg"}
                      alt={company.name}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section id="returns" className="py-20 bg-gradient-to-b from-blue-950 to-black">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
              Retornos diários impressionantes
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Nossa tecnologia proprietária permite retornos diários entre 4% e 10%, superando qualquer investimento
              tradicional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Retorno Mínimo</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">4%</p>
                <p className="text-gray-400">
                  Retorno diário mínimo garantido em nossa plataforma, mesmo em dias de baixa volatilidade.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Retorno Médio</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">7%</p>
                <p className="text-gray-400">
                  Média de retorno diário observada pelos nossos investidores na maioria dos dias de operação.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Retorno Máximo</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">10%</p>
                <p className="text-gray-400">
                  Retorno diário máximo alcançado em dias de alta volatilidade e oportunidades de mercado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Affiliate Program Section */}
      <section id="affiliate" className="py-20 bg-gradient-to-b from-black to-blue-950">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
              Programa de Afiliados
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Multiplique seus ganhos indicando novos investidores para nossa plataforma e receba comissões em até 4
              níveis.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 1</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">10%</p>
                <p className="text-gray-400">
                  Comissão sobre os ganhos de todos os investidores que você indicar diretamente.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 2</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">5%</p>
                <p className="text-gray-400">
                  Comissão sobre os ganhos dos investidores indicados pelos seus afiliados diretos.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 3</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">3%</p>
                <p className="text-gray-400">
                  Comissão sobre os ganhos dos investidores do terceiro nível da sua rede.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-black/50 border-blue-900 overflow-hidden animate-float"
              style={{ animationDelay: "0.6s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nível 4</h3>
                <p className="text-4xl font-bold text-blue-500 mb-4">2%</p>
                <p className="text-gray-400">Comissão sobre os ganhos dos investidores do quarto nível da sua rede.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-950 to-black">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
              Não perca essa oportunidade
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Cadastre-se agora no pré-lançamento e seja um dos primeiros a acessar nossa plataforma revolucionária.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold px-8 animate-pulse"
              asChild
            >
              <Link href="/cadastro">
                Cadastre-se no pré-lançamento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-blue-900/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
                WINDICABR
              </span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()}{" "}
              <span className="relative">
                <span className="cursor-pointer" onClick={() => (window.location.href = "/admin-login")}>
                  WINDICABR
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
