-- Função para executar SQL dinâmico
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
EXECUTE sql_query;
END;
$$;

-- Criar tabela deposits
CREATE TABLE IF NOT EXISTS public.deposits (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),
amount DECIMAL(15, 2) NOT NULL,
status TEXT DEFAULT 'pending',
payment_method TEXT,
payment_details JSONB,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawals (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),
amount DECIMAL(15, 2) NOT NULL,
status TEXT DEFAULT 'pending',
pix_key TEXT,
notes TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id),
name TEXT,
email TEXT,
avatar_url TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
balance DECIMAL(15, 2) DEFAULT 0,
investments DECIMAL(15, 2) DEFAULT 0,
referral_code TEXT,
referred_by TEXT
);

-- Criar tabela investments
CREATE TABLE IF NOT EXISTS public.investments (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),
amount DECIMAL(15, 2) NOT NULL,
status TEXT DEFAULT 'active',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela yields
CREATE TABLE IF NOT EXISTS public.yields (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
investment_id UUID REFERENCES public.investments(id),
user_id UUID REFERENCES auth.users(id),
amount DECIMAL(15, 2) NOT NULL,
percentage DECIMAL(5, 2) NOT NULL,
status TEXT DEFAULT 'pending',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
paid_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela settings
CREATE TABLE IF NOT EXISTS public.settings (
id INTEGER PRIMARY KEY,
min_deposit DECIMAL(15, 2) DEFAULT 100,
min_withdrawal DECIMAL(15, 2) DEFAULT 50,
withdrawal_fee DECIMAL(5, 2) DEFAULT 2.5,
min_investment DECIMAL(15, 2) DEFAULT 100,
max_daily_yield DECIMAL(5, 2) DEFAULT 10,
affiliate_level1 DECIMAL(5, 2) DEFAULT 10,
affiliate_level2 DECIMAL(5, 2) DEFAULT 5,
affiliate_level3 DECIMAL(5, 2) DEFAULT 3,
affiliate_level4 DECIMAL(5, 2) DEFAULT 2,
maintenance_mode BOOLEAN DEFAULT false,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO public.settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
