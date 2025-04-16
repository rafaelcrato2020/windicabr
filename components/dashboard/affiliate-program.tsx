"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Share2, Users, UserPlus, Coins } from "lucide-react"

export default function AffiliateDashboard() {
  const [referralLink, setReferralLink] = useState("https://cashfund.com/ref/johndoe123")
  const [copySuccess, setCopySuccess] = useState(false)

  const affiliateStats = [
    {
      level: 1,
      percentage: "10%",
      count: 12,
      earnings: "$850.00",
      icon: UserPlus,
      color: "from-orange-600/20 to-transparent",
    },
    {
      level: 2,
      percentage: "5%",
      count: 45,
      earnings: "$625.00",
      icon: Users,
      color: "from-green-600/20 to-transparent",
    },
    {
      level: 3,
      percentage: "3%",
      count: 128,
      earnings: "$384.00",
      icon: Coins,
      color: "from-blue-600/20 to-transparent",
    },
  ]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="futuristic-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-orange-500" />
            Seu Link de Indicação
          </CardTitle>
          <CardDescription>Compartilhe seu link e ganhe comissões em 3 níveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
                <span className="ml-2">{copySuccess ? "Copiado!" : "Copiar"}</span>
              </Button>
            </div>
            <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {affiliateStats.map((stat, index) => (
          <Card key={index} className="futuristic-card hover-float border-0">
            <div className={`h-2 w-full rounded-t-lg bg-gradient-to-r ${stat.color}`}></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">Nível {stat.level}</CardTitle>
                <div className="text-3xl font-bold gradient-text">{stat.percentage}</div>
              </div>
              <CardDescription>Comissão sobre investimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Indicados</p>
                  <p className="text-2xl font-bold text-white">{stat.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Ganhos</p>
                  <p className="text-2xl font-bold text-green-500">{stat.earnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="futuristic-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Últimos Indicados</CardTitle>
          <CardDescription>Pessoas que se cadastraram usando seu link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">MR</span>
                </div>
                <div>
                  <p className="text-white">Maria Rodriguez</p>
                  <p className="text-xs text-gray-400">Nível 1 • Registrado há 2 dias</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-medium">+$120.00</p>
                <p className="text-xs text-gray-400">Investimento: $1,200.00</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">JS</span>
                </div>
                <div>
                  <p className="text-white">João Silva</p>
                  <p className="text-xs text-gray-400">Nível 1 • Registrado há 5 dias</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-medium">+$85.00</p>
                <p className="text-xs text-gray-400">Investimento: $850.00</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">AP</span>
                </div>
                <div>
                  <p className="text-white">Ana Pereira</p>
                  <p className="text-xs text-gray-400">Nível 1 • Registrado há 1 semana</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-medium">+$65.00</p>
                <p className="text-xs text-gray-400">Investimento: $650.00</p>
              </div>
            </div>
          </div>

          <Button variant="link" size="sm" className="text-orange-500 mt-4 p-0">
            Ver todos os indicados
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
