;[v0 - no - op - code - block - prefix]
import { redirect } from "next/navigation"

export default function SettingsRedirectPage() {
  redirect("/dashboard/settings")
}
