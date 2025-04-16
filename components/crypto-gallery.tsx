"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export default function CryptoGallery() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const images = [
    {
      src: "/images/bitcoin-circuit.png",
      alt: "Bitcoin Circuit",
      title: "Bitcoin",
      description: "A principal criptomoeda do mercado",
    },
    {
      src: "/images/ethereum-chart.png",
      alt: "Ethereum Chart",
      title: "Ethereum",
      description: "Plataforma de contratos inteligentes",
    },
    {
      src: "/images/bitcoin-energy.png",
      alt: "Bitcoin Energy",
      title: "Tecnologia Blockchain",
      description: "Segurança e transparência garantidas",
    },
    {
      src: "/images/bitcoin-future.png",
      alt: "Bitcoin Future",
      title: "Futuro das Finanças",
      description: "Revolucionando o mercado financeiro",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="w-full bg-black py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">Tecnologia de Ponta</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Operamos com as principais criptomoedas do mercado utilizando tecnologia avançada
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {images.map((image, index) => (
            <motion.div key={index} className="group relative overflow-hidden rounded-xl hover-float" variants={item}>
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-xl font-bold text-white">{image.title}</h3>
                  <p className="text-gray-300">{image.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
