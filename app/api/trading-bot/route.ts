import { NextResponse } from "next/server"
import { createServerClient } from "@/utils/supabase/server-api"
import { TradingBotService } from "@/services/trading-bot-service"

// Instância singleton do serviço do bot
let botService: TradingBotService | null = null

// Inicializar o serviço do bot se ainda não estiver inicializado
async function initBotService() {
  if (!botService) {
    const supabase = createServerClient()
    botService = new TradingBotService(supabase)
    await botService.initialize()
    console.log("Bot service initialized on server")
  }
  return botService
}

// Endpoint para iniciar o bot
export async function POST(request: Request) {
  try {
    const service = await initBotService()
    const result = await service.startBot()

    return NextResponse.json({ success: true, message: "Bot started successfully", status: result })
  } catch (error: any) {
    console.error("Error starting bot:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Endpoint para verificar o status do bot
export async function GET(request: Request) {
  try {
    const service = await initBotService()
    const status = service.getBotStatus()

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error("Error getting bot status:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
