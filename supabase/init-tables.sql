-- Verificar e criar a tabela de perfis se não existir
CREATE TABLE IF NOT EXISTS profiles (
id UUID REFERENCES auth.users(id) PRIMARY KEY,
name TEXT,
email TEXT,
balance DECIMAL(10, 2) DEFAULT 0,
affiliate_code TEXT,
affiliate_earnings DECIMAL(10, 2) DEFAULT 0,
referrer_id UUID REFERENCES profiles(id),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e criar a tabela de depósitos se não existir
CREATE TABLE IF NOT EXISTS deposits (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id) NOT NULL,
amount DECIMAL(10, 2) NOT NULL,
payment_method TEXT DEFAULT 'Pix',
status TEXT DEFAULT 'pending',
receipt_url TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e criar a tabela de saques se não existir
CREATE TABLE IF NOT EXISTS withdrawals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id) NOT NULL,
amount DECIMAL(10, 2) NOT NULL,
wallet TEXT NOT NULL,
status TEXT DEFAULT 'pending',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e criar a tabela de estatísticas de afiliados se não existir
CREATE TABLE IF NOT EXISTS affiliate_stats (
id SERIAL PRIMARY KEY,
total_commissions DECIMAL(10, 2) DEFAULT 0,
total_referrals INTEGER DEFAULT 0,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial na tabela de estatísticas de afiliados se não existir
INSERT INTO affiliate_stats (id, total_commissions, total_referrals)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;
