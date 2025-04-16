import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const supabase = createClient()

  // Buscar dados do usuário autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Buscar o perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Buscar investimentos ativos do usuário
  const { data: activeInvestments } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "active")

  // Buscar transações recentes do usuário
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <DashboardClient profile={profile} activeInvestments={activeInvestments} recentTransactions={recentTransactions} />
  )
}
