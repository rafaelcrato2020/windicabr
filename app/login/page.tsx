import AuthForm from "@/components/auth/auth-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = createClient()

  // Verificar se o usuário já está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se estiver autenticado, redirecionar para o dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}
