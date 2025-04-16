"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  TrendingUp,
  DollarSign,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
  BarChart3,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  currentPath: string
}

export default function Sidebar({ isOpen, setIsOpen, currentPath }: SidebarProps) {
  const [userName, setUserName] = useState("John Doe")
  const [userBalance, setUserBalance] = useState("$10,500.00")

  const menuItems = [
    { icon: Home, label: "Início", href: "/dashboard" },
    { icon: TrendingUp, label: "Investir", href: "/dashboard/invest" },
    { icon: DollarSign, label: "Saque", href: "/dashboard/withdraw" },
    { icon: Users, label: "Programa de Afiliado", href: "/dashboard/affiliate" },
    { icon: BarChart3, label: "Mercado", href: "/dashboard/market" },
    { icon: Clock, label: "Histórico", href: "/dashboard/history" },
    { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20",
          "bg-black/80 backdrop-blur-md border-r border-white/10",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo and toggle */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link href="/dashboard" className={cn("flex items-center", !isOpen && "lg:justify-center")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center glow">
                <span className="text-white font-bold">CF</span>
              </div>
              {isOpen && <span className="ml-3 text-xl font-bold gradient-text">Cash Fund</span>}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors lg:block hidden"
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* User info */}
          <div className={cn("p-4 border-b border-white/10", !isOpen && "lg:px-0")}>
            {isOpen ? (
              <div>
                <p className="text-sm text-gray-400">Bem-vindo,</p>
                <p className="font-semibold text-white truncate">{userName}</p>
                <div className="mt-2 flex items-center">
                  <Wallet className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-sm font-medium text-green-500">{userBalance}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {userName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center p-2 rounded-lg transition-all",
                      currentPath === item.href
                        ? "bg-gradient-to-r from-orange-500/20 to-purple-600/20 text-white"
                        : "text-gray-400 hover:bg-white/10 hover:text-white",
                      !isOpen && "lg:justify-center",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", currentPath === item.href && "text-orange-500")} />
                    {isOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              className={cn(
                "flex items-center p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white w-full transition-all",
                !isOpen && "lg:justify-center",
              )}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="ml-3">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
