// Serviço de automação do bot de trading
import { createBrowserClient } from "@/utils/supabase/client"

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
  autoRestart: boolean
}

// Estado do bot
export interface BotState {
  isActive: boolean
  status: "analyzing" | "trading" | "waiting" | "paused" | "target_reached"
  dailyProfit: number
  dailyProfitPercentage: number
  targetReached: boolean
  lastUpdate: Date
  trades: BotTrade[]
  currentPrices: Record<string, number>
  candlestickData: Record<string, CandlestickData[]>
  activeSymbol: string
  timeframe: string
  tradingPairs: string[]
  stats: {
    winRate: number
    totalTrades: number
    avgProfit: number
    profitFactor: number
    dailyProfit: number
    weeklyProfit: number
    monthlyProfit: number
  }
}

// Classe principal do bot
export class AutoTradingBot {
  private config: BotConfig
  private state: BotState
  private supabase: any
  private chartUpdateInterval: NodeJS.Timeout | null = null
  private tradeInterval: NodeJS.Timeout | null = null
  private statusCheckInterval: NodeJS.Timeout | null = null
  private listeners: Array<(state: BotState) => void> = []
  private userId: string | null = null
  private lastEarningsDate: string | null = null
  private investedBalance = 0

  constructor() {
    // Configuração padrão
    this.config = {
      active: true,
      riskLevel: 2,
      strategy: "smart_ai",
      dailyTarget: 4, // 4% ao dia
      maxDrawdown: 5, // 5% de drawdown máximo
      tradingPairs: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"],
      autoRestart: true,
    }

    // Estado inicial
    this.state = {
      isActive: true,
      status: "analyzing",
      dailyProfit: 0,
      dailyProfitPercentage: 0,
      targetReached: false,
      lastUpdate: new Date(),
      trades: [],
      currentPrices: {
        EURUSD: 1.07845,
        XAUUSD: 2328.45,
        GBPUSD: 1.25432,
        USDJPY: 153.45,
        AUDUSD: 0.65432,
      },
      candlestickData: {},
      activeSymbol: "EURUSD",
      timeframe: "M15",
      tradingPairs: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"], // Adicionar esta linha
      stats: {
        winRate: 78,
        totalTrades: 143,
        avgProfit: 0.12,
        profitFactor: 2.35,
        dailyProfit: 0,
        weeklyProfit: 18.5,
        monthlyProfit: 42.3,
      },
    }

    // Inicializar Supabase
    this.supabase = createBrowserClient()

    // Inicializar dados de velas
    this.initializeCandlestickData()
  }

  // Iniciar o bot
  public async start(): Promise<void> {
    try {
      // Verificar se o usuário está autenticado
      const {
        data: { session },
      } = await this.supabase.auth.getSession()
      if (!session) {
        console.error("Usuário não autenticado")
        return
      }

      this.userId = session.user.id

      try {
        // Buscar configurações do usuário (se existirem)
        await this.loadUserConfig()
      } catch (configError) {
        console.warn("Erro ao carregar configuração, usando padrões:", configError)
        // Continuar com as configurações padrão
      }

      try {
        // Buscar saldo investido
        await this.loadInvestedBalance()
      } catch (balanceError) {
        console.warn("Erro ao carregar saldo investido:", balanceError)
        // Continuar com saldo zero
        this.investedBalance = 0
      }

      try {
        // Verificar se já atingiu a meta diária
        await this.checkDailyEarnings()
      } catch (earningsError) {
        console.warn("Erro ao verificar rendimentos diários:", earningsError)
        // Continuar assumindo que não atingiu a meta
        this.state.targetReached = false
      }

      // Iniciar o bot apenas se não tiver atingido a meta
      if (!this.state.targetReached) {
        this.state.isActive = true
        this.state.status = "analyzing"

        // Iniciar intervalos
        this.startIntervals()

        // Notificar ouvintes
        this.notifyListeners()

        console.log("Bot iniciado com sucesso")
      } else {
        this.state.status = "target_reached"
        this.notifyListeners()
        console.log("Bot não iniciado: meta diária já atingida")
      }
    } catch (error) {
      console.error("Erro ao iniciar o bot:", error)
    }
  }

  // Parar o bot
  public stop(): void {
    this.state.isActive = false
    this.state.status = "paused"

    // Limpar intervalos
    this.clearIntervals()

    // Notificar ouvintes
    this.notifyListeners()

    console.log("Bot parado")
  }

  // Adicionar ouvinte para mudanças de estado
  public addListener(listener: (state: BotState) => void): void {
    this.listeners.push(listener)
  }

  // Remover ouvinte
  public removeListener(listener: (state: BotState) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  // Obter estado atual
  public getState(): BotState {
    return { ...this.state }
  }

  // Atualizar configuração
  public updateConfig(config: Partial<BotConfig>): void {
    this.config = { ...this.config, ...config }

    // Atualizar tradingPairs no estado se for fornecido na configuração
    if (config.tradingPairs) {
      this.state.tradingPairs = config.tradingPairs
    }

    // Salvar configuração no banco de dados
    this.saveUserConfig()

    // Reiniciar intervalos se o bot estiver ativo
    if (this.state.isActive) {
      this.clearIntervals()
      this.startIntervals()
    }
  }

  // Fechar uma operação manualmente
  public closePosition(tradeId: string): void {
    const trade = this.state.trades.find((t) => t.id === tradeId && t.status === "open")
    if (!trade) return

    // Atualizar a operação
    trade.status = "closed"
    trade.closePrice = trade.currentPrice
    trade.closeTime = new Date().toLocaleTimeString()

    // Atualizar estado
    this.state.trades = this.state.trades.map((t) => (t.id === tradeId ? trade : t))

    // Calcular lucro diário
    this.calculateDailyProfit()

    // Verificar se atingiu a meta
    this.checkDailyTarget()

    // Notificar ouvintes
    this.notifyListeners()
  }

  // Métodos privados
  private async loadUserConfig(): Promise<void> {
    if (!this.userId) return

    try {
      // Verificar se a tabela existe antes de tentar acessá-la
      const { data: tableExists, error: tableCheckError } = await this.supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_name", "bot_config")
        .single()

      if (tableCheckError || !tableExists) {
        console.log("Tabela bot_config não existe. Usando configuração padrão.")
        return
      }

      const { data, error } = await this.supabase.from("bot_config").select("*").eq("user_id", this.userId).single()

      if (error) {
        console.error("Erro ao carregar configuração:", error)
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
          autoRestart: data.auto_restart,
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configuração do usuário:", error)
    }
  }

  private async saveUserConfig(): Promise<void> {
    if (!this.userId) return

    try {
      const { error } = await this.supabase.from("bot_config").upsert({
        user_id: this.userId,
        active: this.config.active,
        risk_level: this.config.riskLevel,
        strategy: this.config.strategy,
        daily_target: this.config.dailyTarget,
        max_drawdown: this.config.maxDrawdown,
        trading_pairs: this.config.tradingPairs,
        auto_restart: this.config.autoRestart,
      })

      if (error) {
        console.error("Erro ao salvar configuração:", error)
      }
    } catch (error) {
      console.error("Erro ao salvar configuração do usuário:", error)
    }
  }

  private async loadInvestedBalance(): Promise<void> {
    if (!this.userId) return

    try {
      const { data, error } = await this.supabase
        .from("investments")
        .select("amount")
        .eq("user_id", this.userId)
        .eq("status", "active")

      if (error) {
        console.error("Erro ao carregar saldo investido:", error)
        return
      }

      if (data && data.length > 0) {
        this.investedBalance = data.reduce((sum: number, item: any) => sum + (Number.parseFloat(item.amount) || 0), 0)
      }
    } catch (error) {
      console.error("Erro ao carregar saldo investido:", error)
    }
  }

  private async checkDailyEarnings(): Promise<void> {
    if (!this.userId) return

    try {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Buscar transações de rendimento mais recentes
      const { data, error } = await this.supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("user_id", this.userId)
        .in("type", ["yield", "earning"])
        .eq("status", "completed")
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Erro ao verificar rendimentos diários:", error)
        return
      }

      if (data && data.length > 0) {
        this.lastEarningsDate = data[0].created_at

        // Verificar se já gerou rendimento hoje
        const lastEarningsDate = new Date(data[0].created_at)
        if (
          lastEarningsDate.getDate() === today.getDate() &&
          lastEarningsDate.getMonth() === today.getMonth() &&
          lastEarningsDate.getFullYear() === today.getFullYear()
        ) {
          this.state.targetReached = true
          this.state.dailyProfit = Number.parseFloat(data[0].amount) || 0
          this.state.dailyProfitPercentage =
            this.investedBalance > 0 ? (this.state.dailyProfit / this.investedBalance) * 100 : 0
        }
      }
    } catch (error) {
      console.error("Erro ao verificar rendimentos diários:", error)
    }
  }

  private startIntervals(): void {
    // Atualizar gráfico a cada 5 segundos
    this.chartUpdateInterval = setInterval(() => this.updateChartData(), 5000)

    // Criar novas operações a cada 15 segundos
    this.tradeInterval = setInterval(() => this.createNewTrade(), 15000)

    // Verificar status a cada minuto
    this.statusCheckInterval = setInterval(() => this.checkStatus(), 60000)
  }

  private clearIntervals(): void {
    if (this.chartUpdateInterval) {
      clearInterval(this.chartUpdateInterval)
      this.chartUpdateInterval = null
    }

    if (this.tradeInterval) {
      clearInterval(this.tradeInterval)
      this.tradeInterval = null
    }

    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval)
      this.statusCheckInterval = null
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()))
  }

  private initializeCandlestickData(): void {
    const now = new Date().getTime()
    const initialData: Record<string, CandlestickData[]> = {}

    // Preços base para cada par
    const basePrices = {
      EURUSD: 1.07845,
      XAUUSD: 2328.45,
      GBPUSD: 1.25432,
      USDJPY: 153.45,
      AUDUSD: 0.65432,
    }

    // Volatilidade para cada par
    const volatility = {
      EURUSD: 0.0008,
      XAUUSD: 2.5,
      GBPUSD: 0.0012,
      USDJPY: 0.15,
      AUDUSD: 0.0006,
    }

    // Gerar 100 velas para cada par
    Object.keys(basePrices).forEach((symbol) => {
      initialData[symbol] = []
      const basePrice = basePrices[symbol as keyof typeof basePrices]
      const vol = volatility[symbol as keyof typeof volatility]

      for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 900000 // 15 minutos por vela (M15)
        const open = i === 0 ? basePrice : initialData[symbol][i - 1].close

        const change = (Math.random() * 2 - 1) * vol
        const close = open + change

        const upCandle = close > open
        const highAdd = upCandle ? Math.random() * vol * 0.5 : Math.random() * vol * 0.3
        const lowAdd = upCandle ? Math.random() * vol * 0.3 : Math.random() * vol * 0.5

        const high = Math.max(open, close) + highAdd
        const low = Math.min(open, close) - lowAdd
        const volume = Math.floor(Math.random() * 1000) + 500

        initialData[symbol].push({ time, open, high, low, close, volume })
      }
    })

    this.state.candlestickData = initialData
  }

  private updateChartData(): void {
    if (!this.state.isActive) return

    // Atualizar dados de velas
    const updatedData = { ...this.state.candlestickData }
    const updatedPrices = { ...this.state.currentPrices }

    // Atualizar cada par
    Object.keys(updatedData).forEach((symbol) => {
      const data = [...updatedData[symbol]]
      const lastCandle = data[data.length - 1]
      const now = new Date().getTime()

      // Volatilidade para cada par
      const volatility =
        {
          EURUSD: 0.0008,
          XAUUSD: 2.5,
          GBPUSD: 0.0012,
          USDJPY: 0.15,
          AUDUSD: 0.0006,
        }[symbol] || 0.0008

      // Se passaram mais de 15 minutos desde a última vela, criar uma nova
      if (now - lastCandle.time > 900000) {
        const newOpen = lastCandle.close
        const change = (Math.random() * 2 - 1) * volatility
        const newClose = newOpen + change

        const upCandle = newClose > newOpen
        const highAdd = upCandle ? Math.random() * volatility * 0.5 : Math.random() * volatility * 0.3
        const lowAdd = upCandle ? Math.random() * volatility * 0.3 : Math.random() * volatility * 0.5

        const newHigh = Math.max(newOpen, newClose) + highAdd
        const newLow = Math.min(newOpen, newClose) - lowAdd
        const volume = Math.floor(Math.random() * 1000) + 500

        const newCandle = {
          time: now,
          open: newOpen,
          high: newHigh,
          low: newLow,
          close: newClose,
          volume,
        }

        // Atualizar o preço atual
        updatedPrices[symbol] = newClose

        updatedData[symbol] = [...data.slice(1), newCandle] // Manter apenas as últimas 100 velas
      } else {
        // Caso contrário, atualizar a vela atual
        const updatedLastCandle = { ...lastCandle }
        const change = (Math.random() * 2 - 1) * (volatility * 0.3)
        updatedLastCandle.close = lastCandle.close + change
        updatedLastCandle.high = Math.max(updatedLastCandle.high, updatedLastCandle.close)
        updatedLastCandle.low = Math.min(updatedLastCandle.low, updatedLastCandle.close)
        updatedLastCandle.volume += Math.floor(Math.random() * 50)

        // Atualizar o preço atual
        updatedPrices[symbol] = updatedLastCandle.close

        updatedData[symbol] = [...data.slice(0, -1), updatedLastCandle]
      }
    })

    // Atualizar estado
    this.state.candlestickData = updatedData
    this.state.currentPrices = updatedPrices
    this.state.lastUpdate = new Date()

    // Atualizar operações abertas
    this.updateOpenTrades()

    // Notificar ouvintes
    this.notifyListeners()
  }

  private updateOpenTrades(): void {
    // Atualizar operações abertas
    this.state.trades = this.state.trades.map((trade) => {
      if (trade.status === "open") {
        const currentPrice = this.state.currentPrices[trade.symbol]
        const isGold = trade.symbol.includes("XAU")

        // Calcular lucro
        const pipValue = isGold ? 0.01 : 0.0001
        const pips = Math.abs(currentPrice - trade.entryPrice) / pipValue
        const profit = (trade.type === "buy" ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice)
          ? pips * trade.lotSize * (isGold ? 10 : 10)
          : -pips * trade.lotSize * (isGold ? 10 : 10)

        const profitPercent = (profit / trade.amount) * 100

        // Verificar se atingiu stop loss ou take profit
        let status = "open"
        let closePrice = undefined
        let closeTime = undefined

        if (
          trade.stopLoss &&
          ((trade.type === "buy" && currentPrice <= trade.stopLoss) ||
            (trade.type === "sell" && currentPrice >= trade.stopLoss))
        ) {
          status = "closed"
          closePrice = trade.stopLoss
          closeTime = new Date().toLocaleTimeString()
        } else if (
          trade.takeProfit &&
          ((trade.type === "buy" && currentPrice >= trade.takeProfit) ||
            (trade.type === "sell" && currentPrice <= trade.takeProfit))
        ) {
          status = "closed"
          closePrice = trade.takeProfit
          closeTime = new Date().toLocaleTimeString()
        }

        return {
          ...trade,
          currentPrice,
          profit,
          profitPercent,
          status,
          closePrice,
          closeTime,
        }
      }
      return trade
    })

    // Calcular lucro diário
    this.calculateDailyProfit()

    // Verificar se atingiu a meta
    this.checkDailyTarget()
  }

  private createNewTrade(): void {
    if (!this.state.isActive || this.state.targetReached) return

    // Chance de criar uma nova operação (70%)
    if (Math.random() > 0.3) {
      const now = new Date()

      // Escolher um par aleatório da lista de pares configurados
      const tradingPairs =
        this.config.tradingPairs.length > 0
          ? this.config.tradingPairs
          : ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "AUDUSD"]

      const symbol = tradingPairs[Math.floor(Math.random() * tradingPairs.length)]
      const isGold = symbol.includes("XAU")
      const currentPrice = this.state.currentPrices[symbol] || 0

      // Se não tiver preço para este par, pular
      if (currentPrice === 0) return

      // Escolher direção (compra/venda)
      const type = Math.random() > 0.5 ? "buy" : "sell"

      // Tamanho do lote baseado no nível de risco
      const lotSize =
        this.config.riskLevel === 1
          ? Math.random() > 0.5
            ? 0.01
            : 0.02
          : this.config.riskLevel === 2
            ? Math.random() > 0.5
              ? 0.05
              : 0.1
            : Math.random() > 0.5
              ? 0.1
              : 0.2

      // Calcular stop loss e take profit
      const pipValue = isGold ? 0.01 : 0.0001
      const stopPips = this.config.riskLevel === 1 ? 15 : this.config.riskLevel === 2 ? 25 : 40
      const tpPips = this.config.riskLevel === 1 ? 30 : this.config.riskLevel === 2 ? 50 : 80

      const stopLoss = type === "buy" ? currentPrice - stopPips * pipValue : currentPrice + stopPips * pipValue
      const takeProfit = type === "buy" ? currentPrice + tpPips * pipValue : currentPrice - tpPips * pipValue

      // Criar nova operação
      const newTrade: BotTrade = {
        id: `trade-${Date.now()}`,
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
      }

      // Adicionar ao estado
      this.state.trades = [...this.state.trades, newTrade]

      // Atualizar status
      this.state.status = "trading"

      // Notificar ouvintes
      this.notifyListeners()
    } else if (Math.random() > 0.7) {
      // Chance de mudar o status (30%)
      const statuses: ("analyzing" | "trading" | "waiting")[] = ["analyzing", "trading", "waiting"]
      this.state.status = statuses[Math.floor(Math.random() * statuses.length)]

      // Notificar ouvintes
      this.notifyListeners()
    }
  }

  private calculateDailyProfit(): void {
    // Calcular lucro diário com base nas operações fechadas
    const closedTrades = this.state.trades.filter((t) => t.status === "closed")
    const totalProfit = closedTrades.reduce((sum, t) => sum + t.profit, 0)

    // Atualizar estatísticas
    this.state.dailyProfit = totalProfit
    this.state.dailyProfitPercentage = this.investedBalance > 0 ? (totalProfit / this.investedBalance) * 100 : 0

    // Atualizar estatísticas do bot
    const winningTrades = closedTrades.filter((t) => t.profit > 0)
    const winRate =
      closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : this.state.stats.winRate

    const totalLoss = closedTrades.reduce((sum, t) => (t.profit < 0 ? sum + Math.abs(t.profit) : sum), 0)
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : this.state.stats.profitFactor

    this.state.stats = {
      ...this.state.stats,
      winRate: Math.round(winRate),
      totalTrades: closedTrades.length,
      profitFactor,
      dailyProfit: this.state.dailyProfitPercentage,
    }
  }

  private checkDailyTarget(): void {
    // Verificar se atingiu a meta diária
    if (this.state.dailyProfitPercentage >= this.config.dailyTarget && !this.state.targetReached) {
      this.state.targetReached = true
      this.state.status = "target_reached"

      // Registrar o rendimento no banco de dados
      this.registerDailyEarnings()

      // Notificar ouvintes
      this.notifyListeners()
    }
  }

  private async registerDailyEarnings(): Promise<void> {
    if (!this.userId || this.investedBalance <= 0) return

    try {
      // Calcular 4% do valor investido
      const earningsAmount = this.investedBalance * (this.config.dailyTarget / 100)

      // 1. Registrar a transação de rendimento
      const { error: transactionError } = await this.supabase.from("transactions").insert({
        user_id: this.userId,
        amount: earningsAmount,
        type: "earning",
        description: `Rendimento diário de ${this.config.dailyTarget}% (${this.formatCurrency(earningsAmount)})`,
        status: "completed",
      })

      if (transactionError) {
        console.error("Erro ao registrar rendimento:", transactionError)
        return
      }

      // 2. Atualizar o saldo do usuário
      const { data: profileData, error: profileError } = await this.supabase
        .from("profiles")
        .select("balance")
        .eq("id", this.userId)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        return
      }

      const newBalance = (profileData?.balance || 0) + earningsAmount

      const { error: updateBalanceError } = await this.supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", this.userId)

      if (updateBalanceError) {
        console.error("Erro ao atualizar saldo:", updateBalanceError)
        return
      }

      // 3. Atualizar o total de rendimentos para cada investimento
      const { data: investments, error: investmentsError } = await this.supabase
        .from("investments")
        .select("id, amount, total_earnings")
        .eq("user_id", this.userId)
        .eq("status", "active")

      if (investmentsError) {
        console.error("Erro ao buscar investimentos:", investmentsError)
        return
      }

      // Distribuir o rendimento proporcionalmente entre os investimentos
      for (const investment of investments) {
        const proportion = investment.amount / this.investedBalance
        const investmentEarning = earningsAmount * proportion
        const newTotalEarnings = (investment.total_earnings || 0) + investmentEarning

        const { error: updateInvestmentError } = await this.supabase
          .from("investments")
          .update({ total_earnings: newTotalEarnings })
          .eq("id", investment.id)

        if (updateInvestmentError) {
          console.error("Erro ao atualizar rendimento do investimento:", updateInvestmentError)
        }
      }

      console.log(`Rendimento diário de ${this.config.dailyTarget}% registrado com sucesso`)
    } catch (error) {
      console.error("Erro ao registrar rendimento diário:", error)
    }
  }

  private checkStatus(): void {
    if (!this.state.isActive) return

    const now = new Date()

    // Verificar se é um novo dia
    if (this.state.targetReached && this.config.autoRestart) {
      const lastEarningsDate = this.lastEarningsDate ? new Date(this.lastEarningsDate) : null

      if (lastEarningsDate) {
        // Se o último rendimento foi em um dia diferente, reiniciar o bot
        if (
          lastEarningsDate.getDate() !== now.getDate() ||
          lastEarningsDate.getMonth() !== now.getMonth() ||
          lastEarningsDate.getFullYear() !== now.getFullYear()
        ) {
          // Reiniciar o bot
          this.state.targetReached = false
          this.state.dailyProfit = 0
          this.state.dailyProfitPercentage = 0
          this.state.status = "analyzing"

          // Notificar ouvintes
          this.notifyListeners()

          console.log("Bot reiniciado para um novo dia")
        }
      }
    }
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

// Instância singleton do bot
let botInstance: AutoTradingBot | null = null

export function getAutoTradingBot(): AutoTradingBot {
  if (!botInstance) {
    botInstance = new AutoTradingBot()
  }
  return botInstance
}
