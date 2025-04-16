import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-10 z-0"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0">{/* Particles would be added here with a library like tsparticles */}</div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text">Rendimento Fixo de 4% ao Dia</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300">
            Invista em criptomoedas com rendimento garantido e programa de afiliados em 3 níveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0"
            >
              Comece a Investir
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-500/10"
            >
              Saiba Mais
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-lg card-hover">
              <p className="text-3xl font-bold gradient-text">4%</p>
              <p className="text-gray-600 dark:text-gray-400">Rendimento Diário</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-lg card-hover">
              <p className="text-3xl font-bold gradient-text">10%</p>
              <p className="text-gray-600 dark:text-gray-400">Comissão Nível 1</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-lg card-hover">
              <p className="text-3xl font-bold gradient-text">5%</p>
              <p className="text-gray-600 dark:text-gray-400">Comissão Nível 2</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-lg card-hover">
              <p className="text-3xl font-bold gradient-text">3%</p>
              <p className="text-gray-600 dark:text-gray-400">Comissão Nível 3</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
