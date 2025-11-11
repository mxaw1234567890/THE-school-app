import { createClient } from "@supabase/supabase-js"

let serverClient: ReturnType<typeof createClient> | null = null

export function getSupabaseServerClient() {
  if (serverClient) return serverClient

  const url = process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_ANON_KEY || ""

  if (!url || !key) {
    console.error("[v0] Missing Supabase server credentials")
    throw new Error("Supabase server credentials not configured")
  }

  serverClient = createClient(url, key)
  return serverClient
}

export async function createServerClient() {
  return getSupabaseServerClient()
}
