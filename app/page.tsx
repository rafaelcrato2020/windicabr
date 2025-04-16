import Hero from "@/components/hero"
import Features from "@/components/features"
import AffiliateProgram from "@/components/affiliate-program"
import ReferralCalculator from "@/components/referral-calculator"
import YieldCalculator from "@/components/yield-calculator"
import CryptoSection from "@/components/crypto-section"
import TradingBot from "@/components/trading-bot"
import CryptoGallery from "@/components/crypto-gallery"
import Footer from "@/components/footer"
import FloatingElements from "@/components/floating-elements"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white overflow-hidden">
      <FloatingElements />
      <Navbar />
      <div className="pt-16">
        <Hero />

        <Features />
        <TradingBot />
        <CryptoGallery />
        <AffiliateProgram />
        <div className="w-full max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 relative z-10">
          <ReferralCalculator />
          <YieldCalculator />
        </div>
        <CryptoSection />
        <Footer />
      </div>
    </main>
  )
}
