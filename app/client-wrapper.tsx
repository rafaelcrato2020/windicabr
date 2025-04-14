"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const HomePageClient = dynamic(() => import("./home-page-client"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando...</div>,
})

export function ClientWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <HomePageClient />
    </Suspense>
  )
}
