import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Criar tabela deposits se não existir
    const { error: depositsError } = await supabase.rpc("create_deposits_if_not_exists")
    if (depositsError) {
      // Se a função RPC não existir, criar a tabela diretamente
      const { error: createDepositsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.deposits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          amount DECIMAL(15, 2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          payment_details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      if (createDepositsError) {
        console.error("Erro ao criar tabela deposits:", createDepositsError)
        return NextResponse.json({ success: false, error: createDepositsError.message }, { status: 500 })
      }
    }

    // Criar tabela withdrawals se não existir
    const { error: withdrawalsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        amount DECIMAL(15, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        withdrawal_method TEXT,
        withdrawal_details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    if (withdrawalsError) {
      console.error("Erro ao criar tabela withdrawals:", withdrawalsError)
      return NextResponse.json({ success: false, error: withdrawalsError.message }, { status: 500 })
    }

    // Criar tabela profiles se não existir
    const { error: profilesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        name TEXT,
        email TEXT UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        balance DECIMAL(15, 2) DEFAULT 0,
        referral_code TEXT,
        referred_by TEXT
      )
    `)

    if (profilesError) {
      console.error("Erro ao criar tabela profiles:", profilesError)
      return NextResponse.json({ success: false, error: profilesError.message }, { status: 500 })
    }

    // Criar tabela investments se não existir
    const { error: investmentsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        amount DECIMAL(15, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    if (investmentsError) {
      console.error("Erro ao criar tabela investments:", investmentsError)
      return NextResponse.json({ success: false, error: investmentsError.message }, { status: 500 })
    }

    // Criar tabela yields se não existir
    const { error: yieldsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.yields (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        investment_id UUID REFERENCES public.investments(id),
        user_id UUID REFERENCES auth.users(id),
        amount DECIMAL(15, 2) NOT NULL,
        percentage DECIMAL(5, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        paid_at TIMESTAMP WITH TIME ZONE
      )
    `)

    if (yieldsError) {
      console.error("Erro ao criar tabela yields:", yieldsError)
      return NextResponse.json({ success: false, error: yieldsError.message }, { status: 500 })
    }

    // Criar tabela settings se não existir
    const { error: settingsError } = await supabase.query(`
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
      )
    `)

    if (settingsError) {
      console.error("Erro ao criar tabela settings:", settingsError)
      return NextResponse.json({ success: false, error: settingsError.message }, { status: 500 })
    }

    // Inserir configurações padrão se não existirem
    const { error: insertSettingsError } = await supabase.query(`
      INSERT INTO public.settings (id)
      VALUES (1)
      ON CONFLICT (id) DO NOTHING
    `)

    if (insertSettingsError) {
      console.error("Erro ao inserir configurações padrão:", insertSettingsError)
      return NextResponse.json({ success: false, error: insertSettingsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Tabelas inicializadas com sucesso" })
  } catch (error: any) {
    console.error("Erro ao inicializar tabelas:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
