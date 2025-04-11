import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    cookies: {
      get(name) {
        return cookies().get(name)?.value
      },
    },
  })
}

export { createRouteHandlerClient }
