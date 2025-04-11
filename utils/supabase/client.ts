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

    // Fallback para evitar erros de runtime - usar valores vazios
    // Isso permitirá que a aplicação carregue, mas as operações do Supabase falharão
    return createClient("https://example.supabase.co", "example-key")
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "supabase.auth.token",
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") {
            return null
          }
          return window.localStorage.getItem(key)
        },
        setItem: (key, value) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value)
          }
        },
        removeItem: (key) => {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(key)
          }
        },
      },
    },
  })

  return supabaseClient
}
