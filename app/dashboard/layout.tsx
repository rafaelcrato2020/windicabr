"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { CreditCard, DollarSign, Home, LogOut, Menu, Settings, Users, Wallet, X, Zap } from "lucide-react"
import { Toaster } from "@/components/toaster"
import { UserProvider, useUser } from "@/contexts/user-context"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Adicione estes imports no topo do arquivo
import { createBrowserClient } from "@/utils/supabase/client"

// Adicione esta interface antes do componente DashboardLayout
interface UserData {
  id: string
  email: string
  name?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { profilePhoto } = useUser()
  const isMobile = useMobile()
  const supabase = createBrowserClient()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do usuário
  useEffect(() => {
    async function fetchUserData() {
      try {
        if (!supabase) {
          console.error("Cliente Supabase não disponível")
          setError("Erro de conexão")
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Buscar dados do usuário da tabela profiles
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("id, email, name")
            .eq("id", session.user.id)
            .single()

          if (data && !profileError) {
            setUserData(data)
          } else {
            // Fallback para os dados básicos do usuário
            setUserData({
              id: session.user.id,
              email: session.user.email || "",
            })
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err)
        setError("Erro ao carregar dados")
      }
    }

    if (supabase) {
      fetchUserData()
    }
  }, [supabase])

  return (
    <div className="flex flex-col h-full">
      {/* User Profile */}
      <div className="flex flex-col items-center py-4 px-4 border-b border-green-900/30">
        <div className="relative w-16 h-16 mb-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 animate-pulse-glow"></div>
          <div className="absolute inset-0.5 rounded-full overflow-hidden">
            <Image
              src={profilePhoto || "/placeholder.svg?height=64&width=64"}
              alt="Foto do perfil"
              width={64}
              height={64}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="text-center">
          <div className="text-center">
            {userData ? (
              <>
                <p className="font-medium text-white">{userData.name || "Usuário"}</p>
                <p className="text-xs text-gray-400">{userData.email}</p>
              </>
            ) : (
              <>
                <p className="font-medium text-white">Carregando...</p>
                <p className="text-xs text-gray-400">...</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-16 items-center justify-between px-4 border-b border-green-900/30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
            FOREXITY
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {[
            { name: "Início", href: "/dashboard", icon: Home },
            { name: "Investimentos", href: "/dashboard/investimentos", icon: DollarSign },
            { name: "Saques", href: "/dashboard/saques", icon: Wallet },
            { name: "Transações", href: "/dashboard/transacoes", icon: CreditCard },
            { name: "Programa de Afiliados", href: "/dashboard/afiliados", icon: Users },
            { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? "bg-green-900/20 text-green-500"
                    : "text-gray-400 hover:bg-green-900/10 hover:text-green-500"
                }`}
                onClick={onItemClick}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-green-500" : ""}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-green-900/30 p-4">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:bg-red-900/10 hover:text-red-500 transition-all"
          onClick={onItemClick}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Link>
      </div>
    </div>
  )
}

function MobileHeader() {
  const { profilePhoto } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 md:hidden flex items-center justify-between h-16 px-4 border-b border-green-900/30 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-yellow-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
          FOREXITY
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 animate-pulse-glow"></div>
          <div className="absolute inset-0.5 rounded-full overflow-hidden">
            <Image
              src={profilePhoto || "/placeholder.svg?height=32&width=32"}
              alt="Foto do perfil"
              width={32}
              height={32}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-green-900/20 hover:text-green-500">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-black border-green-900/30 w-[280px] sm:w-[320px]">
            <div className="absolute right-4 top-4 z-50">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-red-900/20 hover:text-red-500">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent onItemClick={() => document.body.click()} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMobile()
  const [sidebarHidden, setSidebarHidden] = useState(false)

  // Resetar o estado da barra lateral quando mudar o tamanho da tela
  useEffect(() => {
    setSidebarHidden(false)
  }, [isMobile])

  return (
    <UserProvider>
      <div className="flex min-h-screen bg-black">
        {/* Botão flutuante para mostrar a barra lateral quando estiver escondida (apenas desktop) */}
        {!isMobile && sidebarHidden && (
          <button
            onClick={() => setSidebarHidden(false)}
            className="fixed top-4 left-4 z-50 rounded-full p-2 bg-green-900/20 text-green-500 hover:bg-green-900/30 transition-all"
            aria-label="Mostrar barra lateral"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Sidebar para desktop */}
        {!isMobile && (
          <aside
            className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-green-900/30 bg-black/80 backdrop-blur-xl transition-all duration-300 ${
              sidebarHidden ? "-translate-x-full" : "translate-x-0"
            } w-64`}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={() => setSidebarHidden(true)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-green-900/20 hover:text-green-500"
                aria-label="Esconder barra lateral"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
            <SidebarContent />
          </aside>
        )}

        {/* Conteúdo principal */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            !isMobile && !sidebarHidden ? "ml-64" : "ml-0"
          }`}
        >
          {/* Header móvel */}
          <MobileHeader />

          {/* Conteúdo da página */}
          <main className="flex-1">{children}</main>

          <Toaster />
        </div>
      </div>
    </UserProvider>
  )
}
