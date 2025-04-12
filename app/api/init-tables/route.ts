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

    // Criar tabelas usando a função exec_sql
    try {
      // Criar tabela deposits
      await executeSql(`
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
      console.log("Tabela deposits verificada/criada com sucesso")

      // Criar tabela withdrawals
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.withdrawals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          amount DECIMAL(15, 2) NOT NULL,
          status TEXT DEFAULT 'pending',
          pix_key TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log("Tabela withdrawals verificada/criada com sucesso")

      // Criar tabela profiles
      await executeSql(`
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
          referred_by TEXT,
          last_yield_date TIMESTAMP WITH TIME ZONE,
          last_yield_rate DECIMAL(5, 2)
        )
      `)
      console.log("Tabela profiles verificada/criada com sucesso")

      // Criar tabela investments - Adicionando a coluna rate
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.investments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          amount DECIMAL(15, 2) NOT NULL,
          rate DECIMAL(5, 2) DEFAULT 6.0,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log("Tabela investments verificada/criada com sucesso")

      // Verificar se a coluna rate existe e adicioná-la se não existir
      await executeSql(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'investments' AND column_name = 'rate'
          ) THEN
            ALTER TABLE public.investments ADD COLUMN rate DECIMAL(5, 2) DEFAULT 6.0;
          END IF;
        END
        $$;
      `)
      console.log("Coluna rate verificada/adicionada com sucesso")

      // Criar tabela yields
      await executeSql(`
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
      console.log("Tabela yields verificada/criada com sucesso")

      // Criar tabela transactions
      await executeSql(`
        CREATE TABLE IF NOT EXISTS public.transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          amount DECIMAL(15, 2) NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log("Tabela transactions verificada/criada com sucesso")

      // Criar tabela settings
      await executeSql(`
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
      console.log("Tabela settings verificada/criada com sucesso")

      // Inserir configurações padrão
      await executeSql(`
        INSERT INTO public.settings (id)
        VALUES (1)
        ON CONFLICT (id) DO NOTHING
      `)
      console.log("Configurações padrão verificadas/inseridas com sucesso")

      return NextResponse.json({ success: true, message: "Tabelas inicializadas com sucesso" })
    } catch (error: any) {
      console.error("Erro ao criar tabelas:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Erro ao inicializar tabelas:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
