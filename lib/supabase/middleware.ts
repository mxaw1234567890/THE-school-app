import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function updateSession(request: NextRequest) {
  // Skip middleware for auth pages and public routes
  if (request.nextUrl.pathname.startsWith("/auth") || request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  try {
    const url = process.env.SUPABASE_URL || ""
    const key = process.env.SUPABASE_ANON_KEY || ""

    if (!url || !key) {
      console.error("[v0] Supabase credentials missing in middleware")
      return NextResponse.next()
    }

    const supabase = createClient(url, key)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect to login if not authenticated and trying to access protected route
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("[v0] Middleware error:", error)
  }

  return NextResponse.next()
}
