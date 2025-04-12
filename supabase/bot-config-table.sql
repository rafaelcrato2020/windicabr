-- Criar tabela de configuração do bot
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

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_bot_config_user_id ON public.bot_config(user_id);
