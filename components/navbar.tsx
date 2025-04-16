"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { AuthModals } from "@/components/auth/auth-modals"
// Adicionar o import do useRouter
// Remover esta linha
// import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  // const router = useRouter()

  const handleOpenLogin = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
    setIsMenuOpen(false)
  }

  const handleOpenRegister = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
    setIsMenuOpen(false)
  }

  const handleSwitchToLogin = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
  }

  const handleSwitchToRegister = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
  }

  // Adicionar função para acessar o dashboard diretamente
  // Remover esta função
  // const goToDashboard = () => {
  //   router.push("/dashboard")
  // }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="#" className="text-2xl font-bold gradient-text">
                Cash Fund
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Início
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Sobre
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Afiliados
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Contato
                </a>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleOpenLogin}
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                >
                  Login
                </Button>
                <Button
                  onClick={handleOpenRegister}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
                >
                  Cadastre-se
                </Button>
                {/* Botão de acesso direto ao dashboard para demonstração */}
                {/* Remover este botão dos botões de autenticação (desktop)
                <Button
                  variant="outline"
                  onClick={goToDashboard}
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  Demo Dashboard
                </Button> */}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Início
            </a>
            <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Sobre
            </a>
            <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Afiliados
            </a>
            <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Contato
            </a>
          </div>
          <div className="px-5 pt-4 pb-6 space-y-3">
            <Button
              variant="outline"
              onClick={handleOpenLogin}
              className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            >
              Login
            </Button>
            <Button
              onClick={handleOpenRegister}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
            >
              Cadastre-se
            </Button>
            {/* Botão de acesso direto ao dashboard para demonstração em mobile */}
            {/* Remover este botão da versão mobile
            <Button
              variant="outline"
              onClick={goToDashboard}
              className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              Demo Dashboard
            </Button> */}
          </div>
        </div>
      </nav>

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
