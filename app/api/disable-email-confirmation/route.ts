import { createServerClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

/**
 * Este endpoint desativa a necessidade de confirmação de email para todos os usuários
 * existentes no sistema. Útil para ser executado pelo administrador quando necessário.
 */
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    // Buscar todos os usuários
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error("Erro ao listar usuários:", usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const results = []

    // Para cada usuário, atualizar os metadados para marcar o email como confirmado
    for (const user of users.users) {
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { email_confirmed: true },
      })

      results.push({
        id: user.id,
        email: user.email,
        success: !error,
        error: error?.message,
      })

      if (error) {
        console.error(`Erro ao atualizar usuário ${user.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Confirmação de email desativada para todos os usuários",
      results,
    })
  } catch (error: any) {
    console.error("Erro ao desativar confirmação de email:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
