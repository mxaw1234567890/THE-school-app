import { redirect } from "next/navigation"

export default function HomePage() {
  const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasEnvVars) {
    redirect("/setup")
  }

  // If env vars exist, redirect to dashboard - let middleware handle auth checks
  redirect("/dashboard")
}
