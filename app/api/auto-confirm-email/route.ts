import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Criar cliente Supabase com cookies do servidor
    const supabase = createRouteHandlerClient({ cookies })

    // Usar o serviço de administração para confirmar o e-mail
    // Nota: Isso requer permissões de serviço
    const { data, error } = await supabase.rpc("confirm_user_email", {
      user_email: email,
    })

    if (error) {
      console.error("Error confirming email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error confirming email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
