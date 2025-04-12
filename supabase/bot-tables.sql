-- Tabela para configuração global do bot
CREATE TABLE IF NOT EXISTS bot_global_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  active BOOLEAN DEFAULT TRUE,
  risk_level INTEGER DEFAULT 2,
  strategy TEXT DEFAULT 'smart_ai',
  daily_target NUMERIC DEFAULT 4.0,
  max_drawdown NUMERIC DEFAULT 5.0,
  trading_pairs TEXT[] DEFAULT ARRAY['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
  operating_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para operações do bot
CREATE TABLE IF NOT EXISTS bot_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  close_price NUMERIC,
  amount NUMERIC NOT NULL,
  lot_size NUMERIC NOT NULL,
  profit NUMERIC DEFAULT 0,
  profit_percent NUMERIC DEFAULT 0,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  status TEXT NOT NULL,
  close_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  close_time TIMESTAMP WITH TIME ZONE
);

-- Tabela para desempenho diário do bot
CREATE TABLE IF NOT EXISTS bot_daily_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  daily_profit NUMERIC DEFAULT 0,
  daily_profit_percentage NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  failed_trades INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para lucros diários dos usuários
CREATE TABLE IF NOT EXISTS user_daily_profits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  profit NUMERIC DEFAULT 0,
  profit_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de desempenho do bot
CREATE TABLE IF NOT EXISTS bot_performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  daily_profit NUMERIC DEFAULT 0,
  daily_profit_percentage NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  failed_trades INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0
);

-- Inserir configuração padrão se não existir
INSERT INTO bot_global_config (active, risk_level, strategy, daily_target, max_drawdown)
SELECT TRUE, 2, 'smart_ai', 4.0, 5.0
WHERE NOT EXISTS (SELECT 1 FROM bot_global_config);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_bot_trades_user_id ON bot_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_trades_status ON bot_trades(status);
CREATE INDEX IF NOT EXISTS idx_user_daily_profits_user_id ON user_daily_profits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_profits_date ON user_daily_profits(date);
CREATE INDEX IF NOT EXISTS idx_bot_daily_performance_date ON bot_daily_performance(date);
