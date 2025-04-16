import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tire suas dúvidas sobre o Cash Fund
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como funciona o rendimento diário de 4%?</AccordionTrigger>
              <AccordionContent>
                Nosso sistema de trading automatizado opera 24 horas por dia nos mercados de criptomoedas, aproveitando
                as oscilações de preço para gerar lucros. Garantimos um rendimento fixo de 4% ao dia sobre o valor
                investido, que é creditado automaticamente em sua conta.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Qual é o valor mínimo para investir?</AccordionTrigger>
              <AccordionContent>
                O valor mínimo para começar a investir no Cash Fund é de R$ 100,00 ou o equivalente em criptomoedas
                (Bitcoin, Ethereum ou Solana).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Como funciona o programa de afiliados?</AccordionTrigger>
              <AccordionContent>
                Nosso programa de afiliados oferece comissões em 3 níveis: 10% sobre os rendimentos dos seus indicados
                diretos (nível 1), 5% sobre os rendimentos dos indicados dos seus indicados (nível 2) e 3% sobre os
                rendimentos do terceiro nível.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Quanto tempo leva para processar um saque?</AccordionTrigger>
              <AccordionContent>
                Os saques são processados em até 24 horas após a solicitação. O valor é enviado diretamente para a
                carteira de criptomoedas informada no momento do saque.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>É possível perder dinheiro investindo no Cash Fund?</AccordionTrigger>
              <AccordionContent>
                O Cash Fund trabalha com estratégias de trading de baixo risco e garantimos o rendimento fixo de 4% ao
                dia. No entanto, como em qualquer investimento, é importante lembrar que resultados passados não
                garantem resultados futuros.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
