import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Tentar usar a função exec_sql se existir
    async function executeSql(sql: string) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

        if (error) {
          console.error("Erro ao executar SQL via RPC:", error)
          throw error
        }

        return { success: true }
      } catch (error: any) {
        console.error("Erro ao executar SQL:", error)
        throw new Error(`Erro ao executar SQL: ${error.message}`)
      }
    }

    // Verificar se a função exec_sql existe
    try {
      await executeSql("SELECT 1")
      console.log("Função exec_sql verificada com sucesso")
    } catch (error: any) {
      console.error("Função exec_sql não existe ou não está funcionando:", error)
      return NextResponse.json(
        {
          success: false,
          error: "A função exec_sql não existe ou não está funcionando. Configure-a primeiro.",
        },
        { status: 500 },
      )
    }

    // Criar tabela bot_global_config
    try {
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.bot_global_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          active BOOLEAN DEFAULT TRUE,
          risk_level INTEGER DEFAULT 2,
          strategy TEXT DEFAULT 'smart_ai',
          daily_target DECIMAL(5, 2) DEFAULT 4.0,
          max_drawdown DECIMAL(5, 2) DEFAULT 5.0,
          trading_pairs TEXT[] DEFAULT ARRAY['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
          operating_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Inserir configuração padrão se a tabela estiver vazia
        INSERT INTO public.bot_global_config (
          active, 
          risk_level, 
          strategy, 
          daily_target, 
          max_drawdown, 
          trading_pairs, 
          operating_days
        )
        SELECT 
          TRUE, 
          2, 
          'smart_ai', 
          4.0, 
          5.0, 
          ARRAY['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'], 
          ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        WHERE NOT EXISTS (SELECT 1 FROM public.bot_global_config LIMIT 1);
      `)
      console.log("Tabela bot_global_config verificada/criada com sucesso")

      // Criar tabela bot_config
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.bot_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          active BOOLEAN DEFAULT TRUE,
          risk_level INTEGER DEFAULT 2,
          strategy TEXT DEFAULT 'smart_ai',
          daily_target DECIMAL(5, 2) DEFAULT 4.0,
          max_drawdown DECIMAL(5, 2) DEFAULT 5.0,
          trading_pairs TEXT[] DEFAULT ARRAY['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
          auto_restart BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_bot_config_user_id ON public.bot_config(user_id);
      `)
      console.log("Tabela bot_config verificada/criada com sucesso")

      // Criar tabela bot_trades
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.bot_trades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trade_id TEXT NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id),
          symbol TEXT NOT NULL,
          type TEXT NOT NULL,
          entry_price DECIMAL(15, 5) NOT NULL,
          current_price DECIMAL(15, 5) NOT NULL,
          close_price DECIMAL(15, 5),
          amount DECIMAL(15, 2) NOT NULL,
          lot_size DECIMAL(10, 2) NOT NULL,
          profit DECIMAL(15, 2) DEFAULT 0,
          profit_percent DECIMAL(10, 2) DEFAULT 0,
          stop_loss DECIMAL(15, 5),
          take_profit DECIMAL(15, 5),
          status TEXT NOT NULL,
          close_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          close_time TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_bot_trades_user_id ON public.bot_trades(user_id);
        CREATE INDEX IF NOT EXISTS idx_bot_trades_status ON public.bot_trades(status);
      `)
      console.log("Tabela bot_trades verificada/criada com sucesso")

      // Criar tabela bot_daily_performance
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.bot_daily_performance (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          date DATE NOT NULL,
          daily_profit DECIMAL(15, 2) DEFAULT 0,
          daily_profit_percentage DECIMAL(10, 2) DEFAULT 0,
          total_trades INTEGER DEFAULT 0,
          successful_trades INTEGER DEFAULT 0,
          failed_trades INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_bot_daily_performance_date ON public.bot_daily_performance(date);
      `)
      console.log("Tabela bot_daily_performance verificada/criada com sucesso")

      // Criar tabela bot_performance_logs
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.bot_performance_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT NOT NULL,
          daily_profit DECIMAL(15, 2) DEFAULT 0,
          daily_profit_percentage DECIMAL(10, 2) DEFAULT 0,
          total_trades INTEGER DEFAULT 0,
          successful_trades INTEGER DEFAULT 0,
          failed_trades INTEGER DEFAULT 0,
          active_users INTEGER DEFAULT 0
        );
      `)
      console.log("Tabela bot_performance_logs verificada/criada com sucesso")

      // Criar tabela user_daily_profits
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.user_daily_profits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          date DATE NOT NULL,
          profit DECIMAL(15, 2) DEFAULT 0,
          profit_percentage DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_daily_profits_user_id ON public.user_daily_profits(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_daily_profits_date ON public.user_daily_profits(date);
      `)
      console.log("Tabela user_daily_profits verificada/criada com sucesso")

      return NextResponse.json({ success: true, message: "Tabelas do bot inicializadas com sucesso" })
    } catch (error: any) {
      console.error("Erro ao criar tabelas do bot:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Erro ao inicializar tabelas do bot:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
