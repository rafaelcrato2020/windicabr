import { createServerClient } from "@/utils/supabase/server-api"
import { TradingBotService } from "@/services/trading-bot-service"

async function startBot() {
  try {
    console.log("Starting trading bot service...")
    const supabase = createServerClient()
    const botService = new TradingBotService(supabase)

    await botService.initialize()
    console.log("Trading bot service initialized successfully")

    // Manter o script rodando
    setInterval(() => {
      console.log("Bot service heartbeat check:", new Date().toISOString())
    }, 3600000) // 1 hora
  } catch (error) {
    console.error("Error starting bot service:", error)
  }
}

// Iniciar o bot
startBot()
