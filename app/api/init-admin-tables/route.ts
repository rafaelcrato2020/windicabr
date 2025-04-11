import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // 1. Criar tabela de depósitos se não existir
    const { error: depositsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "deposits",
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        amount decimal NOT NULL,
        payment_method text,
        status text DEFAULT 'pending',
        notes text,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    if (depositsError) {
      return NextResponse.json({ error: depositsError.message }, { status: 500 })
    }

    // 2. Criar tabela de saques se não existir
    const { error: withdrawalsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "withdrawals",
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        amount decimal NOT NULL,
        payment_method text,
        pix_key text,
        status text DEFAULT 'pending',
        notes text,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    if (withdrawalsError) {
      return NextResponse.json({ error: withdrawalsError.message }, { status: 500 })
    }

    // 3. Criar tabela de transações se não existir
    const { error: transactionsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "transactions",
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        amount decimal NOT NULL,
        type text NOT NULL,
        description text,
        status text DEFAULT 'pending',
        created_at timestamp with time zone DEFAULT now()
      `,
    })

    if (transactionsError) {
      return NextResponse.json({ error: transactionsError.message }, { status: 500 })
    }

    // 4. Criar tabela de configurações se não existir
    const { error: settingsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "settings",
      table_definition: `
        id integer PRIMARY KEY DEFAULT 1,
        min_deposit decimal DEFAULT 100,
        min_withdrawal decimal DEFAULT 50,
        withdrawal_fee decimal DEFAULT 2.5,
        min_investment decimal DEFAULT 100,
        max_daily_yield decimal DEFAULT 10,
        affiliate_level1 decimal DEFAULT 10,
        affiliate_level2 decimal DEFAULT 5,
        affiliate_level3 decimal DEFAULT 3,
        affiliate_level4 decimal DEFAULT 2,
        maintenance_mode boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    // 5. Criar tabela de estatísticas de afiliados se não existir
    const { error: affiliateStatsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "affiliate_stats",
      table_definition: `
        id integer PRIMARY KEY DEFAULT 1,
        total_commissions decimal DEFAULT 0,
        total_referrals integer DEFAULT 0,
        updated_at timestamp with time zone DEFAULT now()
      `,
    })

    if (affiliateStatsError) {
      return NextResponse.json({ error: affiliateStatsError.message }, { status: 500 })
    }

    // 6. Adicionar colunas necessárias à tabela de perfis se não existirem
    const { error: alterProfilesError } = await supabase.rpc("execute_sql", {
      sql: `
        ALTER TABLE IF EXISTS profiles 
        ADD COLUMN IF NOT EXISTS balance decimal DEFAULT 0,
        ADD COLUMN IF NOT EXISTS investments decimal DEFAULT 0,
        ADD COLUMN IF NOT EXISTS affiliate_code text,
        ADD COLUMN IF NOT EXISTS affiliate_earnings decimal DEFAULT 0,
        ADD COLUMN IF NOT EXISTS referred_by uuid,
        ADD COLUMN IF NOT EXISTS last_yield_date timestamp with time zone,
        ADD COLUMN IF NOT EXISTS last_yield_rate decimal,
        ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
      `,
    })

    if (alterProfilesError) {
      return NextResponse.json({ error: alterProfilesError.message }, { status: 500 })
    }

    // 7. Inserir configurações padrão se não existirem
    const { error: insertSettingsError } = await supabase.from("settings").upsert({ id: 1 }).select()

    if (insertSettingsError) {
      return NextResponse.json({ error: insertSettingsError.message }, { status: 500 })
    }

    // 8. Inserir estatísticas de afiliados padrão se não existirem
    const { error: insertAffiliateStatsError } = await supabase.from("affiliate_stats").upsert({ id: 1 }).select()

    if (insertAffiliateStatsError) {
      return NextResponse.json({ error: insertAffiliateStatsError.message }, { status: 500 })
    }

    // 9. Definir o usuário atual como administrador
    const { error: updateUserError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", session.user.id)
      .select()

    if (updateUserError) {
      return NextResponse.json({ error: updateUserError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Tabelas do painel administrativo inicializadas com sucesso",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
