import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">O que nossos investidores dizem</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Veja os depoimentos de quem já está lucrando com o Cash Fund
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-400 italic">
                "Comecei com um pequeno investimento e em apenas 30 dias já consegui dobrar meu capital. O programa de
                afiliados também me rendeu uma boa comissão!"
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>RM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Ricardo Mendes</p>
                  <p className="text-sm text-gray-500">Investidor há 3 meses</p>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-400 italic">
                "O rendimento diário é consistente e os saques são processados rapidamente. Já indiquei para vários
                amigos e estou ganhando comissões todos os dias."
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Carla Santos</p>
                  <p className="text-sm text-gray-500">Investidora há 6 meses</p>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-400 italic">
                "Nunca tinha investido em criptomoedas antes, mas o Cash Fund tornou tudo muito simples. O suporte é
                excelente e os rendimentos são pagos pontualmente."
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>MA</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Marcos Almeida</p>
                  <p className="text-sm text-gray-500">Investidor há 2 meses</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
