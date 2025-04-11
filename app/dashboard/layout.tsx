"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BarChart2, CreditCard, DollarSign, Home, LogOut, Menu, Settings, Users, Wallet, X, Zap } from "lucide-react"
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

function MyInvestmentsButton({ href, isActive, onClick }: { href: string; isActive: boolean; onClick?: () => void }) {
  const supabase = createBrowserClient()
  const [totalInvested, setTotalInvested] = useState(0)
  const [activeInvestments, setActiveInvestments] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchInvestmentData = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      // Buscar investimentos ativos
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "active")

      if (error) {
        console.error("Erro ao buscar investimentos:", error)
        return
      }

      // Calcular total investido
      let total = 0
      data?.forEach((inv) => {
        total += Number(inv.amount)
      })

      setTotalInvested(total)
      setActiveInvestments(data?.length || 0)
    } catch (err) {
      console.error("Erro ao buscar dados de investimentos:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchInvestmentData()

    // Configurar um intervalo para atualizar os dados a cada 5 minutos
    const interval = setInterval(fetchInvestmentData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchInvestmentData])

  // Função para formatar números com separadores
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 rounded-lg px-3 py-3 transition-all ${
        isActive ? "bg-blue-900/20 text-blue-500" : "text-gray-400 hover:bg-blue-900/10 hover:text-blue-500"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <BarChart2 className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
        <span>Meus Investimentos</span>
      </div>

      {loading ? (
        <div className="ml-8 text-xs text-gray-500">Carregando...</div>
      ) : (
        <div className="ml-8 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Total:</span>
            <span className={`text-xs font-medium ${isActive ? "text-blue-400" : "text-gray-400"}`}>
              {formatCurrency(totalInvested)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Ativos:</span>
            <span className={`text-xs font-medium ${isActive ? "text-blue-400" : "text-gray-400"}`}>
              {activeInvestments}
            </span>
          </div>
        </div>
      )}
    </Link>
  )
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
      <div className="flex flex-col items-center py-4 px-4 border-b border-blue-900/30">
        <div className="relative w-16 h-16 mb-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 animate-pulse-glow"></div>
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

      <div className="flex h-16 items-center justify-between px-4 border-b border-blue-900/30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
            WINDICABR
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              pathname === "/dashboard"
                ? "bg-blue-900/20 text-blue-500"
                : "text-gray-400 hover:bg-blue-900/10 hover:text-blue-500"
            }`}
            onClick={onItemClick}
          >
            <Home className={`h-5 w-5 ${pathname === "/dashboard" ? "text-blue-500" : ""}`} />
            <span>Início</span>
          </Link>

          {/* Botão original de Investimentos */}
          <Link
            href="/dashboard/investimentos"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              pathname === "/dashboard/investimentos"
                ? "bg-blue-900/20 text-blue-500"
                : "text-gray-400 hover:bg-blue-900/10 hover:text-blue-500"
            }`}
            onClick={onItemClick}
          >
            <DollarSign className={`h-5 w-5 ${pathname === "/dashboard/investimentos" ? "text-blue-500" : ""}`} />
            <span>Investimentos</span>
          </Link>

          {/* Novo botão de Meus Investimentos */}
          <MyInvestmentsButton
            href="/dashboard/meus-investimentos"
            isActive={pathname === "/dashboard/meus-investimentos"}
            onClick={onItemClick}
          />

          {[
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
                  isActive ? "bg-blue-900/20 text-blue-500" : "text-gray-400 hover:bg-blue-900/10 hover:text-blue-500"
                }`}
                onClick={onItemClick}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-blue-900/30 p-4">
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
    <header className="sticky top-0 z-40 md:hidden flex items-center justify-between h-16 px-4 border-b border-blue-900/30 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-blue-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-transparent bg-clip-text">
          WINDICABR
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 animate-pulse-glow"></div>
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
            <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-blue-900/20 hover:text-blue-500">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-black border-blue-900/30 w-[280px] sm:w-[320px]">
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
            className="fixed top-4 left-4 z-50 rounded-full p-2 bg-blue-900/20 text-blue-500 hover:bg-blue-900/30 transition-all"
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
            className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-blue-900/30 bg-black/80 backdrop-blur-xl transition-all duration-300 ${
              sidebarHidden ? "-translate-x-full" : "translate-x-0"
            } w-64`}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={() => setSidebarHidden(true)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-blue-900/20 hover:text-blue-500"
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
