import { Button } from "@/components/ui/button"

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comece a investir e receber rendimentos diários em apenas 3 passos simples
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center card-hover relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mb-4 mt-4">Crie sua conta</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Registre-se gratuitamente na plataforma Cash Fund em menos de 2 minutos.
            </p>
            <Button
              variant="outline"
              className="border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-500/10"
            >
              Criar Conta
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center card-hover relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mb-4 mt-4">Faça um depósito</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Deposite Bitcoin, Ethereum ou Solana para começar a investir.
            </p>
            <Button
              variant="outline"
              className="border-blue-500/50 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
            >
              Depositar
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center card-hover relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mb-4 mt-4">Receba rendimentos</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece a receber 4% de rendimento diário automaticamente em sua conta.
            </p>
            <Button
              variant="outline"
              className="border-purple-500/50 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10"
            >
              Ver Rendimentos
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
