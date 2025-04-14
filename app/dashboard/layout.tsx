"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { CreditCard, DollarSign, Home, LogOut, Settings, Users, Wallet, Zap } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useMobile } from "@/hooks/use-mobile"

// Adicione estes imports no topo do arquivo
import { createBrowserClient } from "@/utils/supabase/client"

// Adicione esta interface antes do componente DashboardLayout
interface UserData {
  id: string
  email: string
  name?: string
  unique_referral_code?: string
  referral_count?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

function SidebarContent({
  onItemClick,
  referralCode,
  referralCount,
}: { onItemClick?: () => void; referralCode?: string; referralCount?: number }) {
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
            .select("id, email, name, unique_referral_code, referral_count")
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
            {
              name: "Programa de Afiliados",
              href: `/dashboard/afiliados?ref=${userData?.unique_referral_code}`,
              icon: Users,
            },
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
    <header className="sticky top-0 z-40 md:hidden flex items-center justify-between h\
