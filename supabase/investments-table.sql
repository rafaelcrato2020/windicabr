-- Tabela para armazenar os investimentos dos usuários
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 2) NOT NULL,
  rate DECIMAL(5, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS investments_user_id_idx ON investments(user_id);

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS investments_status_idx ON investments(status);
