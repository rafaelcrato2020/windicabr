-- Criar tabela de configuração global do bot
CREATE TABLE IF NOT EXISTS public.bot_global_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active BOOLEAN DEFAULT TRUE,
  risk_level INTEGER DEFAULT 2,
  strategy TEXT DEFAULT 'smart_ai',
  daily_target DECIMAL(5, 2) DEFAULT 6.0, -- Alterado de 4.0 para 6.0
  max_drawdown DECIMAL(5, 2) DEFAULT 5.0,
  trading_pairs TEXT[] DEFAULT ARRAY['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
  operating_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  trading_days INTEGER DEFAULT 20, -- Adicionado número de dias úteis para operar
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
  operating_days,
  trading_days
)
SELECT 
  TRUE, 
  2, 
  'smart_ai', 
  6.0, -- Alterado de 4.0 para 6.0
  5.0, 
  ARRAY['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'], 
  ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  20 -- 20 dias úteis
WHERE NOT EXISTS (SELECT 1 FROM public.bot_global_config LIMIT 1);
