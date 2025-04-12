"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowDownUp,
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Verificar inicialmente
    checkMobile()

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkMobile)

    // Limpar listener ao desmontar
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fechar menu móvel quando mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    router.push("/")
  }

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin-panel",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      title: "Usuários",
      href: "/admin-panel/usuarios",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Depósitos",
      href: "/admin-panel/depositos",
      icon: <ArrowDownCircle className="w-5 h-5" />,
    },
    {
      title: "Saques",
      href: "/admin-panel/saques",
      icon: <ArrowUpCircle className="w-5 h-5" />,
    },
    {
      title: "Rendimentos",
      href: "/admin-panel/rendimentos",
      icon: <Percent className="w-5 h-5" />,
    },
    {
      title: "Afiliados",
      href: "/admin-panel/afiliados",
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      href: "/admin-panel/afiliados/processar-comissoes",
      title: "Processar Comissões",
      icon: <ArrowDownUp className="w-5 h-5" />,
    },
    {
      title: "Configurações",
      href: "/admin-panel/configuracoes",
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  // Renderizar botão de menu móvel
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-700 text-white"
      aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
    >
      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  )

  // Renderizar overlay para fechar o menu ao clicar fora
  const MobileOverlay = () =>
    isMobileMenuOpen && (
      <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)} />
    )

  return (
    <>
      <MobileMenuButton />
      <MobileOverlay />

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out transform ${
          isMobile ? (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        } lg:translate-x-0`}
      >
        <div className="p-4">
          <Link href="/admin-panel" className="text-2xl font-bold text-green-500">
            FOREXITY <span className="text-yellow-500">Admin</span>
          </Link>
        </div>

        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm ${
                    pathname === item.href
                      ? "bg-gray-700 text-green-400 border-l-4 border-green-500"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              </li>
            ))}

            <li className="mt-8">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <span className="mr-3">
                  <LogOut className="w-5 h-5" />
                </span>
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
