"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/login-modal"
import RegisterModal from "@/components/register-modal"
import { useSearchParams } from "next/navigation"

const companies = [
  { name: "Tesla", logo: "/placeholder.svg?height=50&width=120" },
  { name: "Amazon", logo: "/placeholder.svg?height=50&width=120" },
  { name: "McDonald's", logo: "/placeholder.svg?height=50&width=120" },
  { name: "Nike", logo: "/placeholder.svg?height=50&width=120" },
  { name: "Coca-Cola", logo: "/placeholder.svg?height=50&width=120" },
  { name: "Meta", logo: "/placeholder.svg?height=50&width=120" },
  { name: "Google", logo: "/placeholder.svg?height=50&width=120" },
  { name: "Bitcoin", logo: "/placeholder.svg?height=50&width=120" },
]

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false)
  const searchParams = useSearchParams()

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
    <div className="min-h-screen bg-gradient-to-b from-black to-green-900">
      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} onOpenRegister={openRegisterModal} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={closeModals} onOpenLogin={openLoginModal} />

      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-yellow-500">WindicaBR</div>
        <div className="flex gap-4">
          <Button
            asChild
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-600">
            <Link href="/register">Cadastre-se</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-red-500 to-green-500">
            WindicaBR
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto">
            Uma plataforma de investimento revolucionária que atua nos maiores mercados do mundo com retornos diários de
            4% a 10%
          </p>
          <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 text-lg px-8 py-6">
            <Link href="/register">Cadastre-se para o Pré-lançamento</Link>
          </Button>
        </section>

        {/* Companies Section */}
        <section className="bg-black/50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-white mb-10">
              Investimos nos Maiores Mercados do Mundo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {companies.map((company) => (
                <div key={company.name} className="flex flex-col items-center">
                  <Image
                    src={company.logo || "/placeholder.svg"}
                    alt={`${company.name} logo`}
                    width={120}
                    height={50}
                    className="mb-2 bg-white p-2 rounded-lg"
                  />
                  <p className="text-white font-medium">{company.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Returns Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Retornos Diários Impressionantes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-800 to-green-600 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold text-white mb-4">Conservador</h3>
              <p className="text-5xl font-bold text-yellow-500 mb-4">4%</p>
              <p className="text-white">Retorno diário médio</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-700 to-yellow-500 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold text-white mb-4">Moderado</h3>
              <p className="text-5xl font-bold text-white mb-4">7%</p>
              <p className="text-white">Retorno diário médio</p>
            </div>
            <div className="bg-gradient-to-br from-red-800 to-red-600 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold text-white mb-4">Agressivo</h3>
              <p className="text-5xl font-bold text-yellow-500 mb-4">10%</p>
              <p className="text-white">Retorno diário médio</p>
            </div>
          </div>
        </section>

        {/* Affiliate Program */}
        <section className="bg-black/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-white mb-16">Programa de Afiliados</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Nível 1</h3>
                <p className="text-4xl font-bold text-yellow-500 mb-2">10%</p>
                <p className="text-white text-sm">Comissão direta</p>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Nível 2</h3>
                <p className="text-4xl font-bold text-yellow-500 mb-2">5%</p>
                <p className="text-white text-sm">Comissão indireta</p>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Nível 3</h3>
                <p className="text-4xl font-bold text-yellow-500 mb-2">3%</p>
                <p className="text-white text-sm">Comissão indireta</p>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Nível 4</h3>
                <p className="text-4xl font-bold text-yellow-500 mb-2">2%</p>
                <p className="text-white text-sm">Comissão indireta</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Pronto para Começar?</h2>
          <p className="text-xl text-white mb-10 max-w-2xl mx-auto">
            Junte-se à WindicaBR hoje e comece a investir nos maiores mercados do mundo com retornos diários
            impressionantes.
          </p>
          <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 text-lg px-8 py-6">
            <Link href="/register">Cadastre-se para o Pré-lançamento</Link>
          </Button>
        </section>
      </main>

      <footer className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-4">WindicaBR</div>
            <p className="text-gray-400 mb-6">A plataforma de investimento do futuro</p>
            <p className="text-gray-500">&copy; {new Date().getFullYear()} WindicaBR. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
