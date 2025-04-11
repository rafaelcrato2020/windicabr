import { createServerClient as createServerClientBase } from "@supabase/ssr"

export function createServerClient() {
  return createServerClientBase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return undefined // API routes don't need cookies
      },
      set(name: string, value: string, options: any) {
        // API routes don't need to set cookies
      },
      remove(name: string, options: any) {
        // API routes don't need to remove cookies
      },
    },
  })
}
