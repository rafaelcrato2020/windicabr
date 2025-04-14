"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateReferralLink } from "@/utils/referral"

interface ReferralCardProps {
  referralCode: string
  referralCount: number
}

export default function ReferralCard({ referralCode, referralCount }: ReferralCardProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState("")

  useEffect(() => {
    if (referralCode) {
      setReferralLink(generateReferralLink(referralCode))
    }
  }, [referralCode])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast({
        title: "Link copiado!",
        description: "O link de indicação foi copiado para a área de transferência.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Junte-se a mim na FOREXITY",
          text: "Use meu link de indicação para se cadastrar na FOREXITY e começar a investir!",
          url: referralLink,
        })
        toast({
          title: "Link compartilhado!",
          description: "Obrigado por compartilhar seu link de indicação.",
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card className="bg-black/40 border-green-900/50 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      <CardHeader>
        <CardTitle className="text-xl bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
          Programa de Indicação
        </CardTitle>
        <CardDescription className="text-gray-400">Indique amigos e ganhe comissões em até 4 níveis</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-black/60 rounded-lg p-4 border border-green-900/50">
          <p className="text-sm text-gray-400 mb-2">Seu link de indicação:</p>
          <div className="flex">
            <Input value={referralLink} readOnly className="bg-black/50 border-green-900/50 text-sm" />
            <Button
              variant="outline"
              size="icon"
              className="ml-2 border-green-900/50 hover:bg-green-900/20"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 rounded-lg p-4 border border-green-900/50 text-center">
            <p className="text-sm text-gray-400">Seu código</p>
            <p className="text-xl font-bold text-green-500 mt-1">{referralCode}</p>
          </div>
          <div className="bg-black/60 rounded-lg p-4 border border-green-900/50 text-center">
            <p className="text-sm text-gray-400">Indicados</p>
            <p className="text-xl font-bold text-yellow-500 mt-1">{referralCount}</p>
          </div>
        </div>

        <div className="bg-black/60 rounded-lg p-4 border border-green-900/50">
          <h4 className="font-medium text-green-500 mb-2">Comissões por nível</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-400">Nível 1 (diretos)</span>
              <span className="text-white">10%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">Nível 2</span>
              <span className="text-white">5%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">Nível 3</span>
              <span className="text-white">3%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">Nível 4</span>
              <span className="text-white">2%</span>
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-black font-bold"
          onClick={shareReferralLink}
        >
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar link de indicação
        </Button>
      </CardFooter>
    </Card>
  )
}
