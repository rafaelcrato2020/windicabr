import type { SupabaseClient } from "@supabase/supabase-js"

// Tipos para as operações do bot
export interface BotTrade {
  id: string
  symbol: string
  type: "buy" | "sell"
  entryPrice: number
  currentPrice: number
  amount: number
  profit: number
  profitPercent: number
  time: string
  status: "open" | "closed" | "pending"
  closePrice?: number
  closeTime?: string
  lotSize: number
  stopLoss?: number
  takeProfit?: number
  userId: string
}

// Tipo para os dados de velas
export interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Configurações do bot
export interface BotConfig {
  active: boolean
  riskLevel: 1 | 2 | 3
  strategy: string
  dailyTarget: number
  maxDrawdown: number
  tradingPairs: string[]
  operatingDays: string[] // dias da semana em que o bot opera
  tradingDays: number // número de dias úteis para operar
}

// Estado do bot
export interface BotStatus {
  isActive: boolean
  status: "analyzing" | "trading" | "waiting" | "paused" | "target_reached" | "weekend"
  dailyProfit: number
  dailyProfitPercentage: number
  targetReached: boolean
  lastUpdate: Date
  activeUsers: number
  totalTrades: number
  successfulTrades: number
  failedTrades: number
  completedDays: number
  totalReturnPercentage: number
}

export class TradingBotService {
  private supabase: SupabaseClient
  private status: BotStatus
  private config: BotConfig
  private intervals: NodeJS.Timeout[] = []
  private isInitialized = false
  private marketData: Record<string, any> = {}
  private activeUsers: Set<string> = new Set()

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient

    // Estado inicial do bot
    this.status = {
      isActive: false,
      status: "paused",
      dailyProfit: 0,
      dailyProfitPercentage: 0,
      targetReached: false,
      lastUpdate: new Date(),
      activeUsers: 0,
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      completedDays: 0,
      totalReturnPercentage: 0,
    }

    // Configuração padrão
    this.config = {
      active: true,
      riskLevel: 2,
      strategy: "smart_ai",
      dailyTarget: 6, // 6% ao dia (alterado de 4% para 6%)
      maxDrawdown: 5, // 5% de drawdown máximo
      tradingPairs: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"],
      operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], // Opera de segunda a sexta
      tradingDays: 20, // 20 dias úteis de operação
    }
  }

  // Inicializar o serviço do bot
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Carregar configurações do banco de dados
      await this.loadConfig()

      // Verificar se é dia de operação
      if (this.isOperatingDay()) {
        // Iniciar o bot
        await this.startBot()
      } else {
        this.status.status = "weekend"
        console.log("Bot not started: Not an operating day")
      }

      // Configurar verificação periódica do dia de operação
      this.setupDailyCheck()

      this.isInitialized = true
    } catch (error) {
      console.error("Error initializing bot service:", error)
      throw error
    }
  }

  // Iniciar o bot
  public async startBot(): Promise<string> {
    try {
      // Verificar se é dia de operação
      if (!this.isOperatingDay()) {
        this.status.status = "weekend"
        return "weekend"
      }

      // Verificar se já atingiu a meta diária
      if (await this.checkDailyTarget()) {
        this.status.status = "target_reached"
        return "target_reached"
      }

      // Iniciar o bot
      this.status.isActive = true
      this.status.status = "analyzing"

      // Iniciar os intervalos para as operações do bot
      this.startIntervals()

      console.log("Bot started successfully")
      return this.status.status
    } catch (error) {
      console.error("Error starting bot:", error)
      this.status.status = "paused"
      return "error"
    }
  }

  // Parar o bot
  public stopBot(): void {
    this.status.isActive = false
    this.status.status = "paused"

    // Limpar intervalos
    this.clearIntervals()

    console.log("Bot stopped")
  }

  // Obter status do bot
  public getBotStatus(): BotStatus {
    // Atualizar número de usuários ativos
    this.status.activeUsers = this.activeUsers.size

    return { ...this.status }
  }

  // Registrar usuário ativo
  public registerActiveUser(userId: string): void {
    this.activeUsers.add(userId)
  }

  // Remover usuário ativo
  public unregisterActiveUser(userId: string): void {
    this.activeUsers.delete(userId)
  }

  // Métodos privados
  private async loadConfig(): Promise<void> {
    try {
      // Verificar primeiro se a tabela existe
      const { data: tableExists, error: tableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_global_config")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_global_config não existe. Usando configuração padrão.")
        return
      }

      // Se a tabela existir, buscar as configurações
      const { data, error } = await this.supabase.from("bot_global_config").select("*").single()

      if (error) {
        console.error("Error loading bot config:", error)
        return
      }

      if (data) {
        this.config = {
          ...this.config,
          active: data.active,
          riskLevel: data.risk_level,
          strategy: data.strategy,
          dailyTarget: data.daily_target,
          maxDrawdown: data.max_drawdown,
          tradingPairs: data.trading_pairs,
          operatingDays: data.operating_days,
          tradingDays: data.trading_days || 20,
        }
      }
    } catch (error) {
      console.error("Error loading bot configuration:", error)
    }
  }

  private isOperatingDay(): boolean {
    const today = new Date()
    const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" })
    return this.config.operatingDays.includes(dayOfWeek)
  }

  private setupDailyCheck(): void {
    // Verificar a cada hora se é dia de operação e se já atingiu a meta
    const interval = setInterval(async () => {
      const isOperatingDay = this.isOperatingDay()
      const targetReached = await this.checkDailyTarget()

      if (isOperatingDay && !targetReached && !this.status.isActive) {
        // Se for dia de operação, não atingiu a meta e o bot está parado, iniciar o bot
        await this.startBot()
      } else if (!isOperatingDay && this.status.isActive) {
        // Se não for dia de operação e o bot está ativo, parar o bot
        this.stopBot()
        this.status.status = "weekend"
      } else if (targetReached && this.status.isActive) {
        // Se atingiu a meta e o bot está ativo, parar o bot
        this.stopBot()
        this.status.status = "target_reached"
      }

      // Verificar se é um novo dia para resetar a meta
      this.checkNewDay()
    }, 3600000) // 1 hora

    this.intervals.push(interval)
  }

  private async checkDailyTarget(): Promise<boolean> {
    try {
      // Verificar se já atingiu a meta diária
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Verificar se a tabela existe
      const { data: tableExists, error: tableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_daily_performance")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_daily_performance não existe. Assumindo que a meta não foi atingida.")
        return false
      }

      const { data, error } = await this.supabase
        .from("bot_daily_performance")
        .select("daily_profit_percentage")
        .gte("date", today.toISOString())
        .single()

      if (error) {
        console.error("Error checking daily target:", error)
        return false
      }

      if (data && data.daily_profit_percentage >= this.config.dailyTarget) {
        this.status.targetReached = true
        this.status.dailyProfitPercentage = data.daily_profit_percentage
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking daily target:", error)
      return false
    }
  }

  private async checkNewDay(): Promise<void> {
    try {
      // Verificar se é um novo dia para resetar a meta
      const lastUpdate = new Date(this.status.lastUpdate)
      const today = new Date()

      if (
        lastUpdate.getDate() !== today.getDate() ||
        lastUpdate.getMonth() !== today.getMonth() ||
        lastUpdate.getFullYear() !== today.getFullYear()
      ) {
        // Resetar a meta diária
        this.status.targetReached = false
        this.status.dailyProfit = 0
        this.status.dailyProfitPercentage = 0

        // Atualizar a data da última atualização
        this.status.lastUpdate = today

        // Se for dia de operação, iniciar o bot
        if (this.isOperatingDay()) {
          await this.startBot()
        }
      }
    } catch (error) {
      console.error("Error checking new day:", error)
    }
  }

  private startIntervals(): void {
    // Limpar intervalos existentes
    this.clearIntervals()

    // Intervalo para atualizar dados de mercado (a cada 5 segundos)
    const marketInterval = setInterval(() => this.updateMarketData(), 5000)
    this.intervals.push(marketInterval)

    // Intervalo para executar operações (a cada 15 segundos)
    const tradingInterval = setInterval(() => this.executeTrades(), 15000)
    this.intervals.push(tradingInterval)

    // Intervalo para verificar operações abertas (a cada 3 segundos)
    const checkTradesInterval = setInterval(() => this.checkOpenTrades(), 3000)
    this.intervals.push(checkTradesInterval)

    // Intervalo para registrar desempenho (a cada 5 minutos)
    const performanceInterval = setInterval(() => this.recordPerformance(), 300000)
    this.intervals.push(performanceInterval)
  }

  private clearIntervals(): void {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []
  }

  private async updateMarketData(): Promise<void> {
    if (!this.status.isActive) return

    try {
      // Simular atualização de dados de mercado
      // Em um ambiente real, isso seria substituído por chamadas a APIs de mercado
      for (const symbol of this.config.tradingPairs) {
        if (!this.marketData[symbol]) {
          this.marketData[symbol] = this.getInitialPrice(symbol)
        }

        // Simular movimento de preço
        const volatility = this.getVolatility(symbol)
        const change = (Math.random() * 2 - 1) * volatility
        const currentPrice = this.marketData[symbol] + change

        this.marketData[symbol] = currentPrice
      }

      // Atualizar timestamp da última atualização
      this.status.lastUpdate = new Date()

      // Alternar entre estados de análise e trading para simular comportamento real
      if (Math.random() > 0.7) {
        const states: ("analyzing" | "trading" | "waiting")[] = ["analyzing", "trading", "waiting"]
        this.status.status = states[Math.floor(Math.random() * states.length)]
      }
    } catch (error) {
      console.error("Error updating market data:", error)
    }
  }

  private async executeTrades(): Promise<void> {
    if (!this.status.isActive || this.status.targetReached) return

    try {
      // Verificar se já atingiu a meta diária
      if (this.status.dailyProfitPercentage >= this.config.dailyTarget) {
        this.status.targetReached = true
        this.status.status = "target_reached"
        await this.recordDailyPerformance()
        this.stopBot()
        return
      }

      // Chance de criar uma nova operação (70%)
      if (Math.random() > 0.3) {
        // Verificar se a tabela investments existe
        const { data: tableExists, error: tableCheckError } = await this.supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .eq("table_name", "investments")
          .single()

        if (tableCheckError || !tableExists) {
          console.log("Tabela investments não existe. Não é possível criar operações.")
          return
        }

        // Obter usuários ativos com investimentos
        const { data: users, error } = await this.supabase
          .from("investments")
          .select("user_id, amount")
          .eq("status", "active")

        if (error) {
          console.error("Error fetching active users:", error)
          return
        }

        if (!users || users.length === 0) {
          console.log("No active users with investments found")
          return
        }

        // Verificar se a tabela bot_trades existe
        const { data: tradesTableExists, error: tradesTableCheckError } = await this.supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .eq("table_name", "bot_trades")
          .single()

        if (tradesTableCheckError || !tradesTableExists) {
          console.log("Tabela bot_trades não existe. Não é possível registrar operações.")
          return
        }

        // Para cada usuário com investimento, criar uma operação
        for (const user of users) {
          // Escolher um par aleatório
          const symbol = this.config.tradingPairs[Math.floor(Math.random() * this.config.tradingPairs.length)]
          const currentPrice = this.marketData[symbol] || this.getInitialPrice(symbol)

          // Escolher direção (compra/venda)
          const type = Math.random() > 0.5 ? "buy" : "sell"

          // Tamanho do lote baseado no nível de risco e valor investido
          const investedAmount = Number.parseFloat(user.amount) || 1000
          const lotSizeBase = Math.min(0.01, investedAmount / 100000) // Máximo de 0.01 lote por $1000 investidos
          const lotSize =
            this.config.riskLevel === 1 ? lotSizeBase : this.config.riskLevel === 2 ? lotSizeBase * 2 : lotSizeBase * 3

          // Calcular stop loss e take profit
          const isGold = symbol.includes("XAU")
          const pipValue = isGold ? 0.01 : 0.0001
          const stopPips = this.config.riskLevel === 1 ? 15 : this.config.riskLevel === 2 ? 25 : 40
          const tpPips = this.config.riskLevel === 1 ? 30 : this.config.riskLevel === 2 ? 50 : 80

          const stopLoss = type === "buy" ? currentPrice - stopPips * pipValue : currentPrice + stopPips * pipValue
          const takeProfit = type === "buy" ? currentPrice + tpPips * pipValue : currentPrice - tpPips * pipValue

          // Criar nova operação
          const tradeId = `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          const now = new Date()

          const newTrade: BotTrade = {
            id: tradeId,
            symbol,
            type,
            entryPrice: currentPrice,
            currentPrice,
            amount: lotSize * 1000,
            profit: 0,
            profitPercent: 0,
            time: now.toLocaleTimeString(),
            status: "open",
            lotSize,
            stopLoss,
            takeProfit,
            userId: user.user_id,
          }

          // Registrar a operação no banco de dados
          const { error: tradeError } = await this.supabase.from("bot_trades").insert({
            trade_id: tradeId,
            user_id: user.user_id,
            symbol,
            type,
            entry_price: currentPrice,
            current_price: currentPrice,
            amount: lotSize * 1000,
            lot_size: lotSize,
            stop_loss: stopLoss,
            take_profit: takeProfit,
            status: "open",
            created_at: now.toISOString(),
          })

          if (tradeError) {
            console.error("Error creating trade:", tradeError)
          } else {
            this.status.totalTrades++
            console.log(`New trade created for user ${user.user_id}: ${symbol} ${type} ${lotSize} lots`)
          }
        }
      }
    } catch (error) {
      console.error("Error executing trades:", error)
    }
  }

  private async checkOpenTrades(): Promise<void> {
    if (!this.status.isActive) return

    try {
      // Verificar se a tabela bot_trades existe
      const { data: tableExists, error: tableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_trades")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_trades não existe. Não é possível verificar operações.")
        return
      }

      // Buscar operações abertas
      const { data: openTrades, error } = await this.supabase.from("bot_trades").select("*").eq("status", "open")

      if (error) {
        console.error("Error fetching open trades:", error)
        return
      }

      if (!openTrades || openTrades.length === 0) return

      // Para cada operação aberta, verificar se atingiu stop loss ou take profit
      for (const trade of openTrades) {
        const symbol = trade.symbol
        const currentPrice = this.marketData[symbol] || this.getInitialPrice(symbol)

        // Atualizar preço atual
        await this.supabase.from("bot_trades").update({ current_price: currentPrice }).eq("trade_id", trade.trade_id)

        // Calcular lucro
        const isGold = symbol.includes("XAU")
        const pipValue = isGold ? 0.01 : 0.0001
        const pips = Math.abs(currentPrice - trade.entry_price) / pipValue
        let profit = (trade.type === "buy" ? currentPrice > trade.entry_price : currentPrice < trade.entry_price)
          ? pips * trade.lot_size * (isGold ? 10 : 10)
          : -pips * trade.lot_size * (isGold ? 10 : 10)

        const profitPercent = (profit / trade.amount) * 100

        // Verificar se atingiu stop loss ou take profit
        let shouldClose = false
        let closeReason = ""

        if (
          trade.stop_loss &&
          ((trade.type === "buy" && currentPrice <= trade.stop_loss) ||
            (trade.type === "sell" && currentPrice >= trade.stop_loss))
        ) {
          shouldClose = true
          closeReason = "stop_loss"
        } else if (
          trade.take_profit &&
          ((trade.type === "buy" && currentPrice >= trade.take_profit) ||
            (trade.type === "sell" && currentPrice <= trade.take_profit))
        ) {
          shouldClose = true
          closeReason = "take_profit"
        }

        // Chance aleatória de fechar com lucro (para garantir a meta de 6%)
        // Isso simula o comportamento de um bot "garantido"
        if (!shouldClose && Math.random() > 0.7) {
          const dailyTargetNearly = this.status.dailyProfitPercentage >= this.config.dailyTarget * 0.8

          if (dailyTargetNearly) {
            // Se estiver próximo da meta diária, aumentar chance de lucro
            if (Math.random() > 0.3) {
              shouldClose = true
              closeReason = "manual_profit"
            }
          } else {
            // Chance normal de lucro (70%)
            if (Math.random() > 0.3) {
              shouldClose = true
              closeReason = "manual_profit"
            }
          }
        }

        if (shouldClose) {
          const now = new Date()

          // Ajustar o preço de fechamento para garantir lucro se for manual_profit
          let closePrice = currentPrice
          if (closeReason === "manual_profit") {
            // Garantir que a operação feche com lucro
            const pipAdjustment = isGold ? 0.05 : 0.0005
            closePrice = trade.type === "buy" ? trade.entry_price + pipAdjustment : trade.entry_price - pipAdjustment

            // Recalcular lucro
            const pips = Math.abs(closePrice - trade.entry_price) / pipValue
            profit = (trade.type === "buy" ? closePrice > trade.entry_price : closePrice < trade.entry_price)
              ? pips * trade.lot_size * (isGold ? 10 : 10)
              : -pips * trade.lot_size * (isGold ? 10 : 10)
          }

          // Fechar a operação
          await this.supabase
            .from("bot_trades")
            .update({
              status: "closed",
              close_price: closePrice,
              close_time: now.toISOString(),
              profit: profit,
              profit_percent: profitPercent,
              close_reason: closeReason,
            })
            .eq("trade_id", trade.trade_id)

          // Atualizar estatísticas
          if (profit > 0) {
            this.status.successfulTrades++
          } else {
            this.status.failedTrades++
          }

          // Atualizar lucro diário
          await this.updateDailyProfit(trade.user_id, profit, profitPercent)

          console.log(`Trade ${trade.trade_id} closed: ${closeReason}, profit: ${profit.toFixed(2)}`)
        }
      }
    } catch (error) {
      console.error("Error checking open trades:", error)
    }
  }

  private async updateDailyProfit(userId: string, profit: number, profitPercent: number): Promise<void> {
    try {
      // Verificar se a tabela investments existe
      const { data: investmentsTableExists, error: investmentsTableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "investments")
        .single()

      if (investmentsTableCheckError || !investmentsTableExists) {
        console.log("Tabela investments não existe. Não é possível atualizar lucro diário.")
        return
      }

      // Buscar investimento do usuário
      const { data: investment, error } = await this.supabase
        .from("investments")
        .select("amount")
        .eq("user_id", userId)
        .eq("status", "active")
        .single()

      if (error) {
        console.error("Error fetching user investment:", error)
        return
      }

      if (!investment) return

      const investedAmount = Number.parseFloat(investment.amount) || 0

      // Calcular percentual de lucro em relação ao investimento
      const profitPercentage = (profit / investedAmount) * 100

      // Verificar se a tabela user_daily_profits existe
      const { data: userProfitsTableExists, error: userProfitsTableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "user_daily_profits")
        .single()

      if (userProfitsTableCheckError || !userProfitsTableExists) {
        console.log("Tabela user_daily_profits não existe. Não é possível registrar lucro diário do usuário.")
        return
      }

      // Atualizar lucro diário do usuário
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Verificar se já existe registro para hoje
      const { data: existingRecord, error: recordError } = await this.supabase
        .from("user_daily_profits")
        .select("*")
        .eq("user_id", userId)
        .gte("date", today.toISOString())
        .single()

      if (recordError && recordError.code !== "PGRST116") {
        console.error("Error checking user daily profit record:", recordError)
        return
      }

      if (existingRecord) {
        // Atualizar registro existente
        const newProfit = existingRecord.profit + profit
        const newProfitPercentage = existingRecord.profit_percentage + profitPercentage

        await this.supabase
          .from("user_daily_profits")
          .update({
            profit: newProfit,
            profit_percentage: newProfitPercentage,
          })
          .eq("id", existingRecord.id)
      } else {
        // Criar novo registro
        await this.supabase.from("user_daily_profits").insert({
          user_id: userId,
          date: today.toISOString(),
          profit: profit,
          profit_percentage: profitPercentage,
        })
      }

      // Atualizar lucro diário global do bot
      await this.updateGlobalDailyProfit(profit, profitPercentage)
    } catch (error) {
      console.error("Error updating daily profit:", error)
    }
  }

  private async updateGlobalDailyProfit(profit: number, profitPercentage: number): Promise<void> {
    try {
      // Verificar se a tabela bot_daily_performance existe
      const { data: tableExists, error: tableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_daily_performance")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_daily_performance não existe. Não é possível registrar desempenho diário.")
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Verificar se já existe registro para hoje
      const { data: existingRecord, error: recordError } = await this.supabase
        .from("bot_daily_performance")
        .select("*")
        .gte("date", today.toISOString())
        .single()

      if (recordError && recordError.code !== "PGRST116") {
        console.error("Error checking bot daily performance record:", recordError)
        return
      }

      if (existingRecord) {
        // Atualizar registro existente
        const newProfit = existingRecord.daily_profit + profit
        const newProfitPercentage = existingRecord.daily_profit_percentage + profitPercentage

        await this.supabase
          .from("bot_daily_performance")
          .update({
            daily_profit: newProfit,
            daily_profit_percentage: newProfitPercentage,
          })
          .eq("id", existingRecord.id)

        // Atualizar estado do bot
        this.status.dailyProfit = newProfit
        this.status.dailyProfitPercentage = newProfitPercentage

        // Verificar se atingiu a meta diária
        if (newProfitPercentage >= this.config.dailyTarget && !this.status.targetReached) {
          this.status.targetReached = true
          this.status.status = "target_reached"

          // Incrementar o contador de dias completos
          this.status.completedDays += 1

          // Atualizar o percentual total de retorno
          this.status.totalReturnPercentage += this.config.dailyTarget

          await this.recordDailyPerformance()
          this.stopBot()
        }
      } else {
        // Criar novo registro
        await this.supabase.from("bot_daily_performance").insert({
          date: today.toISOString(),
          daily_profit: profit,
          daily_profit_percentage: profitPercentage,
          total_trades: 1,
          successful_trades: profit > 0 ? 1 : 0,
          failed_trades: profit <= 0 ? 1 : 0,
        })

        // Atualizar estado do bot
        this.status.dailyProfit = profit
        this.status.dailyProfitPercentage = profitPercentage
      }
    } catch (error) {
      console.error("Error updating global daily profit:", error)
    }
  }

  private async recordPerformance(): Promise<void> {
    if (!this.status.isActive) return

    try {
      // Verificar se a tabela bot_performance_logs existe
      const { data: tableExists, error: tableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_performance_logs")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_performance_logs não existe. Não é possível registrar logs de desempenho.")
        return
      }

      const now = new Date()

      // Registrar desempenho do bot
      await this.supabase.from("bot_performance_logs").insert({
        timestamp: now.toISOString(),
        status: this.status.status,
        daily_profit: this.status.dailyProfit,
        daily_profit_percentage: this.status.dailyProfitPercentage,
        total_trades: this.status.totalTrades,
        successful_trades: this.status.successfulTrades,
        failed_trades: this.status.failedTrades,
        active_users: this.activeUsers.size,
        completed_days: this.status.completedDays,
        total_return_percentage: this.status.totalReturnPercentage,
      })
    } catch (error) {
      console.error("Error recording performance:", error)
    }
  }

  private async recordDailyPerformance(): Promise<void> {
    try {
      // Verificar se a tabela transactions existe
      const { data: transactionsTableExists, error: transactionsTableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "transactions")
        .single()

      if (transactionsTableCheckError || !transactionsTableExists) {
        console.log("Tabela transactions não existe. Não é possível registrar rendimentos.")
        return
      }

      // Verificar se a tabela investments existe
      const { data: investmentsTableExists, error: investmentsTableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "investments")
        .single()

      if (investmentsTableCheckError || !investmentsTableExists) {
        console.log("Tabela investments não existe. Não é possível registrar rendimentos.")
        return
      }

      // Registrar que a meta diária foi atingida
      const today = new Date()

      // Para cada usuário com investimento, registrar o rendimento
      const { data: investments, error } = await this.supabase
        .from("investments")
        .select("user_id, amount")
        .eq("status", "active")

      if (error) {
        console.error("Error fetching investments:", error)
        return
      }

      if (!investments || investments.length === 0) return

      for (const investment of investments) {
        const userId = investment.user_id
        const investedAmount = Number.parseFloat(investment.amount) || 0

        // Calcular 6% do valor investido
        const earningsAmount = investedAmount * (this.config.dailyTarget / 100)

        // 1. Registrar a transação de rendimento
        await this.supabase.from("transactions").insert({
          user_id: userId,
          amount: earningsAmount,
          type: "earning",
          description: `Rendimento diário de ${this.config.dailyTarget}% (${this.formatCurrency(earningsAmount)})`,
          status: "completed",
        })

        // 2. Atualizar o saldo do usuário
        const { data: profileData, error: profileError } = await this.supabase
          .from("profiles")
          .select("balance")
          .eq("id", userId)
          .single()

        if (!profileError && profileData) {
          const newBalance = (profileData.balance || 0) + earningsAmount

          await this.supabase.from("profiles").update({ balance: newBalance }).eq("id", userId)
        }

        // 3. Atualizar o total de rendimentos para o investimento
        const { data: investmentData, error: investmentError } = await this.supabase
          .from("investments")
          .select("total_earnings")
          .eq("user_id", userId)
          .eq("status", "active")
          .single()

        if (!investmentError && investmentData) {
          const newTotalEarnings = (investmentData.total_earnings || 0) + earningsAmount

          await this.supabase
            .from("investments")
            .update({ total_earnings: newTotalEarnings })
            .eq("user_id", userId)
            .eq("status", "active")
        }

        console.log(`Daily earnings of ${this.config.dailyTarget}% registered for user ${userId}: ${earningsAmount}`)
      }

      // Incrementar o contador de dias completos
      this.status.completedDays += 1

      // Verificar se atingiu o número máximo de dias de operação
      if (this.status.completedDays >= this.config.tradingDays) {
        console.log(
          `Ciclo de ${this.config.tradingDays} dias completo com rendimento total de ${this.status.totalReturnPercentage}%`,
        )
      }
    } catch (error) {
      console.error("Error recording daily performance:", error)
    }
  }

  private getInitialPrice(symbol: string): number {
    const prices = {
      EURUSD: 1.07845,
      XAUUSD: 2328.45,
      GBPUSD: 1.25432,
      USDJPY: 153.45,
      AUDUSD: 0.65432,
    }

    return prices[symbol as keyof typeof prices] || 1.0
  }

  private getVolatility(symbol: string): number {
    const volatility = {
      EURUSD: 0.0008,
      XAUUSD: 2.5,
      GBPUSD: 0.0012,
      USDJPY: 0.15,
      AUDUSD: 0.0006,
    }

    return volatility[symbol as keyof typeof volatility] || 0.001
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
}
