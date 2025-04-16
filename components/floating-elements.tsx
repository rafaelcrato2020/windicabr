"use client"

import { useEffect, useState } from "react"

export default function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div className="floating-orb bg-orange-500/20 w-64 h-64 rounded-full absolute -top-20 -left-20 blur-3xl"></div>
      <div className="floating-orb-slow bg-purple-600/20 w-96 h-96 rounded-full absolute top-1/4 -right-48 blur-3xl"></div>
      <div className="floating-orb-reverse bg-blue-500/20 w-80 h-80 rounded-full absolute bottom-1/4 -left-40 blur-3xl"></div>
      <div className="floating-orb-slow bg-green-500/20 w-72 h-72 rounded-full absolute -bottom-20 right-20 blur-3xl"></div>

      {/* Grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      {/* Small floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/30 particle"
          style={{
            width: `${Math.random() * 10 + 2}px`,
            height: `${Math.random() * 10 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 20 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        ></div>
      ))}
    </div>
  )
}
