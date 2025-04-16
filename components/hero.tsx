"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Image from "next/image"
import { AuthModals } from "@/components/auth/auth-modals"

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpenLogin = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
  }

  const handleOpenRegister = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
  }

  const handleSwitchToLogin = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
  }

  const handleSwitchToRegister = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
  }

  return (
    <>
      <div className="w-full bg-black relative overflow-hidden py-24 md:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/20 via-purple-600/20 to-blue-600/20 opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="mb-6 relative">
                <h1 className="text-5xl md:text-7xl font-bold mb-2 gradient-text tracking-tight">Cash Fund</h1>
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-500/30 rounded-full blur-xl floating-orb-slow"></div>
                <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-blue-500/30 rounded-full blur-xl floating-orb"></div>
              </div>

              <div className="futuristic-card p-6 rounded-xl mb-8 hover-float">
                <p className="text-xl md:text-2xl mb-4">
                  Rendimentos diários fixos de <span className="font-bold text-3xl text-orange-500 glow-text">4%</span>{" "}
                  ao dia
                </p>
                <p className="text-gray-300">
                  Bot de trading automatizado operando 24 horas por dia com nossa estratégia exclusiva
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={handleOpenRegister}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0 hover-float"
                >
                  Comece a Investir
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleOpenLogin}
                  className="border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover-float"
                >
                  Acessar Conta <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl floating-orb"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-xl floating-orb-slow"></div>

              <div className="relative z-10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                <Image
                  src="/images/robot-bitcoin.png"
                  alt="Cash Fund Trading Bot"
                  width={600}
                  height={600}
                  className="w-full h-auto hover-float"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onCloseLogin={() => setIsLoginOpen(false)}
        onCloseRegister={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </>
  )
}
