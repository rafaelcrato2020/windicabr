"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Criando um cliente Supabase para o lado do cliente
export const createClient = () => {
  return createClientComponentClient<Database>()
}
