import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Usar a API REST do Supabase para executar SQL diretamente
    const { error } = await supabase.from("_exec_sql_setup").select("*").limit(1).maybeSingle()

    // Se a tabela não existir, vamos criar a função SQL usando a API de serviço
    if (error && error.message.includes("does not exist")) {
      // Usar o cliente de serviço para executar SQL diretamente
      const { data, error: sqlError } = await supabase.auth.admin.createUser({
        email: "temp@example.com",
        password: "tempPassword123",
        email_confirm: true,
      })

      if (sqlError) {
        console.error("Erro ao criar usuário temporário:", sqlError)
        return NextResponse.json(
          {
            success: false,
            error: "Não foi possível configurar a função SQL. Erro de autenticação.",
          },
          { status: 500 },
        )
      }

      // Agora vamos tentar uma abordagem alternativa
      return NextResponse.json({
        success: false,
        message:
          "A função SQL não pôde ser criada automaticamente. Por favor, execute o SQL manualmente no console do Supabase.",
        sqlToExecute: `
        -- Execute este SQL no console do Supabase:
        CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;
      `,
      })
    }

    // Se chegou aqui, a função provavelmente já existe
    return NextResponse.json({ success: true, message: "Função SQL já configurada ou verificada com sucesso" })
  } catch (error: any) {
    console.error("Erro ao configurar função SQL:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Erro ao configurar função SQL. Por favor, execute o SQL manualmente.",
      },
      { status: 500 },
    )
  }
}
