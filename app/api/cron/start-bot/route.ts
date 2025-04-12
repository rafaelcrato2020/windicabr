import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server-api"
import { TradingBotService } from "@/services/trading-bot-service"

// Variável para armazenar a instância do bot
let botService: TradingBotService | null = null

export async function GET(request: Request) {
  try {
    // Verificar se o bot já está inicializado
    if (!botService) {
      console.log("Initializing trading bot service...")
      const supabase = createServerClient()
      botService = new TradingBotService(supabase)

      await botService.initialize()
      console.log("Trading bot service initialized successfully")
    } else {
      console.log("Trading bot service already running")
    }

    return NextResponse.json({
      success: true,
      message: "Bot service is running",
      status: botService.getBotStatus(),
    })
  } catch (error: any) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
