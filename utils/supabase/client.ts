import { createClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createClient> | null = null

export function createBrowserClient() {
  // Usar um singleton para evitar múltiplas instâncias do cliente
  if (supabaseClient) return supabaseClient

  // Verificar se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Erro: Variáveis de ambiente do Supabase não estão definidas corretamente.")
    console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "Definido" : "Não definido"}`)
    console.error(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "Definido" : "Não definido"}`)
    return null
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "supabase.auth.token",
      },
    })

    return supabaseClient
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error)
    return null
  }
}
