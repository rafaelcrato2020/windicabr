import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Verificar se a função exec_sql existe
    try {
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: "SELECT 1",
      })

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: "A função exec_sql não existe ou não está funcionando. Configure-a primeiro.",
          },
          { status: 500 },
        )
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: "A função exec_sql não existe ou não está funcionando. Configure-a primeiro.",
        },
        { status: 500 },
      )
    }

    // Adicionar colunas necessárias à tabela profiles
    try {
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: `
          ALTER TABLE IF EXISTS public.profiles 
          ADD COLUMN IF NOT EXISTS last_yield_date TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS last_yield_rate DECIMAL(5, 2);
        `,
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Esquema atualizado com sucesso. Colunas adicionadas à tabela profiles.",
      })
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
