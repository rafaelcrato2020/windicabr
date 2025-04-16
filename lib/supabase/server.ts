import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Criando um cliente Supabase para o lado do servidor
export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
