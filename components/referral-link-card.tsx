"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Share2, CheckCircle2 } from "lucide-react"
import { generateReferralLink } from "@/utils/referral-utils"

interface ReferralLinkCardProps {
  referralCode: string
}

export function ReferralLinkCard({ referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = generateReferralLink(referralCode)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Falha ao copiar texto: ", err)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Forexity - Plataforma de Investimento",
          text: "Junte-se a mim na Forexity e comece a lucrar no mercado Forex com retornos diários de 6%!",
          url: referralLink,
        })
      } catch (err) {
        console.error("Erro ao compartilhar:", err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card className="bg-black border-green-900">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Share2 className="mr-2 h-5 w-5 text-green-500" />
          Seu Link de Indicação
        </CardTitle>
        <CardDescription className="text-gray-400">
          Compartilhe este link e ganhe comissões quando novos usuários se cadastrarem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={referralLink} readOnly className="bg-black border-green-900 text-white" />
            <Button
              variant="outline"
              size="icon"
              className="border-green-500 text-green-500 hover:bg-green-500/10"
              onClick={copyToClipboard}
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-bold"
              onClick={shareLink}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar Link
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Seu código de referência: <span className="text-green-500 font-bold">{referralCode}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
