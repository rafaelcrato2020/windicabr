import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bitcoin, Percent, Users, TrendingUp } from "lucide-react"

export default function Features() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Por que escolher o Cash Fund?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Nossa plataforma oferece rendimentos diários fixos e um programa de afiliados lucrativo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="card-hover">
            <CardHeader>
              <Percent className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Rendimento Fixo</CardTitle>
              <CardDescription>4% de rendimento diário garantido sobre seus investimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Nosso sistema de trading automatizado garante rendimentos consistentes todos os dias.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Bitcoin className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Criptomoedas</CardTitle>
              <CardDescription>Investimentos em Bitcoin, Ethereum e Solana</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Aproveite o potencial das principais criptomoedas do mercado com segurança.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Users className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Programa de Afiliados</CardTitle>
              <CardDescription>Ganhe comissões em 3 níveis de indicação</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                10% no primeiro nível, 5% no segundo nível e 3% no terceiro nível.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Saques Rápidos</CardTitle>
              <CardDescription>Retire seus rendimentos a qualquer momento</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Processamento de saques em até 24 horas diretamente para sua carteira.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
